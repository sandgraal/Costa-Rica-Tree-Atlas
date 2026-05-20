import { NextRequest, NextResponse } from "next/server";
import { allTrees } from "contentlayer/generated";
import { rateLimit } from "@/lib/ratelimit";
import { validateOrigin } from "@/lib/security/csrf";
import { captureApiError } from "@/lib/error-tracking";
import { normalizeLocale } from "@/lib/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Flip to true once PLANTNET_API_KEY is set in .env.local and Vercel env vars.
const FEATURE_ENABLED = !!process.env.PLANTNET_API_KEY;

const PLANTNET_API_URL = "https://my-api.plantnet.org/v2/identify/all";
const MAX_RESULTS = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const VALID_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface PlantNetSpecies {
  scientificNameWithoutAuthor: string;
  scientificName: string;
  commonNames: string[];
  family: { scientificNameWithoutAuthor: string };
}

interface PlantNetResult {
  score: number;
  species: PlantNetSpecies;
}

interface PlantNetResponse {
  results?: PlantNetResult[];
  remainingIdentificationRequests?: number;
}

export interface IdentifyCandidate {
  scientificName: string;
  commonName: string | null;
  family: string;
  score: number;
  // Matched atlas tree, if we have it
  atlasSlug: string | null;
  atlasTitle: string | null;
  atlasUrl: string | null;
}

interface AtlasTree {
  locale: string;
  scientificName: string;
  slug: string;
  title: string;
  url: string;
}

// Match a Pl@ntNet scientific name against the atlas tree DB.
// Tries exact match first, then genus-level match as fallback.
function matchAtlasTree(scientificNameRaw: string, locale: string) {
  const name = scientificNameRaw.toLowerCase().trim();
  const genus = name.split(" ")[0];
  const trees = (allTrees as AtlasTree[]).filter((t) => t.locale === locale);

  const exact = trees.find((t) => t.scientificName.toLowerCase() === name);
  if (exact) return { slug: exact.slug, title: exact.title, url: exact.url };

  const genusMatch = trees.find((t) =>
    t.scientificName.toLowerCase().startsWith(genus + " ")
  );
  if (genusMatch)
    return {
      slug: genusMatch.slug,
      title: genusMatch.title,
      url: genusMatch.url,
    };

  return null;
}

export async function POST(request: NextRequest) {
  const originValidation = validateOrigin(request);
  if (!originValidation.valid) {
    return NextResponse.json(
      {
        error: `CSRF validation failed: ${originValidation.error}`,
        code: "INVALID_ORIGIN",
      },
      { status: 403 }
    );
  }

  if (!FEATURE_ENABLED) {
    return NextResponse.json(
      {
        error:
          "Tree identification is temporarily unavailable while we improve the feature.",
        code: "FEATURE_DISABLED",
      },
      { status: 503 }
    );
  }

  const rateLimitResult = await rateLimit(request, "identify");
  if ("response" in rateLimitResult) {
    return rateLimitResult.response;
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("image");
  const requestedLocale = formData.get("locale")?.toString();
  const locale = normalizeLocale(requestedLocale ?? "en");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing image file" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 10MB." },
      { status: 400 }
    );
  }

  if (!VALID_TYPES.includes(file.type)) {
    return NextResponse.json(
      {
        error: "Invalid file type. Please upload a JPEG, PNG, or WebP image.",
      },
      { status: 400 }
    );
  }

  // Forward the image to Pl@ntNet.
  // "organs=auto" lets Pl@ntNet decide what part of the plant it sees.
  const upstream = new FormData();
  upstream.append("images", file, file.name);
  upstream.append("organs", "auto");

  const apiKey = process.env.PLANTNET_API_KEY!;
  const plantNetUrl = `${PLANTNET_API_URL}?api-key=${apiKey}&lang=${locale}&include-related-images=false&no-reject=false`;

  let data: PlantNetResponse;
  try {
    const res = await fetch(plantNetUrl, { method: "POST", body: upstream });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      captureApiError(
        new Error(`Pl@ntNet API HTTP ${res.status}: ${errorText}`),
        "/api/identify",
        "POST"
      );
      return NextResponse.json(
        {
          error: "Plant identification service request failed.",
          code: "PLANTNET_API_HTTP_ERROR",
        },
        { status: 502 }
      );
    }

    data = await res.json();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown network error";
    captureApiError(
      error instanceof Error ? error : new Error(message),
      "/api/identify",
      "POST"
    );
    return NextResponse.json(
      {
        error: "Failed to connect to plant identification service.",
        code: "PLANTNET_NETWORK_ERROR",
        details: message,
      },
      { status: 502 }
    );
  }

  const candidates: IdentifyCandidate[] = (data.results ?? [])
    .slice(0, MAX_RESULTS)
    .map((r) => {
      const atlas = matchAtlasTree(
        r.species.scientificNameWithoutAuthor,
        locale
      );
      return {
        scientificName: r.species.scientificName,
        commonName: r.species.commonNames?.[0] ?? null,
        family: r.species.family.scientificNameWithoutAuthor,
        score: Math.round(r.score * 100),
        atlasSlug: atlas?.slug ?? null,
        atlasTitle: atlas?.title ?? null,
        atlasUrl: atlas?.url ?? null,
      };
    });

  return NextResponse.json({
    candidates,
    remainingRequests: data.remainingIdentificationRequests ?? null,
  });
}

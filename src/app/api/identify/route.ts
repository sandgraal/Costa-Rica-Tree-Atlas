import { NextResponse } from "next/server";
import { allTrees } from "contentlayer/generated";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_LABELS = 12;

interface VisionLabel {
  description: string;
  score: number;
}

interface VisionApiResponse {
  responses?: Array<{
    labelAnnotations?: VisionLabel[];
  }>;
}

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (value: string) =>
  normalizeText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);

const scoreLabelAgainstTree = (
  label: VisionLabel,
  treeText: string,
  treeTokens: Set<string>
) => {
  const normalizedLabel = normalizeText(label.description);
  if (!normalizedLabel) {
    return 0;
  }

  const labelTokens = tokenize(label.description);
  const labelText = normalizedLabel;

  if (treeText.includes(labelText)) {
    return label.score * 1.1;
  }

  const overlapCount = labelTokens.filter((token) =>
    treeTokens.has(token)
  ).length;
  if (overlapCount === 0) {
    return 0;
  }

  const overlapRatio = overlapCount / labelTokens.length;
  return label.score * overlapRatio * 0.75;
};

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing vision API key" },
      { status: 500 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("image");
  const requestedLocale = formData.get("locale")?.toString();
  const locale = requestedLocale === "es" ? "es" : "en";

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing image file" }, { status: 400 });
  }

  // Validate file size (max 10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 10MB." },
      { status: 400 }
    );
  }

  // Validate file type
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!validTypes.includes(file.type)) {
    return NextResponse.json(
      {
        error:
          "Invalid file type. Please upload an image (JPEG, PNG, WebP, or GIF).",
      },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const encodedImage = buffer.toString("base64");

  let data: VisionApiResponse;
  try {
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: [
            {
              image: { content: encodedImage },
              features: [{ type: "LABEL_DETECTION", maxResults: MAX_LABELS }],
            },
          ],
        }),
      }
    );

    if (!visionResponse.ok) {
      const errorText = await visionResponse
        .text()
        .catch(() => "Unknown error");
      console.error("Vision API HTTP error:", visionResponse.status, errorText);
      return NextResponse.json(
        { error: "Vision API request failed", code: "VISION_API_HTTP_ERROR" },
        { status: 502 }
      );
    }

    data = await visionResponse.json();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown network error";
    console.error("Vision API network error:", message);
    return NextResponse.json(
      {
        error: "Failed to connect to Vision API",
        code: "VISION_API_NETWORK_ERROR",
        details: message,
      },
      { status: 502 }
    );
  }

  const labels: VisionLabel[] =
    data?.responses?.[0]?.labelAnnotations?.map((label: VisionLabel) => ({
      description: label.description,
      score: label.score,
    })) ?? [];

  const matchingTrees = allTrees.filter((tree) => tree.locale === locale);
  const matches = matchingTrees
    .map((tree) => {
      const treeText = normalizeText(
        `${tree.title} ${tree.scientificName} ${tree.slug}`
      );
      const treeTokens = new Set(tokenize(treeText));

      const score = labels.reduce((total, label) => {
        return total + scoreLabelAgainstTree(label, treeText, treeTokens);
      }, 0);

      return {
        title: tree.title,
        scientificName: tree.scientificName,
        slug: tree.slug,
        score,
        url: tree.url,
      };
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return NextResponse.json({
    labels: labels.sort((a, b) => b.score - a.score).slice(0, MAX_LABELS),
    matches,
  });
}

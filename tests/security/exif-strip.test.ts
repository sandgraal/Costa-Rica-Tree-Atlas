/**
 * EXIF metadata stripping regression test.
 *
 * The upload route at src/app/api/images/upload/route.ts pre-processes
 * user-uploaded photos through Sharp before forwarding to Cloudinary.
 * This is the critical privacy guardrail: smartphone photos commonly
 * embed precise GPS coordinates in EXIF, which for protected species
 * could enable poaching.
 *
 * This test guards two invariants of the Sharp pipeline we depend on:
 *   1. `sharp(buf).rotate().toBuffer()` strips EXIF entirely.
 *   2. The output has no GPS tags, even when the input did.
 *
 * If a future Sharp upgrade changes default behaviour, this test will
 * fail and force a deliberate review of the upload pipeline.
 *
 * See: docs/IMAGE_REVIEW_SYSTEM.md, Master Plan v6.0 lane L10.
 */
import { describe, expect, it } from "vitest";
import sharp from "sharp";

async function buildJpegWithExif(): Promise<Buffer> {
  // Synthesize a JPEG with EXIF GPS coordinates embedded.
  // Sharp ≥0.33 supports passing structured EXIF on write.
  return sharp({
    create: {
      width: 1000,
      height: 800,
      channels: 3,
      background: { r: 34, g: 139, b: 34 },
    },
  })
    .withExif({
      IFD0: {
        Make: "TEST",
        Model: "EXIF-STRIP-REGRESSION",
        Software: "Costa Rica Tree Atlas test fixture",
      },
      GPS: {
        // Coordinates near Corcovado — a real poaching-risk location for
        // protected species. We're embedding them in the fixture so the
        // test would catch a regression that leaks them.
        GPSLatitudeRef: "N",
        GPSLatitude: "8/1 30/1 0/1",
        GPSLongitudeRef: "W",
        GPSLongitude: "83/1 35/1 0/1",
      },
    })
    .jpeg()
    .toBuffer();
}

describe("EXIF GPS strip on upload", () => {
  it("the Sharp pipeline the upload route uses strips all metadata", async () => {
    const withGps = await buildJpegWithExif();

    // Sanity: the fixture really does contain EXIF GPS data.
    const beforeMeta = await sharp(withGps).metadata();
    expect(beforeMeta.exif, "fixture should contain EXIF").toBeDefined();

    // This mirrors src/app/api/images/upload/route.ts:
    //   const buffer = await sharp(rawBuffer).rotate().toBuffer();
    const stripped = await sharp(withGps).rotate().toBuffer();

    const afterMeta = await sharp(stripped).metadata();

    expect(
      afterMeta.exif,
      "Sharp output must not retain EXIF metadata"
    ).toBeUndefined();

    // Also verify the rendered pixels are still valid and have the
    // expected dimensions (so we didn't break the upload flow's
    // dimension validation).
    expect(afterMeta.width).toBe(1000);
    expect(afterMeta.height).toBe(800);
  });

  it("the stripped output still has valid pixel data for downstream use", async () => {
    const withGps = await buildJpegWithExif();
    const stripped = await sharp(withGps).rotate().toBuffer();

    // Round-trip through Sharp again to confirm the JPEG is well-formed.
    const reread = await sharp(stripped).metadata();
    expect(reread.format).toBe("jpeg");
    expect(reread.width).toBeGreaterThan(0);
    expect(reread.height).toBeGreaterThan(0);

    // Cloudinary's dimension validation in the upload route requires
    // a non-zero size; verify the stripped buffer isn't degenerate.
    expect(stripped.byteLength).toBeGreaterThan(1000);
  });
});

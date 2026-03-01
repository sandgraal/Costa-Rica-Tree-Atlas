#!/usr/bin/env node

/**
 * Re-compress hero images for LCP optimization.
 *
 * Hero images are displayed behind a dark gradient overlay, so lower
 * AVIF/WebP quality (40-45) is visually acceptable and significantly
 * reduces download size — the biggest lever for improving simulated
 * LCP on throttled mobile connections.
 */

import sharp from "sharp";
import { writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const HERO_DIR = "public/images/hero";
const AVIF_QUALITY = 40;
const WEBP_QUALITY = 45;
const JPEG_QUALITY = 65;

const configs = [
  {
    src: "guanacaste-mobile.jpg",
    avif: "guanacaste-mobile.avif",
    webp: "guanacaste-mobile.webp",
  },
  {
    src: "guanacaste-mobile-lg.jpg",
    avif: "guanacaste-mobile-lg.avif",
    webp: "guanacaste-mobile-lg.webp",
  },
  {
    src: "guanacaste-desktop.jpg",
    avif: "guanacaste-desktop.avif",
    webp: "guanacaste-desktop.webp",
  },
];

async function main() {
  console.log("🖼️  Hero Image LCP Optimizer");
  console.log(
    `   AVIF quality: ${AVIF_QUALITY} | WebP quality: ${WEBP_QUALITY} | JPEG quality: ${JPEG_QUALITY}\n`
  );

  let totalSaved = 0;

  for (const cfg of configs) {
    const srcPath = join(HERO_DIR, cfg.src);
    const meta = await sharp(srcPath).metadata();

    // Re-encode AVIF
    const avifPath = join(HERO_DIR, cfg.avif);
    const origAvifSize = statSync(avifPath).size;
    const avifBuf = await sharp(srcPath)
      .avif({ quality: AVIF_QUALITY, effort: 6 })
      .toBuffer();
    writeFileSync(avifPath, avifBuf);
    const avifSaved = origAvifSize - avifBuf.length;
    totalSaved += Math.max(0, avifSaved);
    console.log(
      `  ${cfg.avif}: ${Math.round(origAvifSize / 1024)}KB → ${Math.round(avifBuf.length / 1024)}KB (${meta.width}x${meta.height}) ${avifSaved > 0 ? `saved ${Math.round(avifSaved / 1024)}KB` : "no change"}`
    );

    // Re-encode WebP
    const webpPath = join(HERO_DIR, cfg.webp);
    const origWebpSize = statSync(webpPath).size;
    const webpBuf = await sharp(srcPath)
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    writeFileSync(webpPath, webpBuf);
    const webpSaved = origWebpSize - webpBuf.length;
    totalSaved += Math.max(0, webpSaved);
    console.log(
      `  ${cfg.webp}: ${Math.round(origWebpSize / 1024)}KB → ${Math.round(webpBuf.length / 1024)}KB ${webpSaved > 0 ? `saved ${Math.round(webpSaved / 1024)}KB` : "no change"}`
    );

    // Re-compress JPEG fallback with mozjpeg
    const origJpgSize = statSync(srcPath).size;
    const jpgBuf = await sharp(srcPath)
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toBuffer();
    writeFileSync(srcPath, jpgBuf);
    const jpgSaved = origJpgSize - jpgBuf.length;
    totalSaved += Math.max(0, jpgSaved);
    console.log(
      `  ${cfg.src}: ${Math.round(origJpgSize / 1024)}KB → ${Math.round(jpgBuf.length / 1024)}KB ${jpgSaved > 0 ? `saved ${Math.round(jpgSaved / 1024)}KB` : "no change"}`
    );

    console.log("");
  }

  console.log(
    `\nTotal saved: ${(totalSaved / 1024).toFixed(1)}KB (${(totalSaved / 1024 / 1024).toFixed(2)}MB)`
  );
}

main().catch(console.error);

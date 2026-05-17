import sharp from "sharp";
import { readdir, stat, rename, unlink } from "node:fs/promises";
import { join } from "node:path";

const IMG_DIR = "public/image";

const targets = {
  "avatar.png":     { width: 600,  quality: 80 },
  "pirat.png":      { width: 400,  quality: 80 },
  "portfolio.jpg":  { width: 1200, quality: 78 },
  "eventival.jpg":  { width: 1200, quality: 78 },
  "rggloves.jpg":   { width: 1200, quality: 78 },
  "sepionet.jpg":   { width: 1200, quality: 78 },
};

const files = await readdir(IMG_DIR);

for (const name of files) {
  const path = join(IMG_DIR, name);
  const ext = name.split(".").pop().toLowerCase();
  if (!["png", "jpg", "jpeg"].includes(ext)) continue;

  const before = (await stat(path)).size;
  const config = targets[name] ?? { width: 1600, quality: 78 };
  const tmpPath = path + ".tmp";

  let pipeline = sharp(path).resize({ width: config.width, withoutEnlargement: true });
  if (ext === "png") {
    pipeline = pipeline.png({ quality: config.quality, compressionLevel: 9, palette: true });
  } else {
    pipeline = pipeline.jpeg({ quality: config.quality, mozjpeg: true, progressive: true });
  }
  await pipeline.toFile(tmpPath);
  await unlink(path);
  await rename(tmpPath, path);

  const webpPath = path.replace(/\.(png|jpg|jpeg)$/i, ".webp");
  await sharp(path).webp({ quality: config.quality }).toFile(webpPath);

  const after = (await stat(path)).size;
  const webpSize = (await stat(webpPath)).size;
  console.log(
    `${name}: ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB | WebP ${(webpSize/1024).toFixed(0)}KB`
  );
}

import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");

async function copyDir(source, target) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.cp(source, target, {
    recursive: true,
    filter: (src) => {
      if (src.includes(`${path.sep}assets${path.sep}projects${path.sep}2026${path.sep}医图生科`)) return false;
      return !/\.(mp4|mov|mp3|MP3)$/i.test(src);
    },
  });
}

await fs.copyFile(path.join(root, "data.js"), path.join(dist, "data.js"));
await copyDir(path.join(root, "assets", "curated"), path.join(dist, "assets", "curated"));
await copyDir(path.join(root, "assets", "generated"), path.join(dist, "assets", "generated"));
await copyDir(path.join(root, "assets", "projects"), path.join(dist, "assets", "projects"));
await fs.mkdir(path.join(dist, "assets", "curated", "med"), { recursive: true });
await fs.copyFile(
  path.join(root, "assets", "curated", "med", "2050-flash.mp4"),
  path.join(dist, "assets", "curated", "med", "2050-flash.mp4"),
);
await fs.copyFile(
  path.join(root, "assets", "curated", "med", "2050-recap.mp4"),
  path.join(dist, "assets", "curated", "med", "2050-recap.mp4"),
);

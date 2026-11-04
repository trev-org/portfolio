#!/usr/bin/env node
/**
 * Add a photo to the /photos page in one step.
 *
 * Usage:
 *   npm run photo:add -- <image-file> --title "Lands End" [options]
 *
 * Options:
 *   --title "..."     (required) caption title; also becomes the filename
 *   --camera "..."    (required) camera model used to take the photo
 *   --location "..."  caption location line
 *   --alt "..."       accessibility text (defaults to the title)
 *   --date MM-DD-YYYY overrides the date read from the photo's EXIF data
 *   --name slug       overrides the filename derived from the title
 *
 * What it does:
 *   1. Resizes the image to at most 2048px on the long edge (never
 *      upscales), auto-rotates it from its EXIF orientation, and saves it
 *      as a quality-87 JPEG to public/photos/<slug>.jpg, keeping EXIF.
 *   2. Reads the date taken from the EXIF DateTimeOriginal, unless --date
 *      is given. If no EXIF date exists, --date is required.
 *   3. Adds the entry to the `photos` array in src/data/photos.ts, in the
 *      order photos are added. Re-running with the same title/name
 *      updates the existing entry and image instead of duplicating them.
 */

import { readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PHOTOS_DIR = path.join(ROOT, "public", "photos");
const DATA_FILE = path.join(ROOT, "src", "data", "photos.ts");
const MAX_EDGE = 2048;
const JPEG_QUALITY = 87;

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      args[arg.slice(2)] = argv[i + 1];
      i += 1;
    } else {
      args._.push(arg);
    }
  }
  return args;
}

function fail(message) {
  console.error(`add-photo: ${message}`);
  process.exit(1);
}

/** First EXIF-style "YYYY:MM:DD hh:mm:ss" string in the file -> "MM-DD-YYYY". */
function readExifTakenAt(file) {
  const text = readFileSync(file).toString("latin1");
  const match = text.match(/(\d{4}):(0[1-9]|1[0-2]):(0[1-9]|[12]\d|3[01]) \d{2}:\d{2}:\d{2}/);
  if (!match) return undefined;
  const year = Number(match[1]);
  if (year < 1990 || year > 2100) return undefined;
  return `${match[2]}-${match[3]}-${match[1]}`;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatEntry({ src, alt, title, location, takenAt, camera }) {
  const lines = [`    src: ${JSON.stringify(src)},`, `    alt: ${JSON.stringify(alt)},`];
  if (title) lines.push(`    title: ${JSON.stringify(title)},`);
  if (location) lines.push(`    location: ${JSON.stringify(location)},`);
  lines.push(`    takenAt: ${JSON.stringify(takenAt)},`);
  lines.push(`    camera: ${JSON.stringify(camera)},`);
  return `{\n${lines.join("\n")}\n  },`;
}

function upsertEntry(entry) {
  const source = readFileSync(DATA_FILE, "utf8");
  if (!source.includes("export const photos")) {
    fail(`could not find the photos array in ${path.relative(ROOT, DATA_FILE)} — add the entry by hand.`);
  }
  const entryText = formatEntry(entry);
  const existing = new RegExp(`[ \\t]*\\{\\s*src: ${JSON.stringify(entry.src).replace(/\//g, "\\/")},[^}]*\\},?`);
  if (existing.test(source)) {
    writeFileSync(DATA_FILE, source.replace(existing, () => `  ${entryText}`));
    return "updated";
  }
  const closing = source.lastIndexOf("\n];");
  if (closing === -1) fail("could not find the end of the photos array — add the entry by hand.");
  writeFileSync(DATA_FILE, `${source.slice(0, closing)}\n  ${entryText}${source.slice(closing)}`);
  return "added";
}

const args = parseArgs(process.argv.slice(2));
const [input] = args._;
if (!input) fail('no image file given. Usage: npm run photo:add -- <image-file> --title "..."');
if (!args.title) fail('--title is required (it is the caption, and becomes the filename).');
if (!args.camera) fail('--camera is required (for example, --camera "iPhone 14").');
if (args.date && !/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])-\d{4}$/.test(args.date)) {
  fail("--date must look like MM-DD-YYYY.");
}

const takenAt = args.date ?? readExifTakenAt(input);
if (!takenAt) fail("no EXIF date found; pass --date MM-DD-YYYY.");

const slug = args.name ? slugify(args.name) : slugify(args.title);
if (!slug) fail("could not derive a filename from the title — pass --name.");
const filename = `${slug}.jpg`;
const output = path.join(PHOTOS_DIR, filename);

const beforeBytes = statSync(input).size;
const image = sharp(input).rotate();
const metadata = await image.metadata();
const info = await image
  .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
  .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
  .withMetadata()
  .toFile(output);

const action = upsertEntry({
  src: `/photos/${filename}`,
  alt: args.alt ?? args.title,
  title: args.title,
  location: args.location,
  takenAt,
  camera: args.camera,
});

const kb = (n) => `${Math.round(n / 1024)}KB`;
console.log(
  [
    `${path.basename(input)}: ${metadata.width}x${metadata.height}, ${kb(beforeBytes)}`,
    `-> public/photos/${filename}: ${info.width}x${info.height}, ${kb(info.size)}`,
    `entry ${action} in src/data/photos.ts (takenAt ${takenAt}, camera ${args.camera})`,
  ].join("\n"),
);

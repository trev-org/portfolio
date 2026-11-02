import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  getWrappedPath,
  isCalendarDate,
  latestDate,
  monthKeys,
  parseArgs,
  parseYear,
  readJson,
  writeJson,
} from "./utils.mjs";

function usage() {
  console.log(`Import daily step totals from an iPhone Shortcut export.

Usage:
  node scripts/wrapped/import-steps.mjs --input <file.json|file.csv> [--year 2026] [--output <wrapped.json>]

The input must contain complete year-to-date daily rows with:
  date, source ("google" or "iphone"), steps`);
}

function parseCsv(contents) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < contents.length; index += 1) {
    const character = contents[index];

    if (character === '"') {
      if (quoted && contents[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && contents[index + 1] === "\n") {
        index += 1;
      }
      row.push(field);
      if (row.some((value) => value.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (quoted) {
    throw new Error("CSV contains an unterminated quoted field.");
  }

  row.push(field);
  if (row.some((value) => value.trim() !== "")) {
    rows.push(row);
  }

  if (rows.length < 2) {
    throw new Error("CSV must contain a header and at least one data row.");
  }

  const headers = rows[0].map((value) =>
    value.replace(/^\uFEFF/, "").trim().toLowerCase()
  );
  for (const requiredHeader of ["date", "source", "steps"]) {
    if (!headers.includes(requiredHeader)) {
      throw new Error(`CSV is missing the "${requiredHeader}" header.`);
    }
  }

  return rows.slice(1).map((values) =>
    Object.fromEntries(
      headers.map((header, index) => [header, values[index]?.trim() ?? ""])
    )
  );
}

async function readRows(inputPath) {
  const contents = await readFile(inputPath, "utf8");
  if (path.extname(inputPath).toLowerCase() === ".csv") {
    return parseCsv(contents);
  }

  let parsed;
  try {
    parsed = JSON.parse(contents);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not parse ${inputPath}: ${message}`);
  }

  const rows = Array.isArray(parsed) ? parsed : parsed?.rows;
  if (!Array.isArray(rows)) {
    throw new Error('JSON input must be an array or an object with a "rows" array.');
  }
  if (rows.length === 0) {
    throw new Error("Step input contains no rows.");
  }
  return rows;
}

function normalizeSource(value, rowNumber) {
  const source = String(value ?? "")
    .trim()
    .toLowerCase();

  if (["google", "google health", "google fit"].includes(source)) {
    return "google";
  }
  if (["iphone", "apple", "apple health"].includes(source)) {
    return "iphone";
  }

  throw new Error(
    `Row ${rowNumber} has source "${value}". Use "google" or "iphone".`
  );
}

function normalizeRows(rows, year) {
  const normalized = [];
  const seen = new Set();

  for (const [index, row] of rows.entries()) {
    const rowNumber = index + 1;
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      throw new Error(`Row ${rowNumber} must be an object.`);
    }

    const date = String(row.date ?? "").trim();
    if (!isCalendarDate(date)) {
      throw new Error(
        `Row ${rowNumber} has invalid date "${row.date}". Use YYYY-MM-DD.`
      );
    }
    if (!date.startsWith(`${year}-`)) {
      throw new Error(`Row ${rowNumber} date ${date} is outside ${year}.`);
    }

    const source = normalizeSource(row.source, rowNumber);
    const steps = Number(row.steps);
    if (!Number.isInteger(steps) || steps < 0) {
      throw new Error(
        `Row ${rowNumber} has invalid steps "${row.steps}". Use a non-negative integer.`
      );
    }

    const key = `${date}|${source}`;
    if (seen.has(key)) {
      throw new Error(
        `Duplicate ${source} row for ${date}. Export one daily total per source.`
      );
    }
    seen.add(key);
    normalized.push({ date, source, steps });
  }

  return normalized;
}

function buildStepSummary(rows, year) {
  const days = new Map();

  for (const row of rows) {
    const day = days.get(row.date) ?? {};
    day[row.source] = row.steps;
    days.set(row.date, day);
  }

  const monthTotals = new Map(
    monthKeys(year).map((month) => [
      month,
      { total: 0, googleDays: 0, iphoneDays: 0 },
    ])
  );

  for (const [date, sources] of days.entries()) {
    const month = date.slice(0, 7);
    const summary = monthTotals.get(month);

    if (Object.hasOwn(sources, "google")) {
      summary.total += sources.google;
      summary.googleDays += 1;
    } else if (Object.hasOwn(sources, "iphone")) {
      summary.total += sources.iphone;
      summary.iphoneDays += 1;
    }
  }

  const monthly = [...monthTotals.entries()].map(([month, summary]) => ({
    month,
    total: summary.total,
    sourceMix:
      summary.googleDays + summary.iphoneDays === 0
        ? "No step data imported"
        : `Google Health: ${summary.googleDays} day${
            summary.googleDays === 1 ? "" : "s"
          } · iPhone: ${summary.iphoneDays} day${
            summary.iphoneDays === 1 ? "" : "s"
          }`,
  }));

  return {
    monthly,
    yearlyTotal: monthly.reduce((total, month) => total + month.total, 0),
  };
}

async function main() {
  const { options } = parseArgs(process.argv.slice(2));
  if (options.help) {
    usage();
    return;
  }
  if (typeof options.input !== "string") {
    usage();
    throw new Error("Missing required --input path.");
  }

  const year = parseYear(options.year ?? 2026);
  const inputPath = path.resolve(process.cwd(), options.input);
  const outputPath = getWrappedPath(year, options.output);
  const [rawRows, data] = await Promise.all([
    readRows(inputPath),
    readJson(outputPath),
  ]);

  if (data.year !== year) {
    throw new Error(`${outputPath} is for ${data.year}, not ${year}.`);
  }

  const rows = normalizeRows(rawRows, year);
  const latestInputDate = rows.reduce(
    (latest, row) => latestDate(latest, row.date),
    ""
  );

  data.steps = buildStepSummary(rows, year);
  data.updatedThrough = latestDate(data.updatedThrough, latestInputDate);
  await writeJson(outputPath, data);

  console.log(
    `Imported ${rows.length} source rows across ${new Set(
      rows.map((row) => row.date)
    ).size} days. ${data.steps.yearlyTotal} steps written to ${outputPath}.`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

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
  console.log(`Import daily step totals from an Apple Health export.

Usage:
  node scripts/wrapped/import-steps.mjs --input <file.json|file.csv> [--year 2026] [--output <wrapped.json>]

The input must contain complete year-to-date daily rows with:
  date, source ("health"), steps

Legacy source-specific exports using "google" or "iphone" are also supported.`);
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

  if (["health", "apple health merged"].includes(source)) {
    return "health";
  }
  if (["google", "google health", "google fit"].includes(source)) {
    return "google";
  }
  if (["iphone", "apple", "apple health"].includes(source)) {
    return "iphone";
  }

  throw new Error(
    `Row ${rowNumber} has source "${value}". Use "health", "google", or "iphone".`
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

  const sources = new Set(normalized.map((row) => row.source));
  if (sources.has("health") && sources.size > 1) {
    throw new Error(
      'The merged "health" source cannot be mixed with "google" or "iphone" rows.'
    );
  }

  return normalized;
}

function selectDailyTotals(rows, year) {
  const days = new Map();

  for (const row of rows) {
    const day = days.get(row.date) ?? {};
    day[row.source] = row.steps;
    days.set(row.date, day);
  }

  const dates = [...days.keys()].sort();
  const firstDate = `${year}-01-01`;
  const finalDate = dates.at(-1);
  const missingDates = [];

  for (
    let cursor = new Date(`${firstDate}T00:00:00Z`);
    cursor <= new Date(`${finalDate}T00:00:00Z`);
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  ) {
    const date = cursor.toISOString().slice(0, 10);
    if (!days.has(date)) {
      missingDates.push(date);
    }
  }

  if (missingDates.length > 0) {
    const preview = missingDates.slice(0, 5).join(", ");
    throw new Error(
      `Step input must cover every day from ${firstDate} through ${finalDate}. Missing ${preview}${
        missingDates.length > 5 ? ` and ${missingDates.length - 5} more` : ""
      }.`
    );
  }

  return dates.map((date) => {
    const sources = days.get(date);
    if (Object.hasOwn(sources, "health")) {
      return { date, source: "health", steps: sources.health };
    }
    if (Object.hasOwn(sources, "google")) {
      return { date, source: "google", steps: sources.google };
    }
    return { date, source: "iphone", steps: sources.iphone };
  });
}

function buildStepSummary(rows, year) {
  const daily = selectDailyTotals(rows, year);
  const monthTotals = new Map(
    monthKeys(year).map((month) => [
      month,
      { total: 0, healthDays: 0, googleDays: 0, iphoneDays: 0 },
    ])
  );

  for (const day of daily) {
    const month = day.date.slice(0, 7);
    const summary = monthTotals.get(month);
    summary.total += day.steps;
    summary[`${day.source}Days`] += 1;
  }

  const monthly = [...monthTotals.entries()].map(([month, summary]) => ({
    month,
    total: summary.total,
    sourceMix: [
      ["Apple Health", summary.healthDays],
      ["Google Health", summary.googleDays],
      ["iPhone", summary.iphoneDays],
    ]
      .filter(([, count]) => count > 0)
      .map(
        ([label, count]) =>
          `${label}: ${count} day${count === 1 ? "" : "s"}`
      )
      .join(" · ") || "No step data imported",
  }));
  const yearlyTotal = daily.reduce((total, day) => total + day.steps, 0);
  const bestDay = daily.reduce((best, day) =>
    day.steps > best.steps ? day : best
  );

  return {
    monthly,
    yearlyTotal,
    daysTracked: daily.length,
    dailyAverage: Math.round(yearlyTotal / daily.length),
    bestDay: {
      date: bestDay.date,
      steps: bestDay.steps,
    },
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

  data.steps = {
    example: false,
    updatedThrough: latestInputDate,
    ...buildStepSummary(rows, year),
  };
  data.example = Boolean(data.driving.example);
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

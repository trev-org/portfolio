import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AIRPORTS } from "./airports.mjs";

export const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));

export function parseArgs(argv) {
  const options = {};
  const positional = [];

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (!argument.startsWith("--")) {
      positional.push(argument);
      continue;
    }

    const [rawKey, inlineValue] = argument.slice(2).split("=", 2);

    if (inlineValue !== undefined) {
      options[rawKey] = inlineValue;
      continue;
    }

    const nextArgument = argv[index + 1];
    if (nextArgument !== undefined && !nextArgument.startsWith("--")) {
      options[rawKey] = nextArgument;
      index += 1;
    } else {
      options[rawKey] = true;
    }
  }

  return { options, positional };
}

export function parseYear(value) {
  const year = Number(value);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error(`Expected --year to be an integer from 2000–2100; got "${value}".`);
  }
  return year;
}

export function getWrappedPath(year, output) {
  return output
    ? path.resolve(process.cwd(), String(output))
    : path.join(REPO_ROOT, "data", `wrapped-${year}.json`);
}

export async function readJson(filePath) {
  let contents;
  try {
    contents = await readFile(filePath, "utf8");
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") {
      throw new Error(`File not found: ${filePath}`);
    }
    throw error;
  }

  try {
    return JSON.parse(contents);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not parse JSON in ${filePath}: ${message}`);
  }
}

export async function writeJson(filePath, value) {
  const directory = path.dirname(filePath);
  const temporaryPath = `${filePath}.tmp`;
  await mkdir(directory, { recursive: true });
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporaryPath, filePath);
}

export function monthKeys(year) {
  return Array.from(
    { length: 12 },
    (_, index) => `${year}-${String(index + 1).padStart(2, "0")}`
  );
}

export function isCalendarDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const [, year, month, day] = match;
  const date = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day))
  );

  return (
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day)
  );
}

export function latestDate(current, candidate) {
  if (!candidate) {
    return current;
  }
  return candidate > current ? candidate : current;
}

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function greatCircleMiles(origin, destination) {
  const earthRadiusMiles = 3958.7613;
  const latitudeDelta = degreesToRadians(destination.lat - origin.lat);
  const longitudeDelta = degreesToRadians(destination.lng - origin.lng);
  const originLatitude = degreesToRadians(origin.lat);
  const destinationLatitude = degreesToRadians(destination.lat);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return (
    2 *
    earthRadiusMiles *
    Math.asin(Math.min(1, Math.sqrt(haversine)))
  );
}

export function calculateFlightMiles(segments) {
  let total = 0;

  for (const [index, segment] of segments.entries()) {
    const origin = AIRPORTS[segment.from];
    const destination = AIRPORTS[segment.to];

    if (!origin || !destination) {
      const missingCodes = [segment.from, segment.to]
        .filter((code) => !AIRPORTS[code])
        .join(", ");
      throw new Error(
        `Flight ${index + 1} uses unknown IATA code${
          missingCodes.includes(",") ? "s" : ""
        }: ${missingCodes}. Add the airport coordinates to scripts/wrapped/airports.mjs.`
      );
    }

    total += greatCircleMiles(origin, destination);
  }

  return Math.round(total);
}

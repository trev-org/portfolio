import path from "node:path";
import Ajv from "ajv";
import {
  REPO_ROOT,
  calculateFlightMiles,
  isCalendarDate,
  monthKeys,
  parseArgs,
  parseYear,
  readJson,
  writeJson,
} from "./utils.mjs";

function usage() {
  console.log(`Validate one wrapped data file and verify its computed totals.

Usage:
  node scripts/wrapped/validate.mjs [data/wrapped-2026.json] [--year 2026] [--write]

Options:
  --year   Select data/wrapped-<year>.json when no file is provided.
  --write  Persist a newly computed flights.totalMiles value.
  --help   Show this message.`);
}

function dateYear(date) {
  return Number(date.slice(0, 4));
}

function validateSemanticRules(data) {
  const errors = [];
  const expectedMonths = monthKeys(data.year);

  if (!isCalendarDate(data.updatedThrough)) {
    errors.push(`updatedThrough is not a real calendar date: ${data.updatedThrough}`);
  } else if (dateYear(data.updatedThrough) !== data.year) {
    errors.push("updatedThrough must fall within the wrapped year.");
  }

  for (const [index, city] of data.cities.entries()) {
    const dates = city.firstVisited ? [city.firstVisited] : city.dates;
    for (const date of dates) {
      if (!isCalendarDate(date)) {
        errors.push(`cities[${index}] contains an invalid date: ${date}`);
      } else if (dateYear(date) !== data.year) {
        errors.push(`cities[${index}] date ${date} is outside ${data.year}.`);
      } else if (date > data.updatedThrough) {
        errors.push(`cities[${index}] date ${date} is after updatedThrough.`);
      }
    }
  }

  const cityKeys = data.cities.map(
    (city) => `${city.city.toLowerCase()}|${city.regionCountry.toLowerCase()}`
  );
  if (new Set(cityKeys).size !== cityKeys.length) {
    errors.push("cities contains a duplicate city and region/country pair.");
  }

  for (const [index, flight] of data.flights.segments.entries()) {
    if (!isCalendarDate(flight.date)) {
      errors.push(`flights.segments[${index}] has an invalid date: ${flight.date}`);
    } else if (dateYear(flight.date) !== data.year) {
      errors.push(`flights.segments[${index}] date is outside ${data.year}.`);
    } else if (flight.date > data.updatedThrough) {
      errors.push(`flights.segments[${index}] date is after updatedThrough.`);
    }

    if (flight.from === flight.to) {
      errors.push(`flights.segments[${index}] has the same origin and destination.`);
    }
  }

  const drivingMonths = data.driving.monthlyMiles.map((item) => item.month);
  if (JSON.stringify(drivingMonths) !== JSON.stringify(expectedMonths)) {
    errors.push(
      `driving.monthlyMiles must contain ${expectedMonths.join(", ")} in order.`
    );
  }

  const stepMonths = data.steps.monthly.map((item) => item.month);
  if (JSON.stringify(stepMonths) !== JSON.stringify(expectedMonths)) {
    errors.push(`steps.monthly must contain ${expectedMonths.join(", ")} in order.`);
  }

  const summedSteps = data.steps.monthly.reduce(
    (total, month) => total + month.total,
    0
  );
  if (summedSteps !== data.steps.yearlyTotal) {
    errors.push(
      `steps.yearlyTotal is ${data.steps.yearlyTotal}, but monthly totals sum to ${summedSteps}.`
    );
  }

  if (
    !data.example &&
    JSON.stringify(data).toUpperCase().includes("EXAMPLE")
  ) {
    errors.push(
      'example is false, but the data still contains an "EXAMPLE" placeholder.'
    );
  }

  return errors;
}

async function main() {
  const { options, positional } = parseArgs(process.argv.slice(2));
  if (options.help) {
    usage();
    return;
  }

  const selectedYear = options.year ? parseYear(options.year) : 2026;
  const dataPath = positional[0]
    ? path.resolve(process.cwd(), positional[0])
    : path.join(REPO_ROOT, "data", `wrapped-${selectedYear}.json`);
  const schemaPath = path.join(REPO_ROOT, "data", "wrapped.schema.json");
  const [data, schema] = await Promise.all([
    readJson(dataPath),
    readJson(schemaPath),
  ]);

  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);

  if (!validate(data)) {
    const details = validate.errors
      .map((error) => `  ${error.instancePath || "/"} ${error.message}`)
      .join("\n");
    throw new Error(`Schema validation failed:\n${details}`);
  }

  const semanticErrors = validateSemanticRules(data);
  if (semanticErrors.length > 0) {
    throw new Error(
      `Wrapped data checks failed:\n${semanticErrors
        .map((error) => `  - ${error}`)
        .join("\n")}`
    );
  }

  const computedFlightMiles = calculateFlightMiles(data.flights.segments);
  const flightMilesChanged = data.flights.totalMiles !== computedFlightMiles;

  if (flightMilesChanged && !options.write) {
    throw new Error(
      `flights.totalMiles is ${data.flights.totalMiles}, but the flight list computes to ${computedFlightMiles}. Re-run with --write.`
    );
  }

  if (flightMilesChanged) {
    data.flights.totalMiles = computedFlightMiles;
    await writeJson(dataPath, data);
    console.log(`Updated flights.totalMiles to ${computedFlightMiles}.`);
  }

  console.log(
    `Valid ${data.year} wrapped data: ${data.cities.length} cities, ${data.flights.segments.length} flights, ${data.steps.yearlyTotal} steps.`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

import path from "node:path";
import Ajv from "ajv";
import {
  REPO_ROOT,
  isCalendarDate,
  monthKeys,
  parseArgs,
  parseYear,
  readJson,
} from "./utils.mjs";

function usage() {
  console.log(`Validate one wrapped data file and verify its computed totals.

Usage:
  node scripts/wrapped/validate.mjs [data/wrapped-2026.json] [--year 2026]

Options:
  --year   Select data/wrapped-<year>.json when no file is provided.
  --help   Show this message.`);
}

function dateYear(date) {
  return Number(date.slice(0, 4));
}

function containsExamplePlaceholder(value) {
  if (typeof value === "string") {
    return value.toUpperCase().includes("EXAMPLE");
  }
  if (Array.isArray(value)) {
    return value.some(containsExamplePlaceholder);
  }
  if (value && typeof value === "object") {
    return Object.values(value).some(containsExamplePlaceholder);
  }
  return false;
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
    const visits = city.firstVisited
      ? [{ start: city.firstVisited, end: city.firstVisited }]
      : city.dates;

    for (const [visitIndex, visit] of visits.entries()) {
      for (const [boundary, date] of Object.entries(visit)) {
        if (!isCalendarDate(date)) {
          errors.push(
            `cities[${index}].dates[${visitIndex}].${boundary} is invalid: ${date}`
          );
        } else if (dateYear(date) !== data.year) {
          errors.push(`cities[${index}] date ${date} is outside ${data.year}.`);
        } else if (date > data.updatedThrough) {
          errors.push(`cities[${index}] date ${date} is after updatedThrough.`);
        }
      }

      if (visit.end < visit.start) {
        errors.push(
          `cities[${index}].dates[${visitIndex}] ends before it starts.`
        );
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
    for (const boundary of ["date", "endDate"]) {
      const date = flight[boundary];
      if (!isCalendarDate(date)) {
        errors.push(
          `flights.segments[${index}].${boundary} is invalid: ${date}`
        );
      } else if (dateYear(date) !== data.year) {
        errors.push(
          `flights.segments[${index}].${boundary} is outside ${data.year}.`
        );
      } else if (date > data.updatedThrough) {
        errors.push(
          `flights.segments[${index}].${boundary} is after updatedThrough.`
        );
      }
    }
    if (flight.endDate < flight.date) {
      errors.push(`flights.segments[${index}] ends before it starts.`);
    }

    if (flight.from === flight.to) {
      errors.push(`flights.segments[${index}] has the same origin and destination.`);
    }
  }
  const summedFlightMiles = data.flights.segments.reduce(
    (total, flight) => total + flight.miles,
    0
  );
  if (summedFlightMiles !== data.flights.totalMiles) {
    errors.push(
      `flights.totalMiles is ${data.flights.totalMiles}, but flight segments sum to ${summedFlightMiles}.`
    );
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
  if (!isCalendarDate(data.steps.updatedThrough)) {
    errors.push(
      `steps.updatedThrough is not a real calendar date: ${data.steps.updatedThrough}`
    );
  } else if (dateYear(data.steps.updatedThrough) !== data.year) {
    errors.push("steps.updatedThrough must fall within the wrapped year.");
  } else if (data.steps.updatedThrough > data.updatedThrough) {
    errors.push("steps.updatedThrough cannot be after updatedThrough.");
  }

  const expectedDailyAverage = Math.round(
    data.steps.yearlyTotal / data.steps.daysTracked
  );
  if (data.steps.dailyAverage !== expectedDailyAverage) {
    errors.push(
      `steps.dailyAverage is ${data.steps.dailyAverage}, but the total across ${data.steps.daysTracked} days averages ${expectedDailyAverage}.`
    );
  }
  if (!isCalendarDate(data.steps.bestDay.date)) {
    errors.push(
      `steps.bestDay.date is not a real calendar date: ${data.steps.bestDay.date}`
    );
  } else if (dateYear(data.steps.bestDay.date) !== data.year) {
    errors.push("steps.bestDay.date must fall within the wrapped year.");
  } else if (data.steps.bestDay.date > data.steps.updatedThrough) {
    errors.push("steps.bestDay.date cannot be after steps.updatedThrough.");
  }
  if (data.steps.bestDay.steps > data.steps.yearlyTotal) {
    errors.push("steps.bestDay.steps cannot exceed steps.yearlyTotal.");
  }

  const containsSampleData = data.driving.example || data.steps.example;
  if (data.example !== containsSampleData) {
    errors.push(
      "example must be true exactly while driving or steps contains sample data."
    );
  }

  if (!data.example && containsExamplePlaceholder(data)) {
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

  console.log(
    `Valid ${data.year} wrapped data: ${data.cities.length} cities, ${data.flights.segments.length} flights, ${data.steps.yearlyTotal} steps.`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

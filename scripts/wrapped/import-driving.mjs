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

const DRIVING_TYPES = new Set([
  "DRIVING",
  "IN_PASSENGER_VEHICLE",
  "IN_VEHICLE",
  "PASSENGER_VEHICLE",
]);
const METERS_PER_MILE = 1609.344;

function usage() {
  console.log(`Import monthly driving mileage from an iPhone Google Maps Timeline export.

Usage:
  node scripts/wrapped/import-driving.mjs --input <timeline.json> [--year 2026] [--output <wrapped.json>]

The input must be the on-device Timeline JSON containing semanticSegments.`);
}

function activityFor(segment) {
  return segment.activity ?? segment.activitySegment ?? null;
}

function normalizedActivityType(segment) {
  const activity = activityFor(segment);
  const rawType =
    activity?.topCandidate?.type ??
    activity?.type ??
    activity?.activityType ??
    segment.activityType ??
    segment.type;

  return typeof rawType === "string"
    ? rawType.trim().toUpperCase().replaceAll(/[\s-]+/g, "_")
    : "";
}

function segmentDate(segment) {
  const activity = activityFor(segment);
  const segmentStart =
    typeof segment.startTime === "object"
      ? segment.startTime?.time
      : segment.startTime;
  const activityStart =
    typeof activity?.startTime === "object"
      ? activity.startTime?.time
      : activity?.startTime;
  const rawDate =
    segmentStart ??
    segment.duration?.startTimestamp ??
    activityStart ??
    activity?.duration?.startTimestamp ??
    activity?.start?.time;

  if (typeof rawDate === "string") {
    const datePrefix = rawDate.slice(0, 10);
    if (isCalendarDate(datePrefix)) {
      return datePrefix;
    }
  }

  if (typeof rawDate === "number" && Number.isFinite(rawDate)) {
    const date = new Date(rawDate);
    if (!Number.isNaN(date.valueOf())) {
      return date.toISOString().slice(0, 10);
    }
  }

  return null;
}

function distanceMetersFor(segment) {
  const activity = activityFor(segment);
  const rawDistance =
    activity?.distanceMeters ??
    activity?.distance?.meters ??
    segment.distanceMeters ??
    activity?.distance;
  const distance = Number(rawDistance);

  return Number.isFinite(distance) && distance >= 0 ? distance : null;
}

function timelineSegments(input) {
  if (Array.isArray(input)) {
    return input;
  }
  if (Array.isArray(input?.semanticSegments)) {
    return input.semanticSegments;
  }
  if (Array.isArray(input?.timelineObjects)) {
    return input.timelineObjects;
  }

  throw new Error(
    'Timeline input must contain a "semanticSegments" array (or legacy "timelineObjects").'
  );
}

function buildMonthlyMiles(segments, year) {
  const metersByMonth = new Map(monthKeys(year).map((month) => [month, 0]));
  let drivingSegmentCount = 0;
  let latestTimelineDate = "";

  for (const [index, segment] of segments.entries()) {
    const date = segmentDate(segment);
    if (date?.startsWith(`${year}-`)) {
      latestTimelineDate = latestDate(latestTimelineDate, date);
    }

    if (!DRIVING_TYPES.has(normalizedActivityType(segment))) {
      continue;
    }

    if (!date) {
      throw new Error(`Driving segment ${index + 1} has no readable start date.`);
    }
    if (!date.startsWith(`${year}-`)) {
      continue;
    }

    const distanceMeters = distanceMetersFor(segment);
    if (distanceMeters === null) {
      throw new Error(
        `Driving segment ${index + 1} (${date}) has no valid distanceMeters value.`
      );
    }

    const month = date.slice(0, 7);
    metersByMonth.set(month, metersByMonth.get(month) + distanceMeters);
    drivingSegmentCount += 1;
  }

  return {
    drivingSegmentCount,
    latestTimelineDate,
    monthlyMiles: [...metersByMonth.entries()].map(([month, meters]) => ({
      month,
      miles: Math.round((meters / METERS_PER_MILE) * 10) / 10,
    })),
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
  const [timeline, data] = await Promise.all([
    readJson(inputPath),
    readJson(outputPath),
  ]);

  if (data.year !== year) {
    throw new Error(`${outputPath} is for ${data.year}, not ${year}.`);
  }

  const summary = buildMonthlyMiles(timelineSegments(timeline), year);
  data.driving.example = false;
  data.driving.monthlyMiles = summary.monthlyMiles;
  data.example = Boolean(data.steps.example);
  data.updatedThrough = latestDate(
    data.updatedThrough,
    summary.latestTimelineDate
  );
  await writeJson(outputPath, data);

  const totalMiles = summary.monthlyMiles.reduce(
    (total, month) => total + month.miles,
    0
  );
  console.log(
    `Imported ${summary.drivingSegmentCount} driving segments (${Math.round(
      totalMiles
    )} miles) into ${outputPath}.`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

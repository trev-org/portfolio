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
const EXPLICIT_FLYING_TYPES = new Set(["FLYING", "IN_AIRPLANE"]);
const METERS_PER_MILE = 1609.344;
const EARTH_RADIUS_KM = 6371.0088;
const FLIGHT_MIN_DISTANCE_METERS = 400_000;
const FLIGHT_MIN_SPEED_KPH = 300;
const MIN_VISIT_HOURS = 0.5;
const MIN_CITY_HOURS = 2;
const CITY_CLUSTER_RADIUS_KM = 5;
const EXISTING_CITY_MATCH_KM = 25;
const FLIGHT_CITY_MATCH_KM = 100;
const GEOCODER_DELAY_MS = 1100;
let nextGeocoderRequestAt = 0;
const HOME = {
  city: "San Francisco",
  lat: 37.7749,
  lng: -122.4194,
  exclusionRadiusKm: 100,
};

// Timeline does not distinguish a private car from a taxi or rideshare, so all
// passenger-vehicle records count as driving. Explicit bus, subway, and train
// records do not. Records that cross a flight threshold are removed from
// driving first, regardless of their original activity label.

function usage() {
  console.log(`Import travel aggregates from an iPhone Google Maps Timeline export.

Usage:
  node scripts/wrapped/import-driving.mjs --input <timeline.json> [--year 2026] [--output <wrapped.json>]

The input must be the on-device Timeline JSON containing semanticSegments.
Only derived cities, flights, and monthly driving totals are written.`);
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

function parseGeo(value) {
  const match = /^geo:([-+\d.]+),([-+\d.]+)$/.exec(value ?? "");
  if (!match) {
    return null;
  }

  const lat = Number(match[1]);
  const lng = Number(match[2]);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

function segmentEndDate(segment) {
  const rawDate =
    typeof segment.endTime === "object"
      ? segment.endTime?.time
      : segment.endTime;
  if (typeof rawDate !== "string") {
    return null;
  }

  const date = rawDate.slice(0, 10);
  return isCalendarDate(date) ? date : null;
}

function durationHours(segment) {
  const start = new Date(
    typeof segment.startTime === "object"
      ? segment.startTime?.time
      : segment.startTime
  );
  const end = new Date(
    typeof segment.endTime === "object"
      ? segment.endTime?.time
      : segment.endTime
  );
  const duration = (end.valueOf() - start.valueOf()) / 3_600_000;
  return Number.isFinite(duration) && duration > 0 ? duration : null;
}

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function distanceKm(first, second) {
  const latitudeDelta = degreesToRadians(second.lat - first.lat);
  const longitudeDelta = degreesToRadians(second.lng - first.lng);
  const firstLatitude = degreesToRadians(first.lat);
  const secondLatitude = degreesToRadians(second.lat);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return (
    2 *
    EARTH_RADIUS_KM *
    Math.asin(Math.min(1, Math.sqrt(haversine)))
  );
}

function isFlightActivity(segment) {
  const distanceMeters = distanceMetersFor(segment);
  const hours = durationHours(segment);
  const speedKph =
    distanceMeters !== null && hours !== null
      ? distanceMeters / 1000 / hours
      : 0;

  return (
    EXPLICIT_FLYING_TYPES.has(normalizedActivityType(segment)) ||
    (distanceMeters !== null &&
      distanceMeters > FLIGHT_MIN_DISTANCE_METERS) ||
    speedKph > FLIGHT_MIN_SPEED_KPH
  );
}

function timelineSegments(input) {
  if (Array.isArray(input)) {
    return input;
  }
  if (Array.isArray(input?.semanticSegments)) {
    return input.semanticSegments;
  }

  throw new Error(
    'Timeline input must be a semantic-segment array or contain a "semanticSegments" array.'
  );
}

function addCalendarDay(date) {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10);
}

function mergeDateRanges(ranges) {
  const ordered = ranges
    .map((range) => ({ ...range }))
    .sort((first, second) => first.start.localeCompare(second.start));
  const merged = [];

  for (const range of ordered) {
    const current = merged.at(-1);
    if (current && range.start <= addCalendarDay(current.end)) {
      current.end = latestDate(current.end, range.end);
    } else {
      merged.push(range);
    }
  }

  return merged;
}

function cityDateRanges(city) {
  if (Array.isArray(city.dates)) {
    return city.dates;
  }
  return city.firstVisited
    ? [{ start: city.firstVisited, end: city.firstVisited }]
    : [];
}

function cityFirstDate(city) {
  return cityDateRanges(city)[0]?.start ?? "9999-12-31";
}

function qualifyingVisits(segments, year) {
  const visits = [];

  for (const segment of segments) {
    const visit = segment.visit ?? segment.placeVisit;
    if (!visit || String(visit.hierarchyLevel ?? "0") !== "0") {
      continue;
    }

    const date = segmentDate(segment);
    const endDate = segmentEndDate(segment) ?? date;
    const hours = durationHours(segment);
    const point = parseGeo(
      visit.topCandidate?.placeLocation ??
        visit.location?.latLng ??
        visit.location
    );

    if (
      !date?.startsWith(`${year}-`) ||
      !point ||
      hours === null ||
      hours < MIN_VISIT_HOURS
    ) {
      continue;
    }

    visits.push({
      ...point,
      hours,
      start: date,
      end: endDate,
    });
  }

  return visits;
}

function clusterVisits(visits) {
  const parents = visits.map((_, index) => index);
  const find = (index) => {
    if (parents[index] !== index) {
      parents[index] = find(parents[index]);
    }
    return parents[index];
  };
  const union = (first, second) => {
    const firstRoot = find(first);
    const secondRoot = find(second);
    if (firstRoot !== secondRoot) {
      parents[secondRoot] = firstRoot;
    }
  };

  for (let first = 0; first < visits.length; first += 1) {
    for (let second = first + 1; second < visits.length; second += 1) {
      if (
        distanceKm(visits[first], visits[second]) <=
        CITY_CLUSTER_RADIUS_KM
      ) {
        union(first, second);
      }
    }
  }

  const groups = new Map();
  for (const [index, visit] of visits.entries()) {
    const root = find(index);
    const group = groups.get(root) ?? [];
    group.push(visit);
    groups.set(root, group);
  }

  return [...groups.values()]
    .map((group) => {
      const hours = group.reduce((total, visit) => total + visit.hours, 0);
      return {
        hours,
        lat:
          group.reduce(
            (total, visit) => total + visit.lat * visit.hours,
            0
          ) / hours,
        lng:
          group.reduce(
            (total, visit) => total + visit.lng * visit.hours,
            0
          ) / hours,
        dates: mergeDateRanges(
          group.map((visit) => ({
            start: visit.start,
            end: visit.end,
          }))
        ),
      };
    })
    .filter(
      (cluster) =>
        cluster.hours >= MIN_CITY_HOURS &&
        distanceKm(cluster, HOME) > HOME.exclusionRadiusKm
    );
}

function closestExistingCity(cluster, cities) {
  let closest = null;
  for (const [index, city] of cities.entries()) {
    const distance = distanceKm(cluster, city);
    if (!closest || distance < closest.distance) {
      closest = { index, distance };
    }
  }

  return closest?.distance <= EXISTING_CITY_MATCH_KM ? closest.index : null;
}

function cityNameFromAddress(address) {
  const name =
    address.city ??
    address.town ??
    address.village ??
    address.municipality;
  if (!name || /^unincorporated\b/i.test(name)) {
    return null;
  }
  if (name === "New York") {
    return "New York City";
  }
  if (name === "Göteborg") {
    return "Gothenburg";
  }
  return name;
}

function regionCountryFromAddress(address) {
  if (address.country_code?.toLowerCase() === "us") {
    return address.state ? `${address.state}, US` : "US";
  }
  return address.state
    ? `${address.state}, ${address.country}`
    : address.country;
}

async function reverseGeocode(point) {
  const waitMs = Math.max(0, nextGeocoderRequestAt - Date.now());
  if (waitMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.search = new URLSearchParams({
    format: "jsonv2",
    lat: String(point.lat),
    lon: String(point.lng),
    zoom: "10",
    addressdetails: "1",
    "accept-language": "en",
  });
  nextGeocoderRequestAt = Date.now() + GEOCODER_DELAY_MS;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "portfolio-wrapped-import/1.0 (https://rovert.io)",
    },
  });
  if (!response.ok) {
    throw new Error(
      `Nominatim reverse geocoding failed with HTTP ${response.status}.`
    );
  }

  const result = await response.json();
  const city = cityNameFromAddress(result.address ?? {});
  const regionCountry = regionCountryFromAddress(result.address ?? {});
  const lat = Number(result.lat);
  const lng = Number(result.lon);
  return city &&
    regionCountry &&
    Number.isFinite(lat) &&
    Number.isFinite(lng)
    ? { city, regionCountry, lat, lng }
    : null;
}

async function reverseGeocodeClusters(clusters) {
  const results = [];

  for (const cluster of clusters) {
    const result = await reverseGeocode(cluster);
    if (result) {
      results.push({ ...cluster, ...result });
    }
  }

  return results;
}

function mergeDerivedCities(cities) {
  const merged = new Map();

  for (const city of cities) {
    const key = `${city.city.toLowerCase()}|${city.regionCountry.toLowerCase()}`;
    const current = merged.get(key);
    if (!current) {
      merged.set(key, { ...city });
      continue;
    }

    const hours = current.hours + city.hours;
    current.lat = (current.lat * current.hours + city.lat * city.hours) / hours;
    current.lng = (current.lng * current.hours + city.lng * city.hours) / hours;
    current.hours = hours;
    current.dates = mergeDateRanges([...current.dates, ...city.dates]);
  }

  return [...merged.values()];
}

async function buildCities(segments, year, existingCities) {
  const clusters = clusterVisits(qualifyingVisits(segments, year));
  const curatedCities = existingCities.filter(
    (city) => city.source !== "timeline"
  );
  const matches = new Map();
  const unmatched = [];

  for (const cluster of clusters) {
    const existingIndex = closestExistingCity(cluster, curatedCities);
    if (existingIndex === null) {
      unmatched.push(cluster);
      continue;
    }

    const cityClusters = matches.get(existingIndex) ?? [];
    cityClusters.push(cluster);
    matches.set(existingIndex, cityClusters);
  }

  const retained = curatedCities.map((existing, index) => {
    const cityClusters = matches.get(index) ?? [];
    const dates = mergeDateRanges([
      ...cityDateRanges(existing),
      ...cityClusters.flatMap((cluster) => cluster.dates),
    ]);
    return {
      city: existing.city,
      regionCountry: existing.regionCountry,
      lat: existing.lat,
      lng: existing.lng,
      dates,
      source: "curated",
    };
  });
  const geocoded = await reverseGeocodeClusters(unmatched);
  const derived = mergeDerivedCities(geocoded).map((city) => ({
    city: city.city,
    regionCountry: city.regionCountry,
    lat: Math.round(city.lat * 10_000) / 10_000,
    lng: Math.round(city.lng * 10_000) / 10_000,
    dates: city.dates,
    source: "timeline",
  }));

  return [...retained, ...derived].sort((first, second) =>
    cityFirstDate(first).localeCompare(cityFirstDate(second))
  );
}

function buildMovementSummary(segments, year) {
  const metersByMonth = new Map(monthKeys(year).map((month) => [month, 0]));
  const flightSegments = [];
  let drivingSegmentCount = 0;
  let latestTimelineDate = "";

  for (const [index, segment] of segments.entries()) {
    const date = segmentDate(segment);
    const endDate = segmentEndDate(segment);
    if (date?.startsWith(`${year}-`)) {
      latestTimelineDate = latestDate(latestTimelineDate, date);
    }
    if (endDate?.startsWith(`${year}-`)) {
      latestTimelineDate = latestDate(latestTimelineDate, endDate);
    }

    const activity = activityFor(segment);
    if (!activity) {
      continue;
    }
    if (!date) {
      throw new Error(`Activity ${index + 1} has no readable start date.`);
    }
    if (!date.startsWith(`${year}-`)) {
      continue;
    }

    if (isFlightActivity(segment)) {
      const start = parseGeo(activity.start);
      const end = parseGeo(activity.end);
      if (!start || !end) {
        throw new Error(
          `Flight activity ${index + 1} (${date}) has no readable start/end coordinates.`
        );
      }
      flightSegments.push({
        date,
        endDate: endDate ?? date,
        start,
        end,
        miles: Math.round(distanceKm(start, end) / 1.609344),
      });
      continue;
    }

    if (!DRIVING_TYPES.has(normalizedActivityType(segment))) {
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
    flightSegments,
    latestTimelineDate,
    monthlyMiles: [...metersByMonth.entries()].map(([month, meters]) => ({
      month,
      miles: Math.round((meters / METERS_PER_MILE) * 10) / 10,
    })),
  };
}

async function cityForFlightPoint(point, cities) {
  if (distanceKm(point, HOME) <= HOME.exclusionRadiusKm) {
    return HOME.city;
  }

  let closest = null;
  for (const city of cities) {
    const distance = distanceKm(point, city);
    if (!closest || distance < closest.distance) {
      closest = { city: city.city, distance };
    }
  }

  if (closest && closest.distance <= FLIGHT_CITY_MATCH_KM) {
    return closest.city;
  }

  const geocoded = await reverseGeocode(point);
  if (!geocoded) {
    throw new Error(
      `Could not resolve a city for flight endpoint ${point.lat},${point.lng}.`
    );
  }
  return geocoded.city;
}

async function buildFlights(flightSegments, cities) {
  const segments = [];
  for (const flight of flightSegments) {
    segments.push({
      date: flight.date,
      endDate: flight.endDate,
      from: await cityForFlightPoint(flight.start, cities),
      to: await cityForFlightPoint(flight.end, cities),
      miles: flight.miles,
    });
  }

  return {
    segments,
    totalMiles: segments.reduce((total, flight) => total + flight.miles, 0),
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

  const segments = timelineSegments(timeline);
  const summary = buildMovementSummary(segments, year);
  const cities = await buildCities(segments, year, data.cities);
  const flights = await buildFlights(summary.flightSegments, cities);
  data.cities = cities;
  data.flights = flights;
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
    )} miles), ${flights.segments.length} flights (${
      flights.totalMiles
    } miles), and ${cities.length} cities into ${outputPath}.`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

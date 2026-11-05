# Wrapped data workflow

`/wrapped` reads one committed, year-specific file: `data/wrapped-2026.json`.
The raw Health and Timeline exports are private inputs and must stay in
`.wrapped-inputs/`, which Git ignores.

## Monthly inputs

Provide these two complete, year-to-date files each month:

1. `.wrapped-inputs/steps-2026.csv` (or `.json`) — Apple Health's merged daily
   step totals.
2. `.wrapped-inputs/timeline-2026.json` — a fresh Google Maps on-device
   Timeline export from the iPhone.

The importers replace all 12 monthly totals for the selected year, so each
input must be a complete year-to-date snapshot rather than only the newest
days. The Timeline importer also derives qualifying cities and flights while
preserving existing manually named cities. Matching visit clusters extend
their date ranges without replacing their curated names or map coordinates.

Run:

```bash
npm run wrapped:steps -- --input .wrapped-inputs/steps-2026.csv --year 2026
npm run wrapped:driving -- --input .wrapped-inputs/timeline-2026.json --year 2026
npm run wrapped:validate
```

The first two commands update only derived aggregates in the committed JSON.
The last command validates the whole file and verifies its computed totals.
The Timeline importer automatically merges `data/wrapped-flights-email.json`;
pass `--email-flights <path>` only when testing a different email export.

`driving.example` and `steps.example` keep sample messaging scoped to those
sections. Each importer clears its own flag, and the root `example` flag remains
true while either section still uses sample data. Validation rejects an
inconsistent flag or hidden `EXAMPLE` placeholders.

## Step input format

CSV is the simplest Shortcut output. It must use this exact header:

```csv
date,source,steps
2026-01-01,health,1234
2026-01-02,health,5678
```

JSON may be either the array below or `{ "rows": [...] }`:

```json
[
  { "date": "2026-01-01", "source": "health", "steps": 1234 },
  { "date": "2026-01-02", "source": "health", "steps": 5678 }
]
```

Rules:

- `date` is local calendar date in `YYYY-MM-DD` format.
- `source` is the literal value `health`.
- `steps` is a non-negative whole-number daily total.
- Include exactly one row for every day from January 1 through the export's
  latest date. The importer rejects gaps and duplicate dates.
- Apple Health has already applied its source priority, so the importer does
  not add or deduplicate source totals.

Legacy source-specific exports using `google` and `iphone` remain supported.
Those modes may include both sources for a date; Google wins when present.
Merged `health` rows cannot be mixed with either legacy source.

## Build the iPhone Shortcut

Create a Shortcut named **Export Wrapped Steps**. Query Health without a
source filter so Apple Health applies the same source priority used in the
Health app.

1. Add a `Date` action for January 1, 2026 and save it as `Year Start`.
2. Add `Current Date` and save it as `Year End`.
3. Add `Find Health Samples` with:
   - Type: `Steps`
   - Start Date: between `Year Start` and `Year End`
   - Source: no filter
   - Group by: `Day`
   - Sort by: `Start Date`, oldest first
4. Repeat through those daily groups. For each group:
   - Format its start date with custom format `yyyy-MM-dd`.
   - Read the group's summed step value and round to the ones place.
   - Create Text as `Formatted Date,health,Rounded Value`.
   - Add that Text to a `Health Rows` variable.
5. Combine `Health Rows` with new lines.
6. Add a final Text action containing the header and combined block:

   ```text
   date,source,steps
   [Health Rows]
   ```

7. Set the file name to `steps-2026.csv`, then use `Save File` or the Share
   Sheet. Transfer the result to `.wrapped-inputs/steps-2026.csv` in this repo.

## Google Maps Timeline input

In Google Maps on the iPhone, open **Your Timeline**, use Timeline's
on-device export option, and transfer the JSON file to
`.wrapped-inputs/timeline-2026.json`. The importer accepts the current
semantic-segment list or a `semanticSegments` wrapper.

A current driving segment is expected to resemble:

```json
{
  "startTime": "2026-05-03T09:15:00-07:00",
  "activity": {
    "topCandidate": { "type": "IN_PASSENGER_VEHICLE" },
    "distanceMeters": 18234
  }
}
```

`DRIVING`, `IN_PASSENGER_VEHICLE`, `IN_VEHICLE`, and `PASSENGER_VEHICLE`
segments count as driving, including taxis and rideshares that Timeline labels
as passenger vehicles. Explicit bus, subway, and train records are excluded.

Before driving totals are calculated, any activity explicitly labeled as
flying, longer than 400 km, or faster than 300 km/h on average is classified
as a flight. This catches long records mislabeled as train or passenger
vehicle and prevents them from also counting as driving. Flight mileage is the
great-circle distance between the activity's start and end coordinates.
Single-day activities get one date; multi-day records keep their full date
range rather than claiming an exact departure date the export does not provide.

City visits use only top-level visit records lasting at least 30 minutes.
Locations within 5 km are clustered before reverse geocoding, and a cluster
must contain at least two hours of visits. The San Francisco home region
(100 km radius) and non-city geocoder results are excluded. Existing named
cities within 25 km of a qualifying cluster keep their curated names; other
cluster centroids are sent to the free OpenStreetMap Nominatim reverse
geocoder at no more than one request every 1.1 seconds. The committed map
coordinates are the geocoder's public city centers, not raw visit centroids.
Flight endpoints without a nearby qualifying city use the same rate-limited
geocoder as a fallback.

Only monthly driving totals, city-level visit ranges, and flight summaries are
written. The raw Timeline export is never copied into committed data.

## Email-confirmed flights

The user's assistant regenerates `data/wrapped-flights-email.json` monthly from
Gmail flight confirmations. Each record retains the airline, flight number
when known, booking and confirmation codes, booking channel when known, travel
date, IATA route, and `source: "email"`:

```json
{
  "schemaVersion": 1,
  "year": 2026,
  "flights": [
    {
      "date": "2026-09-16",
      "airline": "Lufthansa",
      "flightNumber": null,
      "bookingCode": "BHO63Z",
      "confirmationCode": "O3K6WT",
      "bookedVia": "Navan",
      "from": "ARN",
      "to": "MUC",
      "source": "email"
    }
  ]
}
```

The importer merges these records with Timeline-detected flights and
deduplicates by date and displayed route; email wins when both sources contain
the same flight. It computes great-circle mileage and display cities from
`scripts/wrapped/airports.mjs`. Add public coordinates and a city name there
before using a new IATA code. Curated city-level entries, including Munich,
remain in the main Wrapped data and survive later Timeline imports.

## Committed schema

`data/wrapped.schema.json` is the JSON Schema used by the validator. Each
`wrapped-<year>.json` contains:

```text
year, example, updatedThrough
cities[]: city, regionCountry, lat, lng, source, and either firstVisited
          or dates[] ({ start, end } per visit)
flights: segments[] (date/endDate/from/to/miles) and computed totalMiles
driving: example and monthlyMiles[] (month/miles)
steps: example, updatedThrough, monthly[] (month/total/sourceMix),
       yearlyTotal, daysTracked, dailyAverage, and bestDay
```

There must be exactly one ordered monthly row for every month of the file's
year. `updatedThrough`, city dates, and flight dates must also fall in that
year. To start a future year, copy the data file to
`data/wrapped-<year>.json`, reset its values, change `year` and all month keys,
then run the scripts with `--year <year>` and point the page import at the new
file.

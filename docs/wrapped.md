# Wrapped data workflow

`/wrapped` reads one committed, year-specific file: `data/wrapped-2026.json`.
The raw Health and Timeline exports are private inputs and must stay in
`.wrapped-inputs/`, which Git ignores.

## Monthly inputs

Provide these two complete, year-to-date files each month:

1. `.wrapped-inputs/steps-2026.csv` (or `.json`) — daily step totals, split by
   source.
2. `.wrapped-inputs/timeline-2026.json` — a fresh Google Maps on-device
   Timeline export from the iPhone.

The importers replace all 12 monthly totals for the selected year, so each
input must be a complete year-to-date snapshot rather than only the newest
days. Cities and flights are maintained directly in `data/wrapped-2026.json`;
they do not require a private raw-data file.

Run:

```bash
npm run wrapped:steps -- --input .wrapped-inputs/steps-2026.csv --year 2026
npm run wrapped:driving -- --input .wrapped-inputs/timeline-2026.json --year 2026
npm run wrapped:validate -- --write
```

The first two commands update only derived totals in the committed JSON. The
last command validates the whole file and recomputes
`flights.totalMiles` from airport coordinates. If a flight uses an airport that
is not in the small lookup, add its public coordinates to
`scripts/wrapped/airports.mjs`.

Keep `"example": true` until every placeholder is replaced. Before changing it
to `false`, remove all `EXAMPLE` values; validation rejects hidden placeholders.

## Step input format

CSV is the simplest Shortcut output. It must use this exact header:

```csv
date,source,steps
2026-01-01,iphone,1234
2026-04-22,google,5678
2026-04-22,iphone,5432
```

JSON may be either the array below or `{ "rows": [...] }`:

```json
[
  { "date": "2026-01-01", "source": "iphone", "steps": 1234 },
  { "date": "2026-04-22", "source": "google", "steps": 5678 },
  { "date": "2026-04-22", "source": "iphone", "steps": 5432 }
]
```

Rules:

- `date` is local calendar date in `YYYY-MM-DD` format.
- `source` is the literal value `google` or `iphone`.
- `steps` is a non-negative whole-number daily total.
- Include at most one row for each date/source pair.
- It is valid to include both sources for the same day.
- For each day, the importer uses Google's row when one exists, even if its
  value is zero. It uses the iPhone row only when Google has no row. It never
  adds the two sources together.

This gives iPhone-only backfill before Google starts reporting (April 22, 2026
for the intended real dataset) and fills isolated Google gaps later in the
year.

## Build the iPhone Shortcut

Create a Shortcut named **Export Wrapped Steps**. The important part is to run
two source-specific Health queries so the sources are never aggregated
together.

1. Add a `Date` action for January 1, 2026 and save it as `Year Start`.
2. Add `Current Date` and save it as `Year End`.
3. Add `Find Health Samples` with:
   - Type: `Steps`
   - Start Date: between `Year Start` and `Year End`
   - Source: the source shown by Health for Google Fit/Google Health
   - Group by: `Day`
   - Sort by: `Start Date`, oldest first
4. Repeat through those daily groups. For each group:
   - Format its start date with custom format `yyyy-MM-dd`.
   - Read the group's summed step value and round to the ones place.
   - Create Text as `Formatted Date,google,Rounded Value`.
   - Add that Text to a `Google Rows` variable.
5. Add a second `Find Health Samples` with the same date range, grouping, and
   sort, but set Source to the iPhone (the label may be the phone's name).
6. Repeat through those groups and create
   `Formatted Date,iphone,Rounded Value`, adding each line to `iPhone Rows`.
7. Combine `Google Rows` with new lines. Do the same for `iPhone Rows`.
8. Add a final Text action containing the header and both combined blocks:

   ```text
   date,source,steps
   [Google Rows]
   [iPhone Rows]
   ```

9. Set the file name to `steps-2026.csv`, then use `Save File` or the Share
   Sheet. Transfer the result to `.wrapped-inputs/steps-2026.csv` in this repo.

Health's displayed Google source name varies by app/version. The exported
`source` column must still be normalized to the literal `google`; the iPhone
query must emit the literal `iphone`. Inspect a Health step sample's **Data
Source & Access** screen if the correct source is unclear.

## Google Maps Timeline input

In Google Maps on the iPhone, open **Your Timeline**, use Timeline's
on-device export option, and transfer the JSON file to
`.wrapped-inputs/timeline-2026.json`. The importer accepts the current
`semanticSegments` format and the older `timelineObjects` wrapper.

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
segments are included. Distances are grouped by the segment's local start
month, converted with 1 mile = 1,609.344 meters, and written as monthly miles
only. The raw Timeline export is never copied into committed data.

## Committed schema

`data/wrapped.schema.json` is the JSON Schema used by the validator. Each
`wrapped-<year>.json` contains:

```text
year, example, updatedThrough
cities[]: city, regionCountry, lat, lng, and either firstVisited or dates[]
flights: segments[] (date/from/to) and computed totalMiles
driving: monthlyMiles[] (month/miles)
steps: monthly[] (month/total/sourceMix) and yearlyTotal
```

There must be exactly one ordered monthly row for every month of the file's
year. `updatedThrough`, city dates, and flight dates must also fall in that
year. To start a future year, copy the data file to
`data/wrapped-<year>.json`, reset its values, change `year` and all month keys,
then run the scripts with `--year <year>` and point the page import at the new
file.

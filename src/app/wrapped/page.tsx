import type { Metadata } from "next";
import Footer from "../../components/Footer";
import PageHeader from "../../components/layout/PageHeader";
import PageShell from "../../components/layout/PageShell";
import SectionHeader from "../../components/layout/SectionHeader";
import WrappedMap from "../../components/WrappedMap";
import wrappedJson from "../../../data/wrapped-2026.json";
import musicStyles from "../../styles/music.module.css";
import pocketStyles from "../../styles/pocket.module.css";
import styles from "../../styles/wrapped.module.css";
import type {
  WrappedCity,
  WrappedData,
  WrappedFlight,
  WrappedStepsMonth,
  WrappedVisit,
} from "../../types/wrapped";

export const metadata: Metadata = {
  title: "2026 Wrapped | Trevor Gerald",
  description: "Trevor's year in cities, miles, and steps.",
};

const data = wrappedJson as WrappedData;
const numberFormatter = new Intl.NumberFormat("en-US");
const milesFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function formatMonth(month: string, length: "long" | "short" = "short") {
  return new Intl.DateTimeFormat("en-US", {
    month: length,
    timeZone: "UTC",
  }).format(new Date(`${month}-01T00:00:00Z`));
}

function formatVisitRange(visit: WrappedVisit) {
  const startMonth = formatMonth(visit.start.slice(0, 7));
  const endMonth = formatMonth(visit.end.slice(0, 7));
  const startDay = Number(visit.start.slice(8, 10));
  const endDay = Number(visit.end.slice(8, 10));

  if (visit.start === visit.end) {
    return `${startMonth} ${startDay}`;
  }

  return startMonth === endMonth
    ? `${startMonth} ${startDay}–${endDay}`
    : `${startMonth} ${startDay}–${endMonth} ${endDay}`;
}

function formatFlightDate(flight: WrappedFlight) {
  return flight.date === flight.endDate
    ? formatDate(flight.date)
    : `${formatVisitRange({
        start: flight.date,
        end: flight.endDate,
      })}, ${data.year}`;
}

function cityVisitLabel(city: WrappedCity) {
  if (city.firstVisited) {
    return `First visited ${formatDate(city.firstVisited)}`;
  }

  return (city.dates ?? []).map(formatVisitRange).join(" · ");
}

function sourceMixSummary(months: WrappedStepsMonth[]) {
  return months
    .filter((month) => month.total > 0)
    .map((month) => `${formatMonth(month.month)}: ${month.sourceMix}`)
    .join("; ");
}

function sampleMessage() {
  if (data.driving.example && data.steps.example) {
    return "Miles driven and steps are placeholders until the Timeline and Health exports are imported. Travel data is confirmed.";
  }
  if (data.driving.example) {
    return "Miles driven is a placeholder until the Timeline export is imported.";
  }
  return "Steps are placeholders until the Health export is imported.";
}

function HoverFrame() {
  return (
    <>
      <span className={musicStyles.statsCardHoverTopLeft} aria-hidden="true" />
      <span
        className={musicStyles.statsCardHoverBottomRight}
        aria-hidden="true"
      />
      <span className={musicStyles.statsCardHoverLeft} aria-hidden="true" />
      <span className={musicStyles.statsCardHoverBottom} aria-hidden="true" />
    </>
  );
}

function MetricCard({
  label,
  value,
  meta,
}: {
  label: string;
  value: string;
  meta: string;
}) {
  return (
    <article className={musicStyles.statsCard}>
      <HoverFrame />
      <div className={musicStyles.statsCardContent}>
        <div className={styles.metricCardBody}>
          <span className={styles.metricValue}>{value}</span>
          <div className={musicStyles.statsCardInfo}>
            <span className={musicStyles.statsCardName}>{label}</span>
            <span className={musicStyles.statsCardMeta}>{meta}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function WrappedPage() {
  const totalMilesDriven = data.driving.monthlyMiles.reduce(
    (total, month) => total + month.miles,
    0
  );
  const largestStepMonth = Math.max(
    1,
    ...data.steps.monthly.map((month) => month.total)
  );
  const sourceSummary = sourceMixSummary(data.steps.monthly);

  return (
    <PageShell>
      <PageHeader
        title="2026 Wrapped"
        description="Trevor's year in cities, miles, and everyday steps."
        className={musicStyles.fadeInUp}
        actions={
          <time className={styles.updated} dateTime={data.updatedThrough}>
            Updated through {formatDate(data.updatedThrough)}
          </time>
        }
      />

      <div
        className={`${musicStyles.musicContain} ${musicStyles.fadeInUp}`}
        style={{ animationDelay: "0.05s" }}
      >
        <section className={musicStyles.recentlyPlayedContain}>
          <SectionHeader
            title="Year in numbers"
            actions={
              <span className={musicStyles.sectionSubtitle}>
                through {formatDate(data.updatedThrough)}
              </span>
            }
          />

          <div className={musicStyles.statsCards}>
            <MetricCard
              label="Cities visited"
              value={numberFormatter.format(data.cities.length)}
              meta="City-level locations only"
            />
            <MetricCard
              label="Miles flown"
              value={milesFormatter.format(data.flights.totalMiles)}
              meta={`${data.flights.segments.length} flights · great-circle`}
            />
            <MetricCard
              label="Miles driven"
              value={milesFormatter.format(totalMilesDriven)}
              meta={
                data.driving.example
                  ? "Sample · waiting for Timeline export"
                  : "Summed from monthly Timeline totals"
              }
            />
            <MetricCard
              label="Steps YTD"
              value={numberFormatter.format(data.steps.yearlyTotal)}
              meta={
                data.steps.example
                  ? "Sample · waiting for Health export"
                  : `${data.steps.daysTracked} days through ${formatDate(
                      data.steps.updatedThrough
                    )}`
              }
            />
          </div>

          {data.example && (
            <div className={styles.sampleNotice} role="status">
              <span className={pocketStyles.draftBadge}>Sample activity</span>
              <p>{sampleMessage()}</p>
            </div>
          )}
        </section>

        <section className={musicStyles.statsContain}>
          <SectionHeader
            title="Cities visited"
            actions={
              <span className={musicStyles.sectionSubtitle}>
                {data.cities.length} city-level places
              </span>
            }
          />

          <div className={styles.mapCard}>
            <WrappedMap cities={data.cities} />
            {data.cities.length === 0 && (
              <p className={styles.emptyMap}>No cities added yet.</p>
            )}
          </div>

          <ol className={styles.cityList}>
            {data.cities.map((city, index) => (
              <li key={`${city.city}-${city.regionCountry}-${index}`}>
                <span className={styles.cityIndex}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={styles.cityInfo}>
                  <span className={pocketStyles.articleTitle}>{city.city}</span>
                  <span className={pocketStyles.articleDescription}>
                    {city.regionCountry}
                  </span>
                </span>
                <span
                  className={`${pocketStyles.writtenArticleMeta} ${styles.cityDate}`}
                >
                  {cityVisitLabel(city)}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className={musicStyles.statsContain}>
          <SectionHeader
            title="Steps by month"
            actions={
              <span className={musicStyles.sectionSubtitle}>
                {numberFormatter.format(data.steps.yearlyTotal)} through{" "}
                {formatDate(data.steps.updatedThrough)}
              </span>
            }
          />

          <div className={musicStyles.statsCards}>
            <MetricCard
              label="Daily average"
              value={numberFormatter.format(data.steps.dailyAverage)}
              meta={`Across ${data.steps.daysTracked} tracked days`}
            />
            <MetricCard
              label="Best day"
              value={numberFormatter.format(data.steps.bestDay.steps)}
              meta={formatDate(data.steps.bestDay.date)}
            />
          </div>

          <div className={musicStyles.genreChart}>
            {data.steps.monthly.map((month) => (
              <div className={musicStyles.genreRow} key={month.month}>
                <span className={musicStyles.genreName}>
                  {formatMonth(month.month)}
                </span>
                <div
                  className={musicStyles.genreBarTrack}
                  title={`${formatMonth(month.month, "long")}: ${numberFormatter.format(
                    month.total
                  )} steps. ${month.sourceMix}`}
                >
                  <div
                    className={musicStyles.genreBarFill}
                    style={{
                      width: `${
                        month.total === 0
                          ? 0
                          : Math.max(
                              (month.total / largestStepMonth) * 100,
                              4
                            )
                      }%`,
                    }}
                  />
                </div>
                <span className={musicStyles.genreValue}>
                  {numberFormatter.format(month.total)}
                </span>
              </div>
            ))}
          </div>

          <p className={styles.sourceNote}>
            <sup>*</sup> Daily totals come from Apple Health after it applies
            its source priority. The export is already merged, so no source
            totals are added or deduplicated.
            {sourceSummary && ` Coverage — ${sourceSummary}.`}
          </p>
        </section>

        <section className={musicStyles.statsContain}>
          <SectionHeader
            title="Flight log"
            actions={
              <span className={musicStyles.sectionSubtitle}>
                {data.flights.segments.length} flown ·{" "}
                {milesFormatter.format(data.flights.totalMiles)} miles
              </span>
            }
          />

          <ol className={styles.flightList}>
            {data.flights.segments.map((flight, index) => (
              <li
                key={`${flight.date}-${flight.endDate}-${flight.from}-${flight.to}-${index}`}
              >
                <span className={styles.flightMeta}>
                  <span className={pocketStyles.writtenArticleMeta}>
                    {formatFlightDate(flight)}
                  </span>
                  <span className={styles.flightMiles}>
                    {milesFormatter.format(flight.miles)} mi
                  </span>
                </span>
                <span className={styles.flightRoute}>
                  <span className={musicStyles.albumReviewItemCompany}>
                    {flight.from}
                  </span>
                  <span className={styles.flightLine} aria-hidden="true" />
                  <span className={musicStyles.albumReviewItemCompany}>
                    {flight.to}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <Footer />
    </PageShell>
  );
}

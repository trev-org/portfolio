import type { Metadata } from "next";
import Link from "next/link";
import Footer from "../../components/Footer";
import WrappedMap from "../../components/WrappedMap";
import wrappedJson from "../../../data/wrapped-2026.json";
import musicStyles from "../../styles/music.module.css";
import pocketStyles from "../../styles/pocket.module.css";
import styles from "../../styles/wrapped.module.css";
import type {
  WrappedCity,
  WrappedData,
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
    <div className={pocketStyles.landingContain}>
      <div
        className={`${pocketStyles.brandingContain} ${pocketStyles.fadeInUp}`}
      >
        <div className={pocketStyles.brandingHeader}>
          <Link className={pocketStyles.name} href="/">
            2026 Wrapped
          </Link>
        </div>
        <div className={styles.introBlock}>
          <p className={pocketStyles.intro}>
            Trevor&apos;s year in cities, miles, and everyday steps.
          </p>
          <p className={styles.updated}>
            Updated through{" "}
            <time dateTime={data.updatedThrough}>
              {formatDate(data.updatedThrough)}
            </time>
          </p>
        </div>
      </div>

      <div
        className={`${pocketStyles.musicContain} ${pocketStyles.fadeInUp}`}
        style={{ animationDelay: "0.05s" }}
      >
        <section className={musicStyles.recentlyPlayedContain}>
          <div className={musicStyles.sectionTitleContainer}>
            <span className={musicStyles.sectionTitle}>Year in numbers</span>
            <span className={musicStyles.sectionSubtitle}>
              through {formatDate(data.updatedThrough)}
            </span>
          </div>

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
              label="Steps"
              value={numberFormatter.format(data.steps.yearlyTotal)}
              meta={
                data.steps.example
                  ? "Sample · waiting for Health export"
                  : "One preferred source per day"
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
          <div className={musicStyles.sectionTitleContainer}>
            <span className={musicStyles.sectionTitle}>Cities visited</span>
            <span className={musicStyles.sectionSubtitle}>
              {data.cities.length} city-level places
            </span>
          </div>

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
          <div className={musicStyles.sectionTitleContainer}>
            <span className={musicStyles.sectionTitle}>Steps by month</span>
            <span className={musicStyles.sectionSubtitle}>
              {numberFormatter.format(data.steps.yearlyTotal)} total
            </span>
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
            <sup>*</sup> Daily totals use Google Health when it has data for
            that day; otherwise iPhone fills the gap. The sources are never
            added together.
            {sourceSummary && ` Source mix — ${sourceSummary}.`}
          </p>
        </section>

        <section className={musicStyles.statsContain}>
          <div className={musicStyles.sectionTitleContainer}>
            <span className={musicStyles.sectionTitle}>Flight log</span>
            <span className={musicStyles.sectionSubtitle}>
              {data.flights.segments.length} flown ·{" "}
              {milesFormatter.format(data.flights.totalMiles)} miles
            </span>
          </div>

          <ol className={styles.flightList}>
            {data.flights.segments.map((flight, index) => (
              <li key={`${flight.date}-${flight.from}-${flight.to}-${index}`}>
                <time
                  className={pocketStyles.writtenArticleMeta}
                  dateTime={flight.date}
                >
                  {formatDate(flight.date)}
                </time>
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
    </div>
  );
}

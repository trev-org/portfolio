import type { Metadata } from "next";
import Link from "next/link";
import Footer from "../../components/Footer";
import WrappedMap from "../../components/WrappedMap";
import wrappedJson from "../../../data/wrapped-2026.json";
import styles from "../../styles/wrapped.module.css";
import type {
  WrappedCity,
  WrappedData,
  WrappedStepsMonth,
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

function cityVisitLabel(city: WrappedCity) {
  if (city.firstVisited) {
    return `First visited ${formatDate(city.firstVisited)}`;
  }

  const dates = city.dates ?? [];
  return `${dates.length} visit${dates.length === 1 ? "" : "s"}`;
}

function sourceMixSummary(months: WrappedStepsMonth[]) {
  return months
    .filter((month) => month.total > 0)
    .map((month) => `${formatMonth(month.month)}: ${month.sourceMix}`)
    .join("; ");
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
    <main className={styles.page}>
      <div className={styles.ambientGlow} aria-hidden="true" />

      <header className={styles.header}>
        <Link className={styles.homeLink} href="/">
          Trevor Gerald
        </Link>
        <span className={styles.headerLabel}>
          Wrapped <span aria-hidden="true">/</span> {data.year}
        </span>
      </header>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>A year in motion</p>
        <h1>
          <span>{data.year}</span>
          Wrapped.
        </h1>
        <p className={styles.heroCopy}>
          The cities, miles, and everyday steps that made up Trevor&apos;s
          year.
        </p>
        <p className={styles.updated}>
          Updated through{" "}
          <time dateTime={data.updatedThrough}>
            {formatDate(data.updatedThrough)}
          </time>
        </p>
      </section>

      {data.example && (
        <aside className={styles.sampleBanner} role="status">
          <span>Sample data</span>
          Every value on this page is a clearly marked placeholder. Nothing
          here represents Trevor&apos;s travel or health history.
        </aside>
      )}

      <section className={styles.numberGrid} aria-label="Year totals">
        <article className={`${styles.numberCard} ${styles.citiesCard}`}>
          <p className={styles.cardKicker}>Cities visited</p>
          <p className={styles.bigNumber}>{numberFormatter.format(data.cities.length)}</p>
          <p className={styles.cardMeta}>City-level locations only</p>
        </article>
        <article className={`${styles.numberCard} ${styles.flightsCard}`}>
          <p className={styles.cardKicker}>Miles flown</p>
          <p className={styles.bigNumber}>
            {milesFormatter.format(data.flights.totalMiles)}
          </p>
          <p className={styles.cardMeta}>
            {data.flights.segments.length} flight
            {data.flights.segments.length === 1 ? "" : "s"} · great-circle
          </p>
        </article>
        <article className={`${styles.numberCard} ${styles.drivingCard}`}>
          <p className={styles.cardKicker}>Miles driven</p>
          <p className={styles.bigNumber}>
            {milesFormatter.format(totalMilesDriven)}
          </p>
          <p className={styles.cardMeta}>Summed from monthly Timeline totals</p>
        </article>
        <article className={`${styles.numberCard} ${styles.stepsCard}`}>
          <p className={styles.cardKicker}>Steps</p>
          <p className={styles.bigNumber}>
            {numberFormatter.format(data.steps.yearlyTotal)}
          </p>
          <p className={styles.cardMeta}>One preferred source per day</p>
        </article>
      </section>

      <section className={styles.travelSection}>
        <div className={styles.sectionHeading}>
          <p className={styles.sectionNumber}>01</p>
          <div>
            <p className={styles.eyebrow}>Pin by pin</p>
            <h2>The year had coordinates.</h2>
          </div>
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
              <span className={styles.cityName}>{city.city}</span>
              <span className={styles.cityRegion}>{city.regionCountry}</span>
              <span className={styles.cityDate}>{cityVisitLabel(city)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.stepsSection}>
        <div className={styles.sectionHeading}>
          <p className={styles.sectionNumber}>02</p>
          <div>
            <p className={styles.eyebrow}>Twelve months on foot</p>
            <h2>Every step, without double counting.</h2>
          </div>
        </div>

        <div className={styles.stepChart}>
          {data.steps.monthly.map((month) => {
            const height =
              month.total === 0
                ? "2px"
                : `${Math.max((month.total / largestStepMonth) * 100, 4)}%`;

            return (
              <div className={styles.stepMonth} key={month.month}>
                <p className={styles.stepTotal}>
                  {numberFormatter.format(month.total)}
                </p>
                <div
                  className={styles.stepBarTrack}
                  title={`${formatMonth(month.month, "long")}: ${numberFormatter.format(
                    month.total
                  )} steps. ${month.sourceMix}`}
                >
                  <span
                    className={styles.stepBar}
                    style={{ height }}
                    aria-hidden="true"
                  />
                </div>
                <p className={styles.monthLabel}>
                  {formatMonth(month.month)}
                </p>
              </div>
            );
          })}
        </div>

        <p className={styles.sourceNote}>
          <sup>*</sup> Daily totals use Google Health when it has data for that
          day; otherwise iPhone fills the gap. The two sources are never added
          together.
          {sourceSummary && ` Source mix — ${sourceSummary}.`}
        </p>
      </section>

      {data.flights.segments.length > 0 && (
        <section className={styles.flightLog}>
          <div className={styles.sectionHeading}>
            <p className={styles.sectionNumber}>03</p>
            <div>
              <p className={styles.eyebrow}>Flight log</p>
              <h2>Great circles, one leg at a time.</h2>
            </div>
          </div>
          <ol>
            {data.flights.segments.map((flight, index) => (
              <li key={`${flight.date}-${flight.from}-${flight.to}-${index}`}>
                <time dateTime={flight.date}>{formatDate(flight.date)}</time>
                <span>{flight.from}</span>
                <span className={styles.flightLine} aria-hidden="true" />
                <span>{flight.to}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <Footer />
    </main>
  );
}

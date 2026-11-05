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
import type { WrappedData } from "../../types/wrapped";

export const metadata: Metadata = {
  title: "Wrapped | Trevor Gerald",
  description: "Trevor's year in cities, miles, and steps.",
};

const data = wrappedJson as WrappedData;
const numberFormatter = new Intl.NumberFormat("en-US");
const milesFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});
const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
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

function getAxisScale(maxValue: number) {
  if (maxValue <= 0) return { max: 1, ticks: [0, 1] };

  const roughStep = maxValue / 4;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalizedStep = roughStep / magnitude;
  const multiplier =
    normalizedStep <= 1
      ? 1
      : normalizedStep <= 2
        ? 2
        : normalizedStep <= 5
          ? 5
          : 10;
  const step = multiplier * magnitude;
  const max = Math.ceil(maxValue / step) * step;
  const ticks = Array.from(
    { length: Math.round(max / step) + 1 },
    (_, index) => index * step
  );

  return { max, ticks };
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
  const trackedStepMonths = data.steps.monthly.filter(
    (month) => month.total > 0
  );
  const stepAxisScale = getAxisScale(
    Math.max(0, ...trackedStepMonths.map((month) => month.total))
  );

  return (
    <PageShell>
      <PageHeader
        title="Wrapped"
        description="My year in cities, miles, and steps."
        className={musicStyles.fadeInUp}
      />

      <div
        className={`${musicStyles.musicContain} ${musicStyles.fadeInUp}`}
        style={{ animationDelay: "0.05s" }}
      >
        <section className={musicStyles.recentlyPlayedContain}>
          <SectionHeader
            title="Numbers"
          />

          <div className={musicStyles.statsCards}>
            <MetricCard
              label="Cities Visited"
              value={numberFormatter.format(data.cities.length)}
              meta="from timeline data"
            />
            <MetricCard
              label="Miles Flown"
              value={milesFormatter.format(data.flights.totalMiles)}
              meta={`from ${data.flights.segments.length} flights`}
            />
            <MetricCard
              label="Miles Driven"
              value={milesFormatter.format(totalMilesDriven)}
              meta="from timeline data"
            />
            <MetricCard
              label="Steps"
              value={numberFormatter.format(data.steps.yearlyTotal)}
              meta="from health data"
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
            title="Cities"
            className={styles.mapSectionHeader}
          />

          <WrappedMap cities={data.cities} />
        </section>

        <section className={musicStyles.statsContain}>
          <SectionHeader
            title="Steps"
          />

          <div className={musicStyles.statsCards}>
            <MetricCard
              label="Daily Average"
              value={numberFormatter.format(data.steps.dailyAverage)}
              meta={`across ${data.steps.daysTracked} days`}
            />
            <MetricCard
              label="Best Day"
              value={numberFormatter.format(data.steps.bestDay.steps)}
              meta={formatDate(data.steps.bestDay.date)}
            />
          </div>

          <div className={musicStyles.genreChart}>
            <div className={musicStyles.genreGrid} aria-hidden="true">
              {stepAxisScale.ticks.slice(1, -1).map((tick) => (
                <span
                  className={musicStyles.genreGridLine}
                  style={{ left: `${(tick / stepAxisScale.max) * 100}%` }}
                  key={tick}
                />
              ))}
            </div>
            <div className={musicStyles.genreRows}>
              {trackedStepMonths.map((month) => (
                <div className={musicStyles.genreRow} key={month.month}>
                  <div className={musicStyles.genreLabels}>
                    <span className={musicStyles.genreName}>
                      {formatMonth(month.month)}
                    </span>
                    <span className={musicStyles.genreValue}>
                      {numberFormatter.format(month.total)}
                    </span>
                  </div>
                  <div
                    className={musicStyles.genreBarTrack}
                    title={`${formatMonth(month.month, "long")}: ${numberFormatter.format(
                      month.total
                    )} steps. ${month.sourceMix}`}
                  >
                    <div
                      className={musicStyles.genreBarFill}
                      style={{
                        width: `${(month.total / stepAxisScale.max) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className={musicStyles.genreAxis} aria-hidden="true">
              {stepAxisScale.ticks.map((tick) => (
                <span
                  className={`${musicStyles.genreAxisLabel} ${
                    tick === stepAxisScale.max
                      ? musicStyles.genreAxisLabelEnd
                      : ""
                  }`}
                  style={{ left: `${(tick / stepAxisScale.max) * 100}%` }}
                  key={tick}
                >
                  {tick === 0 ? "0" : compactNumberFormatter.format(tick)}
                </span>
              ))}
            </div>
          </div>
        </section>

      </div>

      <Footer />
    </PageShell>
  );
}

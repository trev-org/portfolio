"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  getArtistDetailsByIds,
  getMyTopArtists,
  getMyTopTracks,
} from "../lib/spotify";
import SectionHeader from "./layout/SectionHeader";
import styles from "../styles/music.module.css";
import type {
  GenreScore,
  History,
  ListeningStats as ListeningStatsData,
  StatsRange,
  StatsTopItem,
} from "../types/types";

const RANGE_OPTIONS: Array<{ id: StatsRange; label: string }> = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "All Time" },
];

const MAX_GENRE_BARS = 6;
const GENRES_PER_ARTIST = 3;
const SKELETON_GENRE_WIDTHS = [88, 76, 64, 52, 43, 34];
const SKELETON_AXIS_POSITIONS = [0, 25, 50, 75, 100];
const STATS_CACHE_PREFIX = "listening-stats:v5";
const STATS_CACHE_TTL: Record<StatsRange, number> = {
  day: 60 * 1000,
  week: 60 * 1000,
  month: 15 * 60 * 1000,
  year: 15 * 60 * 1000,
};

type StatsCacheEntry = {
  cacheKey: string;
  data: ListeningStatsData;
  expiresAt: number;
};

type StoredStatsCacheEntry = Omit<StatsCacheEntry, "cacheKey">;

type ListeningStatsProps = {
  recentPlays: History[];
  isRecentPlaysLoading: boolean;
  recentPlaysError: string | null;
};

function startOfDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

/** Sunday 00:00 local — start of the current week. */
function startOfWeekSunday(date: Date): Date {
  const start = startOfDay(date);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

function getStatsCacheKey(range: StatsRange): string {
  const now = new Date();
  const period =
    range === "day"
      ? startOfDay(now).getTime()
      : range === "week"
        ? startOfWeekSunday(now).getTime()
        : "rolling";

  return `${STATS_CACHE_PREFIX}:${range}:${period}`;
}

function readStoredStats(range: StatsRange): StatsCacheEntry | null {
  if (typeof window === "undefined") return null;

  const cacheKey = getStatsCacheKey(range);

  try {
    const stored = window.sessionStorage.getItem(cacheKey);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as StoredStatsCacheEntry;
    if (
      parsed.expiresAt <= Date.now() ||
      !parsed.data ||
      parsed.data.range !== range
    ) {
      window.sessionStorage.removeItem(cacheKey);
      return null;
    }

    return { ...parsed, cacheKey };
  } catch {
    return null;
  }
}

function writeStoredStats(entry: StatsCacheEntry): void {
  if (typeof window === "undefined") return;

  try {
    const stored: StoredStatsCacheEntry = {
      data: entry.data,
      expiresAt: entry.expiresAt,
    };
    window.sessionStorage.setItem(entry.cacheKey, JSON.stringify(stored));
  } catch {
    // Storage can be disabled; the in-memory cache still works.
  }
}

function formatDay(date: Date): string {
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function titleCase(genre: string): string {
  return genre.replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatFollowerCount(count: number): string {
  const compactCount = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(count);

  return `${compactCount} followers`;
}

function sortGenres(scores: Map<string, number>): GenreScore[] {
  return [...scores.entries()]
    .map(([genre, score]) => ({ genre, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_GENRE_BARS);
}

/**
 * Day/week stats are computed from actual plays in the window.
 * Spotify's recently-played endpoint caps at the 50 most recent plays,
 * so very heavy windows can undercount.
 */
async function computePlayStats(
  range: "day" | "week",
  recentPlays: History[]
): Promise<ListeningStatsData> {
  const now = new Date();
  const start = range === "day" ? startOfDay(now) : startOfWeekSunday(now);
  const plays = recentPlays.filter(
    (play) => new Date(play.played_at) >= start
  );

  const rangeLabel =
    range === "day"
      ? `Today · ${formatDay(now)}`
      : `${formatDay(start)} – ${formatDay(now)}`;
  const note = "Counted from your 50 most recent plays";

  if (plays.length === 0) {
    return { range, rangeLabel, note, topArtist: null, topSong: null, genres: [] };
  }

  const artistDetails = await getArtistDetailsByIds(
    plays.map((play) => play.artistId ?? "").filter(Boolean)
  );

  const artistCounts = new Map<string, { artist: History; plays: number }>();
  const songCounts = new Map<string, { song: History; plays: number }>();
  for (const play of plays) {
    const artistKey = play.artistId ?? play.artist;
    const artistEntry = artistCounts.get(artistKey);
    if (artistEntry) artistEntry.plays += 1;
    else artistCounts.set(artistKey, { artist: play, plays: 1 });

    const songKey = play.trackId ?? `${play.name} — ${play.artist}`;
    const songEntry = songCounts.get(songKey);
    if (songEntry) songEntry.plays += 1;
    else songCounts.set(songKey, { song: play, plays: 1 });
  }

  const topArtistEntry = [...artistCounts.values()].sort(
    (a, b) => b.plays - a.plays
  )[0];
  const topSongEntry = [...songCounts.values()].sort(
    (a, b) => b.plays - a.plays
  )[0];

  const topArtist: StatsTopItem = {
    name: topArtistEntry.artist.artist,
    image: topArtistEntry.artist.artistId
      ? artistDetails.get(topArtistEntry.artist.artistId)?.image
      : undefined,
    plays: topArtistEntry.plays,
    url: topArtistEntry.artist.artistId
      ? `https://open.spotify.com/artist/${topArtistEntry.artist.artistId}`
      : undefined,
  };
  const topSong: StatsTopItem = {
    name: topSongEntry.song.name,
    artist: topSongEntry.song.artist,
    image: topSongEntry.song.image,
    plays: topSongEntry.plays,
    url: topSongEntry.song.url,
  };

  const genreScores = new Map<string, number>();
  for (const [artistKey, { plays: count }] of artistCounts) {
    const genres = (artistDetails.get(artistKey)?.genres ?? []).slice(
      0,
      GENRES_PER_ARTIST
    );
    for (const genre of genres) {
      genreScores.set(genre, (genreScores.get(genre) ?? 0) + count);
    }
  }

  return {
    range,
    rangeLabel,
    note,
    topArtist,
    topSong,
    genres: sortGenres(genreScores),
  };
}

/**
 * Month/all-time stats come from Spotify's ranked top-items windows, which have
 * no play counts — top items are ranks and genre bars are rank-weighted.
 * Month maps to Spotify's ~4-week window, all time to its long-term window.
 */
async function computeTopStats(range: "month" | "year"): Promise<ListeningStatsData> {
  const timeRange = range === "month" ? "short_term" : "long_term";
  const [artists, tracks] = await Promise.all([
    getMyTopArtists(timeRange, 50),
    getMyTopTracks(timeRange, 50),
  ]);

  const rangeLabel = range === "month" ? "Last ~4 weeks" : "All time";
  const note =
    range === "month"
      ? "Spotify's top items over the last ~4 weeks"
      : "Spotify's long-term top items";

  const topArtist: StatsTopItem | null = artists[0]
    ? {
        name: artists[0].name,
        detail: formatFollowerCount(artists[0].followers),
        image: artists[0].image,
        url: artists[0].url,
      }
    : null;
  const topSong: StatsTopItem | null = tracks[0]
    ? {
        name: tracks[0].name,
        artist: tracks[0].artist,
        image: tracks[0].image,
        url: tracks[0].url,
      }
    : null;

  const genreScores = new Map<string, number>();
  artists.forEach((artist, index) => {
    const genres = artist.genres.slice(0, GENRES_PER_ARTIST);
    if (genres.length === 0) return;
    const share = (artists.length - index) / genres.length;
    for (const genre of genres) {
      genreScores.set(genre, (genreScores.get(genre) ?? 0) + share);
    }
  });

  return {
    range,
    rangeLabel,
    note,
    topArtist,
    topSong,
    genres: sortGenres(genreScores),
  };
}

async function computeStats(
  range: StatsRange,
  recentPlays: History[]
): Promise<ListeningStatsData> {
  if (range === "day" || range === "week") {
    return computePlayStats(range, recentPlays);
  }
  return computeTopStats(range);
}

function playsLabel(item: StatsTopItem, noun: string): string {
  return item.plays !== undefined
    ? `${item.plays} ${item.plays === 1 ? "play" : "plays"}`
    : noun;
}

function getAxisScale(
  maxValue: number,
  wholeNumbersOnly: boolean
): { max: number; ticks: number[] } {
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
  const niceStep = Math.max(
    wholeNumbersOnly ? 1 : Number.EPSILON,
    multiplier * magnitude
  );
  const axisMax = Math.ceil(maxValue / niceStep) * niceStep;
  const tickCount = Math.round(axisMax / niceStep);
  const ticks = Array.from({ length: tickCount + 1 }, (_, index) =>
    Number((index * niceStep).toFixed(10))
  );

  return { max: axisMax, ticks };
}

function StatsCardAccents() {
  return (
    <>
      <span className={styles.statsCardHoverTopLeft} aria-hidden="true" />
      <span className={styles.statsCardHoverBottomRight} aria-hidden="true" />
      <span className={styles.statsCardHoverLeft} aria-hidden="true" />
      <span className={styles.statsCardHoverBottom} aria-hidden="true" />
    </>
  );
}

function ListeningStatsSkeleton() {
  return (
    <div
      className={styles.statsSkeleton}
      role="status"
      aria-label="Loading listening stats"
    >
      <div className={styles.statsCards} aria-hidden="true">
        {[
          { type: "artist", label: "Top Artist" },
          { type: "song", label: "Top Song" },
        ].map(({ type, label }) => (
          <div className={styles.statsCardGroup} key={type}>
            <h3 className={styles.statsCardLabel}>{label}</h3>
            <div
              className={`${styles.statsCard} ${styles.statsCardSkeleton}`}
            >
              <div className={styles.statsCardContent}>
                <div className={styles.statsCardBody}>
                  <div
                    className={`${styles.skeletonBlock} ${styles.statsImageSkeleton}`}
                  />
                  <div className={styles.statsCardInfo}>
                    <div
                      className={`${styles.skeletonBlock} ${styles.statsNameSkeleton}`}
                    />
                    <div
                      className={`${styles.skeletonBlock} ${styles.statsDetailSkeleton}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.genreChart} aria-hidden="true">
        <div className={styles.genreGrid}>
          {SKELETON_AXIS_POSITIONS.slice(1, -1).map((position) => (
            <span
              className={styles.genreGridLine}
              style={{ left: `${position}%` }}
              key={position}
            />
          ))}
        </div>
        <div className={styles.genreRows}>
          {SKELETON_GENRE_WIDTHS.map((width) => (
            <div className={styles.genreRow} key={width}>
              <div className={styles.genreLabels}>
                <div
                  className={`${styles.skeletonBlock} ${styles.genreNameSkeleton}`}
                />
                <div
                  className={`${styles.skeletonBlock} ${styles.genreValueSkeleton}`}
                />
              </div>
              <div className={styles.genreBarTrack}>
                <div
                  className={`${styles.skeletonBlock} ${styles.genreBarSkeleton}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className={styles.genreAxis}>
          {SKELETON_AXIS_POSITIONS.map((position) => (
            <div
              className={`${styles.skeletonBlock} ${styles.genreTickSkeleton}`}
              style={{ left: `${position}%` }}
              key={position}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const ListeningStats: React.FC<ListeningStatsProps> = ({
  recentPlays,
  isRecentPlaysLoading,
  recentPlaysError,
}) => {
  const [range, setRange] = useState<StatsRange>("day");
  const [stats, setStats] = useState<ListeningStatsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const cacheRef = useRef(new Map<StatsRange, StatsCacheEntry>());
  const requestSequenceRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: "400px 0px" }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const loadStats = useCallback(
    async (selectedRange: StatsRange) => {
      const requestSequence = ++requestSequenceRef.current;
      const cacheKey = getStatsCacheKey(selectedRange);
      const now = Date.now();
      const memoryEntry = cacheRef.current.get(selectedRange);

      if (
        memoryEntry &&
        memoryEntry.cacheKey === cacheKey &&
        memoryEntry.expiresAt > now
      ) {
        setStats(memoryEntry.data);
        setError(null);
        setIsLoading(false);
        return;
      }
      if (memoryEntry) {
        cacheRef.current.delete(selectedRange);
      }

      const storedEntry = readStoredStats(selectedRange);
      if (storedEntry) {
        cacheRef.current.set(selectedRange, storedEntry);
        setStats(storedEntry.data);
        setError(null);
        setIsLoading(false);
        return;
      }

      const needsRecentPlays =
        selectedRange === "day" || selectedRange === "week";
      if (needsRecentPlays && isRecentPlaysLoading) {
        setIsLoading(true);
        setError(null);
        return;
      }
      if (needsRecentPlays && recentPlaysError) {
        setStats(null);
        setError(recentPlaysError);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const result = await computeStats(selectedRange, recentPlays);
        const entry: StatsCacheEntry = {
          cacheKey,
          data: result,
          expiresAt: Date.now() + STATS_CACHE_TTL[selectedRange],
        };
        cacheRef.current.set(selectedRange, entry);
        writeStoredStats(entry);

        if (requestSequence === requestSequenceRef.current) {
          setStats(result);
        }
      } catch (caughtError) {
        if (requestSequence !== requestSequenceRef.current) return;

        setStats(null);
        const message =
          caughtError instanceof Error ? caughtError.message : "";
        setError(
          message.includes("(403")
            ? "Spotify hasn't granted stats access yet (the token needs the user-top-read scope — re-run npm run spotify:auth)."
            : "Listening stats are temporarily unavailable."
        );
      } finally {
        if (requestSequence === requestSequenceRef.current) {
          setIsLoading(false);
        }
      }
    },
    [isRecentPlaysLoading, recentPlays, recentPlaysError]
  );

  useEffect(() => {
    if (!shouldLoad) return;

    void loadStats(range);

    return () => {
      requestSequenceRef.current += 1;
    };
  }, [range, loadStats, shouldLoad]);

  const isPlayBased = range === "day" || range === "week";
  const totalGenreScore =
    stats?.genres.reduce((sum, genre) => sum + genre.score, 0) ?? 0;
  const maxGenreValue = stats?.genres[0]
    ? isPlayBased
      ? stats.genres[0].score
      : totalGenreScore > 0
        ? (stats.genres[0].score / totalGenreScore) * 100
        : 0
    : 0;
  const axisScale = getAxisScale(maxGenreValue, isPlayBased);

  return (
    <section className={styles.statsContain} ref={sectionRef}>
      <SectionHeader
        title="Listening Stats"
        actions={
          <>
            <div
              className={styles.statsTabs}
              role="group"
              aria-label="Stats time range"
            >
              {RANGE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`${styles.viewToggleButton} ${
                    range === option.id ? styles.viewToggleButtonActive : ""
                  }`}
                  aria-pressed={range === option.id}
                  onClick={() => setRange(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className={styles.statsSelectWrapper}>
              <select
                className={styles.statsSelect}
                value={range}
                aria-label="Stats time range"
                onChange={(event) =>
                  setRange(event.target.value as StatsRange)
                }
              >
                {RANGE_OPTIONS.map((option) => (
                  <option value={option.id} key={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        }
      />

      {isLoading && <ListeningStatsSkeleton />}

      {error && !isLoading && (
        <div className={styles.historyPlaceholder}>
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && stats && !stats.topArtist && !stats.topSong && (
        <div className={styles.historyPlaceholder}>
          <p>No listens recorded in this range yet.</p>
        </div>
      )}

      {!isLoading && !error && stats && (stats.topArtist || stats.topSong) && (
        <>
          <div className={styles.statsCards}>
            {stats.topArtist && (
              <div className={styles.statsCardGroup}>
                <h3 className={styles.statsCardLabel}>Top Artist</h3>
                <a
                  className={styles.statsCard}
                  href={stats.topArtist.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <StatsCardAccents />
                  <div className={styles.statsCardContent}>
                    <div className={styles.statsCardBody}>
                      {stats.topArtist.image && (
                        <Image
                          src={stats.topArtist.image}
                          className={styles.statsCardImage}
                          alt={stats.topArtist.name}
                          width={56}
                          height={56}
                        />
                      )}
                      <div className={styles.statsCardInfo}>
                        <span className={styles.statsCardName}>
                          {stats.topArtist.name}
                        </span>
                        {stats.topArtist.plays !== undefined && (
                          <span className={styles.statsCardMeta}>
                            {playsLabel(stats.topArtist, "Top artist")}
                          </span>
                        )}
                        {stats.topArtist.plays === undefined &&
                          stats.topArtist.detail && (
                            <span className={styles.statsCardMeta}>
                              {stats.topArtist.detail}
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            )}
            {stats.topSong && (
              <div className={styles.statsCardGroup}>
                <h3 className={styles.statsCardLabel}>Top Song</h3>
                <a
                  className={styles.statsCard}
                  href={stats.topSong.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <StatsCardAccents />
                  <div className={styles.statsCardContent}>
                    <div className={styles.statsCardBody}>
                      {stats.topSong.image && (
                        <Image
                          src={stats.topSong.image}
                          className={styles.statsCardImage}
                          alt={stats.topSong.name}
                          width={56}
                          height={56}
                        />
                      )}
                      <div className={styles.statsCardInfo}>
                        <span className={styles.statsCardName}>
                          {stats.topSong.name}
                        </span>
                        <span className={styles.statsCardMeta}>
                          {stats.topSong.artist}
                          {stats.topSong.plays !== undefined &&
                            ` · ${playsLabel(stats.topSong, "Top song")}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            )}
          </div>

          {stats.genres.length > 0 && (
            <div className={styles.genreChart}>
              <div className={styles.genreGrid} aria-hidden="true">
                {axisScale.ticks.slice(1, -1).map((tick) => (
                  <span
                    className={styles.genreGridLine}
                    style={{ left: `${(tick / axisScale.max) * 100}%` }}
                    key={tick}
                  />
                ))}
              </div>
              <div className={styles.genreRows}>
                {stats.genres.map((genre) => {
                  const value = isPlayBased
                    ? genre.score
                    : totalGenreScore > 0
                      ? (genre.score / totalGenreScore) * 100
                      : 0;
                  const width =
                    axisScale.max > 0 ? (value / axisScale.max) * 100 : 0;
                  const roundedValue = Math.round(value);

                  return (
                    <div className={styles.genreRow} key={genre.genre}>
                      <div className={styles.genreLabels}>
                        <span className={styles.genreName}>
                          {titleCase(genre.genre)}
                        </span>
                        <span className={styles.genreValue}>
                          {isPlayBased
                            ? `${roundedValue} ${roundedValue === 1 ? "play" : "plays"}`
                            : `${roundedValue}%`}
                        </span>
                      </div>
                      <div className={styles.genreBarTrack}>
                        <div
                          className={styles.genreBarFill}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className={styles.genreAxis} aria-hidden="true">
                {axisScale.ticks.map((tick) => (
                  <span
                    className={`${styles.genreAxisLabel} ${
                      tick === axisScale.max ? styles.genreAxisLabelEnd : ""
                    }`}
                    style={{ left: `${(tick / axisScale.max) * 100}%` }}
                    key={tick}
                  >
                    {tick === 0
                      ? "0"
                      : isPlayBased
                        ? tick
                        : `${tick}%`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default ListeningStats;

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  getArtistDetailsByIds,
  getMyRecentlyPlayed,
  getMyTopArtists,
  getMyTopTracks,
} from "../lib/spotify";
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
  { id: "year", label: "Year" },
];

const MAX_GENRE_BARS = 6;
const GENRES_PER_ARTIST = 3;

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

function formatDay(date: Date): string {
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function titleCase(genre: string): string {
  return genre.replace(/\b\w/g, (char) => char.toUpperCase());
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
async function computePlayStats(range: "day" | "week"): Promise<ListeningStatsData> {
  const now = new Date();
  const start = range === "day" ? startOfDay(now) : startOfWeekSunday(now);
  const plays = (await getMyRecentlyPlayed(50)).filter(
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
 * Month/year stats come from Spotify's ranked top-items windows, which have
 * no play counts — top items are ranks and genre bars are rank-weighted.
 * Month maps to Spotify's ~4-week window, year to its long-term window.
 */
async function computeTopStats(range: "month" | "year"): Promise<ListeningStatsData> {
  const timeRange = range === "month" ? "short_term" : "long_term";
  const [artists, tracks] = await Promise.all([
    getMyTopArtists(timeRange, 50),
    getMyTopTracks(timeRange, 50),
  ]);

  const rangeLabel = range === "month" ? "Last ~4 weeks" : "Long-term";
  const note =
    range === "month"
      ? "Spotify's top items over the last ~4 weeks"
      : "Spotify's long-term top items";

  const topArtist: StatsTopItem | null = artists[0]
    ? { name: artists[0].name, image: artists[0].image, url: artists[0].url }
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

async function computeStats(range: StatsRange): Promise<ListeningStatsData> {
  if (range === "day" || range === "week") {
    return computePlayStats(range);
  }
  return computeTopStats(range);
}

function playsLabel(item: StatsTopItem, noun: string): string {
  return item.plays !== undefined
    ? `${item.plays} ${item.plays === 1 ? "play" : "plays"}`
    : noun;
}

const ListeningStats: React.FC = () => {
  const [range, setRange] = useState<StatsRange>("day");
  const [stats, setStats] = useState<ListeningStatsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef(new Map<StatsRange, ListeningStatsData>());

  const loadStats = useCallback(async (selectedRange: StatsRange) => {
    const cached = cacheRef.current.get(selectedRange);
    if (cached) {
      setStats(cached);
      setError(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await computeStats(selectedRange);
      cacheRef.current.set(selectedRange, result);
      setStats(result);
    } catch (caughtError) {
      setStats(null);
      const message =
        caughtError instanceof Error ? caughtError.message : "";
      setError(
        message.includes("(403")
          ? "Spotify hasn't granted stats access yet (the token needs the user-top-read scope — re-run npm run spotify:auth)."
          : "Listening stats are temporarily unavailable."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats(range);
  }, [range, loadStats]);

  const maxGenreScore = stats?.genres[0]?.score ?? 0;
  const totalGenreScore =
    stats?.genres.reduce((sum, genre) => sum + genre.score, 0) ?? 0;
  const isPlayBased = range === "day" || range === "week";

  return (
    <section className={styles.statsContain}>
      <div className={styles.sectionTitleContainer}>
        <span className={styles.sectionTitle}>Listening Stats</span>
        <div className={styles.statsTabs} role="group" aria-label="Stats time range">
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
      </div>

      {stats && !isLoading && !error && (
        <p className={styles.statsMeta}>
          {stats.rangeLabel} · {stats.note}
        </p>
      )}

      {isLoading && <p>Loading...</p>}

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
              <a
                className={styles.statsCard}
                href={stats.topArtist.url}
                target="_blank"
                rel="noreferrer"
              >
                <span className={styles.statsCardLabel}>Top Artist</span>
                <div className={styles.statsCardBody}>
                  {stats.topArtist.image && (
                    <Image
                      src={stats.topArtist.image}
                      className={styles.statsCardImageRound}
                      alt={stats.topArtist.name}
                      width={56}
                      height={56}
                    />
                  )}
                  <div className={styles.statsCardInfo}>
                    <span className={styles.statsCardName}>
                      {stats.topArtist.name}
                    </span>
                    <span className={styles.statsCardMeta}>
                      {playsLabel(stats.topArtist, "Top artist")}
                    </span>
                  </div>
                </div>
              </a>
            )}
            {stats.topSong && (
              <a
                className={styles.statsCard}
                href={stats.topSong.url}
                target="_blank"
                rel="noreferrer"
              >
                <span className={styles.statsCardLabel}>Top Song</span>
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
                      {stats.topSong.artist} ·{" "}
                      {playsLabel(stats.topSong, "Top song")}
                    </span>
                  </div>
                </div>
              </a>
            )}
          </div>

          {stats.genres.length > 0 && (
            <div className={styles.genreChart}>
              <span className={styles.statsCardLabel}>Top Genres</span>
              {stats.genres.map((genre) => (
                <div className={styles.genreRow} key={genre.genre}>
                  <span className={styles.genreName}>{titleCase(genre.genre)}</span>
                  <div className={styles.genreBarTrack}>
                    <div
                      className={styles.genreBarFill}
                      style={{
                        width: `${maxGenreScore > 0 ? Math.max((genre.score / maxGenreScore) * 100, 4) : 0}%`,
                      }}
                    />
                  </div>
                  <span className={styles.genreValue}>
                    {isPlayBased
                      ? `${Math.round(genre.score)} ${Math.round(genre.score) === 1 ? "play" : "plays"}`
                      : `${totalGenreScore > 0 ? Math.round((genre.score / totalGenreScore) * 100) : 0}%`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default ListeningStats;

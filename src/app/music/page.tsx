"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  getMyCurrentlyPlaying,
  getMyRecentlyPlayed,
} from "../../lib/spotify";
import styles from "../../styles/music.module.css";
import Footer from "../../components/Footer";
import ListeningStats from "../../components/ListeningStats";
import PageHeader from "../../components/layout/PageHeader";
import PageShell from "../../components/layout/PageShell";
import SectionHeader from "../../components/layout/SectionHeader";
import Image from "next/image";
import { History, CurrentlyPlaying } from "../../types/types";

const Music: React.FC = () => {
  const [history, setHistory] = useState<History[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] =
    useState<CurrentlyPlaying | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(true);
  const [isCurrentlyPlayingLoading, setIsCurrentlyPlayingLoading] =
    useState<boolean>(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [currentlyPlayingError, setCurrentlyPlayingError] = useState<
    string | null
  >(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<"tile" | "list">("tile");

  // Trigger CSS animations on mount
  useEffect(() => {
    setIsLoaded(true);
    try {
      const saved = window.localStorage.getItem("music-view-mode");
      if (saved === "tile" || saved === "list") {
        setViewMode(saved);
      } else if (saved === "grid") {
        setViewMode("list");
      }
    } catch {
      // localStorage unavailable — fall back to tile view
    }
  }, []);

  const changeViewMode = (mode: "tile" | "list") => {
    setViewMode(mode);
    try {
      window.localStorage.setItem("music-view-mode", mode);
    } catch {
      // localStorage unavailable — view still updates for this session
    }
  };

  const fetchHistory = useCallback(async () => {
    try {
      setIsHistoryLoading(true);
      setHistoryError(null);
      const historyData = await getMyRecentlyPlayed(50);
      setHistory(historyData);
    } catch {
      setHistory([]);
      setHistoryError("Spotify is temporarily unavailable.");
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  const fetchCurrentlyPlaying = useCallback(async () => {
    try {
      setIsCurrentlyPlayingLoading(true);
      setCurrentlyPlayingError(null);
      const currentlyPlayingData = await getMyCurrentlyPlaying();
      setCurrentlyPlaying(currentlyPlayingData);
    } catch {
      setCurrentlyPlaying(null);
      setCurrentlyPlayingError("Spotify is temporarily unavailable.");
    } finally {
      setIsCurrentlyPlayingLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchHistory();
    void fetchCurrentlyPlaying();
  }, [fetchCurrentlyPlaying, fetchHistory]);

  // Refresh shortly after the current track should finish.
  useEffect(() => {
    if (!currentlyPlaying?.is_playing) {
      return;
    }

    const timeUntilTrackEnds = Math.max(
      currentlyPlaying.duration_ms - currentlyPlaying.progress_ms + 1000,
      1000
    );
    const refreshTimeout = window.setTimeout(() => {
      void fetchCurrentlyPlaying();
      void fetchHistory();
    }, timeUntilTrackEnds);

    return () => {
      window.clearTimeout(refreshTimeout);
    };
  }, [currentlyPlaying, fetchCurrentlyPlaying, fetchHistory]);

  const visibleHistory = history.slice(0, 20);

  return (
    <>
      {/* Landing Section */}
      <PageShell>
        <PageHeader
          title="Music"
          description="Music is a key part of my life. The rest is a quiet blur."
          className={isLoaded ? styles.fadeInUp : ""}
          actions={
            <>
              {currentlyPlaying &&
                !isCurrentlyPlayingLoading &&
                !currentlyPlayingError && (
                <div className={styles.currentlyPlayingContainer}>
                  <div
                    className={`${styles.currentlyPlayingContent} ${
                      !currentlyPlaying.is_playing ? styles.paused : ""
                    }`}
                  >
                    <Image
                      src={currentlyPlaying.image}
                      className={styles.currentlyPlayingLogo}
                      alt={currentlyPlaying.name}
                      width={50}
                      height={50}
                      loading="eager"
                    />
                    <div className={styles.currentlyPlayingInfo}>
                      <span className={styles.currentlyPlayingSong}>
                        {currentlyPlaying.name}
                      </span>
                      <span className={styles.currentlyPlayingArtist}>
                        {currentlyPlaying.artist}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {isCurrentlyPlayingLoading && <p>Loading...</p>}
              {currentlyPlayingError && !isCurrentlyPlayingLoading && (
                <p className={styles.notPlaying}>{currentlyPlayingError}</p>
              )}
              {!currentlyPlayingError &&
                !currentlyPlaying &&
                !isCurrentlyPlayingLoading && (
                <p className={styles.notPlaying}>Nothing playing.</p>
              )}
            </>
          }
        />

        <div
          className={`${styles.musicContain} ${
            isLoaded ? styles.fadeInUp : ""
          }`}
          style={{ animationDelay: "0.05s" }}
        >
          {/* Recently Played Section */}
          <section className={styles.recentlyPlayedContain}>
            <SectionHeader
              title="Recently Played"
              actions={
                <>
                  {history && history.length > 0 && (
                    <span className={styles.sectionSubtitle}>
                      last at{" "}
                      {new Date(history[0].played_at).toLocaleTimeString([], {
                        day: "numeric",
                        month: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                      })}
                    </span>
                  )}
                  <div
                    className={styles.viewToggle}
                    role="group"
                    aria-label="Change recently played view"
                  >
                    <button
                      type="button"
                      className={`${styles.viewToggleButton} ${
                        viewMode === "list"
                          ? styles.viewToggleButtonActive
                          : ""
                      }`}
                      aria-pressed={viewMode === "list"}
                      onClick={() => changeViewMode("list")}
                    >
                      List
                    </button>
                    <button
                      type="button"
                      className={`${styles.viewToggleButton} ${
                        viewMode === "tile"
                          ? styles.viewToggleButtonActive
                          : ""
                      }`}
                      aria-pressed={viewMode === "tile"}
                      onClick={() => changeViewMode("tile")}
                    >
                      Tile
                    </button>
                  </div>
                </>
              }
            />
            {!historyError &&
              !isHistoryLoading &&
              history &&
              history.length > 0 && (
              <div
                className={`${styles.historyGrid} ${
                  viewMode === "list" ? styles.historyGridList : ""
                }`}
              >
                {visibleHistory.map((item: History, index: number) => (
                  <div className={styles.historyItem} key={index}>
                    <div className={styles.imageContainer}>
                      <Image
                        src={item.image}
                        className={styles.historyLogo}
                        alt={item.name}
                        width={100}
                        height={100}
                        loading={index < 6 ? "eager" : "lazy"}
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className={styles.albumReviewItemContent}>
                      <div className={styles.albumReviewItemHeader}>
                        <span className={styles.albumReviewItemCompany}>
                          {item.name}
                        </span>
                      </div>
                      <span className={styles.albumReviewItemPosition}>
                        {item.artist}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!historyError &&
              !isHistoryLoading &&
              (!history || history.length === 0) && (
              <div className={styles.historyPlaceholder}>
                <p>No history found.</p>
              </div>
            )}
            {historyError && !isHistoryLoading && (
              <div className={styles.historyPlaceholder}>
                <p>{historyError}</p>
              </div>
            )}
            {isHistoryLoading && <p>Loading...</p>}
          </section>

          {/* Listening Stats Section */}
          <ListeningStats
            recentPlays={history}
            isRecentPlaysLoading={isHistoryLoading}
            recentPlaysError={historyError}
          />
        </div>

        <Footer />
      </PageShell>
    </>
  );
};

export default Music;

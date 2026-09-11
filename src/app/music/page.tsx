"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  getMyCurrentlyPlaying,
  getMyRecentlyPlayed,
} from "../../lib/spotify";
import styles from "../../styles/music.module.css";
import Footer from "../../components/Footer";
// import { createClient } from "../../lib/supabase";
import Image from "next/image";
import { History, CurrentlyPlaying } from "../../types/types";
import Link from "next/link";

const Music: React.FC = () => {
  const [history, setHistory] = useState<History[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] =
    useState<CurrentlyPlaying | null>(null);
  // const [albumReviews, setAlbumReviews] = useState<AlbumReview[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(true);
  const [isCurrentlyPlayingLoading, setIsCurrentlyPlayingLoading] =
    useState<boolean>(true);
  // const [isAlbumReviewsLoading, setIsAlbumReviewsLoading] = useState<boolean>(true);
  const [spotifyError, setSpotifyError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  // const supabase = createClient();

  // Trigger CSS animations on mount
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Fetch Album Reviews
  // const fetchAlbumReviews = async () => {
  //   try {
  //     setIsAlbumReviewsLoading(true);
  //     const { data, error } = await supabase.from("album_reviews").select("*");

  //     if (error) {
  //       console.error("Error fetching album reviews:", error);
  //     } else {
  //       setAlbumReviews(data || []);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching album reviews:", error);
  //   } finally {
  //     setIsAlbumReviewsLoading(false);
  //   }
  // };

  const fetchSpotifyData = useCallback(async () => {
    try {
      setIsHistoryLoading(true);
      setIsCurrentlyPlayingLoading(true);
      setSpotifyError(null);

      const [historyData, currentlyPlayingData] = await Promise.all([
        getMyRecentlyPlayed(20),
        getMyCurrentlyPlaying(),
      ]);

      setHistory(historyData);
      setCurrentlyPlaying(currentlyPlayingData);
    } catch {
      setHistory([]);
      setCurrentlyPlaying(null);
      setSpotifyError("Spotify is temporarily unavailable.");
    } finally {
      setIsHistoryLoading(false);
      setIsCurrentlyPlayingLoading(false);
    }
  }, []);

  useEffect(() => {
    // fetchAlbumReviews();
    void fetchSpotifyData();
  }, [fetchSpotifyData]);

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
      void fetchSpotifyData();
    }, timeUntilTrackEnds);

    return () => {
      window.clearTimeout(refreshTimeout);
    };
  }, [currentlyPlaying, fetchSpotifyData]);

  return (
    <>
      {/* Landing Section */}
      <div className={styles.landingContain}>
        {/* Branding Section */}
        <div
          className={`${styles.brandingContain} ${
            isLoaded ? styles.fadeInUp : ""
          }`}
        >
          <div className={styles.brandingHeader}>
            <div className={styles.introContain}>
              <Link className={styles.name} href="/">
                Music
              </Link>
              <p className={styles.intro}>
                Music is a key part of my life. The rest is a quiet blur.
              </p>
            </div>
            <>
              {currentlyPlaying &&
                !isCurrentlyPlayingLoading &&
                !spotifyError && (
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
              {spotifyError && !isCurrentlyPlayingLoading && (
                <p className={styles.notPlaying}>{spotifyError}</p>
              )}
              {!spotifyError &&
                !currentlyPlaying &&
                !isCurrentlyPlayingLoading && (
                <p className={styles.notPlaying}>Nothing playing.</p>
              )}
            </>
          </div>
        </div>

        <div
          className={`${styles.musicContain} ${
            isLoaded ? styles.fadeInUp : ""
          }`}
          style={{ animationDelay: "0.05s" }}
        >
          {/* Recently Played Section */}
          <section className={styles.recentlyPlayedContain}>
            <div className={styles.sectionTitleContainer}>
              <span className={styles.sectionTitle}>Recently Played</span>
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
            </div>
            {!spotifyError &&
              !isHistoryLoading &&
              history &&
              history.length > 0 && (
              <div className={styles.historyGrid}>
                {history.map((item: History, index: number) => (
                  <div className={styles.historyItem} key={index}>
                    <div className={styles.imageContainer}>
                      <Image
                        src={item.image}
                        className={styles.historyLogo}
                        alt={item.name}
                        width={100}
                        height={100}
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
            {!spotifyError &&
              !isHistoryLoading &&
              (!history || history.length === 0) && (
              <div className={styles.historyPlaceholder}>
                <p>No history found.</p>
              </div>
            )}
            {spotifyError && !isHistoryLoading && (
              <div className={styles.historyPlaceholder}>
                <p>{spotifyError}</p>
              </div>
            )}
            {isHistoryLoading && <p>Loading...</p>}
          </section>

          {/* Album Reviews Section */}
          {/* <section className={styles.albumReviewsContain}>
            <span className={styles.sectionTitle}>Album Reviews</span>
            {!isAlbumReviewsLoading &&
              albumReviews &&
              albumReviews.map((item) => (
                <div className={styles.albumReviewItem} key={item.id}>
                  <div className={styles.albumReviewItemInformation}>
                    <Image
                      src={item.cover}
                      className={styles.albumReviewLogo}
                      alt={item.name}
                      width={60}
                      height={60}
                    />
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
                  <div>
                    <span className={styles.albumReviewItemRating}>
                      {item.rating}/10
                    </span>
                  </div>
                </div>
              ))}
            {isAlbumReviewsLoading && <p>Loading...</p>}
            {!albumReviews && !isAlbumReviewsLoading && (
              <p>Unable to load album reviews!</p>
            )}
          </section> */}
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Music;

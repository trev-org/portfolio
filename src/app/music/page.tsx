"use client";

import React, { useEffect, useState, useRef } from "react";
import { getMyRecentlyPlayed, getMyCurrentlyPlaying } from "../../lib/spotify";
import styles from "../../styles/music.module.css";
import Footer from "../../components/Footer";
import { createClient } from "../../lib/supabase";
import Image from "next/image";
import gsap from "gsap";
import { History, CurrentlyPlaying, AlbumReview } from "../../types/types";

const Music: React.FC = () => {
  const [history, setHistory] = useState<History[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] =
    useState<CurrentlyPlaying | null>(null);
  const [albumReviews, setAlbumReviews] = useState<AlbumReview[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(true);
  const [isCurrentlyPlayingLoading, setIsCurrentlyPlayingLoading] =
    useState<boolean>(true);
  const [isAlbumReviewsLoading, setIsAlbumReviewsLoading] =
    useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const nameRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nameFadeTimer = setTimeout(() => {
      if (nameRef.current) {
        gsap.fromTo(
          nameRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
        );
      }
    }, 0);
    const sectionFadeTimer = setTimeout(() => {
      if (sectionRef.current) {
        gsap.fromTo(
          sectionRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
        );
      }
    }, 500);
    return () => {
      clearTimeout(nameFadeTimer);
      clearTimeout(sectionFadeTimer);
    };
  }, []);

  const supabase = createClient();

  // Fetch Album Reviews
  const fetchAlbumReviews = async () => {
    try {
      setIsAlbumReviewsLoading(true);
      const { data, error } = await supabase.from("album_reviews").select("*");

      if (error) {
        console.error("Error fetching album reviews:", error);
      } else {
        setAlbumReviews(data || []);
      }
    } catch (error) {
      console.error("Error fetching album reviews:", error);
    } finally {
      setIsAlbumReviewsLoading(false);
    }
  };

  // Fetch History
  const fetchHistory = async () => {
    try {
      setIsHistoryLoading(true);
      const recentlyPlayed = await getMyRecentlyPlayed();

      if (recentlyPlayed) {
        setHistory(recentlyPlayed);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // Fetch Currently Playing
  const fetchCurrentlyPlaying = async () => {
    try {
      setIsCurrentlyPlayingLoading(true);

      const currentlyPlayingData = await getMyCurrentlyPlaying();

      if (currentlyPlayingData) {
        setCurrentlyPlaying(currentlyPlayingData);
      }
    } catch (error) {
      console.error("Error fetching currently playing:", error);
    } finally {
      setIsCurrentlyPlayingLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbumReviews();
    fetchHistory();
    fetchCurrentlyPlaying();
  }, []);

  // Update progress bar
  useEffect(() => {
    if (!currentlyPlaying) return;
    let progressInterval: NodeJS.Timeout;

    if (currentlyPlaying && currentlyPlaying.is_playing) {
      // Initialize progress
      setProgress(currentlyPlaying.progress_ms);

      // Update progress every second
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          // Don't exceed the song duration
          if (prev >= currentlyPlaying.duration_ms) {
            clearInterval(progressInterval);
            fetchCurrentlyPlaying();
            return currentlyPlaying.duration_ms;
          }
          return prev + 1000; // Add 1 second (1000ms)
        });
      }, 1000);
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [currentlyPlaying]);

  return (
    <>
      {/* Landing Section */}
      <div className={styles.landingContain}>
        {/* Branding Section */}
        <div className={styles.brandingContain} ref={nameRef}>
          <div className={styles.brandingHeader}>
            <span className={styles.name}>Music</span>
            <>
              {currentlyPlaying && !isCurrentlyPlayingLoading && (
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
                      width={60}
                      height={60}
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
                  <div className={styles.progressBarContainer}>
                    <div
                      className={styles.progressBar}
                      style={{
                        width: `${
                          (progress / currentlyPlaying.duration_ms) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
              {isCurrentlyPlayingLoading && <p>Loading...</p>}
              {!currentlyPlaying && !isCurrentlyPlayingLoading && (
                <p className={styles.notPlaying}>Nothing playing.</p>
              )}
            </>
          </div>
          <div className={styles.introContain}>
            <p className={styles.intro}>
              Music is a key part of my life. The rest is a quiet blur.
            </p>
          </div>
        </div>

        <div className={styles.musicContain} ref={sectionRef}>
          {/* Recently Played Section */}
          <section className={styles.recentlyPlayedContain}>
            <div className={styles.sectionTitleContainer}>
              <span className={styles.sectionTitle}>Recently Played</span>
              {history && history.length > 0 && (
                <span className={styles.sectionSubtitle}>
                  last at{" "}
                  {new Date(history[0].played_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
            {!isHistoryLoading && history && history.length > 0 && (
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
            {!isHistoryLoading && (!history || history.length === 0) && (
              <div className={styles.historyPlaceholder}>
                <p>No history found.</p>
              </div>
            )}
            {isHistoryLoading && <p>Loading...</p>}
          </section>

          {/* Album Reviews Section */}
          <section className={styles.albumReviewsContain}>
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
          </section>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Music;

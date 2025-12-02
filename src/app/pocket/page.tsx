"use client";

import React, { useEffect, useState } from "react";
import styles from "../../styles/pocket.module.css";
import Footer from "../../components/Footer";
import { createClient } from "../../lib/supabase";
import Image from "next/image";
import { Article } from "../../types/types";
import Link from "next/link";

const Pocket: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isArticlesLoading, setIsArticlesLoading] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Trigger CSS animations on mount
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    async function fetchArticles() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("pocket")
        .select()
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Failed to fetch articles:", error);
        return;
      }
      setArticles(data);
      setIsArticlesLoading(false);
    }
    fetchArticles();
  }, []);
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
            <Link className={styles.name} href="/">
              Pocket
            </Link>
          </div>
          <div className={styles.introContain}>
            <p className={styles.intro}>
              This is where I collect the sparks of thought that I find
              interesting and sometimes write my own.
            </p>
          </div>
        </div>

        <div
          className={`${styles.musicContain} ${
            isLoaded ? styles.fadeInUp : ""
          }`}
          style={{ animationDelay: "0.05s" }}
        >
          {/* Recently Played Section */}
          <section className={styles.articlesContain}>
            <div className={styles.sectionTitleContainer}>
              <span className={styles.sectionTitle}>Saved Articles</span>
            </div>
            {!isArticlesLoading && articles && articles.length > 0 && (
              <div className={styles.articlesGrid}>
                {articles.map((item: Article, index: number) => (
                  <Link href={`${item.link}`} target="_blank" key={index}>
                    <div className={styles.articleItem}>
                      <div className={styles.articleHoverTopLeft}></div>
                      <div className={styles.articleHoverBottomRight}></div>
                      <div className={styles.articleHoverLeft}></div>
                      <div className={styles.articleHoverBottom}></div>
                      <div className={styles.articleContentContain}>
                        <Image
                          src={item.favicon}
                          className={styles.articlesLogo}
                          alt={item.title}
                          width={50}
                          height={50}
                        />
                        <div className={styles.articlesItemContent}>
                          <div className={styles.articleTitleContain}>
                            <span className={styles.articleTitle}>
                              {item.title}
                            </span>
                            {/* <span
                              className={
                                item.has_read
                                  ? styles.articleHasRead
                                  : styles.articleHasNotRead
                              }
                            >
                              {item.has_read ? "Read" : "Not Read"}
                            </span> */}
                          </div>
                          <span className={styles.articleDescription}>
                            {item.description}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {!isArticlesLoading && (!articles || articles.length === 0) && (
              <div className={styles.articlesPlaceholder}>
                <p>No articles found.</p>
              </div>
            )}
            {isArticlesLoading && <p>Loading...</p>}
          </section>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Pocket;

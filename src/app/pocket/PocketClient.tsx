"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import { createClient } from "../../lib/supabase";
import styles from "../../styles/pocket.module.css";
import type {
  SavedArticle,
  WrittenArticleMetadata,
} from "../../types/types";

type PocketClientProps = {
  writtenArticles: WrittenArticleMetadata[];
};

const publishedDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function formatPublishedDate(publishedAt: string) {
  return publishedDateFormatter.format(
    new Date(`${publishedAt}T00:00:00.000Z`),
  );
}

function ArticleHoverFrame() {
  return (
    <>
      <div className={styles.articleHoverTopLeft} />
      <div className={styles.articleHoverBottomRight} />
      <div className={styles.articleHoverLeft} />
      <div className={styles.articleHoverBottom} />
    </>
  );
}

export default function PocketClient({
  writtenArticles,
}: PocketClientProps) {
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [isSavedArticlesLoading, setIsSavedArticlesLoading] = useState(true);
  const [savedArticlesError, setSavedArticlesError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    let isActive = true;

    async function fetchSavedArticles() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("pocket")
          .select()
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        if (isActive) {
          setSavedArticles((data ?? []) as SavedArticle[]);
        }
      } catch (error) {
        console.error("Failed to fetch saved articles:", error);

        if (isActive) {
          setSavedArticlesError(true);
        }
      } finally {
        if (isActive) {
          setIsSavedArticlesLoading(false);
        }
      }
    }

    fetchSavedArticles();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className={styles.landingContain}>
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
        <section className={styles.articlesContain}>
          <div className={styles.sectionTitleContainer}>
            <h2 className={styles.sectionTitle}>My Writing</h2>
          </div>

          {writtenArticles.length > 0 ? (
            <div className={styles.articlesGrid}>
              {writtenArticles.map((article) => (
                <Link href={`/pocket/${article.slug}`} key={article.slug}>
                  <article
                    className={`${styles.articleItem} ${styles.writtenArticleItem}`}
                  >
                    <ArticleHoverFrame />
                    <div
                      className={`${styles.articleContentContain} ${styles.writtenArticleContent}`}
                    >
                      <div className={styles.articlesItemContent}>
                        <div className={styles.articleTitleContain}>
                          <h3 className={styles.articleTitle}>
                            {article.title}
                          </h3>
                          <div className={styles.writtenArticleMeta}>
                            <time dateTime={article.publishedAt}>
                              {formatPublishedDate(article.publishedAt)}
                            </time>
                            {article.draft && (
                              <span className={styles.draftBadge}>Draft</span>
                            )}
                          </div>
                        </div>
                        <p className={styles.articleDescription}>
                          {article.description}
                        </p>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.articlesPlaceholder}>
              <p>No writing published yet.</p>
            </div>
          )}
        </section>

        <section className={styles.articlesContain}>
          <div className={styles.sectionTitleContainer}>
            <h2 className={styles.sectionTitle}>Saved Articles</h2>
          </div>

          {!isSavedArticlesLoading &&
            !savedArticlesError &&
            savedArticles.length > 0 && (
              <div className={styles.articlesGrid}>
                {savedArticles.map((article) => (
                  <Link
                    href={article.link}
                    target="_blank"
                    rel="noreferrer"
                    key={article.id}
                  >
                    <article className={styles.articleItem}>
                      <ArticleHoverFrame />
                      <div className={styles.articleContentContain}>
                        <Image
                          src={article.favicon}
                          className={styles.articlesLogo}
                          alt=""
                          width={50}
                          height={50}
                        />
                        <div className={styles.articlesItemContent}>
                          <div className={styles.articleTitleContain}>
                            <h3 className={styles.articleTitle}>
                              {article.title}
                            </h3>
                          </div>
                          <p className={styles.articleDescription}>
                            {article.description}
                          </p>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}

          {!isSavedArticlesLoading &&
            !savedArticlesError &&
            savedArticles.length === 0 && (
              <div className={styles.articlesPlaceholder}>
                <p>No saved articles found.</p>
              </div>
            )}

          {savedArticlesError && (
            <div className={styles.articlesPlaceholder}>
              <p>Saved articles are unavailable right now.</p>
            </div>
          )}

          {isSavedArticlesLoading && (
            <div className={styles.articlesPlaceholder}>
              <p>Loading...</p>
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}

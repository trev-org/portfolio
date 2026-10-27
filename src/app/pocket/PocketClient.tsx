"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import styles from "../../styles/pocket.module.css";
import type { WrittenArticleMetadata } from "../../types/types";

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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
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
            This is where I write about the sparks of thought that I find
            interesting.
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
      </div>

      <Footer />
    </div>
  );
}

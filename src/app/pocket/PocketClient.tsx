"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import PageHeader from "../../components/layout/PageHeader";
import PageShell from "../../components/layout/PageShell";
import SectionHeader from "../../components/layout/SectionHeader";
import { savedArticles } from "../../data/savedArticles";
import styles from "../../styles/pocket.module.css";
import type { WrittenArticleMetadata } from "../../types/types";

type PocketClientProps = {
  writtenArticles: WrittenArticleMetadata[];
};

const articleDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function formatArticleDate(date: string) {
  return articleDateFormatter.format(
    new Date(`${date}T00:00:00.000Z`),
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

type ArticleListItem = {
  key: string;
  href: string;
  title: string;
  description: string;
  date?: string;
  image?: string;
  draft?: boolean;
  external?: boolean;
};

type ArticleSectionProps = {
  title: string;
  articles: ArticleListItem[];
  emptyMessage: string;
  columns?: 1 | 2;
};

function ArticleSection({
  title,
  articles,
  emptyMessage,
  columns = 1,
}: ArticleSectionProps) {
  return (
    <section className={styles.articlesContain}>
      <SectionHeader title={title} />

      {articles.length > 0 ? (
        <div
          className={`${styles.articlesGrid} ${
            columns === 2 ? styles.articlesGridTwoColumn : ""
          }`}
        >
          {articles.map((article) => (
            <Link
              href={article.href}
              target={article.external ? "_blank" : undefined}
              rel={article.external ? "noopener noreferrer" : undefined}
              key={article.key}
            >
              <article
                className={`${styles.articleItem} ${styles.writtenArticleItem}`}
              >
                <ArticleHoverFrame />
                <div
                  className={`${styles.articleContentContain} ${styles.writtenArticleContent}`}
                >
                  {article.image && (
                    <Image
                      src={article.image}
                      className={styles.articleImage}
                      alt=""
                      width={72}
                      height={72}
                    />
                  )}
                  <div className={styles.articlesItemContent}>
                    <div className={styles.articleTitleContain}>
                      <h3 className={styles.articleTitle}>{article.title}</h3>
                      {(article.date || article.draft) && (
                        <div className={styles.writtenArticleMeta}>
                          {article.date && (
                            <time dateTime={article.date}>
                              {formatArticleDate(article.date)}
                            </time>
                          )}
                          {article.draft && (
                            <span className={styles.draftBadge}>Draft</span>
                          )}
                        </div>
                      )}
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
          <p>{emptyMessage}</p>
        </div>
      )}
    </section>
  );
}

export default function PocketClient({
  writtenArticles,
}: PocketClientProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const writtenArticleItems: ArticleListItem[] = writtenArticles.map(
    (article) => ({
      key: article.slug,
      href: `/pocket/${article.slug}`,
      title: article.title,
      description: article.description,
      date: article.publishedAt,
      draft: article.draft,
    }),
  );
  const savedArticleItems: ArticleListItem[] = savedArticles.map((article) => ({
    key: `${article.url}-${article.savedAt}`,
    href: article.url,
    title: article.title,
    description: article.description,
    image: article.image,
    external: true,
  }));

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <PageShell>
      <PageHeader
        title="Pocket"
        description="Sparks of thought that I find interesting. Sometimes original, sometimes not."
        className={`${styles.revealItem} ${
          isLoaded ? styles.fadeInUp : ""
        }`}
      />

      <div
        className={`${styles.musicContain} ${
          isLoaded ? styles.fadeInUp : ""
        }`}
        style={{ animationDelay: "0.05s" }}
      >
        <ArticleSection
          title="My Writing"
          articles={writtenArticleItems}
          emptyMessage="No writing published yet."
          columns={2}
        />
        <ArticleSection
          title="Saved Articles"
          articles={savedArticleItems}
          emptyMessage="No saved articles found."
          columns={2}
        />
      </div>

      <Footer />
    </PageShell>
  );
}

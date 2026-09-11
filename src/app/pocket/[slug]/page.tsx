import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "../../../components/Footer";
import { getWrittenArticle, getWrittenArticles } from "../../../lib/articles";
import styles from "../../../styles/pocket.module.css";

type PocketPostParams = {
  slug: string;
};

type PocketPostProps = {
  params: Promise<PocketPostParams>;
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

export async function generateStaticParams(): Promise<PocketPostParams[]> {
  const articles = await getWrittenArticles();

  return articles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PocketPostProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getWrittenArticle(slug);

  if (!article) {
    return {
      title: "Article not found | Trevor Gerald",
    };
  }

  const { metadata } = article;

  return {
    title: `${metadata.title} | Trevor Gerald`,
    description: metadata.description,
    openGraph: {
      type: "article",
      title: metadata.title,
      description: metadata.description,
      publishedTime: metadata.publishedAt,
      authors: ["Trevor Gerald"],
    },
  };
}

export const dynamicParams = false;

export default async function PocketPost({ params }: PocketPostProps) {
  const { slug } = await params;
  const article = await getWrittenArticle(slug);

  if (!article) {
    notFound();
  }

  const { Content, metadata } = article;

  return (
    <main className={styles.postPage}>
      <article className={styles.postArticle}>
        <header className={styles.postHeader}>
          <Link className={styles.postBackLink} href="/pocket">
            <span aria-hidden="true">←</span> Pocket
          </Link>

          <div className={styles.postMeta}>
            <time dateTime={metadata.publishedAt}>
              {formatPublishedDate(metadata.publishedAt)}
            </time>
            {metadata.draft && (
              <span className={styles.postDraftBadge}>Draft preview</span>
            )}
          </div>

          <h1 className={styles.postTitle}>{metadata.title}</h1>
          <p className={styles.postDescription}>{metadata.description}</p>
        </header>

        <div className={styles.postBody}>
          <Content />
        </div>
      </article>

      <Footer />
    </main>
  );
}

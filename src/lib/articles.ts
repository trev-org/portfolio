import "server-only";

import { readdir } from "node:fs/promises";
import path from "node:path";
import { cache, type ComponentType } from "react";
import type { WrittenArticleMetadata } from "../types/types";

const ARTICLES_DIRECTORY = path.join(
  process.cwd(),
  "src",
  "content",
  "articles",
);
const ARTICLE_FILENAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PUBLISHED_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type ArticleModule = {
  default: ComponentType;
  metadata: unknown;
};

export type WrittenArticle = {
  Content: ComponentType;
  metadata: WrittenArticleMetadata;
};

type ArticleOptions = {
  includeDrafts?: boolean;
};

function shouldIncludeDrafts({ includeDrafts }: ArticleOptions = {}) {
  return includeDrafts ?? process.env.NODE_ENV !== "production";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidPublishedDate(value: string) {
  if (!PUBLISHED_DATE_PATTERN.test(value)) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === value
  );
}

function validateMetadata(
  slug: string,
  metadata: unknown,
): WrittenArticleMetadata {
  if (!isRecord(metadata)) {
    throw new Error(
      `Article "${slug}" must define a YAML frontmatter metadata block.`,
    );
  }

  const { title, description, publishedAt, draft = false } = metadata;

  if (typeof title !== "string" || title.trim().length === 0) {
    throw new Error(`Article "${slug}" must have a non-empty title.`);
  }

  if (typeof description !== "string" || description.trim().length === 0) {
    throw new Error(`Article "${slug}" must have a non-empty description.`);
  }

  if (typeof publishedAt !== "string" || !isValidPublishedDate(publishedAt)) {
    throw new Error(
      `Article "${slug}" must have a valid publishedAt date in YYYY-MM-DD format.`,
    );
  }

  if (typeof draft !== "boolean") {
    throw new Error(`Article "${slug}" must use a boolean draft value.`);
  }

  return {
    slug,
    title: title.trim(),
    description: description.trim(),
    publishedAt,
    draft,
  };
}

const getArticleSlugs = cache(async () => {
  const entries = await readdir(ARTICLES_DIRECTORY, { withFileTypes: true });

  return entries
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.endsWith(".mdx") &&
        !entry.name.startsWith("_"),
    )
    .map((entry) => entry.name.slice(0, -".mdx".length))
    .map((slug) => {
      if (!ARTICLE_FILENAME_PATTERN.test(slug)) {
        throw new Error(
          `Article filename "${slug}.mdx" must use lowercase kebab-case.`,
        );
      }

      return slug;
    });
});

const loadArticleModule = cache(async (slug: string) => {
  const articleModule = (await import(
    `@/content/articles/${slug}.mdx`
  )) as ArticleModule;

  return {
    Content: articleModule.default,
    metadata: validateMetadata(slug, articleModule.metadata),
  } satisfies WrittenArticle;
});

export async function getWrittenArticles(
  options: ArticleOptions = {},
): Promise<WrittenArticleMetadata[]> {
  const includeDrafts = shouldIncludeDrafts(options);
  const slugs = await getArticleSlugs();
  const articles = await Promise.all(
    slugs.map(async (slug) => (await loadArticleModule(slug)).metadata),
  );

  return articles
    .filter((article) => includeDrafts || !article.draft)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getWrittenArticle(
  slug: string,
  options: ArticleOptions = {},
): Promise<WrittenArticle | null> {
  if (!ARTICLE_FILENAME_PATTERN.test(slug)) {
    return null;
  }

  const slugs = await getArticleSlugs();

  if (!slugs.includes(slug)) {
    return null;
  }

  const article = await loadArticleModule(slug);

  if (article.metadata.draft && !shouldIncludeDrafts(options)) {
    return null;
  }

  return article;
}

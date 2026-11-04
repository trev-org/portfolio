/**
 * Articles for the "Saved Articles" section on /pocket.
 *
 * Add entries directly to the array in the order they should appear
 * (the first entry is shown first).
 *
 * Fields:
 * - `title`: article title.
 * - `description`: short summary shown below the title.
 * - `url`: full URL to the original article.
 * - `image`: image shown beside the article.
 * - `savedAt`: date saved in YYYY-MM-DD format.
 *
 * Example:
 * {
 *   title: "An article worth revisiting",
 *   description: "A short explanation of why it is interesting.",
 *   url: "https://example.com/article",
 *   image: "https://example.com/article-image.jpg",
 *   savedAt: "2026-11-03",
 * },
 */

export interface SavedArticle {
  title: string;
  description: string;
  url: string;
  image: string;
  savedAt: string;
}

export const savedArticles: SavedArticle[] = [
  {
    title: "How to Evaluate AI Agents",
    description:
      "A practical guide to code-aware evals, production error analysis, and continuously improving AI agents.",
    url: "https://www.howtoeval.com/",
    image: "https://www.howtoeval.com/og-image.png?v=2",
    savedAt: "2026-11-03",
  },
  {
    title:
      "Devin's SWE-Grep",
    description:
      "How Cognition trained fast, specialized models to retrieve code context through parallel tool calls.",
    url: "https://cognition.com/blog/swe-grep",
    image:
      "https://cdn.sanity.io/images/2mc9cv2v/production/20622883f04adbd579ede1d301d16711652915be-2376x1342.png?rect=0,51,2376,1241&w=1200&h=627&fit=crop",
    savedAt: "2026-11-03",
  },
  {
    title: "Agentic MapReduce",
    description:
      "A pattern for whole-codebase reasoning using deterministic selection, parallel agent investigation, and reduction.",
    url: "https://devin.ai/blog/agentic-map-reduce",
    image:
      "https://devin.ai/images/blog/agentic-map-reduce/mapreduce-illustration.jpg",
    savedAt: "2026-11-03",
  },
];

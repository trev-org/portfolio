import type { Metadata } from "next";
import { getWrittenArticles } from "../../lib/articles";
import PocketClient from "./PocketClient";

export const metadata: Metadata = {
  title: "Pocket",
  description: "Writing and saved articles from my collection.",
};  

export default async function Pocket() {
  const writtenArticles = await getWrittenArticles();

  return <PocketClient writtenArticles={writtenArticles} />;
}

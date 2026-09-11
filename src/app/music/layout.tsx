import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Music",
  description: "What I've been listening to recently.",
};

export default function MusicLayout({ children }: { children: ReactNode }) {
  return children;
}

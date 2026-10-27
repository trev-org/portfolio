import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Photography",
  description: "A collection of photos I've taken.",
};

export default function PhotosLayout({ children }: { children: ReactNode }) {
  return children;
}

import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trevor Gerald - Portfolio",
  description: "All about me.",
  keywords:
    "portfolio, developer, trevor, trevor gerald, trevor gerald portfolio",
  authors: [{ name: "Trevor Gerald" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trevor Gerald - Portfolio",
  description: "Personal portfolio showcasing my work in music, development, and creative projects",
  keywords: "portfolio, developer, music, creative",
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
      <body>
        {children}
      </body>
    </html>
  );
}

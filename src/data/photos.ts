/**
 * Photography for the /photos page.
 *
 * HOW TO ADD A PHOTO
 * ------------------
 * 1. Put the image file in `public/photos/` (this folder is served at
 *    `/photos/...` on the site). Use a lowercase, hyphenated filename, e.g.
 *    `golden-gate-sunset.jpg`. JPG or WebP, ~2000px on the long edge is
 *    plenty for the web.
 * 2. Add one entry to the `photos` array below, in the order you want them
 *    to appear (first entry shows first).
 * 3. Commit and open a PR like any other change — the page updates itself
 *    from this list, no other file needs editing.
 *
 * Fields:
 * - `src` (required): path to the file, starting with `/photos/`.
 * - `alt` (required): short description of the photo, used for
 *   accessibility and if the image fails to load.
 * - `title` (optional): shown as the caption.
 * - `location` / `takenAt` (optional): shown under the title.
 *
 * Example entry:
 *   {
 *     src: "/photos/golden-gate-sunset.jpg",
 *     alt: "Sunset over the Golden Gate Bridge",
 *     title: "Golden Gate Sunset",
 *     location: "San Francisco, CA",
 *     takenAt: "2026-10",
 *   },
 */

export interface Photo {
  src: string;
  alt: string;
  title?: string;
  location?: string;
  takenAt?: string;
}

export const photos: Photo[] = [];

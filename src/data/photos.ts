/**
 * Photography for the /photos page.
 *
 * HOW TO ADD A PHOTO
 * ------------------
 * Run the add-photo script with the original image file:
 *
 *   npm run photo:add -- ~/Downloads/my-photo.jpg --title "My Photo" \
 *     --location "Somewhere, CA" --camera "Camera Model" \
 *     --alt "What the photo shows"
 *
 * It resizes the image to at most 2048px on the long edge, saves it into
 * `public/photos/` under a lowercase, hyphenated name derived from the
 * title, reads the date taken from the photo's EXIF data (override with
 * --date MM-DD-YYYY), and adds the entry to the `photos` array below.
 * Re-running it for the same title updates the entry instead of
 * duplicating it. See `scripts/add-photo.mjs` for all the options.
 *
 * Then commit and open a PR like any other change — the page updates
 * itself from this list, no other file needs editing.
 *
 * To add a photo by hand instead: put the file in `public/photos/` and
 * add one entry to the array below, in the order you want them to appear
 * (first entry shows first).
 *
 * Fields:
 * - `src` (required): path to the file, starting with `/photos/`.
 * - `alt` (required): short description of the photo, used for
 *   accessibility and if the image fails to load.
 * - `title` (optional): shown as the caption.
 * - `location` (optional): shown under the title.
 * - `takenAt` (required): date taken in MM-DD-YYYY format.
 * - `camera` (required): camera model used to take the photo.
 *
 * Example entry:
 *   {
 *     src: "/photos/golden-gate-sunset.jpg",
 *     alt: "Sunset over the Golden Gate Bridge",
 *     title: "Golden Gate Sunset",
 *     location: "San Francisco, CA",
 *     takenAt: "10-15-2026",
 *     camera: "Kodak PIXPRO FZ55",
 *   },
 */

export interface Photo {
  src: string;
  alt: string;
  title?: string;
  location?: string;
  takenAt: string;
  camera: string;
}

export const photos: Photo[] = [
  {
    src: "/photos/amsterdam-canal.jpg",
    alt: "Canal houses and the Zuiderkerk tower along a canal in Amsterdam",
    title: "Amsterdam Canal",
    location: "Amsterdam, Netherlands",
    takenAt: "09-09-2026",
    camera: "Kodak PIXPRO FZ55",
  },
  {
    src: "/photos/nobu-malibu.jpg",
    alt: "The oceanfront patio at Nobu in Malibu overlooking the Pacific Ocean",
    title: "Nobu Malibu",
    location: "Malibu, CA",
    takenAt: "11-02-2026",
    camera: "Kodak PIXPRO FZ55",
  },
  {
    src: "/photos/lands-end.jpg",
    alt: "The Sutro Baths ruins and Seal Rocks at Lands End in San Francisco",
    title: "Lands End",
    location: "San Francisco, CA",
    takenAt: "06-08-2026",
    camera: "Kodak PIXPRO FZ55",
  },
  {
    src: "/photos/pacifica-sunset.jpg",
    alt: "Sunset over the Pacific Ocean in Pacifica, with a camper van parked along the coast road",
    title: "Pacifica Sunset",
    location: "Pacifica, CA",
    takenAt: "01-08-2026",
    camera: "iPhone 14",
  },
  {
    src: "/photos/lake-tahoe.jpg",
    alt: "A pink bicycle parked by a bench on a sandy Lake Tahoe beach, with mountains across the water",
    title: "Lake Tahoe",
    location: "Lake Tahoe, CA",
    takenAt: "07-19-2026",
    camera: "Kodak PIXPRO FZ55",
  },
  {
    src: "/photos/flower.jpg",
    alt: "A black-eyed Susan with yellow petals and a dark brown center, framed by white trim and gray house siding",
    title: "Flower",
    takenAt: "07-04-2022",
    camera: "iPhone SE (Gen 2)",
  },
];

import React from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../../styles/photos.module.css";
import Footer from "../../components/Footer";
import { photos } from "../../data/photos";

const Photos: React.FC = () => {
  return (
    <div className={styles.landingContain}>
      {/* Branding Section */}
      <div className={styles.brandingContain}>
        <div className={styles.brandingHeader}>
          <div className={styles.introContain}>
            <Link className={styles.name} href="/">
              Photography
            </Link>
            <p className={styles.intro}>
              A collection of photos I&apos;ve taken.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.photosContain}>
        {photos.length > 0 ? (
          <div className={styles.photosGrid}>
            {photos.map((photo) => (
              <figure className={styles.photoItem} key={photo.src}>
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={1200}
                  height={800}
                  className={styles.photoImage}
                />
                {(photo.title || photo.location || photo.takenAt) && (
                  <figcaption className={styles.photoCaption}>
                    {photo.title && (
                      <span className={styles.photoTitle}>{photo.title}</span>
                    )}
                    {(photo.location || photo.takenAt) && (
                      <span className={styles.photoMeta}>
                        {[photo.location, photo.takenAt]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    )}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>
            No photos here yet — check back soon.
          </p>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Photos;

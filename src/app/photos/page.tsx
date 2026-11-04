"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "../../styles/photos.module.css";
import Footer from "../../components/Footer";
import PageHeader from "../../components/layout/PageHeader";
import PageShell from "../../components/layout/PageShell";
import { photos, type Photo } from "../../data/photos";

const Photos: React.FC = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    if (!selectedPhoto) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedPhoto(null);
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedPhoto]);

  return (
    <>
      <PageShell>
        <PageHeader
          title="Photography"
          description="I like to take photos. Some come out well."
        />

        <div className={styles.photosContain}>
          {photos.length > 0 ? (
            <div className={styles.photosGrid}>
              {photos.map((photo, index) => (
                <figure className={styles.photoItem} key={photo.src}>
                  <button
                    type="button"
                    className={styles.photoButton}
                    onClick={() => setSelectedPhoto(photo)}
                    aria-label={`Open ${photo.title ?? photo.alt}`}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      width={1200}
                      height={800}
                      className={styles.photoImage}
                      loading={index < 3 ? "eager" : "lazy"}
                    />
                  </button>
                  {(photo.title || photo.location) && (
                    <figcaption className={styles.photoCaption}>
                      {photo.title && (
                        <span className={styles.photoTitle}>{photo.title}</span>
                      )}
                      {photo.location && (
                        <span className={styles.photoMeta}>
                          {photo.location}
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
      </PageShell>

      {selectedPhoto && (
        <div
          className={styles.photoModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="photo-modal-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedPhoto(null);
          }}
        >
          <div className={styles.photoModalContent}>
            <button
              type="button"
              className={styles.photoModalClose}
              onClick={() => setSelectedPhoto(null)}
              aria-label="Close photo"
              autoFocus
            >
              &times;
            </button>
            <div className={styles.photoModalImageWrap}>
              <Image
                src={selectedPhoto.src}
                alt={selectedPhoto.alt}
                fill
                sizes="100vw"
                className={styles.photoModalImage}
                priority
              />
            </div>
            <div className={styles.photoModalCaption}>
              <span
                className={styles.photoModalTitle}
                id="photo-modal-title"
              >
                {selectedPhoto.title ?? "Photo"}
              </span>
              <span className={styles.photoModalMeta}>
                {[
                  selectedPhoto.location,
                  selectedPhoto.takenAt,
                  selectedPhoto.camera,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Photos;

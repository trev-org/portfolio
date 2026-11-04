import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./page-layout.module.css";

interface PageHeaderProps {
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
  titleHref?: string;
}

export default function PageHeader({
  title,
  description,
  actions,
  className,
  titleHref = "/",
}: PageHeaderProps) {
  return (
    <header
      className={[styles.pageHeader, className].filter(Boolean).join(" ")}
    >
      <div
        className={[
          styles.pageHeaderRow,
          actions ? styles.pageHeaderWithActions : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className={styles.pageHeaderIntro}>
          <h1 className={styles.pageTitleHeading}>
            <Link className={styles.pageTitle} href={titleHref}>
              {title}
            </Link>
          </h1>
          <p className={styles.pageDescription}>{description}</p>
        </div>
        {actions}
      </div>
    </header>
  );
}

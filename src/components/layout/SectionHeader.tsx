import type { ReactNode } from "react";
import styles from "./page-layout.module.css";

interface SectionHeaderProps {
  title: string;
  actions?: ReactNode;
  className?: string;
  spacing?: "standard" | "compact";
}

export default function SectionHeader({
  title,
  actions,
  className,
  spacing = "standard",
}: SectionHeaderProps) {
  return (
    <div
      className={[
        styles.sectionHeader,
        spacing === "compact"
          ? styles.sectionHeaderCompact
          : styles.sectionHeaderStandard,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <h2 className={styles.sectionTitle}>{title}</h2>
      {actions && <div className={styles.sectionActions}>{actions}</div>}
    </div>
  );
}

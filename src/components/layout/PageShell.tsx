import type { ReactNode } from "react";
import styles from "./page-layout.module.css";

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

export default function PageShell({
  children,
  className,
}: PageShellProps) {
  return (
    <main className={[styles.pageShell, className].filter(Boolean).join(" ")}>
      {children}
    </main>
  );
}

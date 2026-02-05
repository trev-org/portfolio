"use client";

import React, { useEffect } from "react";
import styles from "../../styles/schedule.module.css";
import Cal, { getCalApi } from "@calcom/embed-react";
import Link from "next/link";

function CalEmbed() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "30min" });
      cal("ui", {
        cssVarsPerTheme: {
          light: { "cal-brand": "#121212" },
          dark: { "cal-brand": "#e5e5e0" },
        },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);
  return (
    <div style={{ padding: "0 20px", width: "100%" }}>
      <Cal
        namespace="30min"
        calLink="trev.org/30min"
        style={{ width: "100%", height: "100%", overflow: "scroll" }}
        config={{ layout: "month_view" }}
      />
    </div>
  );
}

const Schedule: React.FC = () => {
  return (
    <div className={styles.scheduleContain}>
      <div className={styles.brandingContain}>
        <div className={styles.brandingHeader}>
          <Link className={styles.name} href="/">
            Schedule
          </Link>
        </div>
        <div className={styles.introContain}>
          <p className={styles.intro}>
            Always looking to connect with others. Feel free to grab some time
            with me below!
          </p>
        </div>
      </div>
      <CalEmbed />
    </div>
  );
};

export default Schedule;

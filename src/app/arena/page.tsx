"use client";

import React, { useState } from "react";
import styles from "../../styles/arena.module.css";
import Link from "next/link";

const Arena: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  return (
    <div className={styles.scheduleContain}>
      <div className={`${styles.brandingContain} ${styles.fadeInUp}`}>
        <div className={styles.brandingHeader}>
          <Link className={styles.name} href="/">
            Arena
          </Link>
        </div>
        <div className={styles.introContain}>
          <p className={styles.intro}>
            This is where I put models side by side to see what stands out.
          </p>
        </div>

        <div className={`${styles.arenaTabContain} ${styles.fadeInUp}`}>
          <div
            className={styles.projectsItem}
            onClick={() => setSelectedTab(0)}
          >
            <div className={styles.projectItemHoverTopLeft}></div>
            <div className={styles.projectItemHoverBottomRight}></div>
            <div className={styles.projectItemHoverLeft}></div>
            <div className={styles.projectItemHoverBottom}></div>
            <div className={styles.projectsItemContentContain}>
              <span className={styles.projectsItemTitle}>Ask</span>
            </div>
          </div>
          <div
            className={styles.projectsItem}
            onClick={() => setSelectedTab(1)}
          >
            <div className={styles.projectItemHoverTopLeft}></div>
            <div className={styles.projectItemHoverBottomRight}></div>
            <div className={styles.projectItemHoverLeft}></div>
            <div className={styles.projectItemHoverBottom}></div>
            <div className={styles.projectsItemContentContain}>
              <span className={styles.projectsItemTitle}>Compare</span>
            </div>
          </div>
        </div>

        <div className={styles.contentContain}>
          {selectedTab === 0 ? (
            <div className={styles.chatContainer}>
              <input
                type="text"
                placeholder="Ask a question..."
                className={styles.chatInput}
              />
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 10,
                  marginLeft: 5,
                }}
              >
                <select className={styles.modelSelect}>
                  <option value="gpt-4">GPT-4</option>
                  <option value="claude-3">Claude 3</option>
                </select>
                <select className={styles.modelSelect}>
                  <option value="openrouter">OpenRouter</option>
                  <option value="first-party">First Party</option>
                </select>
              </div>
            </div>
          ) : (
            <div className={styles.compareContent}>Compare tab content</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Arena;

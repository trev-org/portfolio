"use client";

import React, { useEffect, useState, useRef } from "react";
import styles from "../../styles/pocket.module.css";
import Footer from "../../components/Footer";
import { createClient } from "../../lib/supabase";
import Image from "next/image";
import gsap from "gsap";
import { Article } from "../../types/types";
import Link from "next/link";

const Pocket: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isArticlesLoading, setIsArticlesLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const nameRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nameFadeTimer = setTimeout(() => {
      if (nameRef.current) {
        gsap.fromTo(
          nameRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
        );
      }
    }, 0);
    const sectionFadeTimer = setTimeout(() => {
      if (sectionRef.current) {
        gsap.fromTo(
          sectionRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
        );
      }
    }, 500);
    return () => {
      clearTimeout(nameFadeTimer);
      clearTimeout(sectionFadeTimer);
    };
  }, []);

  function checkAuth() {
    const password = document.getElementById("password") as HTMLInputElement;
    if (password.value === process.env.NEXT_PUBLIC_PASSWORD) {
      setAuthenticated(true);
    }
  }

  async function parseURL(url: string) {
    try {
      const response = await fetch("/api/parse-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Failed to parse URL: ${url}`, error);
      return null;
    }
  }

  useEffect(() => {
    async function fetchArticles() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("pocket")
        .select()
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Failed to fetch articles:", error);
        return;
      }
      setArticles(data);
      setIsArticlesLoading(false);
    }
    fetchArticles();
  }, []);
  return (
    <>
      {/* Landing Section */}
      <div className={styles.landingContain}>
        {/* Modal */}
        {modalOpen && (
          <div className={styles.modal}>
            <div className={styles.modalIconHeader}>
              <span
                className={styles.close}
                onClick={() => setModalOpen(false)}
              >
                &times;
              </span>
            </div>
            <div className={styles.modalContent}>
              {!authenticated && (
                <div className={styles.modalForm}>
                  <input
                    id="password"
                    type="password"
                    className={styles.modalPasswordInput}
                    placeholder="Password"
                  />
                  <button className={styles.modalButton} onClick={checkAuth}>
                    Submit
                  </button>
                </div>
              )}
              {authenticated && (
                <>
                  <div className={styles.modalHeader}>Articles</div>
                  {articles && articles.length > 0 && (
                    <div className={styles.modalArticlesGrid}>
                      {articles.map((article: Article, index: number) => (
                        <div key={index} className={styles.modalArticlesItem}>
                            <div className={styles.modalArticlesItemTitle}>
                              {article.title}
                            </div>
                            <select
                              value={article.has_read ? "true" : "false"}
                              onChange={(e) => {
                                const updatedArticle = {
                                  ...article,
                                  has_read: e.target.value === "true",
                                };
                                const updatedArticles = articles.map((a) =>
                                  a.id === article.id ? updatedArticle : a
                                );
                                setArticles(updatedArticles);
                              }}
                            >
                              <option value="true">Read</option>
                              <option value="false">Not Read</option>
                            </select>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={styles.modalHeader}>Add Article</div>
                  <div className={styles.modalAddArticleForm}>
                    <input
                      type="text"
                      id="url"
                      placeholder="URL"
                      className={styles.modalAddArticleInput}
                    />
                    <button className={styles.modalAddArticleButton} onClick={() => parseURL((document.getElementById("url") as HTMLInputElement).value)}>
                      Add
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Branding Section */}
        <div className={styles.brandingContain} ref={nameRef}>
          <div className={styles.brandingHeader}>
            <span className={styles.name} onClick={() => setModalOpen(true)}>
              Pocket
            </span>
          </div>
          <div className={styles.introContain}>
            <p className={styles.intro}>
              This is where I collect the sparks of thought.
            </p>
          </div>
        </div>

        <div className={styles.musicContain} ref={sectionRef}>
          {/* Recently Played Section */}
          <section className={styles.articlesContain}>
            <div className={styles.sectionTitleContainer}>
              <span className={styles.sectionTitle}>Articles</span>
            </div>
            {!isArticlesLoading && articles && articles.length > 0 && (
              <div className={styles.articlesGrid}>
                {articles.map((item: Article, index: number) => (
                  <Link href={`${item.link}`} target="_blank" key={index}>
                    <div className={styles.articleItem}>
                      <div className={styles.articleHoverTopLeft}></div>
                      <div className={styles.articleHoverBottomRight}></div>
                      <div className={styles.articleHoverLeft}></div>
                      <div className={styles.articleHoverBottom}></div>
                      <div className={styles.articleContentContain}>
                        <Image
                          src={item.favicon}
                          className={styles.articlesLogo}
                          alt={item.title}
                          width={80}
                          height={80}
                        />
                        <div className={styles.articlesItemContent}>
                          <div className={styles.articleTitleContain}>
                            <span className={styles.articleTitle}>
                              {item.title}
                            </span>
                            <span
                              className={
                                item.has_read
                                  ? styles.articleHasRead
                                  : styles.articleHasNotRead
                              }
                            >
                              {item.has_read ? "Read" : "Not Read"}
                            </span>
                          </div>
                          <span className={styles.articleDescription}>
                            {item.description}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {!isArticlesLoading && (!articles || articles.length === 0) && (
              <div className={styles.articlesPlaceholder}>
                <p>No articles found.</p>
              </div>
            )}
            {isArticlesLoading && <p>Loading...</p>}
          </section>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Pocket;

"use client";

import React, { useRef, useEffect, useState } from "react";
import styles from "../styles/home.module.css";
import { app } from "../lib/firebase";
import { getAnalytics } from "firebase/analytics";
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";

gsap.registerPlugin(TextPlugin);

const useWindowWidth = (): number => {
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);

    // Set initial width
    if (typeof window !== "undefined") {
      handleResize();
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
};

const Home: React.FC = () => {
  const width = useWindowWidth();
  const nameRef = useRef<HTMLSpanElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const experienceRef = useRef<HTMLDivElement>(null);
  const educationRef = useRef<HTMLDivElement>(null);
  const extrasRef = useRef<HTMLDivElement>(null);
  const projectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Firebase Analytics
    if (typeof window !== "undefined") {
      getAnalytics(app);
    }
  }, []);

  const animateName = () => {
    if (!nameRef.current) return;

    const text = nameRef.current.textContent || "";
    nameRef.current.innerHTML = "";

    Array.from(text).forEach((char) => {
      if (char !== "") {
        const span = document.createElement("span");
        span.textContent = char;
        nameRef.current?.appendChild(span);
      }
    });

    gsap.fromTo(
      nameRef.current.children,
      {
        color: "#F7F7F7",
      },
      {
        duration: 0.1,
        stagger: 0.1,
        repeat: -1,
        yoyo: true,
        repeatDelay: 1.5,
        color: "#BA0F2F",
      }
    );
  };

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

    const animationTimer = setTimeout(() => {
      animateName();
    }, 1000);

    const introFadeTimer = setTimeout(() => {
      if (introRef.current) {
        gsap.fromTo(
          introRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
        );
      }
    }, 2500);

    const experienceFadeTimer = setTimeout(() => {
      if (experienceRef.current) {
        gsap.fromTo(
          experienceRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
        );
      }
    }, 3000);

    const educationFadeTimer = setTimeout(() => {
      if (educationRef.current) {
        gsap.fromTo(
          educationRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
        );
      }
    }, 3500);

    const extrasFadeTimer = setTimeout(() => {
      if (extrasRef.current) {
        gsap.fromTo(
          extrasRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
        );
      }
    }, 4000);

    const projectsFadeTimer = setTimeout(() => {
      if (projectRef.current) {
        gsap.fromTo(
          projectRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
        );
      }
    }, 4500);

    return () => {
      clearTimeout(nameFadeTimer);
      clearTimeout(animationTimer);
      clearTimeout(introFadeTimer);
      clearTimeout(experienceFadeTimer);
      clearTimeout(educationFadeTimer);
      clearTimeout(extrasFadeTimer);
      clearTimeout(projectsFadeTimer);
    };
  }, []);

  return (
    <>
      {/* Landing Section */}
      <div className={styles.landingContain}>
        {/* Branding Section */}
        <section className={styles.brandingContain}>
          <span className={styles.name} ref={nameRef}>
            Trevor Gerald.
          </span>
          <div className={styles.introContain} ref={introRef}>
            <p className={styles.intro}>
              Hey! I&apos;m a software engineer based in Columbus + a student
              studying computer science at{" "}
              <span className={styles.introOsu}>The Ohio State University</span>
              .
            </p>
            <p className={styles.intro}>
              Building software has been a passion of mine from a young
              age&mdash;so much so that it&apos;s now a form of creative
              expression. I believe the best tools are intuitive, efficient, and
              accessible to everyone. I&apos;m passionate about AI and web +
              mobile dev, focusing on building SaaS products and solutions that
              solve problems and empower others.
            </p>
            <p className={styles.intro}>
              You can connect with me on{" "}
              <a
                className={styles.introLink}
                href="https://www.linkedin.com/in/trevorgerald/"
                rel="noreferrer"
                target="_blank"
              >
                LinkedIn
              </a>{" "}
              or reach me at{" "}
              <a className={styles.introLink} href="mailto:gerald.26@osu.edu">
                gerald.26@osu.edu
              </a>
              .
            </p>
          </div>
        </section>

        <section className={styles.experienceContain} ref={experienceRef}>
          <span className={styles.sectionTitle}>Experience</span>
          <div className={styles.experienceItem}>
            <Image
              src="/static/windsurf.jpeg"
              className={styles.experienceLogo}
              alt="Windsurf"
              width={40}
              height={40}
            />
            <div className={styles.experienceItemContent}>
              <div className={styles.experienceItemHeader}>
                <span className={styles.experienceItemCompany}>Windsurf</span>
                <span className={styles.experienceItemPresentTag}>Present</span>
              </div>
              <span className={styles.experienceItemPosition}>
                Engineering/GTM
              </span>
            </div>
          </div>
          <div className={styles.experienceItem}>
            <Image
              src="/static/perplexity.jpeg"
              className={styles.experienceLogo}
              alt="Perplexity"
              width={40}
              height={40}
            />
            <div className={styles.experienceItemContent}>
              <div className={styles.experienceItemHeader}>
                <span className={styles.experienceItemCompany}>Perplexity</span>
              </div>
              <span className={styles.experienceItemPosition}>
                Fellow
              </span>
            </div>
          </div>
          <div className={styles.experienceItem}>
            <Image
              src="/static/stealth.png"
              className={styles.experienceLogo}
              alt="Stealth"
              width={40}
              height={40}
            />
            <div className={styles.experienceItemContent}>
              <div className={styles.experienceItemHeader}>
                <span className={styles.experienceItemCompany}>Stealth</span>
              </div>
              <span className={styles.experienceItemPosition}>Founding</span>
            </div>
          </div>

          <div className={styles.experienceItem}>
            <Image
              src="/static/chipotle.png"
              className={styles.experienceLogo}
              alt="Chipotle"
              width={40}
              height={40}
            />
            <div className={styles.experienceItemContent}>
              <span className={styles.experienceItemCompanyNonPresent}>
                Chipotle
              </span>
              <span className={styles.experienceItemPosition}>Software</span>
            </div>
          </div>

          <div className={styles.experienceItem}>
            <Image
              src="/static/bob-evans.png"
              className={styles.experienceLogo}
              alt="Bob Evans"
              width={40}
              height={40}
            />
            <div className={styles.experienceItemContent}>
              <span className={styles.experienceItemCompanyNonPresent}>
                Bob Evans
              </span>
              <span className={styles.experienceItemPosition}>Software</span>
            </div>
          </div>

          <div className={styles.experienceItem}>
            <Image
              src="/static/mimecast.png"
              className={styles.experienceLogo}
              alt="Mimecast"
              width={40}
              height={40}
            />
            <div className={styles.experienceItemContent}>
              <span className={styles.experienceItemCompanyNonPresent}>
                Mimecast (Aware)
              </span>
              <span className={styles.experienceItemPosition}>Software</span>
            </div>
          </div>
        </section>

        <section className={styles.educationContain} ref={educationRef}>
          <span className={styles.sectionTitle}>Education</span>
          <div className={styles.experienceItem}>
            <Image
              src="/static/ohio-state.png"
              className={styles.experienceLogo}
              alt="Ohio State"
              width={40}
              height={40}
            />
            <div className={styles.experienceItemContent}>
              <div className={styles.experienceItemHeader}>
                <span className={styles.experienceItemCompany}>
                  The Ohio State University
                </span>
                <span className={styles.experienceItemPresentTag}>
                  {width <= 500 ? "Spring 2026" : "Expected: Spring 2026"}
                </span>
              </div>
              <span className={styles.experienceItemPosition}>
                Computer Science and Engineering, Bachelors
              </span>
            </div>
          </div>
        </section>

        <section className={styles.educationContain} ref={extrasRef}>
          <div className={styles.sectionTitleContainer}>
            <span className={styles.sectionTitle} style={{ marginBottom: 0 }}>
              Extras
            </span>
          </div>
          <div className={styles.extrasGrid}>
          <Link href="/music">
            <div className={styles.projectsItem}>
              <div className={styles.projectItemHoverTopLeft}></div>
              <div className={styles.projectItemHoverBottomRight}></div>
              <div className={styles.projectItemHoverLeft}></div>
              <div className={styles.projectItemHoverBottom}></div>
              <div className={styles.projectsItemContentContain}>
                <span className={styles.projectsItemTitle}>Music</span>
                <span className={styles.projectsItemDesc}>
                A glimpse into my current listening habits and recent audio discoveries
                </span>
              </div>
            </div>
          </Link>
          <Link href="/pocket">
            <div className={styles.projectsItem}>
              <div className={styles.projectItemHoverTopLeft}></div>
              <div className={styles.projectItemHoverBottomRight}></div>
              <div className={styles.projectItemHoverLeft}></div>
              <div className={styles.projectItemHoverBottom}></div>
              <div className={styles.projectsItemContentContain}>
                <span className={styles.projectsItemTitle}>Pocket</span>
                <span className={styles.projectsItemDesc}>
                A handpicked collection of articles I&apos;m drawn to and eager to explore
                </span>
              </div>
            </div>
          </Link>
          </div>
        </section>

        <section className={styles.projectsContain} ref={projectRef}>
          <span className={styles.sectionTitle}>Projects</span>
          <div className={styles.projectsGrid}>
            <div className={styles.projectsItem}>
              <div className={styles.projectItemHoverTopLeft}></div>
              <div className={styles.projectItemHoverBottomRight}></div>
              <div className={styles.projectItemHoverLeft}></div>
              <div className={styles.projectItemHoverBottom}></div>
              <div className={styles.projectsItemContentContain}>
                <span className={styles.projectsItemTitle}>Rep Finder</span>
                <span className={styles.projectsItemDesc}>
                  Mobile app to track gym machine availability using computer
                  vision
                </span>
              </div>
            </div>

            <div className={styles.projectsItem}>
              <div className={styles.projectItemHoverTopLeft}></div>
              <div className={styles.projectItemHoverBottomRight}></div>
              <div className={styles.projectItemHoverLeft}></div>
              <div className={styles.projectItemHoverBottom}></div>
              <div className={styles.projectsItemContentContain}>
                <span className={styles.projectsItemTitle}>
                  Honeycomb Studios
                </span>
                <span className={styles.projectsItemDesc}>
                  High-quality, custom posters designed to be visually stunning
                  for the masses
                </span>
              </div>
            </div>

            <div className={styles.projectsItem}>
              <div className={styles.projectItemHoverTopLeft}></div>
              <div className={styles.projectItemHoverBottomRight}></div>
              <div className={styles.projectItemHoverLeft}></div>
              <div className={styles.projectItemHoverBottom}></div>
              <div className={styles.projectsItemContentContain}>
                <span className={styles.projectsItemTitle}>OSI Bot</span>
                <span className={styles.projectsItemDesc}>
                  LLM to diagnose problems with networking infrastructure at
                  Chipotle restaurants
                </span>
              </div>
            </div>

            <div className={styles.projectsItem}>
              <div className={styles.projectItemHoverTopLeft}></div>
              <div className={styles.projectItemHoverBottomRight}></div>
              <div className={styles.projectItemHoverLeft}></div>
              <div className={styles.projectItemHoverBottom}></div>
              <div className={styles.projectsItemContentContain}>
                <span className={styles.projectsItemTitle}>
                  Research Mentorship Program
                </span>
                <span className={styles.projectsItemDesc}>
                  Web platform commissioned by Ohio State&apos;s Undergraduate
                  Student Government
                </span>
              </div>
            </div>

            <div className={styles.projectsItem}>
              <div className={styles.projectItemHoverTopLeft}></div>
              <div className={styles.projectItemHoverBottomRight}></div>
              <div className={styles.projectItemHoverLeft}></div>
              <div className={styles.projectItemHoverBottom}></div>
              <div className={styles.projectsItemContentContain}>
                <span className={styles.projectsItemTitle}>
                  Brutus the Plumber
                </span>
                <span className={styles.projectsItemDesc}>
                  Super Mario clone developed in C featuring both a graphics + a
                  text mode
                </span>
              </div>
            </div>

            <div className={styles.projectsItem}>
              <div className={styles.projectItemHoverTopLeft}></div>
              <div className={styles.projectItemHoverBottomRight}></div>
              <div className={styles.projectItemHoverLeft}></div>
              <div className={styles.projectItemHoverBottom}></div>
              <div className={styles.projectsItemContentContain}>
                <span className={styles.projectsItemTitle}>Brawl Stars</span>
                <span className={styles.projectsItemDesc}>
                  Brawl Stars clone written for the Freescale Kinetis K60 in C++
                  with custom graphics libraries
                </span>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Home;

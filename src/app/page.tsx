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
  const brandingRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const experienceRef = useRef<HTMLDivElement>(null);
  const educationRef = useRef<HTMLDivElement>(null);
  const extrasRef = useRef<HTMLDivElement>(null);
  const projectRef = useRef<HTMLDivElement>(null);
  const projectListRef = useRef<HTMLDivElement>(null);
  const explanationRef = useRef<HTMLDivElement>(null);

  const projects = {
    rtuhub: {
      name: "RTU Hub",
      link: "https://rtuhub.com/",
      description: "one-stop shop for discovering food service products",
    },
    polymer: {
      name: "Polymer",
      link: "",
      description: "redefining social media x music",
    },
    honeycomb: {
      name: "Honeycomb Studios",
      link: "https://honeycomb-studios.web.app/",
      description: "high quality posters for the masses",
    },
    urmp: {
      name: "URMP",
      link: "https://research.osu.dev/",
      description: "platform to connect researchers to mentees, 500+ users",
    },
  };

  const [hoveredProject, setHoveredProject] = useState<
    keyof typeof projects | null
  >(null);
  const [isProjectHovering, setIsProjectHovering] = useState<boolean>(false);

  useEffect(() => {
    // Initialize Firebase Analytics
    if (typeof window !== "undefined") {
      getAnalytics(app);
    }
  }, []);

  // Close explanation on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        isProjectHovering &&
        !projectListRef.current?.contains(target) &&
        !explanationRef.current?.contains(target)
      ) {
        setHoveredProject(null);
        setIsProjectHovering(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHoveredProject(null);
        setIsProjectHovering(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProjectHovering]);

  const toggleProject = (key: keyof typeof projects) => {
    if (hoveredProject === key && isProjectHovering) {
      setHoveredProject(null);
      setIsProjectHovering(false);
    } else {
      setHoveredProject(key);
      setIsProjectHovering(true);
    }
  };

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
        duration: 0.05,
        stagger: 0.05,
        repeat: -1,
        yoyo: true,
        repeatDelay: 1.5,
        color: "var(--main-color)",
      }
    );
  };

  useEffect(() => {
    const brandingFadeTimer = setTimeout(() => {
      if (brandingRef.current) {
        gsap.fromTo(
          brandingRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
        );
      }
    }, 0);

    const animationTimer = setTimeout(() => {
      animateName();
    }, 0);

    const introFadeTimer = setTimeout(() => {
      if (introRef.current) {
        gsap.fromTo(
          introRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
        );
      }
    }, 750);

    const experienceFadeTimer = setTimeout(() => {
      if (experienceRef.current) {
        gsap.fromTo(
          experienceRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
        );
      }
    }, 1000);

    const educationFadeTimer = setTimeout(() => {
      if (educationRef.current) {
        gsap.fromTo(
          educationRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
        );
      }
    }, 1250);

    const extrasFadeTimer = setTimeout(() => {
      if (extrasRef.current) {
        gsap.fromTo(
          extrasRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
        );
      }
    }, 1500);

    const projectsFadeTimer = setTimeout(() => {
      if (projectRef.current) {
        gsap.fromTo(
          projectRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
        );
      }
    }, 1750);

    return () => {
      clearTimeout(brandingFadeTimer);
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
          <div className={styles.brandingContent} ref={brandingRef}>
            <span className={styles.name} ref={nameRef}>
              Trevor Gerald.
            </span>
            <div className={styles.brandingLinks}>
              <a
                className={styles.introLink}
                href="https://www.linkedin.com/in/trevorgerald/"
                rel="noreferrer"
                target="_blank"
              >
                IN
              </a>
              <a className={styles.introLink} href="mailto:gerald.26@osu.edu">
                MAIL
              </a>
            </div>
          </div>
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
              expression. I believe the best tools are aestheically pleasing,
              efficient, and accessible to everyone. I&apos;m passionate about
              building tools that make the world a better place.
            </p>
          </div>
        </section>

        <section className={styles.experienceContain} ref={experienceRef}>
          <span className={styles.sectionTitle}>Experience</span>
          <div className={styles.experienceItem}>
            <Image
              src="/static/cognition.jpeg"
              className={styles.experienceLogo}
              alt="Cognition"
              width={40}
              height={40}
            />
            <div className={styles.experienceItemContent}>
              <div className={styles.experienceItemHeader}>
                <span className={styles.experienceItemCompany}>Cognition</span>
                {/* <span className={styles.experienceItemPresentTag}>Present</span> */}
              </div>
              <span className={styles.experienceItemPosition}>
                Engineering + GTM
              </span>
            </div>
          </div>

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
                {/* <span className={styles.experienceItemPresentTag}>Present</span> */}
              </div>
              <span className={styles.experienceItemPosition}>
                Engineering + GTM, Acquired by Cognition
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
              <span className={styles.experienceItemPosition}>Fellow</span>
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
              <span className={styles.experienceItemPosition}>
                IT Infrastructure
              </span>
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
              <span className={styles.experienceItemPosition}>
                Internal Tooling
              </span>
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
                  {width <= 500 ? "Dec 2025" : "Expected: Dec 2025"}
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
                    A glimpse into my current listening habits and recent audio
                    discoveries
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
                    A handpicked collection of knowledge I&apos;m drawn to and
                    eager to explore
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>

        <section className={styles.projectsContain} ref={projectRef}>
          <span className={styles.sectionTitle}>Projects</span>
          <div className={styles.projectList} ref={projectListRef}>
            <button
              onClick={() => toggleProject("rtuhub")}
              className={
                hoveredProject === "rtuhub" ? styles.activeProject : ""
              }
              aria-label={projects.rtuhub.name}
              title={projects.rtuhub.name}
            >
              🍔
            </button>
            <button
              onClick={() => toggleProject("polymer")}
              className={
                hoveredProject === "polymer" ? styles.activeProject : ""
              }
              aria-label={projects.polymer.name}
              title={projects.polymer.name}
            >
              🎧
            </button>
            <button
              onClick={() => toggleProject("honeycomb")}
              className={
                hoveredProject === "honeycomb" ? styles.activeProject : ""
              }
              aria-label={projects.honeycomb.name}
              title={projects.honeycomb.name}
            >
              🖼️
            </button>
            <button
              onClick={() => toggleProject("urmp")}
              className={hoveredProject === "urmp" ? styles.activeProject : ""}
              aria-label={projects.urmp.name}
              title={projects.urmp.name}
            >
              👨‍🔬
            </button>
          </div>
          {isProjectHovering && (
            <div
              className={`${styles.projectExplanation} ${
                isProjectHovering ? styles.showExplanation : ""
              }`}
              ref={explanationRef}
            >
              {hoveredProject ? (
                <>
                  {projects[hoveredProject].link ? (
                    <a
                      href={projects[hoveredProject].link}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.projectLink}
                    >
                      {projects[hoveredProject].name}
                    </a>
                  ) : (
                    projects[hoveredProject].name
                  )}
                  {" — "}
                  {projects[hoveredProject].description}
                </>
              ) : (
                ""
              )}
            </div>
          )}
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Home;

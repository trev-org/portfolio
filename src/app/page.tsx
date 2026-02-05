"use client";

import React, { useRef, useEffect, useState } from "react";
import styles from "../styles/home.module.css";
import { app } from "../lib/firebase";
import { getAnalytics } from "firebase/analytics";
import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";

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
  const projectListRef = useRef<HTMLDivElement>(null);
  const explanationRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const animationDelay = 0.2;

  const projects = {
    rtuhub: {
      name: "RTU Hub",
      link: "https://rtuhub.com/",
      description: "one-stop shop for discovering food service products",
    },
    // polymer: {
    //   name: "Polymer",
    //   link: "",
    //   description: "redefining social media x music",
    // },
    honeycomb: {
      name: "Honeycomb Studios",
      link: "https://honeycomb-studios.web.app/",
      description: "high quality posters for the masses",
    },
    urmp: {
      name: "URMP",
      link: "https://www.linkedin.com/posts/keminghe_ohiostate-osu-studentorganization-activity-7237797457709998080-eZb2?utm_source=share&utm_medium=member_desktop&rcm=ACoAADQqWlQBhaTkdQU-3gDKW2_4INiiIPHBhU0",
      description: "platform to connect researchers to mentees; 500+ users",
    },
    casey: {
      name: "Casey",
      link: "https://www.linkedin.com/feed/update/urn:li:activity:7352015834879307776/",
      description:
        "turn any real-world experience into structured, classroom-ready case studies; 100+ on waitlist",
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

  // Trigger CSS animations on mount
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <>
      {/* Landing Section */}
      <div
        className={`${styles.landingContain} ${
          isLoaded ? styles.staggerChildren : ""
        }`}
      >
        {/* Branding Section */}
        <section
          className={`${styles.brandingContain} ${
            isLoaded ? styles.fadeInUp : ""
          }`}
        >
          <div className={styles.brandingContent}>
            <span className={styles.name}>
              {"Trevor Gerald.".split("").map((char, i) => (
                <span
                  key={i}
                  className={styles.nameChar}
                  style={{ animationDelay: `${i * animationDelay}s` }}
                >
                  {char}
                </span>
              ))}
            </span>
            <div className={styles.brandingLinks}>
              <Link
                className={styles.introLink}
                href="https://www.linkedin.com/in/trevorgerald/"
                rel="noreferrer"
                target="_blank"
              >
                IN
              </Link>
              <Link
                className={styles.introLink}
                href="https://github.com/trev-org"
                rel="noreferrer"
                target="_blank"
              >
                GH
              </Link>
              <Link
                className={styles.introLink}
                href="mailto:gerald.26@osu.edu"
              >
                MAIL
              </Link>
              <Link className={styles.introLink} href="/schedule">
                SCHEDULE
              </Link>
            </div>
          </div>
          <div
            className={`${styles.introContain} ${
              isLoaded ? styles.fadeInUp : ""
            }`}
            style={{ animationDelay: `${animationDelay * 1}s` }}
          >
            <p className={styles.intro}>
              Hey! I&apos;m a software engineer and a computer science student
              at{" "}
              <span className={styles.introOsu}>The Ohio State University</span>
              .
            </p>
            <p className={styles.intro}>
              As a kid, I loved building things — cars, robots, anything I could
              imagine. In 5th grade, I taught myself to code, launched my first
              app for my middle school, and even received a $1K fellowship
              grant. By high school, I was diving into startups and haven&apos;t
              stopped creating since.
            </p>
            <p className={styles.intro}>
              I believe the best tools are visually appealing, efficient, and
              accessible. I&apos;m passionate about building technology that
              empowers people and makes the world a better place.
            </p>
          </div>
        </section>

        <section
          className={`${styles.projectsContain} ${
            isLoaded ? styles.fadeInUp : ""
          }`}
          style={{ animationDelay: `${animationDelay * 2}s` }}
        >
          <span className={styles.sectionTitle}>Achievements</span>
          <ul className={styles.achievementsList}>
            <li>
              <a href="https://www.linkedin.com/posts/alex-davessar-22a064167_were-excited-to-introduce-you-to-the-business-activity-7289524878586589184-0IXc/?utm_source=share&utm_medium=member_desktop&rcm=ACoAADQqWlQBhaTkdQU-3gDKW2_4INiiIPHBhU0">
                Revived
              </a>{" "}
              the largest entrepreneurship student org at Ohio State and made it{" "}
              <a href="https://www.linkedin.com/posts/business-builders-club_were-honored-to-share-that-business-builders-ugcPost-7317965496203517953-acKM?utm_source=share&utm_medium=member_desktop&rcm=ACoAADQqWlQBhaTkdQU-3gDKW2_4INiiIPHBhU0">
                award-winning
              </a>
            </li>
            <li>
              Helped kick off a{" "}
              <a href="https://www.linkedin.com/posts/laurelmeredithsmith_yale-collegeambassador-osu-activity-7249168827890954240-sCV2?utm_source=share&utm_medium=member_desktop&rcm=ACoAADQqWlQBhaTkdQU-3gDKW2_4INiiIPHBhU0">
                new food-waste initiative
              </a>{" "}
              that rescued 9K meals and counting
            </li>
            <li>
              Primary contributor to a{" "}
              <a href="https://www.linkedin.com/feed/update/urn:li:activity:7358904712647049216?commentUrn=urn%3Ali%3Acomment%3A%28activity%3A7358904712647049216%2C7358979586681946112%29&dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287358979586681946112%2Curn%3Ali%3Aactivity%3A7358904712647049216%29">
                major B2B tech integration
              </a>
            </li>
          </ul>
        </section>

        <section
          className={`${styles.experienceContain} ${
            isLoaded ? styles.fadeInUp : ""
          }`}
          style={{ animationDelay: `${animationDelay * 3}s` }}
        >
          <span className={styles.sectionTitle}>Experience</span>
          <div
            style={{
              display: width < 768 ? "block" : "grid",
              gridTemplateColumns: width < 768 ? "auto" : "repeat(2, 1fr)",
              width: "100%",
            }}
          >
            <div className={styles.experienceItem}>
              <Image
                src="/static/mintlify.jpeg"
                className={styles.experienceLogo}
                alt="Mintlify"
                width={40}
                height={40}
              />
              <div className={styles.experienceItemContent}>
                <div className={styles.experienceItemHeader}>
                  <span className={styles.experienceItemCompany}>Mintlify</span>
                  {/* <span className={styles.experienceItemPresentTag}>Present</span> */}
                </div>
                <span className={styles.experienceItemPosition}>
                  Engineering + GTM
                </span>
              </div>
            </div>
            <div className={styles.experienceItem}>
              <Image
                src="/static/handshake.jpeg"
                className={styles.experienceLogo}
                alt="Handshake"
                width={40}
                height={40}
              />
              <div className={styles.experienceItemContent}>
                <div className={styles.experienceItemHeader}>
                  <span className={styles.experienceItemCompany}>
                    Handshake
                  </span>
                  {/* <span className={styles.experienceItemPresentTag}>Present</span> */}
                </div>
                <span className={styles.experienceItemPosition}>Fellow</span>
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
                  <span className={styles.experienceItemCompany}>
                    Perplexity
                  </span>
                </div>
                <span className={styles.experienceItemPosition}>
                  Fellow, Campus Growth
                </span>
              </div>
            </div>
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
                  <span className={styles.experienceItemCompany}>
                    Cognition
                  </span>
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
                  Engineering + GTM, acq. by Cognition
                </span>
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
                  Software — IT Infrastructure
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
                  Software — Internal Tooling
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          className={`${styles.educationContain} ${
            isLoaded ? styles.fadeInUp : ""
          }`}
          style={{ animationDelay: `${animationDelay * 4}s` }}
        >
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
                {/* <span className={styles.experienceItemPresentTag}>
                  {width <= 500 ? "Dec 2025" : "Expected: Dec 2025"}
                </span> */}
              </div>
              <span className={styles.experienceItemPosition}>
                Honors B.S. in Computer Science and Engineering, AI
                Specialization
              </span>
            </div>
          </div>
        </section>

        <section
          className={`${styles.projectsContain} ${
            isLoaded ? styles.fadeInUp : ""
          }`}
          style={{ animationDelay: `${animationDelay * 5}s` }}
        >
          <span className={styles.sectionTitle}>Ventures</span>
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
            {/* <button
              onClick={() => toggleProject("polymer")}
              className={
                hoveredProject === "polymer" ? styles.activeProject : ""
              }
              aria-label={projects.polymer.name}
              title={projects.polymer.name}
            >
              🎧
            </button> */}
            <button
              onClick={() => toggleProject("urmp")}
              className={hoveredProject === "urmp" ? styles.activeProject : ""}
              aria-label={projects.urmp.name}
              title={projects.urmp.name}
            >
              👨‍🔬
            </button>
            <button
              onClick={() => toggleProject("casey")}
              className={hoveredProject === "casey" ? styles.activeProject : ""}
              aria-label={projects.casey.name}
              title={projects.casey.name}
            >
              📖
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

        <section
          className={`${styles.educationContain} ${
            isLoaded ? styles.fadeInUp : ""
          }`}
          style={{ animationDelay: `${animationDelay * 6}s` }}
        >
          <div className={styles.sectionTitleContainer}>
            <span className={styles.sectionTitle} style={{ marginBottom: 0 }}>
              Extras
            </span>
          </div>
          <div className={styles.extrasGrid}>
            {/* <Link href="/arena">
              <div className={styles.projectsItem}>
                <div className={styles.projectItemHoverTopLeft}></div>
                <div className={styles.projectItemHoverBottomRight}></div>
                <div className={styles.projectItemHoverLeft}></div>
                <div className={styles.projectItemHoverBottom}></div>
                <div className={styles.projectsItemContentContain}>
                  <span className={styles.projectsItemTitle}>Arena</span>
                  <span className={styles.projectsItemDesc}>
                    A space where I experiment with and compare AI models in
                    competitive scenarios
                  </span>
                </div>
              </div>
            </Link> */}
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

        <Footer />
      </div>
    </>
  );
};

export default Home;

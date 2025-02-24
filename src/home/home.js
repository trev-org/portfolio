import React, { useRef, useEffect, useState } from 'react';
import styles from './home.module.css';
import { app } from "../firebase";
import { getAnalytics } from "firebase/analytics";
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import BobEvans from './static/bob-evans.png';
import Mimecast from './static/mimecast.png';
import MarketCrunch from './static/marketcrunch.png';
import Chipotle from './static/chipotle.png';
import OhioState from './static/ohio-state.png';

gsap.registerPlugin(TextPlugin)

const SplashScreen = () => {
    const typewriterNameRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const tl = gsap.timeline({repeat: 1, repeatDelay: 5, yoyo: false});
        tl.to(typewriterNameRef.current, {duration: 2, text:"TREVOR GERALD"});
        tl.to(typewriterNameRef.current, {duration: 0.1, color: "#68DE68"});
        tl.to(containerRef.current, {duration: 2, width: 0, x: "50vw", ease: "power4.out"});
        tl.to(typewriterNameRef.current, { duration: 0.1, opacity: 0, delay: 0.5 }, "<");

        return () => {
            tl.kill();
        };
    }, []);

    return (
        <div ref={containerRef} className="landing-contain" style={{ backgroundColor: "#FFF5EA", position: "relative" }}>
            <span ref={typewriterNameRef} style={{ display: "table", margin: "auto", fontFamily: "MarketSans-Medium", fontWeight: 800, color: "#000401" }}></span>
        </div>
    );
};

const useWindowWidth = () => {
    const [width, setWidth] = useState(window.innerWidth);
  
    useEffect(() => {
      const handleResize = () => setWidth(window.innerWidth);
  
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);
  
    return width;
  };

const Home = () => {
    const width = useWindowWidth();
    const analytics = getAnalytics(app);
    const nameRef = useRef(null);
    const introRef = useRef(null);
    const experienceRef = useRef(null);
    const educationRef = useRef(null);
    const projectRef = useRef(null);
    const menuItemsRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const animateName = () => {
        const text = nameRef.current.textContent;
        nameRef.current.innerHTML = '';
    
        Array.from(text).forEach((char) => {
            if (char !== "") {
                const span = document.createElement('span');
                span.textContent = char;
                nameRef.current.appendChild(span);
            }
        });
    
        gsap.fromTo(nameRef.current.children,
            {
                color: "#F7F7F7"                
            },
            {
                duration: 0.1,
                stagger: 0.1,
                repeat: -1,
                yoyo: true,
                repeatDelay: 1.5,
                color: "#BA0F2F"
            }
        );
    }

    const toggleMenu = () => {
        const menuItems = Array.from(menuItemsRef.current.children).slice(0, 2);
        const menu = Array.from(menuItemsRef.current.children).slice(2);
        const menuTL = gsap.timeline();
    
        if (isOpen) {
            menuTL
                .to(menuItems, {
                    opacity: 0,
                    duration: 0.3,
                    stagger: 0.1,
                    onComplete: () => {
                        menuItems.forEach(item => (item.style.display = "none"));
                    },
                })
                .to(menu, {
                    y: 0,
                    duration: 0.1,
                    onComplete: () => {
                        menu[0].innerHTML = "menu";
                    },
                });
        } else {
            menuTL
                .to(menu, {
                    y: 18,
                    duration: 0.1,
                    onComplete: () => {
                        menu[0].innerHTML = "close";
                        menuItems.forEach(item => (item.style.display = "block"));
                    },
                })
                .to(menuItems, {
                    opacity: 1,
                    duration: 0.3,
                    stagger: 0.1,
                });
        }
        setIsOpen(!isOpen);
    };
    

    useEffect(() => {
        // const loadingTimer = setTimeout(() => {
        //     setIsLoading(false);
        // }, 5000);

        const nameFadeTimer = setTimeout(() => {
            gsap.fromTo(
                nameRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
              );
        }, 0);

        const animationTimer = setTimeout(() => {
            animateName();
        }, 1000);

        const introFadeTimer = setTimeout(() => {
            gsap.fromTo(
                introRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
              );
        }, 2500);

        const experienceFadeTimer = setTimeout(() => {
            gsap.fromTo(
                experienceRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
              );
        }, 3000);

        const educationFadeTimer = setTimeout(() => {
            gsap.fromTo(
                educationRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
              );
        }, 3500);

        const projectsFadeTimer = setTimeout(() => {
            gsap.fromTo(
                projectRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
              );
        }, 4000);

        return () => {
            clearTimeout(nameFadeTimer);
            clearTimeout(animationTimer);
            clearTimeout(introFadeTimer);
            clearTimeout(experienceFadeTimer);
            clearTimeout(educationFadeTimer);
            clearTimeout(projectsFadeTimer);
        };
    }, []);

        return (
            <>
                {isLoading ? (<SplashScreen />) :
            <>
            {/* Landing Section */}
            <div className={styles.landingContain}>
                {/* <div className={styles.menuContain} ref={menuItemsRef}>
                    <a href="/" className={styles.menuItem}>home</a>
                    <a href="/playground" className={styles.menuItem}>playground</a>
                    <span className={styles.menu} onClick={() => toggleMenu()}>menu</span>
                </div> */}
                {/* Branding Section */}
                <section className={styles.brandingContain}>
                    <span className={styles.name} ref={nameRef}>Trevor Gerald.</span>
                    <div className={styles.introContain} ref={introRef}>
                        <p className={styles.intro}>Hey! I'm a software engineer based in Columbus + a student studying computer science at <span className={styles.introOsu}>The Ohio State University</span>.</p>
                        <p className={styles.intro}>Building software has been a passion of mine from a young age&mdash;so much so that it's now a form of creative expression. I believe the best tools are intuitive, efficient, and accessible to everyone. I'm passionate about AI and web + mobile dev, focusing on building SaaS products and solutions that solve problems and empower others.</p>
                        <p className={styles.intro}>You can connect with me on <a className={styles.introLink} href="https://www.linkedin.com/in/trevorgerald/" rel="noreferrer" target="_blank">LinkedIn</a> or reach me at <a className={styles.introLink} href="mailto:gerald.26@osu.edu">gerald.26@osu.edu</a>.</p>
                    </div>
                </section>
                <section className={styles.experienceContain} ref={experienceRef}>
                    <span className={styles.sectionTitle}>Experience</span>
                    <div className={styles.experienceItem}>
                        <img src={MarketCrunch} className={styles.experienceLogo}></img>
                        <div className={styles.experienceItemContent}>
                            <div className={styles.experienceItemHeader}>
                                <span className={styles.experienceItemCompany}>Stealth</span>
                                <span className={styles.experienceItemPresentTag}>Present</span>
                            </div>
                            <span className={styles.experienceItemPosition}>Founding Engineer</span>
                        </div>
                    </div>

                    <div className={styles.experienceItem}>
                        <img src={Chipotle} className={styles.experienceLogo}></img>
                        <div className={styles.experienceItemContent}>
                            <span className={styles.experienceItemCompanyNonPresent}>Chipotle</span>
                            <span className={styles.experienceItemPosition}>Software Engineering Intern</span>
                        </div>
                    </div>
                    
                    <div className={styles.experienceItem}>
                        <img src={BobEvans} className={styles.experienceLogo}></img>
                        <div className={styles.experienceItemContent}>
                            <span className={styles.experienceItemCompanyNonPresent}>Bob Evans</span>
                            <span className={styles.experienceItemPosition}>Software Developer Intern</span>
                        </div>
                    </div>
                    
                    <div className={styles.experienceItem}>
                        <img src={Mimecast} className={styles.experienceLogo}></img>
                        <div className={styles.experienceItemContent}>
                            <span className={styles.experienceItemCompanyNonPresent}>Mimecast (Aware)</span>
                            <span className={styles.experienceItemPosition}>Software Engineering Intern</span>
                        </div>
                    </div>
                </section>
                <section className={styles.educationContain} ref={educationRef}>
                    <span className={styles.sectionTitle}>Education</span>
                    <div className={styles.experienceItem}>
                        <img src={OhioState} className={styles.experienceLogo}></img>
                        <div className={styles.experienceItemContent}>
                            <div className={styles.experienceItemHeader}>
                                <span className={styles.experienceItemCompany}>The Ohio State University</span>
                                <span className={styles.experienceItemPresentTag}>{width <= 500 ? 'Spring 2026' : 'Expected: Spring 2026'}</span>
                            </div>
                            <span className={styles.experienceItemPosition}>Computer Science and Engineering, Bachelors</span>
                        </div>
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
                                <a className={styles.projectsItemTitle}>Rep Finder</a>
                                <span className={styles.projectsItemDesc}>Mobile app to track gym machine availability using computer vision</span>
                            </div>
                        </div>

                        <div className={styles.projectsItem}>
                            <div className={styles.projectItemHoverTopLeft}></div>
                            <div className={styles.projectItemHoverBottomRight}></div>
                            <div className={styles.projectItemHoverLeft}></div>
                            <div className={styles.projectItemHoverBottom}></div>
                            <div className={styles.projectsItemContentContain}>
                                <a className={styles.projectsItemTitle}>Honeycomb Studios</a>
                                <span className={styles.projectsItemDesc}>High-quality, custom posters designed to be visually stunning for the masses</span>
                            </div>
                        </div>

                        <div className={styles.projectsItem}>
                            <div className={styles.projectItemHoverTopLeft}></div>
                            <div className={styles.projectItemHoverBottomRight}></div>
                            <div className={styles.projectItemHoverLeft}></div>
                            <div className={styles.projectItemHoverBottom}></div>
                            <div className={styles.projectsItemContentContain}>
                                <a className={styles.projectsItemTitle}>OSI Bot</a>
                                <span className={styles.projectsItemDesc}>LLM to diagnose problems with networking infrastructure at Chipotle restaurants</span>
                            </div>
                        </div>

                        <div className={styles.projectsItem}>
                            <div className={styles.projectItemHoverTopLeft}></div>
                            <div className={styles.projectItemHoverBottomRight}></div>
                            <div className={styles.projectItemHoverLeft}></div>
                            <div className={styles.projectItemHoverBottom}></div>
                            <div className={styles.projectsItemContentContain}>
                                <a className={styles.projectsItemTitle}>Research Mentorship Program</a>
                                <span className={styles.projectsItemDesc}>Web platform commissioned by Ohio State's Undergraduate Student Government</span>
                            </div>
                        </div>

                        <div className={styles.projectsItem}>
                            <div className={styles.projectItemHoverTopLeft}></div>
                            <div className={styles.projectItemHoverBottomRight}></div>
                            <div className={styles.projectItemHoverLeft}></div>
                            <div className={styles.projectItemHoverBottom}></div>
                            <div className={styles.projectsItemContentContain}>
                                <a className={styles.projectsItemTitle}>Brutus the Plumber</a>
                                <span className={styles.projectsItemDesc}>Super Mario clone developed in C featuring both a graphics + a text mode</span>
                            </div>
                        </div>

                        <div className={styles.projectsItem}>
                            <div className={styles.projectItemHoverTopLeft}></div>
                            <div className={styles.projectItemHoverBottomRight}></div>
                            <div className={styles.projectItemHoverLeft}></div>
                            <div className={styles.projectItemHoverBottom}></div>
                            <div className={styles.projectsItemContentContain}>
                                <a className={styles.projectsItemTitle}>Brawl Stars</a>
                                <span className={styles.projectsItemDesc}>Brawl Stars clone written for the Freescale Kinetis K60 in C++ with custom graphics libraries</span>
                            </div>
                        </div>
                    </div>
                </section>
                <section className={styles.footer}>
                    <span className={styles.clock} id="clock"></span>
                    <span className={styles.quote}>v3</span>
                </section>
            </div>

            {/* Navigation Contain */}

            <Helmet>
                <script type="text/javascript">
                    {`
                        window.addEventListener('load', function() {
                            function startTime() {
                                const today = new Date();
                                const timeZone = "America/New_York";
                                const formatter = new Intl.DateTimeFormat("en-US", {
                                timeZone,
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: false,
                                });
                                const formattedTime = formatter.format(today);
                                document.getElementById('clock').innerHTML = formattedTime + " UTC -5";
                                setTimeout(startTime, 1000);
                            }
                            setTimeout(startTime, 10);
                        });
                    `}
                </script>
            </Helmet>
        </>}
            </>
        )
}
export default Home;

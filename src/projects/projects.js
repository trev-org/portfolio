import React from 'react';
import './projects.css';
import { app } from "../firebase";
import { getAnalytics } from "firebase/analytics";
import Chives from './static/Chives.png';
import Honeycomb from './static/HoneycombStudios.png';
import Sift from './static/Sift.png';
import Eventify from './static/Eventify.png';
import Brutus from './static/Brutus.png';
import Kavi from './static/Kavi.png';
import Crawler from './static/Crawler.png';
import { Helmet } from 'react-helmet-async';
import { Slideshow, SlideshowItem } from '../components/slideshow';
import featuredPosters from './static/Honeycomb Studios - Featured Posters.pdf';
import '../fonts/DrukWide-Medium-Web.woff2';

export default class Experience extends React.Component {
    analytics = getAnalytics(app);
    render() {
        return (
            <>
            {/* Branding Section */}
            <div className='branding-contain'>
                <a className='name' href="/">TREVOR<br/>GERALD</a>
            </div>

            {/* Scroll Section */}
            <div className='scroll-container' id='scroll-parent'>
                <div className='landing-scroll-item-contain' id='landing'>
                    <span className='title'>PROJE<br/>CTS</span>
                    <div className='landing-image'></div>
                </div>

                <div className='scroll-item-contain' id='kavi'>
                    <div className='experience-contain'>
                        <a href="https://google.com"><img src={Kavi} className='project-image' alt='logo'></img></a>
                        <span className='experience-company'>Kavi</span>
                        <span className='experience-position'>Figma</span>
                        <span className='experience-duration'>May 2024 - Present</span>
                    </div>
                    <div className='slideshow-contain'>
                        <Slideshow>
                            <SlideshowItem>
                                <div className='project-slide kavi'>
                                    <span className='project-slide-title'>Purpose</span>
                                    <p className='project-desc'>Kavi is the ultimate platform for facilitating seamless connections among premier brands, creators, agencies, and industry professionals</p>
                                </div>
                            </SlideshowItem>
                            <SlideshowItem>
                                <div className='experience-slide kavi'>
                                    <span className='experience-slide-title'>Design Document</span>
                                    <iframe src='https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2FKBNFOmXHPYPCaSqZp4kGYu%2FKavi-Designs%3Fnode-id%3D0%253A1%26t%3D9djXUqPIPk2Rn6dK-1' className="iframe-project" title="Kavi Design Doc - Trevor Gerald"></iframe>
                                </div>
                            </SlideshowItem>
                        </Slideshow>
                    </div>
                </div>

                <div className='scroll-item-contain' id='sift'>
                    <div className='experience-contain'>
                        <a href="https://google.com"><img src={Sift} className='project-image' alt='logo'></img></a>
                        <span className='experience-company'>Sift</span>
                        <span className='experience-position'>React | Cloud Firestore | Tensorflow | Librosa</span>
                        <span className='experience-duration'>March 2024 - Present</span>
                    </div>
                    <div className='slideshow-contain'>
                        <Slideshow>
                            <SlideshowItem>
                                <div className='project-slide sift'>
                                    <span className='project-slide-title'>Purpose</span>
                                    <p className='project-desc'>Sift is the ultimate music organizer that sorts your songs effortlessly by vibes, ensuring every playlist matches your mood perfectly.</p>
                                </div>
                            </SlideshowItem>
                            <SlideshowItem>
                                <div className='experience-slide sift'>
                                    <span className='experience-slide-title'>Code Snippet</span>
                                    <iframe src='https://emgithub.com/iframe.html?target=https%3A%2F%2Fgithub.com%2Ftrev-org04%2Fsift%2Fblob%2Fmain%2Fsrc%2Fpages%2FDashboard.js%23L4-L28&style=atom-one-dark&type=code&showBorder=on&showLineNumbers=on&showFileMeta=on&showFullPath=on&showCopy=on' className="iframe-project" title="Sift GitHub - Trevor Gerald"></iframe>
                                </div>
                            </SlideshowItem>
                        </Slideshow>
                    </div>
                </div>

                <div className='scroll-item-contain' id='eventify'>
                    <div className='experience-contain'>
                        <a href="https://google.com"><img src={Eventify} className='project-image' alt='logo'></img></a>
                        <span className='experience-company'>Eventify</span>
                        <span className='experience-position'>Next.js | Cloud Firestore | Figma</span>
                        <span className='experience-duration'>March 2024 - Present</span>
                    </div>
                    <div className='slideshow-contain'>
                        <Slideshow>
                            <SlideshowItem>
                                <div className='project-slide eventify'>
                                    <span className='project-slide-title'>Purpose</span>
                                    <p className='project-desc'>Eventify is a comprehensive platform designed for campus clubs, empowering club executives to effortlessly share upcoming events with the student body.</p>
                                </div>
                            </SlideshowItem>
                            <SlideshowItem>
                                <div className='experience-slide eventify'>
                                    <span className='experience-slide-title'>Code Snippet</span>
                                    <iframe src='https://emgithub.com/iframe.html?target=https%3A%2F%2Fgithub.com%2Fdevosu%2Fevent-feed-project%2Fblob%2Fmain%2Fsrc%2Fapp%2Fpage.js%23L26-L100&style=atom-one-dark&type=code&showBorder=on&showLineNumbers=on&showFileMeta=on&showFullPath=on&showCopy=on' className="iframe-project" title="Eventify GitHub - Trevor Gerald"></iframe>
                                </div>
                            </SlideshowItem>
                        </Slideshow>
                    </div>
                </div>

                <div className='scroll-item-contain' id='brutus'>
                    <div className='experience-contain'>
                        <a href="https://google.com"><img src={Brutus} className='project-image' alt='logo'></img></a>
                        <span className='experience-company'>Brutus The<br/>Plumber</span>
                        <span className='experience-position'>C | Make</span>
                        <span className='experience-duration'>February 2024</span>
                    </div>
                    <div className='slideshow-contain'>
                        <Slideshow>
                            <SlideshowItem>
                                <div className='project-slide brutus'>
                                    <span className='project-slide-title'>Purpose</span>
                                    <p className='project-desc'>Brutus the Plumber is an innovative Super Mario clone written in C and simulates Brutus in motion with different starting conditions, which are be read in and decoded.</p>
                                </div>
                            </SlideshowItem>
                            <SlideshowItem>
                                <div className='experience-slide brutus'>
                                    <span className='experience-slide-title'>Video Walkthough</span>
                                    <iframe src='https://www.youtube.com/embed/P4Fa8d9aNmw?si=CJ9LZEwiiV3mkC-6' className="iframe-project" title="BTP Video Walkthough - Trevor Gerald"></iframe>
                                </div>
                            </SlideshowItem>
                            <SlideshowItem>
                                <div className='experience-slide brutus'>
                                    <span className='experience-slide-title'>Code Snippet</span>
                                    <iframe src='https://emgithub.com/iframe.html?target=https%3A%2F%2Fgithub.com%2Ftrev-org04%2Fbrutus-the-plumber%2Fblob%2Fmain%2Fmemory.c%23L3-L76&style=atom-one-dark&type=code&showBorder=on&showLineNumbers=on&showFileMeta=on&showFullPath=on&showCopy=on' className="iframe" title="Brutus the Plumber GitHub - Trevor Gerald"></iframe>
                                </div>
                            </SlideshowItem>
                        </Slideshow>
                    </div>
                </div>

                <div className='scroll-item-contain' id='honeycomb'>
                    <div className='experience-contain'>
                        <a href="https://honeycomb-studios.web.app/"><img src={Honeycomb} className='project-image' alt='logo'></img></a>
                        <span className='experience-company'>Honeycomb<br/>Studios</span>
                        <span className='experience-position'>React | Cloud Firestore</span>
                        <span className='experience-duration'>July 2023 - December 2023</span>
                    </div>
                    <div className='slideshow-contain'>
                        <Slideshow>
                            <SlideshowItem>
                                <div className='experience-slide honeycomb'>
                                    <span className='experience-slide-title'>Purpose</span>
                                    <p className='project-desc'>Honeycomb Studios is a design studio that creates high-quality music posters for the masses, which can be viewed through our online marketplace.</p>
                                </div>
                            </SlideshowItem>
                            <SlideshowItem>
                                <div className='experience-slide honeycomb'>
                                    <span className='experience-slide-title'>Code Snippet</span>
                                    <iframe src='https://emgithub.com/iframe.html?target=https%3A%2F%2Fgithub.com%2Ftrev-org04%2Fhoneycomb-studios%2Fblob%2Fmaster%2Fsrc%2FitemDisplay.js&style=atom-one-dark&type=code&showBorder=on&showLineNumbers=on&showFileMeta=on&showFullPath=on&showCopy=on' className="iframe" title="Honeycomb Studios GitHub - Trevor Gerald"></iframe>
                                </div>
                            </SlideshowItem>
                            <SlideshowItem>
                                <div className='experience-slide honeycomb'>
                                    <span className='experience-slide-title'>Sample Posters</span>
                                    <iframe src={featuredPosters} className="iframe" title="Featured Posters - Honeycomb Studios"></iframe>
                                </div>
                            </SlideshowItem>
                        </Slideshow>
                    </div>
                </div>

                <div className='scroll-item-contain' id='crawler'>
                    <div className='experience-contain'>
                        <a href="https://honeycomb-studios.web.app/"><img src={Crawler} className='project-image' alt='logo'></img></a>
                        <span className='experience-company'>Route<br/>Crawler</span>
                        <span className='experience-position'>Selenium | Python | Excel</span>
                        <span className='experience-duration'>July 2023</span>
                    </div>
                    <div className='slideshow-contain'>
                        <Slideshow>
                            <SlideshowItem>
                                <div className='experience-slide crawler'>
                                    <span className='experience-slide-title'>Purpose</span>
                                    <p className='project-desc'>Route Crawler is a simple webscraper that scrapes a list of bank names and creates a sheet for each bank in an Excel file with all of its routing numbers.</p>
                                </div>
                            </SlideshowItem>
                            <SlideshowItem>
                                <div className='experience-slide crawler'>
                                    <span className='experience-slide-title'>Code Snippet</span>
                                    <iframe src='https://emgithub.com/iframe.html?target=https%3A%2F%2Fgithub.com%2Ftrev-org04%2Fwebscraper%2Fblob%2Fmain%2Fwebscraper.py%23L1-L80&style=atom-one-dark&type=code&showBorder=on&showLineNumbers=on&showFileMeta=on&showFullPath=on&showCopy=on' className="iframe" title="Route Crawler GitHub - Trevor Gerald"></iframe>
                                </div>
                            </SlideshowItem>
                            <SlideshowItem>
                                <div className='experience-slide crawler'>
                                    <span className='experience-slide-title'>Result</span>
                                    <iframe src='https://view.officeapps.live.com/op/embed.aspx?src=https%3A%2F%2Fraw%2Egithubusercontent%2Ecom%3A443%2Ftrev%2Dorg04%2Fwebscraper%2Fmain%2FBank%2520List%2Exls&wdAllowInteractivity=False&wdDownloadButton=True&wdInConfigurator=True&wdInConfigurator=True' className="iframe" title="Chives Video Walkthough - Trevor Gerald"></iframe>
                                </div>
                            </SlideshowItem>
                        </Slideshow>
                    </div>
                </div>
                <div className='scroll-item-contain' id='chives'>
                    <div className='experience-contain'>
                        <a href="https://www.youtube.com/watch?v=YCc_zXKfrmo"><img src={Chives} className='project-image' alt='logo'></img></a>
                        <span className='experience-company'>Chives</span>
                        <span className='experience-position'>Flutter | Cloud Firestore | Spoonacular API</span>
                        <span className='experience-duration'>March 2023 - May 2023</span>
                    </div>
                    <div className='slideshow-contain'>
                        <Slideshow>
                            <SlideshowItem>
                                <div className='experience-slide chives'>
                                    <span className='experience-slide-title'>Purpose</span>
                                    <p className='project-desc'>Chives is a modern mobile application that allows you to find the perfect recipe whenever you need it. </p>
                                </div>
                            </SlideshowItem>
                            <SlideshowItem>
                                <div className='experience-slide chives'>
                                    <span className='experience-slide-title'>Video Walkthough</span>
                                    <iframe src='https://www.youtube.com/embed/YCc_zXKfrmo?si=LQ0JlYD0KXqA_YQQ' className="iframe" title="Chives Video Walkthough - Trevor Gerald"></iframe>
                                </div>
                            </SlideshowItem>
                            <SlideshowItem>
                                <div className='experience-slide chives'>
                                    <span className='experience-slide-title'>Code Snippet</span>
                                    <iframe src='https://emgithub.com/iframe.html?target=https%3A%2F%2Fgithub.com%2Ftrev-org04%2Fchives%2Fblob%2Fmain%2Fchives%2Flib%2Fapplication%2Fhome.dart%23L8-L84&style=atom-one-dark&type=code&showBorder=on&showLineNumbers=on&showFileMeta=on&showFullPath=on&showCopy=on' className="iframe" title="Chives GitHub - Trevor Gerald"></iframe>
                                </div>
                            </SlideshowItem>
                        </Slideshow>
                    </div>
                </div>
            </div>

            <Helmet>
            <script type="text/javascript">
                {
                    `var landing = document.getElementById('landing');
                    var kavi = document.getElementById('kavi');
                    var sift = document.getElementById('sift');
                    var eventify = document.getElementById('eventify');
                    var brutus = document.getElementById('brutus');
                    var honeycomb = document.getElementById('honeycomb');  
                    var crawler = document.getElementById('crawler');  
                    var chives = document.getElementById('chives');  
                    var children = document.getElementById('scroll-parent').children;
                    var sections = [];
                    sections.push(landing), sections.push(kavi), sections.push(sift), sections.push(eventify), sections.push(brutus), sections.push(honeycomb), sections.push(crawler), sections.push(chives);    
                    let slideIndex = 1;        

                    var observer = new window.IntersectionObserver((entries) => {
                        entries.forEach((entry) => {
                            if (entry.isIntersecting) {
                                entry.target.classList.add("active");
                                getIndex();
                            }
                            else {
                                entry.target.classList.remove("active");
                            }
                        })
                      }, {root: null, threshold: 0.6});

                    function startObserver() {
                        sections.forEach((elem) => {
                            observer.observe(elem);
                        });
                    }

                    function getIndex() {
                        let index;
                        var active = document.querySelector('.active');
                        for (let i = 0; i < sections.length; i++) {
                            index = Array.prototype.indexOf.call(children, active);
                        }
                        adjustBackground(index);
                    }

                    function adjustBackground(index) {
                        switch (index) {
                            case 0:
                                document.documentElement.style.backgroundColor = '#C8A104';
                                break;
                            case 1:
                                document.documentElement.style.backgroundColor = '#5A96A6';
                                break;
                            case 2:
                                document.documentElement.style.backgroundColor = '#1D2C2C';
                                break;
                            case 3: 
                                document.documentElement.style.backgroundColor = '#BA0C2F';
                                break;
                            case 4: 
                                document.documentElement.style.backgroundColor = '#BA0C2F';
                                break;
                            case 5: 
                                document.documentElement.style.backgroundColor = '#141115';
                                break;
                            case 6: 
                                document.documentElement.style.backgroundColor = '#E62345';
                                break;
                            case 7: 
                                document.documentElement.style.backgroundColor = '#565C36';
                                break;    
                        }
                    }
                    
                    window.addEventListener("load", startObserver());`
                }
            </script>
        </Helmet>
            </>
        )
    }
}

import React from 'react';
import './experience.css';
import { app } from "../firebase";
import { getAnalytics } from "firebase/analytics";
import IC3D from './static/IC3D.png';
import Aware from './static/Aware.png';
import BobEvans from './static/BobEvans.png';
import DuoDate from './static/DuoDate.png';
import Kavi from './static/Kavi.png';
import mentorEval from './static/Mentor Evaluation - Trevor Gerald.pdf';
import { Helmet } from 'react-helmet-async';
import { Slideshow, SlideshowItem } from '../components/experienceSlideshow';
import '../fonts/DrukWide-Medium-Web.woff2';

export default class Experience extends React.Component {
    analytics = getAnalytics(app);
    state = {
        isExpanded: false
    };

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
                    <span className='title'>EXPERI<br/>ENCE</span>
                    <div className='landing-image'></div>
                </div>

                <div className='scroll-item-contain' id='ic3d'>
                    <div className='experience-contain'>
                        <a href='https://www.ic3dprinters.com/'><img src={IC3D} className='experience-image' alt='logo'></img></a>
                        <span className='experience-company'>IC3D<br/>Printers</span>
                        <span className='experience-position'>Mechanical Engineering Intern</span>
                        <span className='experience-duration'>September 2021-December 2021</span>
                    </div>
                    <div className='slideshow-contain'>
                        <Slideshow>
                            { !this.state.isExpanded && <><SlideshowItem>
                                <div className='experience-slide ic3d'>
                                    <span className='experience-slide-title'>Responsibilities</span>
                                    <div className='experience-slide-contain'>
                                        <div className='experience-slide-card'>
                                            <span className='experience-desc'>Managed the maintenance of a 3D print farm of over <span className='ic3d'>30 printers</span> by performing repairs to ensure optimal functionality and minimize downtime by <span className='ic3d'>10%</span>.</span>
                                            <div className='experience-highlight-contain'>
                                                <span className="material-symbols-rounded slide-icon">precision_manufacturing</span>
                                                <span className='experience-main-title'>Enhanced overall uptime</span>
                                            </div>
                                        </div>
                                        <div className='experience-slide-card'>
                                            <span className='experience-desc'>Worked closely with team members to learn about various aspects of the 3D printer manufacturing process, including design, engineering, and customer service.</span>
                                            <div className='experience-highlight-contain'>
                                                <span className="material-symbols-rounded slide-icon">storefront</span>
                                                <span className='experience-main-title'>Learned business processes</span>
                                            </div>
                                        </div>
                                        <div className='experience-slide-card'>
                                            <span className='experience-desc'>Developed efficient workflows for supports removal, resulting in a significant reduction in turnaround time and a notable enhancement in customer satisfaction.</span>
                                            <div className='experience-highlight-contain'>
                                                <span className="material-symbols-rounded slide-icon">trending_up</span>
                                                <span className='experience-main-title'>Increased overall efficiency</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SlideshowItem>
                            <SlideshowItem>
                                <div className='experience-slide ic3d'>
                                    <span className='experience-slide-title'>Mentor Evaluation</span>
                                    <iframe src={mentorEval} className="iframe" title="IC3D Mentor Evaluation - Trevor Gerald"></iframe>
                                </div>
                            </SlideshowItem></>}

                            {/* Expanded Slides */}
                            { this.state.isExpanded && <><SlideshowItem>
                                <div className='experience-slide ic3d'>
                                    <div className='experience-highlight-contain'>
                                        <span className="material-symbols-rounded slide-icon">precision_manufacturing</span>
                                        <span className='experience-main-title'>Enhanced overall uptime</span>
                                    </div>
                                    <span className='experience-desc'>Managed the maintenance of a 3D print farm of over <span className='experience-slide-card'>30 printers</span> by performing repairs to ensure optimal functionality and minimize downtime by <span className='experience-slide-card'>10%</span>.</span>
                                </div>
                            </SlideshowItem>
                            <SlideshowItem>
                                <div className='experience-slide id3d'>
                                    <div className='experience-highlight-contain'>
                                        <span className="material-symbols-rounded slide-icon">storefront</span>
                                        <span className='experience-main-title'>Learned business processes</span>
                                    </div>
                                    <span className='experience-desc'>Worked closely with team members to learn about various aspects of the 3D printer manufacturing process, including design, engineering, and customer service.</span>
                                </div>
                            </SlideshowItem>
                            <SlideshowItem>
                                <div className='experience-slide id3d'>
                                    <div className='experience-highlight-contain'>
                                        <span className="material-symbols-rounded slide-icon">trending_up</span>
                                        <span className='experience-main-title'>Increased overall efficiency</span>
                                    </div>
                                    <span className='experience-desc'>Developed efficient workflows for supports removal, resulting in a significant reduction in turnaround time and a notable enhancement in customer satisfaction.</span>
                                </div>
                            </SlideshowItem></>}

                        </Slideshow>
                    </div>
                </div>

                <div className='scroll-item-contain' id='aware'>
                    <div className='experience-contain'>
                        <a href='https://www.awarehq.com/'><img src={Aware} className='experience-image' alt='logo'></img></a>
                        <span className='experience-company'>Aware</span>
                        <span className='experience-position'>Software Engineering Intern</span>
                        <span className='experience-duration'>February 2022-April 2022</span>
                    </div>
                    <div className='slideshow-contain'>
                        <Slideshow>
                            { !this.state.isExpanded && <SlideshowItem>
                                <div className='experience-slide aware'>
                                    <span className='experience-slide-title'>Responsibilities</span>
                                    <div className='experience-slide-contain'>
                                        <div className='experience-slide-card'>
                                            <span className='experience-desc'>Designed and developed a React dashboard for the company, leading to a <span className='aware'>16%</span> improvement in efficiency and productivity.</span>
                                            <div className='experience-highlight-contain'>
                                                <span className="material-symbols-rounded slide-icon">dashboard</span>
                                                <span className='experience-main-title'>Increased overall productivity</span>
                                            </div>
                                        </div>
                                        <div className='experience-slide-card'>
                                            <span className='experience-desc'>Implemented Agile methodology for efficient task completion and effective collaboration between team members.</span>
                                            <div className='experience-highlight-contain'>
                                                <span className="material-symbols-rounded slide-icon">checklist</span>
                                                <span className='experience-main-title'>Utilized industry standards</span>
                                            </div>
                                        </div>
                                        <div className='experience-slide-card'>
                                            <span className='experience-desc'>Acquired hands-on experience in software engineering by working closely with a mentor and gaining firsthand knowledge of the development process.</span>
                                            <div className='experience-highlight-contain'>
                                                <span className="material-symbols-rounded slide-icon">terminal</span>
                                                <span className='experience-main-title'>Learned software lifecyle</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SlideshowItem> }

                            {/* Expanded Slides */}
                            { this.state.isExpanded && <><SlideshowItem>
                                <div className='experience-slide aware'>
                                    <div className='experience-highlight-contain'>
                                        <span className="material-symbols-rounded slide-icon">dashboard</span>
                                        <span className='experience-main-title'>Increased overall productivity</span>
                                    </div>
                                    <span className='experience-desc'>Designed and developed a React dashboard for the company, leading to a <span className='experience-slide-card'>16%</span> improvement in efficiency and productivity.</span>
                                </div>
                            </SlideshowItem>
                            <SlideshowItem>
                                <div className='experience-slide aware'>
                                    <div className='experience-highlight-contain'>
                                        <span className="material-symbols-rounded slide-icon">checklist</span>
                                        <span className='experience-main-title'>Utilized industry standards</span>
                                    </div>
                                    <span className='experience-desc'>Implemented Agile methodology for efficient task completion and effective collaboration between team members.</span>
                                </div>
                            </SlideshowItem>
                            <SlideshowItem>
                                <div className='experience-slide aware'>
                                    <div className='experience-highlight-contain'>
                                        <span className="material-symbols-rounded slide-icon">terminal</span>
                                        <span className='experience-main-title'>Learned software lifecyle</span>
                                    </div>
                                    <span className='experience-desc'>Acquired hands-on experience in software engineering by working closely with a mentor and gaining firsthand knowledge of the development process.</span>
                                </div>
                            </SlideshowItem></> }

                        </Slideshow>
                    </div>
                </div>

                <div className='scroll-item-contain' id='bobEvans'>
                    <div className='experience-contain'>
                        <a href='https://www.bobevansgrocery.com/'><img src={BobEvans} className='experience-image' alt='logo'></img></a>
                        <span className='experience-company'>Bob<br/>Evans</span>
                        <span className='experience-position'>IT Developer Intern</span>
                        <span className='experience-duration'>May 2023-August 2023</span>
                    </div>
                    <div className='slideshow-contain'>
                        <Slideshow>
                            { !this.state.isExpanded && <SlideshowItem>
                                <div className='experience-slide bob-evans'>
                                    <span className='experience-slide-title'>Responsibilities</span>
                                    <div className='experience-slide-contain'>
                                        <div className='experience-slide-card'>
                                            <span className='experience-desc'>Proposed and implemented infrastructure risk mitigation strategies, enhancing security by <span className='bob-evans'>34%</span> and reducing vulnerabilities.</span>
                                            <div className='experience-highlight-contain'>
                                                <span className="material-symbols-rounded slide-icon">security</span>
                                                <span className='experience-main-title'>Increased overall security</span>
                                            </div>
                                        </div>
                                        <div className='experience-slide-card'>
                                            <span className='experience-desc'>Constructed automation flows to streamline processes, resulting in significant time savings of <span className='bob-evans'>75%</span> for the business.</span>
                                            <div className='experience-highlight-contain'>
                                                <span className="material-symbols-rounded slide-icon">smart_toy</span>
                                                <span className='experience-main-title'>Streamlined redundant processes</span>
                                            </div>
                                        </div>
                                        <div className='experience-slide-card'>
                                            <span className='experience-desc'>Collaborated with cross-functional teams, gathering information and successfully developing a product that met user needs, market demands, and business requirements.</span>
                                            <div className='experience-highlight-contain'>
                                                <span className="material-symbols-rounded slide-icon">conveyor_belt</span>
                                                <span className='experience-main-title'>Delivered industry-level product</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SlideshowItem>} 

                            {/* Expanded Slides */}
                            { this.state.isExpanded && <><SlideshowItem>
                                <div className='experience-slide bob-evans'>
                                    <div className='experience-highlight-contain'>
                                        <span className="material-symbols-rounded slide-icon">security</span>
                                        <span className='experience-main-title'>Increased overall security</span>
                                    </div>
                                    <span className='experience-desc'>Proposed and implemented infrastructure risk mitigation strategies, enhancing security by <span className='experience-slide-card'>34%</span> and reducing vulnerabilities.</span>   
                                </div>
                            </SlideshowItem>
                            <SlideshowItem>
                                <div className='experience-slide bob-evans'>
                                    <div className='experience-highlight-contain'>
                                        <span className="material-symbols-rounded slide-icon">smart_toy</span>
                                        <span className='experience-main-title'>Streamlined redundant processes</span>
                                    </div>
                                    <span className='experience-desc'>Constructed automation flows to streamline processes, resulting in significant time savings of <span className='experience-slide-card'>75%</span> for the business.</span>
                                </div>
                            </SlideshowItem>
                            <SlideshowItem>
                                <div className='experience-slide bob-evans'>
                                    <div className='experience-highlight-contain'>
                                        <span className="material-symbols-rounded slide-icon">conveyor_belt</span>
                                        <span className='experience-main-title'>Delivered industry-level product</span>
                                    </div>
                                    <span className='experience-desc'>Collaborated with cross-functional teams, gathering information and successfully developing a product that met user needs, market demands, and business requirements.</span>
                                </div>
                            </SlideshowItem></> } 

                        </Slideshow>
                    </div>
                </div>

                <div className='scroll-item-contain' id='duoDate'>
                    <div className='experience-contain'>
                        <a href='https://duodate.co/'><img src={DuoDate} className='experience-image' alt='logo'></img></a>
                        <span className='experience-company'>DuoDate</span>
                        <span className='experience-position'>Founding Engineer</span>
                        <span className='experience-duration'>January 2024-Present</span>
                    </div>
                    <div className='slideshow-contain'>
                        <Slideshow>
                            { !this.state.isExpanded && <SlideshowItem>
                                <div className='experience-slide duodate'>
                                    <span className='experience-slide-title'>Responsibilities</span>
                                    <div className='experience-slide-contain'>
                                        <div className='experience-slide-card'>
                                            <span className='experience-desc'>Independently led the development of the user creation flow for a React Native app, incorporating Firebase authentication and API endpoints for secure user registration.</span>
                                            <div className='experience-highlight-contain'>
                                                <span className="material-symbols-rounded slide-icon">account_circle</span>
                                                <span className='experience-main-title'>Developed user creation flow</span>
                                            </div>
                                        </div>
                                        <div className='experience-slide-card'>
                                            <span className='experience-desc'>Leveraged AWS services such as S3 buckets for user profile pictures to architect and deploy a scalable and reliable infrastructure, ensuring high availability and performance.</span>
                                            <div className='experience-highlight-contain'>
                                                <span className="material-symbols-rounded slide-icon">monitoring</span>
                                                <span className='experience-main-title'>Implemented scalable technologies</span>
                                            </div>
                                        </div>
                                        <div className='experience-slide-card'>
                                            <span className='experience-desc'>Implemented scalable and robust backend functionality for efficient friend management, facilitating the seamless addition and removal of friends within the app.</span>
                                            <div className='experience-highlight-contain'>
                                                <span className="material-symbols-rounded slide-icon">groups</span>
                                                <span className='experience-main-title'>Integrated friend functionality</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SlideshowItem> }

                            {/* Expanded Slides */}
                            { this.state.isExpanded && <><SlideshowItem>
                                <div className='experience-slide duodate'>
                                    <div className='experience-highlight-contain'>
                                            <span className="material-symbols-rounded slide-icon">account_circle</span>
                                            <span className='experience-main-title'>Developed user creation flow</span>
                                    </div>
                                    <span className='experience-desc'>Independently led the development of the user creation flow for a React Native app, incorporating Firebase authentication and API endpoints for secure user registration.</span>
                                </div>
                            </SlideshowItem>
                            <SlideshowItem>
                                <div className='experience-slide duodate'>
                                    <div className='experience-highlight-contain'>
                                        <span className="material-symbols-rounded slide-icon">monitoring</span>
                                        <span className='experience-main-title'>Implemented scalable technologies</span>
                                    </div>
                                    <span className='experience-desc'>Leveraged AWS services such as S3 buckets for user profile pictures to architect and deploy a scalable and reliable infrastructure, ensuring high availability and performance.</span>
                                </div>
                            </SlideshowItem>
                            <SlideshowItem>
                                <div className='experience-slide duodate'>
                                    <div className='experience-highlight-contain'>
                                        <span className="material-symbols-rounded slide-icon">groups</span>
                                        <span className='experience-main-title'>Integrated friend functionality</span>
                                    </div>
                                    <span className='experience-desc'>Implemented scalable and robust backend functionality for efficient friend management, facilitating the seamless addition and removal of friends within the app.</span>
                                </div>
                            </SlideshowItem> </>}

                            

                        </Slideshow>
                    </div>
                </div>

                <div className='scroll-item-contain' id='kavi'>
                    <div className='experience-contain'>
                        <a href='https://www.gokavi.com/'><img src={Kavi} className='experience-image' alt='logo'></img></a>
                        <span className='experience-company'>Kavi</span>
                        <span className='experience-position'>Fullstack Engineer</span>
                        <span className='experience-duration'>May 2024-Present</span>
                    </div>
                    <div className='slideshow-contain'>
                        <Slideshow>
                            { !this.state.isExpanded && <SlideshowItem>
                                <div className='experience-slide kavi'>
                                    <span className='experience-slide-title'>Responsibilities</span>
                                    <div className='experience-slide-contain'>
                                        <div className='experience-slide-card'>
                                            <span className='experience-desc'>Modernized and implemented the redesign of the website's landing page, enhancing visual appeal by <span className='kavi'>93%</span>.</span>
                                            <div className='experience-highlight-contain'>
                                                <span className="material-symbols-rounded slide-icon">palette</span>
                                                <span className='experience-main-title'>Redefined design language</span>
                                            </div>
                                        </div>
                                        <div className='experience-slide-card'>
                                            <span className='experience-desc'>Developed and deployed core functionality that directly contributed to the successful release of the product's MVP.</span>
                                            <div className='experience-highlight-contain'>
                                                <span className="material-symbols-rounded slide-icon">new_releases</span>
                                                <span className='experience-main-title'>Implemented essential features</span>
                                            </div>
                                        </div>
                                        <div className='experience-slide-card'>
                                            <span className='experience-desc'>Implemented comprehensive marketing strategies, resulting in an increase in brand engagement and user sign-ups.</span>
                                            <div className='experience-highlight-contain'>
                                                <span className="material-symbols-rounded slide-icon">trending_up</span>
                                                <span className='experience-main-title'>Boosted brand awareness</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SlideshowItem> }

                            {/* Expanded Slides */}
                            { this.state.isExpanded && <><SlideshowItem>
                                <div className='experience-slide kavi'>
                                    <div className='experience-highlight-contain'>
                                        <span className="material-symbols-rounded slide-icon">palette</span>
                                        <span className='experience-main-title'>Redefined design language</span>
                                    </div>
                                    <span className='experience-desc'>Modernized and implemented the redesign of the website's landing page, enhancing visual appeal by <span className='experience-slide-card'>93%</span>.</span>
                                </div>
                            </SlideshowItem>
                            <SlideshowItem>
                            <div className='experience-slide kavi'>
                                <div className='experience-highlight-contain'>
                                    <span className="material-symbols-rounded slide-icon">new_releases</span>
                                    <span className='experience-main-title'>Implemented essential features</span>
                                </div>
                                <span className='experience-desc'>Developed and deployed core functionality that directly contributed to the successful release of the product's MVP.</span>
                            </div>
                            </SlideshowItem>
                            <SlideshowItem>
                                <div className='experience-slide kavi'>
                                    <div className='experience-highlight-contain'>
                                        <span className="material-symbols-rounded slide-icon">trending_up</span>
                                        <span className='experience-main-title'>Boosted brand awareness</span>
                                    </div>
                                    <span className='experience-desc'>Implemented comprehensive marketing strategies, resulting in an increase in brand engagement and user sign-ups.</span>
                                </div>
                            </SlideshowItem> </>}

                            

                        </Slideshow>
                    </div>
                </div>

            </div>

            <Helmet>
            <script type="text/javascript">
                {
                    `var landing = document.getElementById('landing');
                    var ic3d = document.getElementById('ic3d');
                    var aware = document.getElementById('aware');
                    var bobEvans = document.getElementById('bobEvans');
                    var duoDate = document.getElementById('duoDate');  
                    var kavi = document.getElementById('kavi');   
                    var children = document.getElementById('scroll-parent').children;
                    var sections = [];
                    sections.push(landing), sections.push(ic3d), sections.push(aware), sections.push(bobEvans), sections.push(duoDate), sections.push(kavi);    
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
                      }, {root: null, threshold: 0.5});

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
                                document.documentElement.style.backgroundColor = '#DB504A';
                                break;
                            case 1:
                                document.documentElement.style.backgroundColor = '#F26A20';
                                break;
                            case 2: 
                                document.documentElement.style.backgroundColor = '#9117E6';
                                break;
                            case 3: 
                                document.documentElement.style.backgroundColor = '#B42B35';
                                break;
                            case 4: 
                                document.documentElement.style.backgroundColor = '#E62345';
                                break;
                            case 5: 
                                document.documentElement.style.backgroundColor = '#5A96A6';
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
    setExpanded = () => {
        if (window.innerWidth <= 700) {
            this.setState({ isExpanded: true });
        }
        else {
            this.setState({ isExpanded: false });
        }
        console.log(window.innerWidth, this.state.isExpanded);
    };
    componentDidMount() {
        this.setExpanded();
    }
}

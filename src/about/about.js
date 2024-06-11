import React from 'react';
import './about.css';
import profilePic from './static/profilePic.jpg';
import { app } from "../firebase";
import { Helmet } from 'react-helmet-async';
import { getAnalytics } from "firebase/analytics";
import '../fonts/DrukWide-Medium-Web.woff2';

export default class About extends React.Component {
    analytics = getAnalytics(app);
    render() {
        return (
            <>
            {/* Branding Section */}
            <div className='branding-contain'>
                <span className='pre-name'>HEY! I'M</span>
                <a className='name' href="/">TREVOR<br/>GERALD</a>
            </div>

            {/* Scroll Section */}
            <div className='scroll-container' id='scroll-parent'>
                <div className='landing-scroll-item-contain' id='landing'>
                    <span className='title'>ABOUT<br/>ME</span>
                    <div className='landing-image'></div>
                </div>

                <div className='about-scroll-item-contain' id='about'>
                    <div className='about-feature-contain'>
                        <div className='about-feature-card topLeft'>
                            <span className='card-title'>education</span>
                            <span className='card-text'>CSE & Info Sec @ The Ohio State University<br />Expected Graduation: May 2026</span>
                        </div>
                        <div className='about-feature-card bottomLeft'>
                            <span className='card-title'>student organizations</span>
                            <span className='card-text'>• Business Builders<br />• DEV Club<br />• Club Tennis<br /></span>
                        </div>
                    </div>
                    <img src={profilePic} className='about-me-image' alt='logo'></img>
                    <div className='about-feature-contain'>
                        <div className='about-feature-card topRight'>
                            <span className='card-title'>interests</span>
                            <span className='card-text'>• Technology<br />• Vehicles<br />• Graphic Design<br />• Entrepreneurship<br />• Tennis</span>
                        </div>
                        <div className='about-feature-card bottomRight'>
                            <span className='card-title'>employment</span>
                            <span className='card-text'>Founding SDE @ <a className='text-highlight' href='https://duodate.co/'>Duodate</a><br />Frontend Dev @ <a className='text-highlight' href='https://www.gokavi.com/'>Kavi</a></span>
                        </div>
                    </div>
                </div>
            </div>

            <Helmet>
                <script type="text/javascript">
                    {
                        `var landing = document.getElementById('landing'); 
                        var about = document.getElementById('about'); 
                        var children = document.getElementById('scroll-parent').children;
                        var sections = [];
                        sections.push(landing), sections.push(about);    
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
                                    document.documentElement.style.backgroundColor = '#2C7761';
                                    break;
                                case 1:
                                    document.documentElement.style.backgroundColor = '#2C7761';
                                    break;    
                            }
                        }
                        
                        window.addEventListener("load", startObserver());`
                    }
                </script>
            </Helmet>
            </>
        );
    }
}
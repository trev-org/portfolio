import React from 'react';
import './home.css';
import { app } from "../firebase";
import { getAnalytics } from "firebase/analytics";
import { Helmet } from 'react-helmet-async';
import '../fonts/DrukWide-Medium-Web.woff2';

export default class Home extends React.Component {
    analytics = getAnalytics(app);
    render() {
        return (
            <>
            {/* Landing Section */}
            <div className='landing-contain'>

                {/* Branding Section */}
                <div className='branding-contain'>
                    <a className='name' href="/">TREVOR<br/>GERALD</a>
                    <div className='main-link-contain'>
                        <div className='link-contain'>
                            <span className='link-number'>01</span>
                            <a className='link-content' href="https://github.com/trev-org04">github</a>
                        </div>
                        <div className='link-contain'>
                            <span className='link-number'>02</span>
                            <a className='link-content' href="https://www.linkedin.com/in/trevorgerald/">linkedin</a>
                        </div>
                        <div className='link-contain'>
                            <span className='link-number'>03</span>
                            <a className='link-content' href="mailto:tmgerald04@gmail.com">email</a>
                        </div>
                    </div>
                </div>

                {/* Navigation Contain */}
                <div className='navigation-contain'>
                    <div className='navigation-item first'>
                        <div className='navigation-numbering-contain'>01</div>
                        <a className='navigation-title' href='/about'>ABOUT<br/>ME</a>
                    </div>
                    <div className='navigation-item second'>
                        <div className='navigation-numbering-contain'>02</div>
                        <a className='navigation-title' href='/projects'>PROJE<br/>CTS</a>
                    </div>
                    <div className='navigation-item third'>
                        <div className='navigation-numbering-contain'>03</div>
                        <a className='navigation-title' href='/experience'>EXPERI<br/>ENCE</a>
                    </div>
                </div>
            </div>

            <Helmet>
            <script type="text/javascript">
                {
                    `function adjustBackground() {
                        document.documentElement.style.backgroundColor = '#549CDD';
                        const first = document.querySelector('.first');
                        const second = document.querySelector('.second');
                        const third = document.querySelector('.third');
                        const root = document.querySelector('#root');
                        first.addEventListener('mouseover', () => {
                            document.documentElement.style.backgroundColor = '#2C7761';
                        });
                        first.addEventListener('mouseout', () => {
                            document.documentElement.style.backgroundColor = '#549CDD';
                        });
                        second.addEventListener('mouseover', () => {
                            document.documentElement.style.backgroundColor = '#C8A104';
                        });
                        second.addEventListener('mouseout', () => {
                            document.documentElement.style.backgroundColor = '#549CDD';
                        });
                        third.addEventListener('mouseover', () => {
                            document.documentElement.style.backgroundColor = '#DB504A';
                        });
                        third.addEventListener('mouseout', () => {
                            document.documentElement.style.backgroundColor = '#549CDD';
                        });
                        root.style.cssText += 'width: 100vw;height: 100%;min-height: 100%;box-sizing: border-box;overflow-x: hidden;overflow-y: hidden;'
                    }
                        window.addEventListener("load", adjustBackground());`
                }
            </script>
        </Helmet>
        </>
        )
    }
}

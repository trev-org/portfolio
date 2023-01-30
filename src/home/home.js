import React from 'react';
import './home.css';
import Icon from './static/icon.png'
import Github from './static/githubIcon.png'
import LinkedIn from './static/linkedinIcon.png'
import AboutPic from './static/pfp.png'
import HTML from './static/html.png'
import CSS from './static/css.png'
import JS from './static/js.png'
import C from './static/c.png'
import CPP from './static/c++.png'
import ReactIcon from './static/react.png'
import Dart from './static/dart.png'
import Figma from './static/figma.png'
import Flutter from './static/flutter.png'
import Python from './static/python.png'
import Django from './static/django.png'
import MATLAB from './static/matlab.png'
import tree from './static/treeStudios.png'
import amplio from './static/amplioPrep.png'
import latch from './static/latchFinds.png'
import resume from './static/resume.pdf'

export default class Home extends React.Component {
    render() {
        return (
            <>
            {/* Landing Section */}
            <div className='landingContain'>
                    <div className='header'>
                        <img src={Icon} className='icon' alt=''></img>
                        <div className='navContain'>
                            <a className='navItem' href="#aboutContain">about</a>
                            <a className='navItem' href="#projectsContain">projects</a>
                            <a className='navItem' href="#portfolioContain">portfolio</a>
                            <a className='navItem' href="#contactContain">contact</a>
                        </div>
                    </div>
                    <div className='landingContentContain'>
                        <span className='landingHeader'>Hello, I'm <span className='landingBackgroundHeader'>Trevor Gerald!</span> I'm a front-end developer and designer.</span>
                        <p className='landingSubHeader'>I design and develop modern web and mobile applications with an emphasis on accessibility. I'm currently a honors student at The Ohio State University.</p>
                        <a className='landingButton' href='#aboutContain'>see more</a>
                    </div>
                    <div className='socialsContain'>
                        <a href='https://github.com/trev-org04'><img src={Github} className='socialIcon' alt=''></img></a>
                        <a href='https://www.linkedin.com/in/trevorgerald/'><img src={LinkedIn} className='socialIcon' alt=''></img></a>
                    </div>
            </div>

            {/* About Section */}
            <div id='aboutContain' className='aboutContain'>
                <img src={AboutPic} className='aboutImage' alt=''></img>
                <div className='aboutContentContain'>
                    <span className='aboutHeader'>About Me</span>
                    <p className='aboutSubHeader'>I am a graduate of Olentangy High School and am currently a honors student at The Ohio State University. I am working towards a Bachelor's degree in Computer Science and Engineering and I expect to graduate in 2026. My background in software engineering originated back in seventh grade, and I've been developing my skills since then. I've worked on several projects, ranging from informal ones like tree studios to pull requests at Aware.<br></br><br></br>Outside of coding, I play tennis, make posters, try my hand at cooking, and obsess over the latest news in technology and automobiles.</p>
                    <div className='skillsContain'>
                        <img src={HTML} className='skillIcon' alt=''></img>
                        <img src={CSS} className='skillIcon' alt=''></img>
                        <img src={JS} className='skillIcon' alt=''></img>
                        <img src={ReactIcon} className='skillIcon' alt=''></img>
                        <img src={C} className='skillIcon' alt=''></img>
                        <img src={CPP} className='skillIcon' alt=''></img>
                        <img src={Dart} className='skillIcon' alt=''></img>
                        <img src={Flutter} className='skillIcon' alt=''></img>
                        <img src={Python} className='skillIcon' alt=''></img>
                        <img src={Django} className='skillIcon' alt=''></img>
                        <img src={Figma} className='skillIcon' alt=''></img>
                        <img src={MATLAB} className='skillIcon' alt=''></img>
                    </div>
                </div>
            </div>

            {/* Projects Section */}
            <div id='projectsContain' className='projectsContain'>
                <span className='projectHeader'>Projects</span>
                <div className='projectRow'>
                    <div className='projectItem'>
                        <img src={tree} class="projectImg" alt=''></img>
                        <span className='projectTitle'>tree studios</span>
                        <p className='projectDesc'>tree studios is a brand focused on creating high-quality, affordable posters for the masses.</p>    
                        <div className='projectSkillsContain'>
                            <img src={HTML} className='skillIcon' alt=''></img>
                            <img src={CSS} className='skillIcon' alt=''></img>
                            <img src={JS} className='skillIcon' alt=''></img>
                            <img src={ReactIcon} className='skillIcon' alt=''></img>
                            <img src={Figma} className='skillIcon' alt=''></img>
                        </div>
                        <div className='projectButtonContain'>
                            <a className='projectButton' href='https://tree-studios.web.app/'>view project</a>
                            <a className='projectButton' href='https://github.com/trev-org04/tree-studios'>view code</a>
                        </div>
                    </div>
                    <div className='projectItem itemRight'>
                        <img src={latch} class="projectImg" alt=''></img>
                        <span className='projectTitle'>latch finds</span>
                        <p className='projectDesc'>latch finds is a clothing company dedicated to providing high-quality clothing at an affordable price.</p>
                        <div className='projectSkillsContain'>
                            <img src={HTML} className='skillIcon' alt=''></img>
                            <img src={CSS} className='skillIcon' alt=''></img>
                            <img src={JS} className='skillIcon' alt=''></img>
                            <img src={ReactIcon} className='skillIcon' alt=''></img>
                            <img src={Figma} className='skillIcon' alt=''></img>
                        </div>
                        <div className='projectButtonContain'>
                            <a className='projectButton' href='https://latchfinds.com/'>view project</a>
                            <a className='projectButton' href='https://github.com/trev-org04/latch-finds'>view code</a>
                        </div>
                    </div>
                </div>
                <div className='projectRow'>
                    <div className='projectItem'>
                        <img src={amplio} class="projectImg" alt=''></img>
                        <span className='projectTitle'>Amplio Prep</span>
                        <p className='projectDesc'>Amplio Prep is a modern ACT preparation organization whose goal is to provide quality, inexpensive tutoring.</p>
                        <div className='projectSkillsContain'>
                            <img src={HTML} className='skillIcon' alt=''></img>
                            <img src={CSS} className='skillIcon' alt=''></img>
                            <img src={Python} className='skillIcon' alt=''></img>
                            <img src={Django} className='skillIcon' alt=''></img>
                            <img src={Figma} className='skillIcon' alt=''></img>
                        </div>    
                        <div className='projectButtonContain'>
                            <a className='projectButton' href='https://github.com/trev-org04/amplio'>view code</a>
                        </div>
                    </div>
                    {/* <div className='projectItem itemRight'>
                        <img alt=''></img>
                        <span className='projectTitle'>project title</span>
                        <p className='projectDesc'>project caption</p>
                        <div className='projectButtonContain'>
                            <a className='projectButton' href='/'>view project</a>
                            <a className='projectButton' href='/'>view code</a>
                        </div>
                    </div> */}
                </div>
            </div>

            {/* Design Portfolio Section */}
            <div id='designPortfolioContain' className='designPortfolioContain'>
            </div>
            
            {/* Sitemap Section */}
            <div id='sitemapContain' className='sitemapContain'>
                <span className='projectHeader'>Resume</span>
                <iframe src={resume} className="resumeContainer" title="Resume - Trevor Gerald" width="90%" height="750px"></iframe>
                <span className='sitemapText'>Designed and Developed by Trevor Gerald</span>
            </div>
            </>
        )
    }
}

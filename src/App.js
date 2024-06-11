import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './home/home';
import Projects from './projects/projects';
import About from './about/about';
import { HelmetProvider } from 'react-helmet-async';
import Experience from './experience/experience';


function App() {
  const helmetContext = {};

  return (
    <HelmetProvider context={helmetContext}>
      <Router>
        <Routes>
            <Route exact path='/' element={<Home />} />
            <Route exact path='/projects' element={<Projects />} />
            <Route exact path='/experience' element={<Experience />} />
            <Route exact path='/about' element={<About />} />
        </Routes>
      </Router>
    </HelmetProvider>
);
}

export default App;

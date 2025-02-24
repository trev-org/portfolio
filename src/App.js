import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './home/home';
import { HelmetProvider } from 'react-helmet-async';


function App() {
  const helmetContext = {};

  return (
    <HelmetProvider context={helmetContext}>
      <Router>
        <Routes>
            <Route exact path='/' element={<Home />} />
        </Routes>
      </Router>
    </HelmetProvider>
);
}

export default App;

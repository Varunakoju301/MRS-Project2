import React from 'react';
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App2 from './App2.js';
import Home from './Pages/Home.js';
import About from './Pages/About.js';


function App() {
  return (

<BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route index element={<App2 />} />
          <Route path="about" element={<About />} />
          {/* <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NoPage />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>

  );
}

export default App;

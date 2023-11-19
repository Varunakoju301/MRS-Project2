import React from 'react';
import './Header.css'; // Replace 'Header.css' with the correct path to your CSS file

function Header() {
  return (
    <header>
      <div className="header">
        <div className="container">
          <div className="row">
            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col logo_section">
              <div className="full">
                <div className="center-desk">
                  <div className="logo">
                    <a href="index.html"><img src="images/MrsLogo.png" alt="logo" /></a>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-10 col-lg-10 col-md-10 col-sm-10 text-right">
              <div className="menu-area">
                <div className="limit-box">
                  <nav className="main-menu">
                    <ul className="menu-area-main">
                      <li className="active"> <a href="index.html">Home</a> </li>
                      <li> <a href="about.html">about</a> </li>
                      <li className="dropdown">
                        <a href="#" className="dropdown-toggle">Features</a>
                        <div className="dropdown-content">
                          <a href="http://localhost:3001/">Create Custom Playlist</a>
                          <a href="playlist.html">Generate Playlists</a>
                          <a href="SongRecommender.html">Music Recommender</a>
                        </div>
                      </li>
                      <li> <a href="contact.html">Contact</a> </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

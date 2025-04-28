// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="main-header">
      <div className="header-container">
        <div className="logo">
          <Link to="/" className="logo-link">
            Charity Race
          </Link>
        </div>
        
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/create-team">Create Team</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
// src/components/Footer.js
import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <p>
          &copy; {currentYear} Charity Race | Powered by <a href="https://www.every.org" target="_blank" rel="noopener noreferrer">Every.org</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
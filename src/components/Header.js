import React from 'react';
import '../styles/Header.css';

const Header = ({ isDarkMode, toggleTheme }) => {
  return (
    <header className={`app-header ${isDarkMode ? 'dark' : 'light'}`}>
      <h1 className="logo">Mini Trello</h1>
      <button className="theme-toggle" onClick={toggleTheme}>
        {isDarkMode ? '☀️ Mode clair' : '🌙 Mode sombre'}
      </button>
    </header>
  );
};



export default Header;

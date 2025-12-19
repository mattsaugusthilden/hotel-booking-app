import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/translations';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const t = (key) => getTranslation(language, key);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'sv', name: 'Svenska', flag: '🇸🇪' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    setIsDropdownOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <img src="/pumpkin-logo.jpeg" alt="Creepy Hotels" className="navbar-logo" />
          {t('navBrand')}
        </Link>
        <div className="navbar-menu">
          <Link to="/hotels" className="navbar-link">
            {t('navHotels')}
          </Link>
          {user ? (
            <>
              <Link to="/bookings" className="navbar-link">
                {t('navMyBookings')}
              </Link>
              <span className="navbar-user">{t('navWelcome')}, {user.name}</span>
              <button onClick={handleLogout} className="btn btn-secondary">
                {t('navLogout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">
                {t('navLogin')}
              </Link>
            </>
          )}
          <div className="language-selector" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="language-toggle"
            >
              <span className="language-flag">{currentLanguage.flag}</span>
              <span className="language-code">{currentLanguage.code.toUpperCase()}</span>
              <span className="language-arrow">{isDropdownOpen ? '▲' : '▼'}</span>
            </button>
            {isDropdownOpen && (
              <div className="language-dropdown">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`language-option ${language === lang.code ? 'active' : ''}`}
                  >
                    <span className="language-flag">{lang.flag}</span>
                    <span className="language-name">{lang.name}</span>
                    {language === lang.code && <span className="language-check">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


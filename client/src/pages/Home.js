import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/translations';
import HeroCarousel from '../components/HeroCarousel';
import HotelsMap from '../components/HotelsMap';
import './Home.css';

const Home = () => {
  const [searchCity, setSearchCity] = useState('');
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key) => getTranslation(language, key);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCity.trim()) {
      navigate(`/hotels?city=${encodeURIComponent(searchCity)}`);
    } else {
      navigate('/hotels');
    }
  };

  return (
    <div className="home">
      <div className="hero">
        <HeroCarousel />
        <div className="hero-content">
          <h1>{t('homeTitle')}</h1>
          <p>{t('homeSubtitle')}</p>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder={t('homeSearchPlaceholder')}
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn btn-primary search-btn">
              {t('homeSearchButton')}
            </button>
          </form>
        </div>
      </div>

      <div className="features">
        <div className="container">
          <h2>{t('homeWhyChooseUs')}</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>{t('homeSecureBooking')}</h3>
              <p>{t('homeSecureDesc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>{t('homeBestPrices')}</h3>
              <p>{t('homeBestPricesDesc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>{t('homeVerifiedHotels')}</h3>
              <p>{t('homeVerifiedDesc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>{t('homeEasyManagement')}</h3>
              <p>{t('homeEasyDesc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👻</div>
              <h3>{t('homeHorrificGuarantee')}</h3>
              <p>{t('homeHorrificDesc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💀</div>
              <h3>{t('homePeopleDied')}</h3>
              <p>{t('homePeopleDiedDesc')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <HotelsMap />
      </div>
    </div>
  );
};

export default Home;


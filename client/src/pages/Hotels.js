import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation, translateHotelDescription } from '../utils/translations';
import './Hotels.css';

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key) => getTranslation(language, key);

  const city = searchParams.get('city');
  const [searchCity, setSearchCity] = useState(city || '');

  const fetchHotels = useCallback(async () => {
    try {
      setLoading(true);
      const params = city ? { city } : {};
      const response = await api.get('/hotels', { params });
      // Ensure response.data is an array
      setHotels(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      setError('Failed to load hotels');
      setHotels([]); // Set empty array on error
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCity.trim()) {
      navigate(`/hotels?city=${encodeURIComponent(searchCity)}`);
      fetchHotels();
    } else {
      navigate('/hotels');
      fetchHotels();
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">{t('hotelsLoading')}</div>
      </div>
    );
  }

  return (
    <div className="hotels-page">
      <div className="container">
        <h1>{t('hotelsTitle')}</h1>
        
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder={t('homeSearchPlaceholder')}
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-primary">
            {t('homeSearchButton')}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {hotels.length === 0 ? (
          <div className="no-results">
            <p>{t('hotelsNoResults')}</p>
          </div>
        ) : (
          <div className="hotels-grid">
            {hotels.map((hotel) => (
              <div key={hotel.id} className="hotel-card card" onClick={() => navigate(`/hotels/${hotel.id}`)}>
                <div className="hotel-image">
                  {hotel.image_url ? (
                    <img src={hotel.image_url} alt={hotel.name} />
                  ) : (
                    <div className="placeholder-image">🏨</div>
                  )}
                </div>
                <div className="hotel-info">
                  <h2>{hotel.name}</h2>
                  <p className="hotel-location">
                    📍 {hotel.city}, {hotel.country}
                  </p>
                  <p className="hotel-address">{hotel.address}</p>
                  {hotel.description && (
                    <p className="hotel-description">{translateHotelDescription(hotel.description, hotel.city, language)}</p>
                  )}
                  {hotel.rating > 0 && (
                    <div className="hotel-rating">
                      ⭐ {hotel.rating.toFixed(1)}
                    </div>
                  )}
                  <button className="btn btn-primary" style={{ marginTop: '15px', width: '100%' }}>
                    {t('hotelsViewRooms')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Hotels;


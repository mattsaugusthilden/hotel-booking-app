import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/translations';
import './Bookings.css';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { language } = useLanguage();
  const t = (key) => getTranslation(language, key);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookings');
      setBookings(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm(t('bookingsCancelConfirm'))) {
      return;
    }

    try {
      await api.delete(`/bookings/${bookingId}`);
      setBookings(bookings.filter((b) => b.id !== bookingId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel booking');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">{t('bookingsLoading')}</div>
      </div>
    );
  }

  return (
    <div className="bookings-page">
      <div className="container">
        <h1>{t('bookingsTitle')}</h1>

        {error && <div className="error-message">{error}</div>}

        {bookings.length === 0 ? (
          <div className="no-bookings">
            <p>{t('bookingsNoBookings')}</p>
            <a href="/hotels" className="btn btn-primary">
              {t('bookingsBrowseHotels')}
            </a>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-card card">
                <div className="booking-header">
                  <h2>{booking.hotel_name}</h2>
                  <span className={`booking-status ${booking.status}`}>
                    {booking.status === 'confirmed' ? t('bookingsStatusConfirmed') : t('bookingsStatusCancelled')}
                  </span>
                </div>
                <div className="booking-details">
                  <div className="booking-info-item">
                    <strong>{t('bookingsRoom')}:</strong> {booking.room_type} ({t('bookingsRoom')} {booking.room_number})
                  </div>
                  <div className="booking-info-item">
                    <strong>{t('bookingsLocation')}:</strong> {booking.address}, {booking.city}, {booking.country}
                  </div>
                  <div className="booking-info-item">
                    <strong>{t('hotelCheckIn')}:</strong>{' '}
                    {format(new Date(booking.check_in), 'MMM dd, yyyy')}
                  </div>
                  <div className="booking-info-item">
                    <strong>{t('hotelCheckOut')}:</strong>{' '}
                    {format(new Date(booking.check_out), 'MMM dd, yyyy')}
                  </div>
                  <div className="booking-info-item">
                    <strong>{t('bookingsPricePerNight')}:</strong> ${booking.price_per_night}
                  </div>
                  <div className="booking-info-item total-price">
                    <strong>{t('bookingsTotalPrice')}:</strong> ${booking.total_price.toFixed(2)}
                  </div>
                </div>
                <div className="booking-actions">
                  <button
                    className="btn btn-danger"
                    onClick={() => handleCancel(booking.id)}
                  >
                    {t('bookingsCancel')}
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

export default Bookings;


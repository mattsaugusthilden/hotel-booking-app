import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation, translateHotelDescription } from '../utils/translations';
import './HotelDetail.css';

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = (key) => getTranslation(language, key);
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [bookingRoom, setBookingRoom] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const tomorrow = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');
    setCheckIn(today);
    setCheckOut(tomorrow);
  }, []);

  useEffect(() => {
    fetchHotel();
  }, [id]);

  useEffect(() => {
    if (checkIn && checkOut && hotel) {
      fetchRooms();
    }
  }, [checkIn, checkOut, hotel]);

  const fetchHotel = async () => {
    try {
      const response = await api.get(`/hotels/${id}`);
      setHotel(response.data);
    } catch (err) {
      setError('Failed to load hotel details');
      console.error(err);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const params = {
        hotel_id: id,
        check_in: checkIn,
        check_out: checkOut,
      };
      const response = await api.get('/rooms', { params });
      setRooms(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load rooms');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (room) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setBookingRoom(room);
    setBookingLoading(true);

    try {
      const response = await api.post('/bookings', {
        room_id: room.id,
        check_in: checkIn,
        check_out: checkOut,
      });

      alert(`Booking confirmed! Total: $${response.data.total_price.toFixed(2)}`);
      navigate('/bookings');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
      setBookingRoom(null);
    }
  };

  if (!hotel && !error) {
    return (
      <div className="container">
        <div className="loading">Loading hotel details...</div>
      </div>
    );
  }

  if (error && !hotel) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="hotel-detail-page">
      <div className="container">
        <button onClick={() => navigate('/hotels')} className="back-btn">
          ← {t('hotelBack')}
        </button>

        {hotel && (
          <>
            <div className="hotel-header">
              <div className="hotel-image-large">
                {hotel.image_url ? (
                  <img src={hotel.image_url} alt={hotel.name} />
                ) : (
                  <div className="placeholder-image">🏨</div>
                )}
              </div>
              <div className="hotel-header-info">
                <h1>{hotel.name}</h1>
                <p className="hotel-location">
                  📍 {hotel.address}, {hotel.city}, {hotel.country}
                </p>
                {hotel.rating > 0 && (
                  <div className="hotel-rating">⭐ {hotel.rating.toFixed(1)}</div>
                )}
                {hotel.description && (
                  <p className="hotel-description">{translateHotelDescription(hotel.description, hotel.city, language)}</p>
                )}
              </div>
            </div>

            <div className="booking-filters">
              <h2>{t('hotelSelectDates')}</h2>
              <div className="date-inputs">
                <div className="input-group">
                  <label>{t('hotelCheckIn')}</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
                <div className="input-group">
                  <label>{t('hotelCheckOut')}</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
              </div>
            </div>

            <div className="rooms-section">
              <h2>{t('hotelAvailableRooms')}</h2>
              {loading ? (
                <div className="loading">{t('hotelLoadingRooms')}</div>
              ) : rooms.length === 0 ? (
                <div className="no-rooms">
                  <p>{t('hotelNoRooms')}</p>
                </div>
              ) : (
                <div className="rooms-grid">
                  {rooms.map((room) => (
                    <div key={room.id} className="room-card card">
                      <div className="room-info">
                        <h3>{room.room_type}</h3>
                        <p className="room-number">{t('bookingsRoom')} {room.room_number}</p>
                        <p className="room-occupancy">
                          👥 {t('hotelMaxGuests')} {room.max_occupancy} {language === 'sv' ? 'gäster' : 'guests'}
                        </p>
                        {room.amenities && (
                          <p className="room-amenities">
                            ✨ {room.amenities}
                          </p>
                        )}
                        <div className="room-price">
                          <span className="price-amount">
                            ${room.price_per_night}
                          </span>
                          <span className="price-label">{t('hotelRoomPerNight')}</span>
                        </div>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleBook(room)}
                          disabled={bookingLoading && bookingRoom?.id === room.id}
                          style={{ width: '100%', marginTop: '15px' }}
                        >
                          {bookingLoading && bookingRoom?.id === room.id
                            ? t('hotelBooking')
                            : t('hotelBookNow')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HotelDetail;


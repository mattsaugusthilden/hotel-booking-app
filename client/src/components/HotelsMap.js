import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/translations';
import api from '../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './HotelsMap.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom red icon (default state)
const createRedIcon = () => {
  return L.divIcon({
    className: 'custom-marker red-marker',
    html: '<div class="marker-pin red"></div>',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

// Create hover icon (lighter/bright red for hover)
const createHoverIcon = () => {
  return L.divIcon({
    className: 'custom-marker hover-marker',
    html: '<div class="marker-pin hover"></div>',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

const HotelsMap = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredHotelId, setHoveredHotelId] = useState(null);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key) => getTranslation(language, key);

  // City coordinates for European capitals
  const cityCoordinates = {
    'Amsterdam': [52.3676, 4.9041],
    'Athens': [37.9838, 23.7275],
    'Berlin': [52.5200, 13.4050],
    'Brussels': [50.8503, 4.3517],
    'Bucharest': [44.4268, 26.1025],
    'Budapest': [47.4979, 19.0402],
    'Copenhagen': [55.6761, 12.5683],
    'Dublin': [53.3498, -6.2603],
    'Helsinki': [60.1699, 24.9384],
    'Lisbon': [38.7223, -9.1393],
    'London': [51.5074, -0.1278],
    'Madrid': [40.4168, -3.7038],
    'Oslo': [59.9139, 10.7522],
    'Paris': [48.8566, 2.3522],
    'Prague': [50.0755, 14.4378],
    'Rome': [41.9028, 12.4964],
    'Stockholm': [59.3293, 18.0686],
    'Vienna': [48.2082, 16.3738],
    'Warsaw': [52.2297, 21.0122],
    'Zagreb': [45.8150, 15.9819],
    'Belgrade': [44.7866, 20.4489],
    'Bratislava': [48.1486, 17.1077],
    'Ljubljana': [46.0569, 14.5058],
    'Luxembourg': [49.6116, 6.1319],
    'Reykjavik': [64.1466, -21.9426],
    'Sofia': [42.6977, 23.3219],
    'Tallinn': [59.4370, 24.7536],
    'Vilnius': [54.6872, 25.2797],
    'Riga': [56.9496, 24.1052],
    'Valletta': [35.8997, 14.5146],
    'Nicosia': [35.1856, 33.3823],
    'Bern': [46.9481, 7.4474],
    'Monaco': [43.7384, 7.4246],
    'Andorra la Vella': [42.5063, 1.5218],
    'San Marino': [43.9424, 12.4578],
    'Vatican City': [41.9029, 12.4534],
    'Skopje': [41.9973, 21.4280],
    'Tirana': [41.3275, 19.8187],
    'Podgorica': [42.4304, 19.2594],
    'Sarajevo': [43.8563, 18.4131],
    'Chisinau': [47.0104, 28.8638],
    'Kiev': [50.4501, 30.5234],
    'Minsk': [53.9045, 27.5615],
    'Moscow': [55.7558, 37.6173]
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await api.get('/hotels');
      // Ensure response.data is an array
      setHotels(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to load hotels for map:', err);
      setHotels([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (hotelId) => {
    navigate(`/hotels/${hotelId}`);
  };

  if (loading) {
    return <div className="map-loading">Loading map...</div>;
  }

  // Calculate center of all hotels (average of all coordinates)
  // Ensure hotels is an array before filtering
  const validHotels = Array.isArray(hotels) ? hotels.filter(hotel => cityCoordinates[hotel.city]) : [];
  if (validHotels.length === 0) {
    return <div className="map-error">No hotels found</div>;
  }

  const centerLat = validHotels.reduce((sum, hotel) => sum + cityCoordinates[hotel.city][0], 0) / validHotels.length;
  const centerLng = validHotels.reduce((sum, hotel) => sum + cityCoordinates[hotel.city][1], 0) / validHotels.length;

  return (
    <div className="hotels-map-container">
      <h2>{t('homeMapTitle') || 'Our Hotels Around Europe'}</h2>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={4}
        style={{ height: '900px', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {validHotels.map((hotel) => {
          const coords = cityCoordinates[hotel.city];
          if (!coords) return null;
          
          return (
            <Marker
              key={hotel.id}
              position={coords}
              icon={createRedIcon()}
              eventHandlers={{
                click: () => handleMarkerClick(hotel.id),
                mouseover: (e) => {
                  const marker = e.target;
                  marker.setIcon(createHoverIcon());
                  setHoveredHotelId(hotel.id);
                },
                mouseout: (e) => {
                  const marker = e.target;
                  marker.setIcon(createRedIcon());
                  setHoveredHotelId(null);
                },
              }}
            >
              {hoveredHotelId === hotel.id && (
                <Tooltip 
                  permanent={false} 
                  direction="top" 
                  offset={[0, -10]} 
                  className="city-tooltip" 
                  interactive={true}
                  eventHandlers={{
                    click: (e) => {
                      e.originalEvent.stopPropagation();
                      handleMarkerClick(hotel.id);
                    },
                  }}
                >
                  <div 
                    onClick={() => handleMarkerClick(hotel.id)} 
                    className="city-tooltip-content"
                    style={{ cursor: 'pointer' }}
                  >
                    {hotel.image_url && (
                      <img 
                        src={hotel.image_url} 
                        alt={hotel.name}
                        className="city-tooltip-image"
                        onClick={() => handleMarkerClick(hotel.id)}
                      />
                    )}
                    <span className="city-tooltip-text">{hotel.city}</span>
                  </div>
                </Tooltip>
              )}
              <Popup>
                <div className="map-popup">
                  <h3>{hotel.name}</h3>
                  <p>{hotel.city}, {hotel.country}</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleMarkerClick(hotel.id)}
                    style={{ marginTop: '10px', width: '100%' }}
                  >
                    {t('hotelsViewRooms')}
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default HotelsMap;


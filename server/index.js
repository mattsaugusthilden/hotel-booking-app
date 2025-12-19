const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'hotel_booking.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Hotels table
  db.run(`CREATE TABLE IF NOT EXISTS hotels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    description TEXT,
    rating REAL DEFAULT 0,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Rooms table
  db.run(`CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hotel_id INTEGER NOT NULL,
    room_number TEXT NOT NULL,
    room_type TEXT NOT NULL,
    price_per_night REAL NOT NULL,
    max_occupancy INTEGER NOT NULL,
    amenities TEXT,
    image_url TEXT,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id)
  )`);

  // Bookings table
  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    total_price REAL NOT NULL,
    status TEXT DEFAULT 'confirmed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id)
  )`);
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Error creating user' });
        }

        const token = jwt.sign({ id: this.lastID, email }, JWT_SECRET);
        res.status(201).json({ token, user: { id: this.lastID, email, name } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  });
});

// Hotels Routes
app.get('/api/hotels', (req, res) => {
  const { city, country } = req.query;
  let query = 'SELECT * FROM hotels WHERE 1=1';
  const params = [];

  if (city) {
    query += ' AND city LIKE ?';
    params.push(`%${city}%`);
  }

  if (country) {
    query += ' AND country LIKE ?';
    params.push(`%${country}%`);
  }

  db.all(query, params, (err, hotels) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching hotels' });
    }
    res.json(hotels);
  });
});

app.get('/api/hotels/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM hotels WHERE id = ?', [id], (err, hotel) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching hotel' });
    }
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    res.json(hotel);
  });
});

// Rooms Routes
app.get('/api/rooms', (req, res) => {
  const { hotel_id, check_in, check_out } = req.query;

  if (!hotel_id) {
    return res.status(400).json({ error: 'hotel_id is required' });
  }

  let query = `
    SELECT r.*, h.name as hotel_name, h.address, h.city, h.country
    FROM rooms r
    JOIN hotels h ON r.hotel_id = h.id
    WHERE r.hotel_id = ?
  `;

  const params = [hotel_id];

  // Check for available rooms (not booked during the dates)
  if (check_in && check_out) {
    query += ` AND r.id NOT IN (
      SELECT room_id FROM bookings 
      WHERE status = 'confirmed' 
      AND (
        (check_in <= ? AND check_out >= ?) OR
        (check_in <= ? AND check_out >= ?) OR
        (check_in >= ? AND check_out <= ?)
      )
    )`;
    params.push(check_in, check_in, check_out, check_out, check_in, check_out);
  }

  db.all(query, params, (err, rooms) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching rooms' });
    }
    res.json(rooms);
  });
});

app.get('/api/rooms/:id', (req, res) => {
  const { id } = req.params;

  db.get(`
    SELECT r.*, h.name as hotel_name, h.address, h.city, h.country, h.description as hotel_description
    FROM rooms r
    JOIN hotels h ON r.hotel_id = h.id
    WHERE r.id = ?
  `, [id], (err, room) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching room' });
    }
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
  });
});

// Bookings Routes
app.post('/api/bookings', authenticateToken, (req, res) => {
  const { room_id, check_in, check_out } = req.body;
  const user_id = req.user.id;

  if (!room_id || !check_in || !check_out) {
    return res.status(400).json({ error: 'room_id, check_in, and check_out are required' });
  }

  // Validate dates
  const checkInDate = new Date(check_in);
  const checkOutDate = new Date(check_out);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkInDate < today) {
    return res.status(400).json({ error: 'Check-in date cannot be in the past' });
  }

  if (checkOutDate <= checkInDate) {
    return res.status(400).json({ error: 'Check-out date must be after check-in date' });
  }

  // Check if room is available
  db.get(`
    SELECT * FROM rooms WHERE id = ?
  `, [room_id], (err, room) => {
    if (err) {
      return res.status(500).json({ error: 'Error checking room availability' });
    }
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check for conflicting bookings
    db.get(`
      SELECT * FROM bookings 
      WHERE room_id = ? AND status = 'confirmed'
      AND (
        (check_in <= ? AND check_out >= ?) OR
        (check_in <= ? AND check_out >= ?) OR
        (check_in >= ? AND check_out <= ?)
      )
    `, [room_id, check_in, check_in, check_out, check_out, check_in, check_out], (err, conflict) => {
      if (err) {
        return res.status(500).json({ error: 'Error checking availability' });
      }

      if (conflict) {
        return res.status(400).json({ error: 'Room is not available for the selected dates' });
      }

      // Calculate total price
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      const total_price = room.price_per_night * nights;

      // Create booking
      db.run(`
        INSERT INTO bookings (user_id, room_id, check_in, check_out, total_price)
        VALUES (?, ?, ?, ?, ?)
      `, [user_id, room_id, check_in, check_out, total_price], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error creating booking' });
        }

        res.status(201).json({
          id: this.lastID,
          user_id,
          room_id,
          check_in,
          check_out,
          total_price,
          status: 'confirmed'
        });
      });
    });
  });
});

app.get('/api/bookings', authenticateToken, (req, res) => {
  const user_id = req.user.id;

  db.all(`
    SELECT b.*, r.room_number, r.room_type, r.price_per_night,
           h.name as hotel_name, h.address, h.city, h.country
    FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    JOIN hotels h ON r.hotel_id = h.id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
  `, [user_id], (err, bookings) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching bookings' });
    }
    res.json(bookings);
  });
});

app.delete('/api/bookings/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  db.run('DELETE FROM bookings WHERE id = ? AND user_id = ?', [id, user_id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error canceling booking' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json({ message: 'Booking canceled successfully' });
  });
});

// Seed data route (for development)
app.post('/api/seed', (req, res) => {
  // Clear existing rooms to ensure fresh data
  db.run('DELETE FROM rooms;', (err) => {
    if (err) {
      console.error('Error clearing rooms:', err);
    }
  });

  // Creepy castle images from local folder
  // Images are stored in client/public/images/hotels/
  // These are served as static files from the React app
  const horrorImages = [
    '/images/hotels/0_0 (1)2.jpeg',
    '/images/hotels/0_0 (1)3.jpeg',
    '/images/hotels/0_0 (1)4.jpeg',
    '/images/hotels/0_0 (1)5.jpeg',
    '/images/hotels/0_0 (1)6.jpeg',
    '/images/hotels/0_0 (1)7.jpeg',
    '/images/hotels/0_0 (1)8.jpeg',
    '/images/hotels/0_0 (1)9.jpeg',
    '/images/hotels/0_0 (4).jpeg',
    '/images/hotels/0_0 (5).jpeg',
    '/images/hotels/0_0 (6).jpeg',
    '/images/hotels/0_0 (7).jpeg',
    '/images/hotels/0_0 (8).jpeg',
    '/images/hotels/0_0.jpeg',
    '/images/hotels/0_1 (1)2.jpeg',
    '/images/hotels/0_1 (1)3.jpeg',
    '/images/hotels/0_1 (1)5.jpeg',
    '/images/hotels/0_1 (1)6.jpeg',
    '/images/hotels/0_1 (1)7.jpeg',
    '/images/hotels/0_1 (1)8.jpeg',
    '/images/hotels/0_1 (3).jpeg',
    '/images/hotels/0_1 (4).jpeg',
    '/images/hotels/0_1 (5).jpeg',
    '/images/hotels/0_1 (6).jpeg',
    '/images/hotels/0_1 (7).jpeg',
    '/images/hotels/0_1.jpeg',
    '/images/hotels/0_2 (1)2.jpeg',
    '/images/hotels/0_2 (1)3.jpeg',
    '/images/hotels/0_2 (1)4.jpeg',
    '/images/hotels/0_2 (1)5.jpeg',
    '/images/hotels/0_2 (1)6.jpeg',
    '/images/hotels/0_2 (1)7.jpeg',
    '/images/hotels/0_2 (1)8.jpeg',
    '/images/hotels/0_2 (3).jpeg',
    '/images/hotels/0_2 (4).jpeg',
    '/images/hotels/0_2 (5).jpeg',
    '/images/hotels/0_2 (6).jpeg',
    '/images/hotels/0_2 (7).jpeg',
    '/images/hotels/0_2.jpeg',
    '/images/hotels/0_3 (1)2.jpeg',
    '/images/hotels/0_3 (1)3.jpeg',
    '/images/hotels/0_3 (1)4.jpeg',
    '/images/hotels/0_3 (1)7.jpeg',
    '/images/hotels/0_3 (1)8.jpeg'
  ];

  // European capitals with hotel data
  const europeanCapitals = [
    { city: 'Amsterdam', country: 'Netherlands', address: 'Prinsengracht 1', name: 'Grand Amsterdam Palace' },
    { city: 'Athens', country: 'Greece', address: 'Syntagma Square 1', name: 'Acropolis Grand Hotel' },
    { city: 'Berlin', country: 'Germany', address: 'Unter den Linden 1', name: 'Brandenburg Luxury Hotel' },
    { city: 'Brussels', country: 'Belgium', address: 'Grand Place 1', name: 'Royal Brussels Hotel' },
    { city: 'Bucharest', country: 'Romania', address: 'Calea Victoriei 1', name: 'Palace Bucharest' },
    { city: 'Budapest', country: 'Hungary', address: 'Andrássy út 1', name: 'Danube Grand Hotel' },
    { city: 'Copenhagen', country: 'Denmark', address: 'Nyhavn 1', name: 'Royal Copenhagen Hotel' },
    { city: 'Dublin', country: 'Ireland', address: 'O\'Connell Street 1', name: 'Trinity Luxury Hotel' },
    { city: 'Helsinki', country: 'Finland', address: 'Esplanadi 1', name: 'Nordic Grand Hotel' },
    { city: 'Lisbon', country: 'Portugal', address: 'Praça do Comércio 1', name: 'Tagus Palace Hotel' },
    { city: 'London', country: 'United Kingdom', address: 'Piccadilly Circus 1', name: 'Royal London Hotel' },
    { city: 'Madrid', country: 'Spain', address: 'Puerta del Sol 1', name: 'Palacio Madrid' },
    { city: 'Oslo', country: 'Norway', address: 'Karl Johans gate 1', name: 'Fjord Grand Hotel' },
    { city: 'Paris', country: 'France', address: 'Champs-Élysées 1', name: 'Eiffel Grand Hotel' },
    { city: 'Prague', country: 'Czech Republic', address: 'Old Town Square 1', name: 'Charles Bridge Palace' },
    { city: 'Rome', country: 'Italy', address: 'Via del Corso 1', name: 'Colosseum Grand Hotel' },
    { city: 'Stockholm', country: 'Sweden', address: 'Gamla Stan 1', name: 'Royal Stockholm Hotel' },
    { city: 'Vienna', country: 'Austria', address: 'Ringstraße 1', name: 'Imperial Vienna Hotel' },
    { city: 'Warsaw', country: 'Poland', address: 'Nowy Świat 1', name: 'Royal Warsaw Palace' },
    { city: 'Zagreb', country: 'Croatia', address: 'Ban Jelačić Square 1', name: 'Grand Zagreb Hotel' },
    { city: 'Belgrade', country: 'Serbia', address: 'Knez Mihailova 1', name: 'Danube Palace Hotel' },
    { city: 'Bratislava', country: 'Slovakia', address: 'Hlavné námestie 1', name: 'Castle Grand Hotel' },
    { city: 'Ljubljana', country: 'Slovenia', address: 'Prešernov trg 1', name: 'Ljubljana Grand Hotel' },
    { city: 'Luxembourg', country: 'Luxembourg', address: 'Place d\'Armes 1', name: 'Grand Duchy Hotel' },
    { city: 'Reykjavik', country: 'Iceland', address: 'Laugavegur 1', name: 'Aurora Grand Hotel' },
    { city: 'Sofia', country: 'Bulgaria', address: 'Vitosha Boulevard 1', name: 'Royal Sofia Hotel' },
    { city: 'Tallinn', country: 'Estonia', address: 'Raekoja plats 1', name: 'Medieval Grand Hotel' },
    { city: 'Vilnius', country: 'Lithuania', address: 'Gedimino prospektas 1', name: 'Grand Vilnius Hotel' },
    { city: 'Riga', country: 'Latvia', address: 'Brīvības bulvāris 1', name: 'Art Nouveau Grand Hotel' },
    { city: 'Valletta', country: 'Malta', address: 'Republic Street 1', name: 'Grandmaster Palace Hotel' },
    { city: 'Nicosia', country: 'Cyprus', address: 'Ledra Street 1', name: 'Mediterranean Grand Hotel' },
    { city: 'Bern', country: 'Switzerland', address: 'Bundesplatz 1', name: 'Alpine Grand Hotel' },
    { city: 'Monaco', country: 'Monaco', address: 'Place du Casino 1', name: 'Monte Carlo Grand Hotel' },
    { city: 'Andorra la Vella', country: 'Andorra', address: 'Avinguda Meritxell 1', name: 'Pyrenees Grand Hotel' },
    { city: 'San Marino', country: 'San Marino', address: 'Piazza della Libertà 1', name: 'Mount Titano Grand Hotel' },
    { city: 'Vatican City', country: 'Vatican City', address: 'Via della Conciliazione 1', name: 'Papal Grand Hotel' },
    { city: 'Skopje', country: 'North Macedonia', address: 'Macedonia Square 1', name: 'Grand Skopje Hotel' },
    { city: 'Tirana', country: 'Albania', address: 'Skanderbeg Square 1', name: 'Royal Tirana Hotel' },
    { city: 'Podgorica', country: 'Montenegro', address: 'Trg Republike 1', name: 'Adriatic Grand Hotel' },
    { city: 'Sarajevo', country: 'Bosnia and Herzegovina', address: 'Baščaršija 1', name: 'Ottoman Grand Hotel' },
    { city: 'Chisinau', country: 'Moldova', address: 'Ștefan cel Mare Boulevard 1', name: 'Grand Chisinau Hotel' },
    { city: 'Kiev', country: 'Ukraine', address: 'Khreshchatyk Street 1', name: 'Dnipro Grand Hotel' },
    { city: 'Minsk', country: 'Belarus', address: 'Independence Avenue 1', name: 'Grand Minsk Hotel' },
    { city: 'Moscow', country: 'Russia', address: 'Red Square 1', name: 'Kremlin Grand Hotel' }
  ];

  // Generate 6 luxurious rooms for each hotel
  const generateLuxuriousRooms = () => {
    const roomTypes = [
      { type: 'Deluxe Suite', basePrice: 250, occupancy: 2, amenities: 'WiFi, 4K TV, AC, Mini Bar, Room Service, City View' },
      { type: 'Executive Suite', basePrice: 350, occupancy: 3, amenities: 'WiFi, 4K TV, AC, Mini Bar, Jacuzzi, Room Service, Balcony' },
      { type: 'Presidential Suite', basePrice: 500, occupancy: 4, amenities: 'WiFi, 4K TV, AC, Premium Mini Bar, Jacuzzi, Butler Service, Panoramic View, Private Balcony' },
      { type: 'Royal Suite', basePrice: 750, occupancy: 4, amenities: 'WiFi, 4K TV, AC, Premium Mini Bar, Private Jacuzzi, 24/7 Butler, Panoramic View, Private Terrace, Dining Area' },
      { type: 'Penthouse Suite', basePrice: 1000, occupancy: 6, amenities: 'WiFi, 4K TV, AC, Premium Mini Bar, Private Pool, Personal Butler, 360° View, Private Terrace, Full Kitchen, Living Room' }
    ];

    const rooms = [];
    for (let i = 1; i <= 6; i++) {
      const floor = 1;
      const roomNum = String(100 + i);
      const roomTypeIndex = (i - 1) % roomTypes.length;
      const roomType = roomTypes[roomTypeIndex];
      
      // Add some price variation
      const priceVariation = (Math.random() * 0.3 - 0.15); // ±15% variation
      const price = Math.round(roomType.basePrice * (1 + priceVariation));
      
      rooms.push({
        room_number: roomNum,
        room_type: roomType.type,
        price_per_night: price,
        max_occupancy: roomType.occupancy,
        amenities: roomType.amenities
      });
    }
    return rooms;
  };

  let hotelsProcessed = 0;
  let responseSent = false;
  const totalHotels = europeanCapitals.length;

  const sendResponse = (hotelsCount, roomsCount) => {
    if (!responseSent) {
      responseSent = true;
      res.json({ 
        message: `Successfully seeded ${hotelsCount} European capital hotels, each with 6 luxurious rooms!`,
        hotels: hotelsCount,
        totalRooms: roomsCount
      });
    }
  };

  const insertRooms = (hotelId, cityName) => {
    // First, delete existing rooms for this hotel
    db.run('DELETE FROM rooms WHERE hotel_id = ?', [hotelId], (deleteErr) => {
      if (deleteErr) {
        console.error(`Error deleting rooms for ${cityName}:`, deleteErr);
      }
      
      const rooms = generateLuxuriousRooms();
      let roomsInserted = 0;
      let roomsProcessed = 0;

      if (rooms.length === 0) {
        hotelsProcessed++;
        if (hotelsProcessed === totalHotels) {
          sendResponse(hotelsProcessed, hotelsProcessed * 6);
        }
        return;
      }

      rooms.forEach((room, roomIndex) => {
      db.run(
        'INSERT INTO rooms (hotel_id, room_number, room_type, price_per_night, max_occupancy, amenities) VALUES (?, ?, ?, ?, ?, ?)',
        [hotelId, room.room_number, room.room_type, room.price_per_night, room.max_occupancy, room.amenities],
        function(roomErr) {
          roomsProcessed++;
          if (!roomErr || roomErr.message.includes('UNIQUE constraint')) {
            roomsInserted++;
          }
          
          // When all rooms for this hotel are processed
          if (roomsProcessed === rooms.length) {
            hotelsProcessed++;
            console.log(`✓ ${cityName}: ${roomsInserted} rooms inserted`);
            
            // When all hotels are processed, send response
            if (hotelsProcessed === totalHotels) {
              sendResponse(hotelsProcessed, hotelsProcessed * 6);
            }
          }
        }
      );
      });
    });
  };

  europeanCapitals.forEach((capital, index) => {
    const rating = (4.0 + Math.random() * 1.0).toFixed(1); // Rating between 4.0 and 5.0
    const description = `Luxurious 5-star hotel in the heart of ${capital.city}, offering world-class amenities and exceptional service. Experience the finest in European hospitality.`;
    const imageUrl = horrorImages[index % horrorImages.length]; // Cycle through horror images

    // First, check if hotel exists
    db.get('SELECT id FROM hotels WHERE city = ? AND country = ?', [capital.city, capital.country], (err, existingHotel) => {
      let hotelId;
      
      if (existingHotel) {
        hotelId = existingHotel.id;
        // Update existing hotel with new image
        db.run('UPDATE hotels SET image_url = ? WHERE id = ?', [imageUrl, hotelId], (updateErr) => {
          if (updateErr) {
            console.error(`Error updating image for ${capital.city}:`, updateErr);
          }
        });
        // Hotel exists, just add rooms
        insertRooms(hotelId, capital.city);
      } else {
        // Insert new hotel
        db.run(
          'INSERT INTO hotels (name, address, city, country, description, rating, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [capital.name, capital.address, capital.city, capital.country, description, rating, imageUrl],
          function(insertErr) {
            if (insertErr && !insertErr.message.includes('UNIQUE constraint')) {
              console.error(`Error inserting hotel ${capital.city}:`, insertErr);
              hotelsProcessed++;
              if (hotelsProcessed === totalHotels) {
                sendResponse(hotelsProcessed, hotelsProcessed * 6);
              }
            } else {
              hotelId = this.lastID;
              insertRooms(hotelId, capital.city);
            }
          }
        );
      }
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


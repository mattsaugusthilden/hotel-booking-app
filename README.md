# Creepy Hotels Group

A full-stack web application for booking creepy hotel rooms with a modern React frontend and Node.js/Express backend.

## Features

- 🔍 Search hotels by city
- 🏨 Browse hotel listings with details
- 🛏️ View available rooms with pricing
- 📅 Select check-in and check-out dates
- 🔐 User authentication (register/login)
- 📋 Manage bookings
- ❌ Cancel bookings
- 💰 Real-time price calculation

## Tech Stack

### Frontend
- React 18
- React Router
- Axios
- date-fns
- CSS3

### Backend
- Node.js
- Express
- SQLite3
- JWT Authentication
- bcryptjs

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

   Or install manually:
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   ```

2. **Set up environment variables:**
   ```bash
   cd server
   cp .env.example .env
   ```
   Edit `.env` and set your `JWT_SECRET` (optional, defaults provided)

3. **Start the development servers:**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:5000`
   - Frontend app on `http://localhost:3000`

   Or start them separately:
   ```bash
   # Terminal 1 - Backend
   npm run server

   # Terminal 2 - Frontend
   npm run client
   ```

4. **Seed sample data (optional):**
   Visit `http://localhost:5000/api/seed` in your browser or use curl:
   ```bash
   curl -X POST http://localhost:5000/api/seed
   ```

## Project Structure

```
hotel-booking-app/
├── server/
│   ├── index.js          # Express server and API routes
│   ├── package.json
│   └── .env.example
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── context/      # Auth context
│   │   ├── services/     # API service
│   │   └── App.js
│   └── package.json
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Hotels
- `GET /api/hotels` - Get all hotels (optional query: ?city=...)
- `GET /api/hotels/:id` - Get hotel details

### Rooms
- `GET /api/rooms` - Get rooms (required: ?hotel_id=..., optional: ?check_in=...&check_out=...)
- `GET /api/rooms/:id` - Get room details

### Bookings
- `POST /api/bookings` - Create booking (requires auth)
- `GET /api/bookings` - Get user bookings (requires auth)
- `DELETE /api/bookings/:id` - Cancel booking (requires auth)

## Usage

1. **Browse Hotels:** Navigate to the Hotels page to see available hotels
2. **Search:** Use the search bar to find hotels by city
3. **View Details:** Click on a hotel to see available rooms
4. **Select Dates:** Choose your check-in and check-out dates
5. **Book:** Click "Book Now" on any available room (requires login)
6. **Manage:** View and manage your bookings in the "My Bookings" section

## Development

The database (SQLite) is automatically created when you first run the server. The schema includes:
- `users` - User accounts
- `hotels` - Hotel information
- `rooms` - Room details
- `bookings` - Booking records

## Notes

- The app uses SQLite for simplicity. For production, consider migrating to PostgreSQL or MySQL
- JWT tokens are stored in localStorage
- Passwords are hashed using bcrypt
- Room availability is checked based on existing bookings

## License

MIT


import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Hotels from './pages/Hotels';
import HotelDetail from './pages/HotelDetail';
import Bookings from './pages/Bookings';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/hotels" element={<Hotels />} />
                <Route path="/hotels/:id" element={<HotelDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/bookings"
                  element={
                    <PrivateRoute>
                      <Bookings />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;


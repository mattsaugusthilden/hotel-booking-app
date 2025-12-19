import React, { useState, useEffect } from 'react';
import './HeroCarousel.css';

const HeroCarousel = () => {
  // Hero images from the hero folder - all available hero images
  const heroImages = [
    '/images/0_0 (1).jpeg',
    '/images/0_0 (2).jpeg',
    '/images/0_0 (3).jpeg',
    '/images/0_1 (1).jpeg',
    '/images/0_1 (2).jpeg',
    '/images/0_2 (1).jpeg',
    '/images/0_2 (2).jpeg',
    '/images/0_3 (1).jpeg',
    '/images/0_3 (2).jpeg'
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Auto-rotate images every 5 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="hero-carousel">
      {heroImages.map((image, index) => (
        <div
          key={index}
          className={`carousel-slide ${index === currentIndex ? 'active' : ''}`}
          style={{ backgroundImage: `url('${image}')` }}
        />
      ))}
      <div className="carousel-overlay" />
      
      {/* Carousel indicators */}
      <div className="carousel-indicators">
        {heroImages.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;


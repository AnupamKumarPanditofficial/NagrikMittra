import React, { useState } from 'react';
import './LocationDisplay.css';

const LocationDisplay: React.FC = () => {
  const [location, setLocation] = useState('Kolkata, West Bengal - 700016, India');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetLocation = () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setTimeout(() => {
          setLocation('Marine Drive, Mumbai, 400021, (Maharashtra)');
          setIsLoading(false);
        }, 1200);
      },
      () => {
        setError('Unable to retrieve location. Please enable location services.');
        setIsLoading(false);
      }
    );
  };

  return (
    <div className="location-display-modern">
      <div className="location-content">
        <span className="location-icon">📍</span>
        <span className="location-text">
          {isLoading ? 'Updating location...' : error || location}
        </span>
        <button 
          className="change-location-btn" 
          disabled={isLoading} 
          onClick={handleGetLocation}
        >
          {isLoading ? '⟳' : '↻'}
        </button>
      </div>
    </div>
  );
};

export default LocationDisplay;

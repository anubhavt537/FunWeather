import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import axios from 'axios';
import './Weather.css';

const API_KEY = 'f00c38e0279b7bc85480c3fe775d518c';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

const Weather = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [unit, setUnit] = useState('metric');
  const chartRef = useRef(null);

  useEffect(() => {
    // Load recent searches from local storage
    const storedRecentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    setRecentSearches(storedRecentSearches);
  }, []);

  useEffect(() => {
    if (city) {
      fetchWeatherData();
    }
  }, [city, unit]);

  useEffect(() => {
    if (weatherData) {
      renderChart();
    }
  }, [weatherData]);

  const fetchWeatherData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}?q=${city}&units=${unit}&appid=${API_KEY}`);
      setWeatherData(response.data);

      // Update recent searches
      const updatedRecentSearches = [...recentSearches];
      if (!recentSearches.includes(city)) {
        updatedRecentSearches.unshift(city);
        if (updatedRecentSearches.length > 5) {
          updatedRecentSearches.pop();
        }
      }
      setRecentSearches(updatedRecentSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedRecentSearches));

      // Hide recent searches dropdown
      setShowRecentSearches(false);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const renderChart = () => {
    if (chartRef.current) {
      // If chart instance exists, destroy it
      if (chartRef.current.chart) {
        chartRef.current.chart.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      chartRef.current.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
          datasets: [{
            label: 'Temperature (°C)',
            data: [20, 22, 18, 19, 21], // Sample past weather data
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  };

  const handleChange = (event) => {
    setCity(event.target.value);
  };

  const handleUnitChange = () => {
    setUnit(unit === 'metric' ? 'imperial' : 'metric');
  };

  const handleRecentSearchClick = (recentCity) => {
    setCity(recentCity);
    setShowRecentSearches(false);
  };

  return (
    <div className="weather">
      <h1 className="title">Weather App</h1>
      <form onSubmit={(e) => { e.preventDefault(); }}>
        <div className="input-wrapper">
          <input
            type="text"
            value={city}
            onChange={handleChange}
            onFocus={() => setShowRecentSearches(true)}
            placeholder="Enter city"
          />
          {showRecentSearches && (
            <ul className="recent-searches-dropdown">
              {recentSearches.map((recentCity, index) => (
                <li key={index} onClick={() => handleRecentSearchClick(recentCity)}>{recentCity}</li>
              ))}
            </ul>
          )}
        </div>
        <button className="getweather" type="button" onClick={fetchWeatherData}>Get Weather</button>
        <button className="getweather" type="button" onClick={handleUnitChange}>Toggle Unit</button>
      </form>
      {weatherData && (
        <div>
          <h2>Weather in {weatherData.name}</h2>
          <p>Temperature: {weatherData.main.temp}°{unit === 'metric' ? 'C' : 'F'}</p>
          <p>Description: {weatherData.weather[0].description}</p>
          <canvas ref={chartRef} id="weatherChart" width="400" height="200"></canvas>
        </div>
      )}
    </div>
  );
};

export default Weather;

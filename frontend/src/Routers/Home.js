// import logo from './logo.svg';
import '../App.css';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';



const Home = ({setUser, user}) => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [searchInput, setSearchInput] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  // console.log(user);
  // Fetch random images on load
  useEffect(() => {
    const fetchRandomImages = async () => {
      try {
        const response = await fetch(`${API_URL}/api/home`);
        const data = await response.json();
        console.log(data);
        setImages(data.images);
      } catch (error) {
        console.error('Error fetching random images:', error);
      }
    };
    fetchRandomImages();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const buffer = 100;
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - buffer) {
        console.log('Load more images!');
        loadMoreImages();
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const loadMoreImages = async () => {
    if (loading) return; // Prevent multiple requests while loading
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/home`);
      const data = await response.json();
      setImages(prevImages => [...prevImages, ...data.images]); // Append new images to the existing list
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(`${API_URL}/api/search?query=${encodeURIComponent(searchInput)}`);
      const data = await response.json();
      setImages(data.images);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none'; // Hide the broken image
  };

  const handleLogout = async () => {
    try {
      const response=await fetch(`${API_URL}/api/logout`, {
        method: 'POST',
      });
      const data=await response.json();
      console.log(data.message);

      setUser(null); // Clear user state
      localStorage.removeItem('user'); // Remove user from localStorage
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <div className="app">
      <h1>Text-to-Image Search</h1>
      <div className="auth-buttons">
        {!user ? (
          <>
            <Link to="/login">
              <button className="auth-btn">Login</button>
            </Link>
            <Link to="/register">
              <button className="auth-btn">Register</button>
            </Link>
          </>
        ) : (
          <p>Welcome, {user.username}!</p>
        )}
      </div>

      {user && (
        <div className="logout-btn">
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search images..."
        />
        <button onClick={handleSearch} disabled={!searchInput.trim()}>
          Search
        </button>
      </div>
      <div className="image-grid">
        {images.map((image, index) => (
          <div key={index} className="image-box">
            <img 
              src={image.url} 
              alt={`Image ${index + 1}`} 
              onError={handleImageError}
            />
          </div>
        ))}
      </div>
      {loading && <p>Loading more images...</p>}
    </div>
  );
};

export default Home;


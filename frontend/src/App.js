import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Routers/Login';
import Register from './Routers/Register';
import Home from './Routers/Home';
import { useEffect } from 'react';

const App = () => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      console.log('Stored user found:', storedUser);
      setUser(JSON.parse(storedUser));
    }
  }, []);
  
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home setUser={setUser} user={user}/>} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        <Route path="/" element={<Home setUser={setUser} user={user}/>} />
      </Routes>
    </Router>
  );
};

export default App;

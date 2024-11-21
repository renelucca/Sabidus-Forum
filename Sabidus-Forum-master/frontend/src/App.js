// src/App.js
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile'; // Ajuste o caminho se necessário
import Navbar from './components/Navbar';
import Settings from './pages/Settings';
import SearchResults from './pages/SearchResults';


function App() {
  return (
    <AuthProvider>
      <Router>
      <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

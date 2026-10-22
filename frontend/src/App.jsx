import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import { authService } from './services/auth';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sync theme on initial boot
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Check if user session is active
    const currentUser = authService.getCurrentUser();
    if (currentUser && authService.isAuthenticated()) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleRegister = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentView('login');
  };

  if (loading) {
    return (
      <div className="auth-container">
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading workspace...</span>
      </div>
    );
  }

  return (
    <>
      {!user ? (
        currentView === 'login' ? (
          <Login 
            onLogin={handleLogin} 
            switchToRegister={() => setCurrentView('register')} 
          />
        ) : (
          <Register 
            onRegister={handleRegister} 
            switchToLogin={() => setCurrentView('login')} 
          />
        )
      ) : (
        <Dashboard onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;
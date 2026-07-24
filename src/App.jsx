import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { apiService } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [isStrapiOnline, setIsStrapiOnline] = useState(false);
  const [useMockMode, setUseMockMode] = useState(true);
  const [theme, setTheme] = useState('light');
  const [uiStyle, setUiStyle] = useState('neo-brutalist');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [introProgress, setIntroProgress] = useState(0);
  const [introFinished, setIntroFinished] = useState(false);

  // Cinematic loading animation timer
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      const step = Math.floor(Math.random() * 4) + 3; // increment 3 to 6%
      current = Math.min(current + step, 100);
      setIntroProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIntroFinished(true);
        }, 300);
      }
    }, 90); // ~2.8s total duration
    return () => clearInterval(interval);
  }, []);

  // Check backend server availability and local authentication status on mount
  useEffect(() => {
    async function checkBackendAndAuth() {
      // 1. Check if Strapi is online
      const online = await apiService.checkConnection();
      setIsStrapiOnline(online);
      setUseMockMode(!online);

      // 2. Fetch logged in user
      const savedUser = apiService.getCurrentUser();
      if (savedUser) {
        setUser(savedUser);
      }
      setCheckingAuth(false);
    }
    
    checkBackendAndAuth();

    // Load initial theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Load initial layout style from localStorage
    const savedStyle = localStorage.getItem('uiStyle') || 'neo-brutalist';
    setUiStyle(savedStyle);
    document.documentElement.setAttribute('data-ui-style', savedStyle);
  }, []);

  // Theme change callback
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Layout style change callback
  const changeUiStyle = (newStyle) => {
    setUiStyle(newStyle);
    localStorage.setItem('uiStyle', newStyle);
    document.documentElement.setAttribute('data-ui-style', newStyle);
  };

  // Login callback
  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  // Logout callback
  const handleLogout = () => {
    apiService.logout();
    setUser(null);
  };

  const getStatusText = () => {
    if (user) {
      if (introProgress < 25) return "Every transaction is a seed of trust...";
      if (introProgress < 50) return "Opportunities are created by your daily dedication...";
      if (introProgress < 75) return "Discipline is the bridge between goals and accomplishment...";
      return "Let's build something extraordinary today.";
    } else {
      if (introProgress < 25) return "The secret of getting ahead is getting started...";
      if (introProgress < 50) return "Dream big. Stay focused. Track your growth...";
      if (introProgress < 75) return "Success is the sum of small daily efforts...";
      return "Your next breakthrough is waiting.";
    }
  };

  const showIntro = !introFinished || checkingAuth;

  if (showIntro) {
    return (
      <div className="cinematic-intro-wrap">
        <div className="ambient-glow" />
        <div className="glowing-logo-container">
          <div className="cinematic-logo-mark">B/OLOGY</div>
          <h1 className="cinematic-title">BUYOLOGY</h1>
          <div className="cinematic-subtitle">
            {user ? `Welcome back, ${user.username || 'user'}` : 'Sleek Consumer Psychology & Analytics'}
          </div>
          <div className="minimal-loader-bar">
            <div className="minimal-loader-fill" style={{ width: `${introProgress}%` }} />
          </div>
          <div className="status-text">{getStatusText()}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {user ? (
        <Dashboard 
          user={user} 
          onLogout={handleLogout} 
          isStrapiOnline={isStrapiOnline} 
          onChangeTheme={changeTheme}
          currentTheme={theme}
          onChangeUiStyle={changeUiStyle}
          currentUiStyle={uiStyle}
        />
      ) : (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          isStrapiOnline={isStrapiOnline}
          useMockMode={useMockMode}
          onChangeTheme={changeTheme}
          currentTheme={theme}
          onChangeUiStyle={changeUiStyle}
          currentUiStyle={uiStyle}
        />
      )}
    </>
  );
}

export default App;

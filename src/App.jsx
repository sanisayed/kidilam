import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';

function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <Dashboard 
      user={{ username: 'admin', role: 'admin' }} 
      onLogout={() => {}} 
      onChangeTheme={changeTheme}
      currentTheme={theme}
    />
  );
}

export default App;

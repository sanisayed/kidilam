import React, { useState } from 'react';
import Dashboard from './components/Dashboard';

function App() {
  const [theme] = useState(() => {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    return saved;
  });

  return (
    <Dashboard currentTheme={theme} />
  );
}

export default App;

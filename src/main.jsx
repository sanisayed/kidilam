import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, background: '#090d16', color: '#ff4d4d', fontFamily: 'monospace', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#121827', padding: 24, borderRadius: 12, border: '2px solid #ff4d4d', maxWidth: 640, width: '100%' }}>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⚠️</span> App Error Detected
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#a0aec0', margin: '0 0 16px 0' }}>
              A temporary state issue occurred. Click below to clear cache and reload:
            </p>
            <pre style={{ background: '#090d16', padding: 12, borderRadius: 6, color: '#ff4d4d', fontSize: '0.78rem', overflowX: 'auto', border: '1px solid #2d3748', whiteSpace: 'pre-wrap' }}>
              {this.state.error && this.state.error.toString()}
            </pre>
            <button 
              onClick={() => { try { localStorage.clear(); sessionStorage.clear(); } catch {} window.location.reload(); }}
              style={{ marginTop: 16, width: '100%', padding: '12px', background: '#22c55e', color: '#000', border: 'none', borderRadius: 8, fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer' }}
            >
              🔄 Reset Cache & Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)


import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Terminal, 
  Cpu, 
  Zap, 
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { apiService } from '../services/api';

export default function Login({ onLoginSuccess, isStrapiOnline, useMockMode, onChangeTheme, currentTheme }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

  const canvasRef = useRef(null);

  // Track mouse coordinates on the wrapper for css ambient spotlight
  useEffect(() => {
    const handleMouseMove = (e) => {
      const page = document.querySelector('.login-page');
      if (page) {
        const rect = page.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        page.style.setProperty('--mouse-x', `${x}px`);
        page.style.setProperty('--mouse-y', `${y}px`);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Particle network logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationId;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    
    // Choose colors based on active theme
    let colors = ['#8b5cf6', '#ff007f', '#00f0ff'];
    if (currentTheme === 'cyber-citrus') colors = ['#d8ff36', '#8b5cf6', '#ff007f'];
    else if (currentTheme === 'neo-light') colors = ['#ff007f', '#10b981', '#00f0ff'];
    else if (currentTheme === 'midnight-glass') colors = ['#a78bfa', '#ec4899', '#3b82f6'];
    else if (currentTheme === 'sunset-mirage') colors = ['#f97316', '#f43f5e', '#fcd34d'];
    else if (currentTheme === 'matrix-console') colors = ['#00ff66', '#00ff33', '#003300'];
    else if (currentTheme === 'nord-forest') colors = ['#5e81ac', '#81a1c1', '#bf616a'];

    const numParticles = 65;
    const particles = [];
    
    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 2 + 1.2;
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off bounds
        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }
    
    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle());
    }
    
    // Mouse coords inside canvas
    let mouse = { x: null, y: null };
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };
    
    window.addEventListener('mousemove', onMouseMove);
    canvas.parentElement.addEventListener('mouseleave', onMouseLeave);
    
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);
    
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Update & Draw Particles
      particles.forEach(p => {
        p.update();
        p.draw();
        
        // Mouse interact (pull toward mouse slightly)
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            // Smooth float pull
            p.x += dx * 0.015;
            p.y += dy * 0.015;
            
            // Draw connector line to mouse
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - (dist / 130)) * 0.25;
            ctx.lineWidth = 0.6;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        }
      });
      
      // Connecting lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 85) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p1.color;
            ctx.globalAlpha = (1 - (dist / 85)) * 0.15;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        }
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentTheme]);


  const THEMES = ['cyber-citrus', 'dark', 'midnight-glass', 'neo-light', 'sunset-mirage', 'matrix-console', 'nord-forest'];

  const cycleTheme = () => {
    const nextIdx = (THEMES.indexOf(currentTheme) + 1) % THEMES.length;
    onChangeTheme(THEMES[nextIdx]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim()) {
      handleFormError('Username or email is required!');
      return;
    }
    if (isSignUp && !email.trim()) {
      handleFormError('Email address is required!');
      return;
    }
    if (!password) {
      handleFormError('Password is required!');
      return;
    }
    if (password.length < 6) {
      handleFormError('Password must be at least 6 characters!');
      return;
    }

    setLoading(true);
    setProgress(0);
    setShowLoadingOverlay(true);

    let apiPromise;
    if (isSignUp) {
      apiPromise = apiService.register(username, email, password);
    } else {
      apiPromise = apiService.login(username, password);
    }

    let apiCompleted = false;
    let apiError = null;
    let apiUserData = null;

    apiPromise.then(
      (data) => {
        apiUserData = data.user;
        apiCompleted = true;
      },
      (err) => {
        apiError = err;
        apiCompleted = true;
      }
    );

    let currentProgress = 0;
    const interval = setInterval(() => {
      if (apiCompleted && apiError) {
        clearInterval(interval);
        setShowLoadingOverlay(false);
        setLoading(false);
        setProgress(0);
        handleFormError(apiError.message || 'Authentication failed.');
        return;
      }

      // If we are still waiting for API, cap at 96%
      const cap = apiCompleted ? 100 : 96;
      if (currentProgress < cap) {
        // Random step between 2 and 6
        const step = Math.floor(Math.random() * 5) + 2;
        currentProgress = Math.min(currentProgress + step, cap);
        setProgress(currentProgress);
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setShowLoadingOverlay(false);
          setLoading(false);
          setProgress(0);
          if (apiUserData) {
            onLoginSuccess(apiUserData);
          }
        }, 300); // short delay at 100% to let the user appreciate the completion
      }
    }, 45);
  };

  const handleFormError = (msg) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="login-page">
      <AnimatePresence>
        {showLoadingOverlay && (
          <motion.div 
            className="login-loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="wave-loader-container">
              <div className="wave-loader-circle">
                <div 
                  className="wave-fluid wave-fluid-primary" 
                  style={{ '--wave-translate-y': `${100 - progress}%` }}
                />
                <div 
                  className="wave-fluid wave-fluid-secondary" 
                  style={{ '--wave-translate-y': `${100 - progress}%` }}
                />
                <div className="wave-loader-percentage">
                  <span className="percentage-number">{progress}</span>
                  <span className="percentage-symbol">%</span>
                </div>
              </div>
              <div className="wave-loader-label">
                <span className="wave-loader-title">INITIALIZING SYSTEM</span>
                <span className="wave-loader-subtitle">Loading cognitive weights & modules...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <canvas ref={canvasRef} className="particle-canvas" />
      {/* Brand Column (Left) */}
      <div className="login-brand">
        <div className="brand-bg-grid"></div>
        <div className="brand-glow"></div>
        
        {/* Top Header info */}
        <div className="brand-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="sidebar-logo-mark" style={{ fontSize: '0.85rem' }}>B/OLOGY</div>
          <button 
            type="button" 
            className="theme-btn" 
            onClick={cycleTheme}
            style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'transparent', color: '#fff', boxShadow: 'none' }}
          >
            <Sparkles size={13} />
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>Theme: {currentTheme}</span>
          </button>
        </div>

        {/* Hero title */}
        <div className="brand-content" style={{ margin: 'auto 0' }}>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-heading" style={{ 
              fontSize: '3.6rem', 
              lineHeight: 1, 
              color: 'var(--citrus)',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              marginBottom: '16px'
            }}>
              BUYOLOGY
            </h1>
            <p style={{ 
              color: 'var(--text-on-dark-2)', 
              fontSize: '1rem', 
              fontWeight: 500, 
              lineHeight: 1.6,
              maxWidth: '440px',
              marginBottom: '28px'
            }}>
              Sleek Consumer Psychology & Analytics Suite. Leverage real-time behavioral insights to accelerate transaction velocity.
            </p>
          </motion.div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="badge badge-citrus" style={{ fontSize: '0.75rem' }}>✓ FLAT NEO-BRUTALISM</div>
            <div className="badge badge-purple" style={{ fontSize: '0.75rem' }}>✓ LIVE ANALYTICS</div>
          </div>
        </div>

        {/* Footer info */}
        <div className="brand-content" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-on-dark-2)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
          <span>API INSTANCE: v2.4</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className={`status-dot ${isStrapiOnline ? 'online' : 'offline'}`} />
            {isStrapiOnline ? 'STRAPI ACTIVE' : 'SANDBOX MODE'}
          </span>
        </div>
      </div>

      {/* Form Column (Right) */}
      <div className="login-form-side">
        <motion.div 
          className="card card-p-lg login-card"
          animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
            <h2 className="font-heading" style={{ fontSize: '1.6rem', fontWeight: 800 }}>
              {isSignUp ? 'CREATE ACCOUNT' : 'SYSTEM SIGN IN'}
            </h2>
            <button 
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              style={{
                background: 'none',
                border: 'none',
                textDecoration: 'underline',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: '0.8rem',
                color: 'var(--purple)',
                cursor: 'pointer'
              }}
            >
              {isSignUp ? 'Use login' : 'Create profile'}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                className="alert alert-error"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                <Terminal size={15} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {!error && useMockMode && !isSignUp && (
            <div className="alert alert-info">
              <Cpu size={15} />
              <span>Sandbox mode active. Log in with password &ge; 6 characters.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="field">
              <label className="field-label">
                <User size={14} />
                {isSignUp ? 'Username' : 'Username or Email'}
              </label>
              <input 
                type="text" 
                className="field-input" 
                placeholder={isSignUp ? "e.g. market_lead" : "admin or email"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            {isSignUp && (
              <motion.div 
                className="field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="field-label">
                  <Mail size={14} />
                  Email Address
                </label>
                <input 
                  type="email" 
                  className="field-input" 
                  placeholder="e.g. lead@buyology.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </motion.div>
            )}

            <div className="field">
              <label className="field-label">
                <Lock size={14} />
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="field-input" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  style={{ width: '100%', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '12px', justifyContent: 'center', fontSize: '0.9rem', marginTop: '8px' }}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  <span>TRANSMITTING...</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? 'RUN REGISTRATION' : 'INITIALIZE SYSTEM'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {useMockMode && !isSignUp && (
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '2px dashed rgba(0,0,0,0.08)' }}>
              <span className="field-label" style={{ marginBottom: '8px', fontSize: '0.7rem' }}>
                ⚡ QUICK SHORTCUT CREDENTIALS:
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                  onClick={() => { setUsername('admin'); setPassword('admin123'); }}
                >
                  Admin Profile
                </button>
                <button
                  type="button"
                  className="btn btn-citrus"
                  style={{ padding: '4px 10px', fontSize: '0.72rem', color: '#000' }}
                  onClick={() => { setUsername('buyer_psych'); setPassword('psycho999'); }}
                >
                  Demo User
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

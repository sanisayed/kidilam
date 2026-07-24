import { getApiUrl } from '../config';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Clock, Database, Monitor, Truck, Shield,
  Box, LayoutDashboard, Megaphone, Users, LogOut,
  ChevronDown, ChevronRight, Plus, Search, TrendingUp, Menu,
  TrendingDown, DollarSign, ShoppingBag, ArrowUpRight,
  RefreshCw, Moon, Sun, BarChart2, Filter, Zap, Upload, Sparkles,
  RotateCcw, Heart, Bell, Download
} from 'lucide-react';
import productsSeed from '../services/products_seed.json';
import billsSeed from '../services/bills_seed.json';
import * as pdfjsLib from 'pdfjs-dist';
import WhatsAppCatalogPanel from './WhatsAppCatalogPanel';


/* =========================================================
   UTILITIES
   ========================================================= */

// Animated counting hook
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else { setValue(Math.floor(start)); }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

// Shimmer skeleton component
function Skeleton({ h = 40, w = '100%', mb = 10 }) {
  return <div className="shimmer" style={{ height: h, width: w, marginBottom: mb }} />;
}

/* =========================================================
   SVG SPARKLINE CHART
   ========================================================= */

function SparklineChart({ data, color = '#8b5cf6', height = 70 }) {
  // Interactive state for tooltip hover coordinates
  const [hoveredIndex, setHoveredIndex] = React.useState(null);
  const [hoveredPoint, setHoveredPoint] = React.useState(null);

  if (!data || data.length === 0) return null;
  const padX = 8, padY = 12;
  const w = 300, h = height;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => ({
    x: padX + (i / (data.length - 1)) * (w - padX * 2),
    y: padY + (1 - (v - min) / range) * (h - padY * 2),
    value: v
  }));

  // Create smooth Bezier curve line using midpoint cubic Bezier controls
  let linePath = '';
  if (pts.length > 0) {
    linePath = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
      const cpY2 = p1.y;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
  }

  const areaPath = linePath ? `${linePath} L ${pts[pts.length - 1].x} ${h} L ${pts[0].x} ${h} Z` : '';

  const handleMouseMove = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const xRatio = clientX / rect.width;
    const svgX = xRatio * w;

    // Find nearest point
    let nearestIndex = 0;
    let minDist = Infinity;
    pts.forEach((p, idx) => {
      const dist = Math.abs(p.x - svgX);
      if (dist < minDist) {
        minDist = dist;
        nearestIndex = idx;
      }
    });

    setHoveredIndex(nearestIndex);
    setHoveredPoint(pts[nearestIndex]);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setHoveredPoint(null);
  };

  const gradId = `grad-${color.replace('#', '')}-${height}`;

  return (
    <div className="chart-container" style={{ height, position: 'relative', overflow: 'visible' }}>
      <svg 
        className="chart-svg" 
        viewBox={`0 0 ${w} ${h}`} 
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ overflow: 'visible', cursor: 'crosshair', width: '100%', height: '100%' }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <line x1={0} y1={h * 0.25} x2={w} y2={h * 0.25} stroke="var(--text-muted)" strokeOpacity="0.1" strokeDasharray="3,3" />
        <line x1={0} y1={h * 0.5} x2={w} y2={h * 0.5} stroke="var(--text-muted)" strokeOpacity="0.1" strokeDasharray="3,3" />
        <line x1={0} y1={h * 0.75} x2={w} y2={h * 0.75} stroke="var(--text-muted)" strokeOpacity="0.1" strokeDasharray="3,3" />

        {/* Area fill with entrance fade animation */}
        {areaPath && (
          <motion.path 
            d={areaPath} 
            fill={`url(#${gradId})`} 
            className="chart-area"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
        )}

        {/* Smooth path stroke line with draw-in animation */}
        {linePath && (
          <motion.path 
            d={linePath} 
            className="chart-line" 
            stroke={color} 
            strokeWidth="2.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        )}

        {/* Grid connector vertical line on hover */}
        {hoveredPoint && (
          <line 
            x1={hoveredPoint.x} 
            y1={0} 
            x2={hoveredPoint.x} 
            y2={h} 
            stroke={color} 
            strokeOpacity="0.3" 
            strokeWidth="1.5"
            strokeDasharray="2,2" 
          />
        )}

      </svg>

      {/* HTML non-stretching indicator dots */}
      {pts.map((p, i) => {
        const isHovered = hoveredIndex === i;
        const isLast = i === pts.length - 1;
        const showDot = isHovered || isLast;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${(p.x / w) * 100}%`,
              top: `${(p.y / h) * 100}%`,
              width: isHovered ? '9px' : '7px',
              height: isHovered ? '9px' : '7px',
              borderRadius: '50%',
              backgroundColor: color,
              border: '1.5px solid #fff',
              transform: 'translate(-50%, -50%)',
              opacity: showDot ? 1 : 0.25,
              pointerEvents: 'none',
              transition: 'all 0.15s ease',
              boxShadow: isHovered ? '0 0 6px rgba(0,0,0,0.3)' : 'none',
              zIndex: 3
            }}
          />
        );
      })}

      {/* Floating HTML dynamic tooltip */}
      <AnimatePresence>
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: -28, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            style={{
              position: 'absolute',
              left: `${(hoveredPoint.x / w) * 100}%`,
              top: `${(hoveredPoint.y / h) * 100}%`,
              transform: 'translate(-50%, -100%)',
              background: '#000',
              color: '#fff',
              border: `1.5px solid ${color}`,
              padding: '4px 8px',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              fontWeight: 800,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              zIndex: 10,
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
            }}
          >
            AED {hoveredPoint.value.toLocaleString()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   STAT CARD
   ========================================================= */

function StatCard({ label, value, prefix = '', suffix = '', trend, trendVal, color, icon: Icon, iconBg, chartData, chartColor, delay = 0 }) {
  const counted = useCountUp(value);

  // Compute trend dynamically if chartData is present
  const dynamicTrend = useMemo(() => {
    if (!chartData || chartData.length < 2) return null;
    const len = chartData.length;
    const current = chartData[len - 1];
    const prev = chartData[len - 2];
    if (prev === 0) return { direction: 'up', val: '+0.0%' };
    const change = ((current - prev) / prev) * 100;
    const isUp = change >= 0;
    return {
      direction: isUp ? 'up' : 'down',
      val: `${isUp ? '+' : ''}${change.toFixed(1)}%`
    };
  }, [chartData]);

  const activeTrend = dynamicTrend ? dynamicTrend.direction : trend;
  const activeTrendVal = dynamicTrend ? dynamicTrend.val : trendVal;

  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        <div className="stat-icon-box" style={{ background: iconBg || '#f4f5f7' }}>
          <Icon size={16} />
        </div>
      </div>
      <div className="stat-value" style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap' }}>
        <span>{prefix}{counted.toLocaleString()}</span>
        {suffix && (
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: 6, letterSpacing: 'normal', textTransform: 'none' }}>
            {suffix}
          </span>
        )}
      </div>
      {chartData && <SparklineChart data={chartData} color={chartColor || '#8b5cf6'} height={55} />}
      {activeTrend !== undefined && activeTrendVal !== undefined && (
        <div className="stat-trend">
          <span className={`trend-badge ${activeTrend === 'up' ? 'up' : 'down'}`}>
            {activeTrend === 'up' ? '↑' : '↓'} {activeTrendVal}
          </span>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>vs last period</span>
        </div>
      )}
    </motion.div>
  );
}

/* =========================================================
   ANIMATED SELECT DROPDOWN COMPONENT
   ========================================================= */

function CustomSelect({ value, onChange, options, placeholder = "Select option...", style, dropdownStyle, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div style={{ position: 'relative', width: style?.width || 'auto', flex: style?.flex || 'unset', minWidth: style?.minWidth || '160px' }} ref={selectRef}>
      <motion.button
        type="button"
        className="field-input"
        whileHover={disabled ? {} : { scale: 1.01, boxShadow: 'var(--shadow-hover)' }}
        whileTap={disabled ? {} : { scale: 0.99 }}
        disabled={disabled}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          padding: '10px 14px',
          fontSize: '0.82rem',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          textTransform: 'uppercase',
          textAlign: 'left',
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          ...style
        }}
        onClick={() => { if (!disabled) setIsOpen(!isOpen); }}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown size={14} />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 'calc(100% + 4px)',
              background: 'var(--bg-card)',
              border: 'var(--border)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-flat-sm)',
              zIndex: 9999,
              overflow: 'hidden',
              maxHeight: '220px',
              overflowY: 'auto',
              ...dropdownStyle
            }}
          >
            {options.map(opt => (
              <motion.button
                key={opt.value}
                type="button"
                whileHover={{ scale: 1.03, x: 6, backgroundColor: 'var(--citrus)', color: '#000' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid var(--border-light-color)',
                  textAlign: 'left',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  backgroundColor: value === opt.value ? 'var(--citrus)' : 'transparent',
                  transition: 'background-color 0.12s'
                }}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   USER PROFILE DROPDOWN MENU
   ========================================================= */

function UserProfileDropdown({ user, onLogout, isStrapiOnline, onChangeTheme, currentTheme }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button 
        className="btn btn-dark" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8, 
          padding: '8px 14px', 
          border: '2px solid #000',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          fontSize: '0.78rem',
          background: 'var(--bg-dark)',
          color: 'var(--citrus)',
          boxShadow: 'var(--shadow-flat-sm)',
          borderRadius: 'var(--radius-sm)',
          cursor: 'pointer'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Zap size={13} style={{ fill: isOpen ? 'var(--citrus)' : 'none', color: 'var(--citrus)' }} />
        <span>{user?.username || 'Admin'}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown size={12} />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: '220px',
              background: 'var(--bg-card)',
              border: '2px solid #000',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-flat)',
              zIndex: 99,
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ padding: '4px 6px', borderBottom: '1px solid var(--border-light-color)', paddingBottom: '8px', color: 'var(--text-primary)' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{user?.username || 'Administrator'}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                {isStrapiOnline ? 'Strapi User' : 'Sandbox Admin'}
              </div>
            </div>
            
            <button 
              onClick={() => {
                const THEMES = ['cyber-citrus', 'dark', 'midnight-glass', 'neo-light', 'sunset-mirage', 'matrix-console', 'nord-forest'];
                const nextIdx = (THEMES.indexOf(currentTheme) + 1) % THEMES.length;
                onChangeTheme(THEMES[nextIdx]);
                setIsOpen(false);
              }}
              className="btn btn-ghost" 
              style={{ justifyContent: 'flex-start', fontSize: '0.75rem', width: '100%', padding: '6px 10px', boxShadow: 'none', border: 'none' }}
            >
              <Sparkles size={13} />
              <span>Cycle UI Theme</span>
            </button>

            <button 
              onClick={onLogout}
              className="btn btn-pink" 
              style={{ justifyContent: 'center', fontSize: '0.75rem', width: '100%', padding: '8px' }}
            >
              <LogOut size={13} />
              <span>Log Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   UI THEME SELECTOR DROPDOWN
   ========================================================= */

function UIThemeSelector({ currentTheme, onChangeTheme }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themes = [
    { id: 'cyber-citrus',    label: 'Cyber Citrus',    color: '#d8ff36', desc: 'Hybrid Neon Brutalism' },
    { id: 'dark',            label: 'Citrus Dark',     color: '#8b5cf6', desc: 'Sleek Cyber Dark' },
    { id: 'midnight-glass',  label: 'Midnight Glass',  color: '#ec4899', desc: 'Frosted Glassmorphic' },
    { id: 'neo-light',       label: 'Neo-Brutal Light',color: '#ff007f', desc: 'High-Contrast Paper' },
    { id: 'sunset-mirage',   label: 'Sunset Mirage',   color: '#f97316', desc: 'Luxury Crimson Orange' },
    { id: 'matrix-console',  label: 'Matrix Terminal', color: '#00ff66', desc: 'Emerald Hacking Screen' },
    { id: 'nord-forest',     label: 'Nordic Forest',   color: '#5e81ac', desc: 'Scandinavian Clean Slate' }
  ];

  const activeTheme = themes.find(t => t.id === currentTheme) || themes[0];

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button 
        className="theme-btn" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8, 
          padding: '7px 12px',
          textTransform: 'uppercase',
          fontWeight: 800
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ 
          display: 'inline-block', 
          width: 8, 
          height: 8, 
          borderRadius: '50%', 
          background: activeTheme.color,
          border: '1px solid #000'
        }} />
        <span>UI Theme: {activeTheme.label}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown size={13} />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: '260px',
              background: 'var(--bg-card)',
              border: '2px solid #000',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-flat)',
              zIndex: 9999,
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            {themes.map(t => (
              <button
                key={t.id}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid var(--border-light-color)',
                  textAlign: 'left',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: currentTheme === t.id ? 'rgba(0,0,0,0.05)' : 'transparent',
                  transition: 'background-color 0.12s'
                }}
                onClick={() => {
                  onChangeTheme(t.id);
                  setIsOpen(false);
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: t.color, border: '1px solid #000' }} />
                    {t.label}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginLeft: 12 }}>{t.desc}</div>
                </div>
                {currentTheme === t.id && <span style={{ color: 'var(--purple)', fontSize: '0.75rem', fontWeight: 800 }}>✓</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   ADD PRODUCT DIALOG MODAL
   ========================================================= */

function AddProductModal({ isOpen, onClose, onSave }) {
  const [dta, setDta] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    if (!dta.trim() || !brand.trim() || !model.trim() || !price) {
      setError('All fields are required!');
      return;
    }
    onSave({
      code: dta.trim().toUpperCase(),
      brand: brand.trim(),
      name: model.trim(),
      qty: 15,
      price: parseFloat(price)
    });
    setDta('');
    setBrand('');
    setModel('');
    setPrice('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
      backdropFilter: 'blur(4px)'
    }}>
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card card-p-lg" 
        style={{ width: '100%', maxWidth: '440px', background: 'var(--bg-card)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
          <h3 className="font-heading" style={{ fontSize: '1.4rem' }}>Add New Product</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontWeight: 800, cursor: 'pointer', color: 'var(--text-primary)' }}>✕</button>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field">
            <label className="field-label">DTA SKU CODE</label>
            <input type="text" className="field-input" placeholder="e.g. DTA9999" value={dta} onChange={e => setDta(e.target.value.toUpperCase())} />
          </div>
          <div className="field">
            <label className="field-label">Brand</label>
            <input type="text" className="field-input" placeholder="e.g. Lenovo" value={brand} onChange={e => setBrand(e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Model / Description</label>
            <input type="text" className="field-input" placeholder="e.g. ThinkPad T14 Gen 2" value={model} onChange={e => setModel(e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Unit Price (AED)</label>
            <input type="number" className="field-input" placeholder="e.g. 1500" value={price} onChange={e => setPrice(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save Product</button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* =========================================================
   UPLOAD PRODUCT CSV MODAL
   ========================================================= */

function UploadProductModal({ isOpen, onClose, onUpload }) {
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState([]);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    setDragOver(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'csv') {
      setError('Please upload a .csv file.');
      return;
    }
    setFile(file);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split(/\r?\n/);
        if (lines.length < 2) {
          setError('The uploaded CSV file is empty.');
          return;
        }

        const rows = lines.map(line => {
          const match = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
          return match ? match.map(val => val.replace(/^"|"$/g, '').trim()) : line.split(',');
        }).filter(r => r.length > 0 && r[0]);

        const headers = rows[0].map(h => h.toLowerCase().trim());
        
        const dtaIdx = headers.findIndex(h => h.includes('dta') || h.includes('sku') || h.includes('code') || h.includes('item'));
        const brandIdx = headers.findIndex(h => h.includes('brand') || h.includes('make') || h.includes('manufac'));
        const modelIdx = headers.findIndex(h => h.includes('model') || h.includes('description') || h.includes('name') || h.includes('product'));
        const priceIdx = headers.findIndex(h => h.includes('price') || h.includes('rate') || h.includes('cost') || h.includes('value'));

        if (dtaIdx === -1 || modelIdx === -1) {
          setError('Required columns DTA/SKU and Model name not found.');
          return;
        }

        const items = rows.slice(1).map(row => {
          const dtaVal = row[dtaIdx]?.toUpperCase();
          const brandVal = brandIdx !== -1 ? row[brandIdx] : (row[modelIdx]?.split(' ')[0] || 'Unknown');
          const modelVal = row[modelIdx];
          const priceVal = priceIdx !== -1 ? parseFloat(row[priceIdx]) : 0;

          if (!dtaVal || !modelVal) return null;

          return {
            code: dtaVal,
            brand: brandVal,
            name: modelVal,
            qty: 15,
            price: priceVal || 1200
          };
        }).filter(Boolean);

        if (items.length === 0) {
          setError('No valid rows could be imported.');
          return;
        }

        setParsed(items);
      } catch (err) {
        setError('Error reading CSV string formatting.');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (parsed.length === 0) return;
    onUpload(parsed);
    setFile(null);
    setParsed([]);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
      backdropFilter: 'blur(4px)'
    }}>
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card card-p-lg" 
        style={{ width: '100%', maxWidth: '500px', background: 'var(--bg-card)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
          <h3 className="font-heading" style={{ fontSize: '1.4rem' }}>Upload Product CSV</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontWeight: 800, cursor: 'pointer', color: 'var(--text-primary)' }}>✕</button>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}

        {!file ? (
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            style={{
              border: dragOver ? '2px dashed var(--citrus)' : '2px dashed var(--border-color)',
              background: dragOver ? 'var(--bg)' : 'transparent',
              borderRadius: 'var(--radius)',
              padding: '40px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onClick={() => document.getElementById('csv-file-picker').click()}
          >
            <Upload size={32} style={{ margin: '0 auto 12px', opacity: 0.6 }} />
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 6 }}>Drag and drop your products.csv here</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>or click to browse files</div>
            <input type="file" id="csv-file-picker" accept=".csv" style={{ display: 'none' }} onChange={handleFileSelect} />
          </div>
        ) : (
          <div>
            <div className="alert alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>✓ Parsed <strong>{parsed.length}</strong> items!</span>
              <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.65rem' }} onClick={() => { setFile(null); setParsed([]); }}>Change</button>
            </div>

            <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-light-color)', borderRadius: 'var(--radius-sm)', marginBottom: 20 }}>
              <table className="data-table" style={{ fontSize: '0.78rem' }}>
                <thead><tr><th>SKU</th><th>Name</th><th>Price</th></tr></thead>
                <tbody>
                  {parsed.slice(0, 4).map((p, i) => (
                    <tr key={i}>
                      <td><code style={{ fontWeight: 700 }}>{p.code}</code></td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</td>
                      <td>AED {p.price}</td>
                    </tr>
                  ))}
                  {parsed.length > 4 && <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>...and {parsed.length - 4} more items</td></tr>}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleImport}>
                Import {parsed.length} Products
              </button>
              <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* =========================================================
   REUSABLE INLINE SALES INVOICE FORM (POS TERMINAL)
   ========================================================= */

function SalesInvoiceForm({ onSave, onClose, productsList, editingBill, prefilledData }) {
  const [txType, setTxType] = useState('Sale');
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [date, setDate] = useState(() => {
    const t = new Date();
    const dd = String(t.getDate()).padStart(2, '0');
    const mm = String(t.getMonth() + 1).padStart(2, '0');
    const yyyy = t.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  });
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [platform, setPlatform] = useState('Regular Customer');
  const [note, setNote] = useState('');
  const [delivery, setDelivery] = useState(false);
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [deliveryPlace, setDeliveryPlace] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [jenny, setJenny] = useState(false);

  const handleDateChange = (val) => {
    if (!val) return;
    const parts = val.split('-'); // [YYYY, MM, DD]
    if (parts.length === 3) {
      setDate(`${parts[2]}-${parts[1]}-${parts[0]}`); // DD-MM-YYYY
    }
  };

  const getFormattedInputDate = () => {
    if (!date) return '';
    const parts = date.split('-'); // [DD, MM, YYYY]
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
    }
    return '';
  };

  // Mixed splits
  const [mixCash, setMixCash] = useState('');
  const [mixCard, setMixCard] = useState('');
  const [mixTabby, setMixTabby] = useState('');
  const [mixTamara, setMixTamara] = useState('');
  const [mixBank, setMixBank] = useState('');

  // Cart rows
  const [products, setProducts] = useState([
    { dta: '', brand: '', model: '', price: '', qty: 1, source: 'Inventory' }
  ]);

  const [suggestions, setSuggestions] = useState({ index: null, list: [] });

  // Exchanges
  const [exNewDta, setExNewDta] = useState('');
  const [exNewBrand, setExNewBrand] = useState('');
  const [exNewModel, setExNewModel] = useState('');
  const [exNewPrice, setExNewPrice] = useState('');
  const [exNewSource, setExNewSource] = useState('Inventory');
  const [exOldDta, setExOldDta] = useState('');
  const [exOldBrand, setExOldBrand] = useState('');
  const [exOldModel, setExOldModel] = useState('');
  const [exOldPrice, setExOldPrice] = useState('');
  const [exOldSource, setExOldSource] = useState('Inventory');

  const [exNewSuggestions, setExNewSuggestions] = useState([]);
  const [exOldSuggestions, setExOldSuggestions] = useState([]);

  // Load editing invoice details on mounting / editing changes
  useEffect(() => {
    if (editingBill) {
      setTxType(editingBill.transaction_type || 'Sale');
      setCustomerName(editingBill.customer_name || '');
      setDate(editingBill.date || '');
      setPaymentMode(editingBill.payment_mode || 'Cash');
      setPlatform(editingBill.platform || 'Regular Customer');
      setNote(editingBill.note || '');
      setJenny(editingBill.jenny === 1);
      setDelivery(editingBill.delivery === 1);
      if (editingBill.delivery === 1) {
        setDeliveryPhone(editingBill.delivery_phone || '');
        setDeliveryPlace(editingBill.delivery_place || '');
        setDeliveryAddress(editingBill.delivery_address || '');
      }

      if (editingBill.payment_mode === 'Mixed') {
        setMixCash(editingBill.mixed_cash?.toString() || '');
        setMixCard(editingBill.mixed_card?.toString() || '');
        setMixTabby(editingBill.mixed_tabby?.toString() || '');
        setMixTamara(editingBill.mixed_tamara?.toString() || '');
        setMixBank(editingBill.mixed_bank?.toString() || '');
      }

      if (editingBill.transaction_type === 'Exchange') {
        setExNewDta(editingBill.exch_new_dta || '');
        setExNewBrand(editingBill.exch_new_brand || '');
        setExNewModel(editingBill.exch_new_model || '');
        setExNewPrice(editingBill.exch_new_price?.toString() || '');
        setExNewSource(editingBill.source || 'Inventory');
        setExOldDta(editingBill.exch_old_dta || '');
        setExOldBrand(editingBill.exch_old_brand || '');
        setExOldModel(editingBill.exch_old_model || '');
        setExOldPrice(editingBill.exch_old_price?.toString() || '');
        setExOldSource(editingBill.exch_old_source || 'Inventory');
      } else {
        // Load products cart list
        if (editingBill.products_json) {
          try {
            const parsed = JSON.parse(editingBill.products_json);
            setProducts(parsed.map(p => ({
              dta: p.dta || '',
              brand: p.brand || '',
              model: p.model || '',
              price: (p.price || 0).toString(),
              qty: p.quantity || 1,
              source: p.source || 'Inventory'
            })));
          } catch (e) {
            // fallback if JSON fails
            setProducts([{ dta: editingBill.dta || '', brand: editingBill.brand || '', model: editingBill.model || '', price: (editingBill.price || 0).toString(), qty: 1, source: editingBill.source || 'Inventory' }]);
          }
        } else {
          setProducts([{ dta: editingBill.dta || '', brand: editingBill.brand || '', model: editingBill.model || '', price: (editingBill.price || 0).toString(), qty: 1, source: editingBill.source || 'Inventory' }]);
        }
      }
    }
  }, [editingBill]);

  useEffect(() => {
    if (prefilledData) {
      if (prefilledData.customerName) {
        setCustomerName(prefilledData.customerName);
      }
      if (prefilledData.invoiceDate) {
        setDate(prefilledData.invoiceDate);
      }
      if (prefilledData.products) {
        setProducts(prefilledData.products);
        
        // Also populate Exchange states in case user selects Exchange type!
        const mainProduct = prefilledData.products[0] || {};
        setExNewDta(mainProduct.dta || '');
        setExNewBrand(mainProduct.brand || '');
        setExNewModel(mainProduct.model || '');
        setExNewPrice((mainProduct.price || '').toString());
      }
    }
  }, [prefilledData]);

  // Auto-set payment mode to Nil if Exchange balance is 0
  useEffect(() => {
    if (txType === 'Exchange') {
      const np = parseFloat(exNewPrice) || 0;
      const op = parseFloat(exOldPrice) || 0;
      if (np > 0 && op > 0 && np === op) {
        setPaymentMode('Nil');
      }
    }
  }, [txType, exNewPrice, exOldPrice]);

  const handleProductDtaChange = (index, value) => {
    const updated = [...products];
    updated[index].dta = value.toUpperCase();
    setProducts(updated);

    if (!value.trim()) {
      setSuggestions({ index: null, list: [] });
      return;
    }

    const query = value.toLowerCase();
    const matches = productsList.filter(p => 
      (p.code && p.code.toLowerCase().includes(query)) ||
      (p.brand && p.brand.toLowerCase().includes(query)) ||
      (p.name && p.name.toLowerCase().includes(query))
    ).slice(0, 6);

    setSuggestions({ index, list: matches });
  };

  const selectSuggestion = (index, prod) => {
    const updated = [...products];
    updated[index].dta = prod.code || '';
    updated[index].brand = prod.brand || '';
    updated[index].model = prod.name || '';
    updated[index].price = (prod.price || 0).toString();
    updated[index].source = 'Inventory';
    setProducts(updated);
    setSuggestions({ index: null, list: [] });
  };

  const handleExNewDtaChange = (value) => {
    setExNewDta(value);
    if (!value.trim()) {
      setExNewSuggestions([]);
      return;
    }
    const query = value.toLowerCase();
    const matches = productsList.filter(p => 
      (p.code && p.code.toLowerCase().includes(query)) ||
      (p.brand && p.brand.toLowerCase().includes(query)) ||
      (p.name && p.name.toLowerCase().includes(query))
    ).slice(0, 6);
    setExNewSuggestions(matches);
  };

  const selectExNewSuggestion = (prod) => {
    setExNewDta(prod.code || '');
    setExNewBrand(prod.brand || '');
    setExNewModel(prod.name || '');
    setExNewPrice((prod.price || 0).toString());
    setExNewSuggestions([]);
  };

  const handleExNewBlur = () => {
    setTimeout(() => {
      setExNewSuggestions([]);
      const dta = exNewDta.trim().toUpperCase();
      if (!dta) return;
      const found = productsList.find(p => p.code && p.code.toUpperCase() === dta);
      if (found) {
        setExNewDta(found.code);
        setExNewBrand(found.brand || '');
        setExNewModel(found.name || '');
        setExNewPrice((found.price || 0).toString());
      }
    }, 200);
  };

  const handleExOldDtaChange = (value) => {
    setExOldDta(value);
    if (!value.trim()) {
      setExOldSuggestions([]);
      return;
    }
    const query = value.toLowerCase();
    const matches = productsList.filter(p => 
      (p.code && p.code.toLowerCase().includes(query)) ||
      (p.brand && p.brand.toLowerCase().includes(query)) ||
      (p.name && p.name.toLowerCase().includes(query))
    ).slice(0, 6);
    setExOldSuggestions(matches);
  };

  const selectExOldSuggestion = (prod) => {
    setExOldDta(prod.code || '');
    setExOldBrand(prod.brand || '');
    setExOldModel(prod.name || '');
    setExOldPrice((prod.price || 0).toString());
    setExOldSuggestions([]);
  };

  const handleExOldBlur = () => {
    setTimeout(() => {
      setExOldSuggestions([]);
      const dta = exOldDta.trim().toUpperCase();
      if (!dta) return;
      const found = productsList.find(p => p.code && p.code.toUpperCase() === dta);
      if (found) {
        setExOldDta(found.code);
        setExOldBrand(found.brand || '');
        setExOldModel(found.name || '');
        setExOldPrice((found.price || 0).toString());
      }
    }, 200);
  };

  const addProductRow = () => {
    setProducts([...products, { dta: '', brand: '', model: '', price: '', qty: 1, source: 'Inventory' }]);
  };

  const removeProductRow = (index) => {
    const updated = products.filter((_, i) => i !== index);
    setProducts(updated.length > 0 ? updated : [{ dta: '', brand: '', model: '', price: '', qty: 1, source: 'Inventory' }]);
  };

  const calculateTotal = () => {
    if (txType === 'Exchange') {
      const np = parseFloat(exNewPrice) || 0;
      const op = parseFloat(exOldPrice) || 0;
      return np - op;
    }
    return products.reduce((acc, p) => acc + (parseFloat(p.price) || 0) * (p.qty || 1), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const invoiceTotal = calculateTotal();

    if (paymentMode === 'Mixed') {
      const splitSum = 
        (parseFloat(mixCash) || 0) +
        (parseFloat(mixCard) || 0) +
        (parseFloat(mixTabby) || 0) +
        (parseFloat(mixTamara) || 0) +
        (parseFloat(mixBank) || 0);

      if (Math.abs(splitSum - invoiceTotal) > 0.01) {
        alert(`Error: Mixed splits total (AED ${splitSum}) must match total due (AED ${invoiceTotal})!`);
        return;
      }
    }

    const newInvoice = {
      id: editingBill ? editingBill.id : (Date.now() % 1000000),
      date,
      customer_name: customerName.trim() || 'Walk-in Customer',
      payment_mode: paymentMode,
      transaction_type: txType,
      platform,
      note: note.trim(),
      delivery: delivery ? 1 : 0,
      jenny: jenny ? 1 : 0,
      created_at: editingBill ? editingBill.created_at : (new Date().toISOString().replace('T', ' ').slice(0, 19))
    };

    if (txType === 'Exchange') {
      newInvoice.exch_new_dta = exNewDta.toUpperCase();
      newInvoice.exch_new_brand = exNewBrand;
      newInvoice.exch_new_model = exNewModel;
      newInvoice.exch_new_price = parseFloat(exNewPrice) || 0;
      newInvoice.exch_old_dta = exOldDta.toUpperCase();
      newInvoice.exch_old_brand = exOldBrand;
      newInvoice.exch_old_model = exOldModel;
      newInvoice.exch_old_price = parseFloat(exOldPrice) || 0;
      newInvoice.exch_balance = invoiceTotal;
      newInvoice.price = parseFloat(exNewPrice) || 0;
      newInvoice.source = exNewSource;
      newInvoice.exch_old_source = exOldSource;
    } else {
      newInvoice.price = invoiceTotal;
      newInvoice.products_json = JSON.stringify(products.map(p => ({
        dta: p.dta,
        brand: p.brand,
        model: p.model,
        price: parseFloat(p.price) || 0,
        quantity: p.qty,
        source: p.source
      })));
      if (products.length === 1) {
        newInvoice.dta = products[0].dta;
        newInvoice.brand = products[0].brand;
        newInvoice.model = products[0].model;
        newInvoice.source = products[0].source;
      }
    }

    if (paymentMode === 'Mixed') {
      newInvoice.mixed_cash = parseFloat(mixCash) || 0;
      newInvoice.mixed_card = parseFloat(mixCard) || 0;
      newInvoice.mixed_tabby = parseFloat(mixTabby) || 0;
      newInvoice.mixed_tamara = parseFloat(mixTamara) || 0;
      newInvoice.mixed_bank = parseFloat(mixBank) || 0;
    }

    if (delivery) {
      newInvoice.delivery_phone = '';
      newInvoice.delivery_place = '';
      newInvoice.delivery_address = '';
    }

    setPreviewInvoice(newInvoice);
  };

  const productSourceOptions = [
    'Inventory',
    'Display Piece',
    'QC Piece',
    'Cleaned & Ready Piece',
    'Noon Piece'
  ];

  return (
    <>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        {['Sale', 'Return', 'Exchange'].map(t => (
          <button
            key={t}
            type="button"
            className={`btn ${txType === t ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => setTxType(t)}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="mobile-form-grid">
        <div className="field">
          <label className="field-label">Customer Name</label>
          <input type="text" className="field-input" placeholder="Customer name..." value={customerName} onChange={e => setCustomerName(e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Date</label>
          <input 
            type="date" 
            className="field-input" 
            value={getFormattedInputDate()} 
            onChange={e => handleDateChange(e.target.value)} 
            required 
          />
        </div>
      </div>

      {txType !== 'Exchange' ? (
        <div className="card static" style={{ padding: '14px', background: 'var(--bg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span className="field-label" style={{ color: 'var(--text-primary)' }}>Line Items</span>
            <button type="button" className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={addProductRow}>
              <Plus size={12} /> Add Row
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {products.map((p, idx) => (
              <div key={idx} className="form-row-scroll">
                <div className="form-row-scroll-inner" style={{ display: 'flex', gap: 6, alignItems: 'center', position: 'relative' }}>
                  <div style={{ flex: 2, position: 'relative', minWidth: 120 }}>
                    <input 
                      type="text" 
                      className="field-input" 
                      style={{ width: '100%', padding: '8px 10px', fontSize: '0.8rem' }}
                      placeholder="DTA Code" 
                      value={p.dta} 
                      onChange={e => handleProductDtaChange(idx, e.target.value)}
                      required
                    />
                    {suggestions.index === idx && suggestions.list.length > 0 && (
                      <div style={{
                        background: 'var(--bg-card)',
                        border: '2px solid #000',
                        zIndex: 999,
                        borderRadius: '4px',
                        boxShadow: 'var(--shadow-flat-sm)',
                        maxHeight: '150px',
                        overflowY: 'auto',
                        marginTop: '4px'
                      }}>
                        {suggestions.list.map((item, sIdx) => (
                          <div 
                            key={sIdx}
                            style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid var(--border-light-color)', fontSize: '0.75rem' }}
                            onClick={() => selectSuggestion(idx, item)}
                          >
                            <strong>{item.code}</strong> - {item.brand} {item.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <input type="text" className="field-input" style={{ flex: 2, minWidth: 90, padding: '8px 10px', fontSize: '0.8rem' }} placeholder="Brand" value={p.brand} onChange={e => {
                    const u = [...products]; u[idx].brand = e.target.value; setProducts(u);
                  }} required />
                  
                  <input type="text" className="field-input" style={{ flex: 3, minWidth: 110, padding: '8px 10px', fontSize: '0.8rem' }} placeholder="Model" value={p.model} onChange={e => {
                    const u = [...products]; u[idx].model = e.target.value; setProducts(u);
                  }} required />

                  <input type="number" className="field-input" style={{ flex: 2, minWidth: 80, padding: '8px 10px', fontSize: '0.8rem' }} placeholder="Price" value={p.price} onChange={e => {
                    const u = [...products]; u[idx].price = e.target.value; setProducts(u);
                  }} required />

                  <input type="number" className="field-input" style={{ width: '52px', minWidth: 52, padding: '8px 4px', fontSize: '0.8rem', textAlign: 'center' }} placeholder="Qty" value={p.qty} onChange={e => {
                    const u = [...products]; u[idx].qty = parseInt(e.target.value) || 1; setProducts(u);
                  }} required />

                  <button type="button" className="btn btn-pink" style={{ padding: '8px 10px', minWidth: 36 }} onClick={() => removeProductRow(idx)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card static" style={{ padding: '14px', background: 'var(--bg)' }}>
          <div className="mobile-form-grid">
            <div>
              <span className="field-label" style={{ marginBottom: 8, display: 'block', color: 'var(--purple)' }}>NEW PRODUCT (DISPATCHED)</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    className="field-input" 
                    placeholder="New DTA Code" 
                    value={exNewDta} 
                    onChange={e => handleExNewDtaChange(e.target.value)} 
                    onBlur={handleExNewBlur}
                    style={{ textTransform: 'uppercase' }}
                    required 
                  />
                  {exNewSuggestions.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: '#fff',
                      border: '2px solid #000',
                      borderRadius: '4px',
                      zIndex: 9999,
                      maxHeight: '150px',
                      overflowY: 'auto',
                      boxShadow: '4px 4px 0px #000',
                      marginTop: '4px'
                    }}>
                      {exNewSuggestions.map((prod, sIdx) => (
                        <div
                          key={sIdx}
                          onClick={() => selectExNewSuggestion(prod)}
                          style={{
                            padding: '6px 10px',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            borderBottom: '1px solid #eee',
                            color: '#000',
                            fontFamily: 'var(--font-mono)'
                          }}
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <strong>{prod.code}</strong> - {prod.brand} {prod.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input type="text" className="field-input" placeholder="New Brand" value={exNewBrand} onChange={e => setExNewBrand(e.target.value)} required />
                <input type="text" className="field-input" placeholder="New Model" value={exNewModel} onChange={e => setExNewModel(e.target.value)} required />
                <input type="number" className="field-input" placeholder="New Price (AED)" value={exNewPrice} onChange={e => setExNewPrice(e.target.value)} required />
              </div>
            </div>
            <div>
              <span className="field-label" style={{ marginBottom: 8, display: 'block', color: 'var(--pink)' }}>OLD PRODUCT (TRADE-IN)</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    className="field-input" 
                    placeholder="Old DTA Code" 
                    value={exOldDta} 
                    onChange={e => handleExOldDtaChange(e.target.value)} 
                    onBlur={handleExOldBlur}
                    style={{ textTransform: 'uppercase' }}
                    required 
                  />
                  {exOldSuggestions.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: '#fff',
                      border: '2px solid #000',
                      borderRadius: '4px',
                      zIndex: 9999,
                      maxHeight: '150px',
                      overflowY: 'auto',
                      boxShadow: '4px 4px 0px #000',
                      marginTop: '4px'
                    }}>
                      {exOldSuggestions.map((prod, sIdx) => (
                        <div
                          key={sIdx}
                          onClick={() => selectExOldSuggestion(prod)}
                          style={{
                            padding: '6px 10px',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            borderBottom: '1px solid #eee',
                            color: '#000',
                            fontFamily: 'var(--font-mono)'
                          }}
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <strong>{prod.code}</strong> - {prod.brand} {prod.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input type="text" className="field-input" placeholder="Old Brand" value={exOldBrand} onChange={e => setExOldBrand(e.target.value)} required />
                <input type="text" className="field-input" placeholder="Old Model" value={exOldModel} onChange={e => setExOldModel(e.target.value)} required />
                <input type="number" className="field-input" placeholder="Trade-in Value (AED)" value={exOldPrice} onChange={e => setExOldPrice(e.target.value)} required />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mobile-form-grid">
        <div className="field">
          <label className="field-label">Payment Mode</label>
          <CustomSelect
            disabled={jenny}
            value={paymentMode}
            onChange={setPaymentMode}
            options={[
              { value: 'Cash', label: 'Cash' },
              { value: 'Card', label: 'Card' },
              { value: 'Mixed', label: 'Mixed' },
              { value: 'Tabby', label: 'Tabby' },
              { value: 'Tamara', label: 'Tamara' },
              { value: 'Bank Transfer', label: 'Bank Transfer' },
              { value: 'Payment Link', label: 'Payment Link' },
              { value: 'Nil', label: 'Nil' }
            ]}
            style={{ width: '100%', minWidth: 'unset' }}
          />
        </div>
        <div className="field">
          <label className="field-label">Source Platform</label>
          <CustomSelect
            disabled={jenny}
            value={platform}
            onChange={setPlatform}
            options={[
              { value: 'Regular Customer', label: 'Regular Customer' },
              { value: 'TikTok', label: 'TikTok' },
              { value: 'Instagram', label: 'Instagram' },
              { value: 'Snapchat', label: 'Snapchat' },
              { value: 'Facebook', label: 'Facebook' },
              { value: 'WhatsApp', label: 'WhatsApp' },
              { value: 'Walk-in', label: 'Walk-in' }
            ]}
            style={{ width: '100%', minWidth: 'unset' }}
          />
        </div>
      </div>

      {paymentMode === 'Mixed' && (
        <div className="card static" style={{ padding: '12px 14px', background: 'var(--orange-soft)' }}>
          <span className="field-label" style={{ marginBottom: 10, display: 'block' }}>Mixed Splits (AED)</span>
          <div className="mobile-form-grid-5">
            <input type="number" className="field-input" style={{ padding: '6px' }} placeholder="Cash" value={mixCash} onChange={e => setMixCash(e.target.value)} />
            <input type="number" className="field-input" style={{ padding: '6px' }} placeholder="Card" value={mixCard} onChange={e => setMixCard(e.target.value)} />
            <input type="number" className="field-input" style={{ padding: '6px' }} placeholder="Tabby" value={mixTabby} onChange={e => setMixTabby(e.target.value)} />
            <input type="number" className="field-input" style={{ padding: '6px' }} placeholder="Tamara" value={mixTamara} onChange={e => setMixTamara(e.target.value)} />
            <input type="number" className="field-input" style={{ padding: '6px' }} placeholder="Bank" value={mixBank} onChange={e => setMixBank(e.target.value)} />
          </div>
        </div>
      )}

      <div className="mobile-form-grid">
        <div className="card static card-p-sm" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input 
            type="checkbox" 
            id="modal-delivery-check" 
            checked={delivery} 
            onChange={e => {
              const isChecked = e.target.checked;
              setDelivery(isChecked);
              if (isChecked) {
                setPaymentMode('Nil');
              }
            }} 
          />
          <label htmlFor="modal-delivery-check" style={{ fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>Require Shipping / Delivery?</label>
        </div>
        <div className="card static card-p-sm" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input 
            type="checkbox" 
            id="modal-jenny-check" 
            checked={jenny} 
            onChange={e => {
              const isChecked = e.target.checked;
              setJenny(isChecked);
              if (isChecked) {
                setPaymentMode('Nil');
              }
            }} 
          />
          <label htmlFor="modal-jenny-check" style={{ fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', color: 'var(--pink)' }}>Jenny Promoted Sale?</label>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Notes</label>
        <textarea className="field-input" rows="2" placeholder="Invoice notes..." value={note} onChange={e => setNote(e.target.value)} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 10, padding: '14px 0 0', borderTop: '2px dashed rgba(0,0,0,0.1)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1rem' }}>TOTAL DUE:</span>
        <span style={{ 
          background: 'var(--bg-dark)', 
          color: 'var(--citrus)', 
          padding: '6px 16px', 
          marginLeft: 12, 
          border: '2px solid #000',
          fontFamily: 'var(--font-mono)',
          fontWeight: 800,
          fontSize: '1.25rem',
          boxShadow: 'var(--shadow-flat-sm)'
        }}>
          AED {calculateTotal()}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
          {editingBill ? 'Save Changes' : 'Submit Sales Invoice'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
      </div>
      </form>

      <AnimatePresence>
        {previewInvoice && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            backdropFilter: 'blur(4px)'
          }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card"
              style={{
                width: '100%',
                maxWidth: '440px',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                padding: '24px 20px',
                fontFamily: 'var(--font-sans)',
                border: 'var(--border)',
                boxShadow: 'var(--shadow-flat)',
                borderRadius: 'var(--radius-md)',
                maxHeight: '90dvh',
                overflowY: 'auto'
              }}
            >
              {/* Card Header details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)' }}>Invoice Draft</h3>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>TRANSACTION PREVIEW</span>
                </div>
                <div style={{
                  background: previewInvoice.transaction_type === 'Return' ? 'var(--pink)' : 'var(--citrus)',
                  color: previewInvoice.transaction_type === 'Return' ? '#fff' : '#000',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase'
                }}>
                  {previewInvoice.transaction_type}
                </div>
              </div>

              {/* Meta Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: 'var(--bg)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light-color)', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>CUSTOMER</div>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>{previewInvoice.customer_name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>DATE</div>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>{previewInvoice.date}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>PAYMENT MODE</div>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>{previewInvoice.payment_mode}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>SOURCE PLATFORM</div>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>{previewInvoice.platform}</div>
                </div>
              </div>

              {/* Mixed splits details */}
              {previewInvoice.payment_mode === 'Mixed' && (
                <div style={{ padding: '8px 12px', background: 'var(--orange-soft)', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {previewInvoice.mixed_cash > 0 && <span><strong>Cash:</strong> AED {previewInvoice.mixed_cash}</span>}
                  {previewInvoice.mixed_card > 0 && <span><strong>Card:</strong> AED {previewInvoice.mixed_card}</span>}
                  {previewInvoice.mixed_tabby > 0 && <span><strong>Tabby:</strong> AED {previewInvoice.mixed_tabby}</span>}
                  {previewInvoice.mixed_tamara > 0 && <span><strong>Tamara:</strong> AED {previewInvoice.mixed_tamara}</span>}
                  {previewInvoice.mixed_bank > 0 && <span><strong>Bank:</strong> AED {previewInvoice.mixed_bank}</span>}
                </div>
              )}

              {/* Note / Shipping Tags */}
              {(previewInvoice.note || previewInvoice.delivery === 1 || previewInvoice.jenny === 1) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.72rem', marginBottom: 16, borderBottom: '1px solid var(--border-light-color)', paddingBottom: 12 }}>
                  {previewInvoice.note && <div><strong>Notes:</strong> {previewInvoice.note}</div>}
                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    {previewInvoice.delivery === 1 && <span style={{ background: 'var(--purple-soft)', color: 'var(--purple)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>🚚 SHIPPING REQ</span>}
                    {previewInvoice.jenny === 1 && <span style={{ background: 'var(--pink-soft)', color: 'var(--pink)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>⚡ JENNY PROM</span>}
                  </div>
                </div>
              )}

              {/* Items List */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>Items Invoice Details</div>
                {previewInvoice.transaction_type === 'Exchange' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Dispatched */}
                    <div style={{ border: '1px solid var(--border-light-color)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--purple)', display: 'block' }}>DISPATCHED (NEW)</span>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>{previewInvoice.exch_new_brand} {previewInvoice.exch_new_model}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', margin: '4px 0' }}>DTA: {previewInvoice.exch_new_dta}</div>
                      <div style={{ textAlign: 'right', fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.85rem' }}>AED {previewInvoice.exch_new_price}</div>
                    </div>
                    {/* Trade-in */}
                    <div style={{ border: '1px solid var(--border-light-color)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--pink)', display: 'block' }}>TRADE-IN (OLD)</span>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>{previewInvoice.exch_old_brand} {previewInvoice.exch_old_model}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', margin: '4px 0' }}>DTA: {previewInvoice.exch_old_dta}</div>
                      <div style={{ textAlign: 'right', fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.85rem' }}>AED {previewInvoice.exch_old_price}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {JSON.parse(previewInvoice.products_json || '[]').map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light-color)', paddingBottom: 8 }}>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.8rem' }}>{item.brand} {item.model}</div>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 2 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>DTA: {item.dta}</span>
                            <span style={{ fontSize: '0.68rem', background: 'var(--bg)', border: '1px solid var(--border-light-color)', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>QTY: {item.quantity}</span>
                          </div>
                        </div>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                          AED {item.price * item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total Calculation block - VAT Removed */}
              <div style={{
                background: 'var(--bg-dark)',
                color: 'var(--citrus)',
                padding: '14px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '2px solid #000',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20
              }}>
                <span style={{ fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.05em' }}>AMOUNT TO PAY</span>
                <span style={{ fontWeight: 900, fontSize: '1.25rem', fontFamily: 'var(--font-mono)' }}>AED {previewInvoice.price}</span>
              </div>

              {/* Confirmation Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
                  onClick={() => {
                    onSave(previewInvoice);
                    setPreviewInvoice(null);
                  }}
                >
                  Confirm & Save
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
                  onClick={() => setPreviewInvoice(null)}
                >
                  Back to Edit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

/* =========================================================
   SIDEBAR DEFINITION
   ========================================================= */

const NAV = [
  {
    group: 'MAIN',
    items: [
      { id: 'today-bill',       label: "Today's Bill",      icon: FileText },
      { id: 'sales-history',    label: 'Sales History',     icon: Clock },
      { id: 'product-db',       label: 'Product Database',  icon: Database },
      { id: 'display-pieces',   label: 'Display Pieces',    icon: Monitor },
      { id: 'deliveries',       label: 'Deliveries',        icon: Truck },
      { id: 'warranty-claims',  label: 'Warranty Claims',   icon: Shield },
      { id: 'customer-crm',     label: 'Customer CRM',      icon: Users },
    ]
  },

  {
    group: 'WHATSAPP CATALOG',
    items: [
      { id: 'whatsapp-catalog', label: '💻 WhatsApp Price List', icon: ShoppingBag },
    ]
  },

  {
    group: 'ANALYTICS',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      {
        id: 'marketing', label: 'Marketing', icon: Megaphone,
        sub: [
          { id: 'mkt-platforms', label: 'Platforms Compare' },
          { id: 'mkt-purchase',  label: 'Purchase Compare' },
        ]
      },
    ]
  },
  {
    group: 'ADMINISTRATION',
    items: [
      { id: 'staff-accounts', label: 'Staff Accounts', icon: Users },
    ]
  },
];

/* =========================================================
   SIDEBAR
   ========================================================= */

function Sidebar({ active, onSelect, onLogout, isStrapiOnline, isOpen, onClose, pendingBills = [], isHovered, onHoverChange }) {
  const [mktHovered, setMktHovered] = useState(false);
  const [mktClickOpen, setMktClickOpen] = useState(true);

  const [isMobileSize, setIsMobileSize] = useState(() => {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileSize(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeNav = NAV;

  const isActive = (id) => active === id;
  const isSubActive = (sub) => sub?.some(s => s.id === active);

  const handleItemSelect = (id) => {
    onSelect(id);
    if (onClose) onClose();
  };

  const isMktSubActive = isSubActive([
    { id: 'mkt-platforms' },
    { id: 'mkt-purchase' }
  ]);

  const showSubmenu = isHovered && (mktHovered || isMktSubActive || mktClickOpen);

  return (
    <aside 
      className={`sidebar ${isOpen ? 'mobile-open' : ''}`}
      onMouseEnter={() => onHoverChange && onHoverChange(true)}
      onMouseLeave={() => onHoverChange && onHoverChange(false)}
    >
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">B<span className="logo-extra">/OLOGY</span></div>
        <span className="sidebar-logo-name">Buyology</span>
      </div>

      <nav className="sidebar-nav">
        {activeNav.map((section) => (
          <div key={section.group} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div className="nav-section-label">{section.group}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              if (item.sub) {
                return (
                  <div 
                    key={item.id}
                    onMouseEnter={() => setMktHovered(true)}
                    onMouseLeave={() => setMktHovered(false)}
                  >
                    <button
                      className={`nav-item ${isSubActive(item.sub) ? 'active' : ''}`}
                      onClick={() => setMktClickOpen(!mktClickOpen)}
                      style={{ justifyContent: 'space-between' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon size={17} />
                        <span>{item.label}</span>
                      </div>
                      <motion.span animate={{ rotate: showSubmenu ? 90 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronRight size={14} />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {showSubmenu && (
                        <motion.div
                          className="nav-submenu"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                          style={{ overflow: 'hidden' }}
                        >
                          {item.sub.map(sub => (
                            <button
                              key={sub.id}
                              className={`nav-subitem ${isActive(sub.id) ? 'active' : ''}`}
                              onClick={() => handleItemSelect(sub.id)}
                            >
                              <span style={{ fontSize: '1rem', lineHeight: 1 }}>·</span>
                              <span>{sub.label}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }
              return (
                <button
                  key={item.id}
                  className={`nav-item ${isActive(item.id) ? 'active' : ''}`}
                  onClick={() => handleItemSelect(item.id)}
                >
                  <Icon size={17} className="nav-icon" />
                  <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                  {item.id === 'pending-imports' && pendingBills.length > 0 && (
                    <span 
                      className="badge-imports"
                      style={{ 
                        background: 'var(--cyan, #06b6d4)', 
                        color: '#000', 
                        fontSize: '0.68rem', 
                        fontWeight: 800, 
                        padding: '2px 7px', 
                        borderRadius: '50px',
                        fontFamily: 'var(--font-mono)',
                        lineHeight: 1
                      }}
                    >
                      {pendingBills.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', marginBottom: 10 }}>
          <span className={`status-dot ${isStrapiOnline ? 'online' : 'offline'}`} />
          <span style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em' }}>
            {isStrapiOnline ? 'STRAPI CONNECTED' : 'MOCK SANDBOX'}
          </span>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

/* =========================================================
   PDF INVOICE PARSING HELPERS
   ========================================================= */

const parseInvoicePdf = async (file, productsList, setProductsList) => {
  // Set the worker locally from our public directory
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  
  const reader = new FileReader();
  
  const arrayBuffer = await new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  // 1. Get first page content
  const page = await pdf.getPage(1);
  const textContent = await page.getTextContent();
  
  // Separate items into columns by X coordinate (middle is around 260) for header (Y > 350)
  const leftItems = [];
  const rightItems = [];
  
  for (const item of textContent.items) {
    if (!item.str || !item.str.trim()) continue;
    const x = item.transform[4];
    const y = item.transform[5];
    if (y > 350) {
      if (x < 260) {
        leftItems.push(item);
      } else {
        rightItems.push(item);
      }
    } else {
      leftItems.push(item);
    }
  }

  // Reconstruct lines helper
  const reconstruct = (items) => {
    const lineMap = {};
    for (const item of items) {
      const y = Math.round(item.transform[5] * 10) / 10;
      let foundY = Object.keys(lineMap).find(k => Math.abs(parseFloat(k) - y) < 4);
      if (!foundY) {
        foundY = y.toString();
        lineMap[foundY] = [];
      }
      lineMap[foundY].push(item);
    }
    const sortedY = Object.keys(lineMap).sort((a, b) => parseFloat(b) - parseFloat(a));
    return sortedY.map(yKey => {
      const itemsOnLine = lineMap[yKey];
      itemsOnLine.sort((a, b) => a.transform[4] - b.transform[4]);
      return itemsOnLine.map(item => item.str).join(' ').trim();
    }).filter(Boolean);
  };

  const leftLines = reconstruct(leftItems);
  const rightLines = reconstruct(rightItems);
  const allLines = [...leftLines, ...rightLines];
  
  console.log("Parsed PDF leftLines:", leftLines);
  console.log("Parsed PDF rightLines:", rightLines);
  console.log("Parsed PDF allLines:", allLines);

  // A. Extract Customer Name from Left column
  let customerName = 'Walk-in Customer';
  const billingIdx = leftLines.findIndex(l => 
    l.includes('BILLING ADDRESS') || 
    l.includes('رة ﻮ ﺗ ﺎ ﻔ ﻟ ا ان ﻮ ﻨ ﻋ') || 
    l.includes('رةﻮﺗﺎﻔﻟا انﻮﻨﻋ')
  );
  if (billingIdx !== -1 && leftLines[billingIdx + 1]) {
    const candidate = leftLines[billingIdx + 1].trim();
    if (!candidate.startsWith('Ph.') && !candidate.startsWith('TRN') && !candidate.startsWith('Ph')) {
      customerName = candidate;
    }
  }

  // B. Extract Invoice Date from Right column
  let invoiceDate = '';
  const dateIdx = rightLines.findIndex(l => 
    l.includes('INVOICE DATE') || 
    l.includes('ﺦ ﻳ ر ﺎ ﺗ') || 
    l.includes('ﺦﻳرﺎﺗ')
  );
  if (dateIdx !== -1) {
    for (let offset = 1; offset <= 3; offset++) {
      const candidate = rightLines[dateIdx + offset] || '';
      const dateMatch = candidate.match(/(\d{2}-\d{2}-\d{4})/);
      if (dateMatch) {
        invoiceDate = dateMatch[1];
        break;
      }
    }
  }

  // C. Extract Grand Total
  let grandTotal = 0;
  for (const line of allLines) {
    if (line.includes('Grand Total') || line.includes('يلﻜﻟا يلﺎﻤﺟﻹا') || line.includes('يل ﻜ ﻟ ا يل ﺎ ﻤ ﺟ ﻹ ا')) {
      const match = line.match(/(\d+[\d,]*\.\d{2})/);
      if (match) {
        grandTotal = parseFloat(match[1].replace(/,/g, ''));
        break;
      }
    }
  }

  // D. Extract Quantity
  let totalQty = 1;
  for (const line of allLines) {
    if (line.toLowerCase().includes('total quantity')) {
      const match = line.match(/(\d+(?:\.\d+)?)/);
      if (match) {
        totalQty = parseFloat(match[1]) || 1;
        break;
      }
    }
  }

  // E. Extract DTA Code
  const fullText = allLines.join('\n');
  const dtaMatches = fullText.match(/DTA\d+/i);
  const dtaCode = dtaMatches ? dtaMatches[0].toUpperCase() : 'DTA-UNKNOWN';

  // F. Extract description
  let lineDesc = '';
  for (const line of allLines) {
    if (line.toUpperCase().includes(dtaCode)) {
      const idx = line.toUpperCase().indexOf(dtaCode);
      lineDesc = line.substring(idx + dtaCode.length).trim();
      break;
    }
  }

  // Clean description
  let cleanDesc = lineDesc;
  if (cleanDesc.startsWith('|')) cleanDesc = cleanDesc.substring(1).trim();
  const pipeIdx = cleanDesc.indexOf('|');
  const shortModel = pipeIdx !== -1 ? cleanDesc.substring(0, pipeIdx).trim() : cleanDesc;

  const brand = shortModel.split(' ')[0] || 'Generic';
  const model = shortModel.trim() || 'Imported Product';

  // Cross-reference existing products
  let matchedProduct = productsList.find(p => p.code && p.code.toUpperCase() === dtaCode);
  const pricePerUnit = grandTotal ? (grandTotal / totalQty) : 0;

  if (!matchedProduct && dtaCode !== 'DTA-UNKNOWN') {
    matchedProduct = {
      code: dtaCode,
      name: model,
      brand: brand,
      qty: 15,
      price: pricePerUnit
    };
    setProductsList(prev => [...prev, matchedProduct]);
  }

  return {
    customerName,
    invoiceDate,
    products: [{
      dta: dtaCode,
      brand: matchedProduct ? matchedProduct.brand : brand,
      model: matchedProduct ? matchedProduct.name : model,
      price: pricePerUnit.toString(),
      qty: totalQty,
      source: 'Inventory'
    }]
  };
};

/* =========================================================
   PANEL: TODAY'S BILL
   ========================================================= */

function TodayBillPanel({ billsList, setBillsList, productsList, setProductsList }) {
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [prefilledData, setPrefilledData] = useState(null);

  const billOrderMap = useMemo(() => {
    const sorted = [...billsList].sort((a, b) => {
      const parseDate = (str) => {
        if (!str) return new Date(0);
        const parts = str.split('-');
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      };
      const diff = parseDate(a.date) - parseDate(b.date);
      if (diff !== 0) return diff;
      return (a.id || 0) - (b.id || 0);
    });
    const map = {};
    sorted.forEach((b, idx) => {
      map[b.id] = idx + 1;
    });
    return map;
  }, [billsList]);

  const handleDeleteBill = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        const res = await fetch(getApiUrl(`/api/bills/${id}`), {
          method: 'DELETE'
        });
        if (res.ok) {
          setBillsList(billsList.filter(b => b.id !== id));
        } else {
          alert("Failed to delete from database.");
        }
      } catch (err) {
        console.error("Error deleting bill:", err);
      }
    }
  };

  const todayStr = () => {
    const t = new Date();
    const dd = String(t.getDate()).padStart(2, '0');
    const mm = String(t.getMonth() + 1).padStart(2, '0');
    const yyyy = t.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const todaysBills = billsList.filter(b => b.date === todayStr());
  
  const total = todaysBills.reduce((acc, b) => {
    if (b.jenny === true || b.jenny === 'true' || b.jenny === 1 || Number(b.jenny) === 1) return acc;
    if (b.transaction_type === 'Void') return acc;
    if (b.transaction_type === 'Return') return acc - (b.price || 0);
    if (b.transaction_type === 'Exchange') return acc + (b.exch_balance || 0);
    return acc + (b.price || 0);
  }, 0);

  const todaysBillsCount = todaysBills.reduce((acc, b) => {
    if (b.jenny === true || b.jenny === 'true' || b.jenny === 1 || Number(b.jenny) === 1) return acc;
    if (b.transaction_type === 'Void' || b.transaction_type === 'Exchange' || b.transaction_type === 'Return') return acc;
    return acc + 1;
  }, 0);

  const handleAddInvoice = async (newInvoice) => {
    try {
      if (editingBill) {
        const res = await fetch(getApiUrl(`/api/bills/${editingBill.id}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newInvoice)
        });
        if (res.ok) {
          setBillsList(billsList.map(b => b.id === editingBill.id ? { ...newInvoice, id: editingBill.id } : b));
        } else {
          alert('Warning: Could not update invoice in database. Please check your connection.');
        }
      } else {
        const res = await fetch(getApiUrl('/api/bills'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newInvoice)
        });
        if (res.ok) {
          const respData = await res.json();
          setBillsList([{ ...newInvoice, id: respData.id }, ...billsList]);
        } else {
          alert('Warning: Could not save invoice to database. Please check your connection.');
        }
      }
    } catch (err) {
      // Backend offline — add to local state with temp ID so it shows in UI
      console.error('Backend offline, invoice saved locally:', err);
      if (!editingBill) {
        const tempId = Date.now();
        const localBill = { ...newInvoice, id: tempId, _offline: true };
        setBillsList(prev => [localBill, ...prev]);
        alert('Warning: Backend is offline. Invoice is shown locally but NOT saved to the database. Please restart the backend and re-add this invoice.');
      }
    }
    setShowForm(false);
    setEditingBill(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingBill(null);
  };

  if (showForm) {
    return (
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
        <div className="page-title">{editingBill ? 'Edit Sales Invoice' : "Today's Bill"}</div>
        <div className="page-subtitle">{editingBill ? `Editing Invoice TXID: ${editingBill.id}` : 'New Sales Terminal Session'}</div>
        <div className="card card-p-lg static" style={{ border: '2px solid #000' }}>
          <SalesInvoiceForm 
            onSave={handleAddInvoice} 
            onClose={() => { handleCancelForm(); setPrefilledData(null); }} 
            productsList={productsList} 
            editingBill={editingBill}
            prefilledData={prefilledData}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="page-title">Today's Bill</div>
      <div className="page-subtitle">Invoice terminal — current session charges</div>

      <div className="stats-grid">
        <StatCard label="Total Due" value={total} prefix="AED " icon={DollarSign} iconBg="var(--citrus)" delay={0} chartData={[120,150,130,200,180,220,total]} chartColor="#d8ff36" />
        <StatCard label="Items on Bill" value={todaysBillsCount} icon={FileText} iconBg="var(--cyan-soft)" delay={0.05} trend="up" trendVal="+2" />
        <StatCard label="Tax (VAT 5%)" value={Math.round(total * 0.05)} prefix="AED " icon={BarChart2} iconBg="var(--purple-soft)" delay={0.1} />
      </div>

      <div className="card card-p-lg static" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Today's Transaction Log</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <input 
              type="file" 
              accept=".pdf" 
              id="today-import-pdf" 
              style={{ display: 'none' }} 
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const result = await parseInvoicePdf(file, productsList, setProductsList);
                  setPrefilledData(result);
                  setShowForm(true);
                } catch (err) {
                  alert("Failed to parse PDF invoice. Ensure it is a valid PDF.");
                  console.error(err);
                }
              }}
            />
            <button 
              type="button" 
              className="btn btn-ghost" 
              onClick={() => document.getElementById('today-import-pdf').click()}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Upload size={14} /> Import PDF Invoice
            </button>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={14} /> Add Sales Invoice
            </button>
          </div>
        </div>
        
        {todaysBills.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
            No transactions recorded today. Click the button above to log a sale.
          </div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Order No</th><th>Customer</th><th>Product</th><th>Type</th><th>MOP</th><th>Total</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {todaysBills.map(b => (
                  <tr key={b.id}>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>#{billOrderMap[b.id] || b.id}</span></td>
                    <td style={{ fontWeight: 600 }}>
                      {b.customer_name || 'Walk-in'}
                      {b.jenny === 1 && (
                        <span className="badge badge-pink" style={{ fontSize: '0.58rem', padding: '1px 4px', marginLeft: 6 }}>JENNY</span>
                      )}
                      {b.delivery === 1 && (
                        <span className="badge" style={{ 
                          fontSize: '0.58rem', 
                          padding: '1px 4px', 
                          marginLeft: 6,
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: 'var(--green, #10b981)',
                          border: '1px solid rgba(16, 185, 129, 0.25)',
                          borderRadius: '4px',
                          fontWeight: 700
                        }}>
                          DELIVERY
                        </span>
                      )}
                    </td>
                    <td>{b.model ? b.model.split('|')[0] : 'Multi-product'}</td>
                    <td><span className={`badge ${b.transaction_type === 'Return' ? 'badge-pink' : b.transaction_type === 'Exchange' ? 'badge-citrus' : 'badge-green'}`}>{b.transaction_type}</span></td>
                    <td>{b.payment_mode}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>AED {b.price}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => {
                          setEditingBill(b);
                          setShowForm(true);
                        }}>
                          Edit
                        </button>
                        <button 
                          type="button"
                          className="btn btn-ghost" 
                          style={{ padding: '4px 10px', fontSize: '0.72rem', borderColor: 'var(--yellow-green)' }} 
                          onClick={() => window.open(`/api/bills/${b.id}/pdf`, '_blank')}
                        >
                          PDF
                        </button>
                        <button className="btn btn-pink" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => handleDeleteBill(b.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   PANEL: SALES HISTORY
   ========================================================= */

function SalesHistoryPanel({ billsList, setBillsList, productsList, setProductsList }) {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [txTypeFilter, setTxTypeFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [prefilledData, setPrefilledData] = useState(null);
  const [dateFilter, setDateFilter] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('ALL');

  const latestMonthStr = useMemo(() => {
    if (!billsList || billsList.length === 0) {
      const now = new Date();
      return `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
    }
    let latestDate = null;
    let latestMonth = '';
    billsList.forEach(b => {
      if (!b.date) return;
      const parts = b.date.split('-');
      if (parts.length === 3) {
        const [d, m, y] = parts;
        const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        if (!latestDate || dateObj > latestDate) {
          latestDate = dateObj;
          latestMonth = `${m}-${y}`;
        }
      }
    });
    return latestMonth;
  }, [billsList]);

  const monthLabel = (mVal) => {
    if (!mVal) return '';
    const [m, y] = mVal.split('-');
    const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${names[parseInt(m) - 1]} ${y}`;
  };

  // Dynamic calendar months in DB for Transaction Log
  const uniqueMonths = useMemo(() => {
    const monthsSet = new Set();
    billsList.forEach(b => {
      if (!b.date) return;
      const parts = b.date.split('-');
      if (parts.length === 3) {
        monthsSet.add(`${parts[1]}-${parts[2]}`);
      }
    });
    const monthsArray = Array.from(monthsSet).sort((a, b) => {
      const [mA, yA] = a.split('-').map(Number);
      const [mB, yB] = b.split('-').map(Number);
      if (yA !== yB) return yB - yA;
      return mB - mA;
    });
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const mapped = monthsArray.map(my => {
      const [m, y] = my.split('-');
      return {
        value: my,
        label: `${monthNames[parseInt(m) - 1]} ${y}`
      };
    });
    return [
      { value: 'ALL', label: 'All Months' },
      ...mapped
    ];
  }, [billsList]);

  const billOrderMap = useMemo(() => {
    const sorted = [...billsList].sort((a, b) => {
      const parseDate = (str) => {
        if (!str) return new Date(0);
        const parts = str.split('-');
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      };
      const diff = parseDate(a.date) - parseDate(b.date);
      if (diff !== 0) return diff;
      return (a.id || 0) - (b.id || 0);
    });
    const map = {};
    sorted.forEach((b, idx) => {
      map[b.id] = idx + 1;
    });
    return map;
  }, [billsList]);

  const handleExportPDF = () => {
    let queryStr = '';
    if (dateFilter) {
      const parts = dateFilter.split('-');
      if (parts.length === 3) {
        queryStr = `?date=${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    window.open(`/api/export-pdf${queryStr}`, '_blank');
  };

  const handleDeleteBill = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction from archive?")) {
      try {
        const res = await fetch(getApiUrl(`/api/bills/${id}`), {
          method: 'DELETE'
        });
        if (res.ok) {
          setBillsList(billsList.filter(b => b.id !== id));
        } else {
          alert("Failed to delete from database.");
        }
      } catch (err) {
        console.error("Error deleting bill:", err);
      }
    }
  };

  const handleAddInvoice = async (newInvoice) => {
    try {
      if (editingBill) {
        const res = await fetch(getApiUrl(`/api/bills/${editingBill.id}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newInvoice)
        });
        if (res.ok) {
          setBillsList(billsList.map(b => b.id === editingBill.id ? { ...newInvoice, id: editingBill.id } : b));
        } else {
          alert('Warning: Could not update invoice in database. Please check your connection.');
        }
      } else {
        const res = await fetch(getApiUrl('/api/bills'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newInvoice)
        });
        if (res.ok) {
          const respData = await res.json();
          setBillsList([{ ...newInvoice, id: respData.id }, ...billsList]);
        } else {
          alert('Warning: Could not save invoice to database. Please check your connection.');
        }
      }
    } catch (err) {
      // Backend offline — add to local state with temp ID so it shows in UI
      console.error('Backend offline, invoice saved locally:', err);
      if (!editingBill) {
        const tempId = Date.now();
        const localBill = { ...newInvoice, id: tempId, _offline: true };
        setBillsList(prev => [localBill, ...prev]);
        alert('Warning: Backend is offline. Invoice is shown locally but NOT saved to the database. Please restart the backend and re-add this invoice.');
      }
    }
    setShowForm(false);
    setEditingBill(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingBill(null);
  };

  const statusBadge = (s) => {
    if (s === 'Return') return 'badge-pink';
    if (s === 'Exchange') return 'badge-citrus';
    if (s === 'Void') return 'badge-gray';
    return 'badge-green';
  };

  // Filter and Search logic
  const filtered = billsList.filter(b => {
    const matchesSearch = 
      (b.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.dta || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.brand || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.model || '').toLowerCase().includes(search.toLowerCase()) ||
      String(b.id).includes(search);

    const matchesType = filter === 'ALL' || b.payment_mode === filter;

    const matchesTxType = txTypeFilter === 'ALL' || b.transaction_type === txTypeFilter;

    let matchesDate = true;
    if (dateFilter) {
      const parts = dateFilter.split('-'); // [YYYY, MM, DD]
      if (parts.length === 3) {
        const formattedFilterDate = `${parts[2]}-${parts[1]}-${parts[0]}`; // DD-MM-YYYY
        matchesDate = b.date === formattedFilterDate;
      }
    }

    let matchesMonth = true;
    if (selectedMonth !== 'ALL') {
      if (dateFilter) {
        matchesMonth = true; // override month filter since we have a specific date search
      } else if (b.date) {
        const parts = b.date.split('-');
        if (parts.length === 3) {
          const targetMonth = selectedMonth === 'LATEST' ? latestMonthStr : selectedMonth;
          matchesMonth = `${parts[1]}-${parts[2]}` === targetMonth;
        }
      }
    }

    return matchesSearch && matchesType && matchesTxType && matchesDate && matchesMonth;
  });

  // Sort filtered by date descending (newest first) and then by ID descending
  const sortedFiltered = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const parseDate = (str) => {
        if (!str) return new Date(0);
        const parts = str.split('-');
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      };
      const diff = parseDate(b.date) - parseDate(a.date);
      if (diff !== 0) return diff;
      return (b.id || 0) - (a.id || 0);
    });
  }, [filtered]);

  const displayed = useMemo(() => {
    return sortedFiltered.slice(0, 80);
  }, [sortedFiltered]);

  // Breakdown counts of filtered bills (excluding Jenny from counts)
  const filteredBreakdown = useMemo(() => {
    let sales = 0;
    let returns = 0;
    let exchanges = 0;
    let voids = 0;
    let jennys = 0;
    filtered.forEach(b => {
      const isJenny = b.jenny === true || b.jenny === 'true' || b.jenny === 1;
      if (b.transaction_type === 'Void') voids++;
      else if (b.transaction_type === 'Return') returns++;
      else if (b.transaction_type === 'Exchange') exchanges++;
      else {
        sales++;
        if (isJenny) jennys++;
      }
    });
    return { sales, returns, exchanges, voids, jennys, net: sales - returns - jennys };
  }, [filtered]);

  // Compute stats dynamically from filtered list (Excluding Jenny, Subtracting Returns & Adding Exchange Balances)
  const totalRevenue = filtered.reduce((acc, bill) => {
    if (bill.jenny === true || bill.jenny === 'true' || bill.jenny === 1 || Number(bill.jenny) === 1) return acc;
    if (bill.transaction_type === 'Void') return acc;
    if (bill.transaction_type === 'Return') return acc - (bill.price || 0);
    if (bill.transaction_type === 'Exchange') return acc + (bill.exch_balance || 0);
    return acc + (bill.price || 0);
  }, 0);

  const totalTransactions = filtered.reduce((acc, b) => {
    if (b.jenny === true || b.jenny === 'true' || b.jenny === 1 || Number(b.jenny) === 1) return acc;
    if (b.transaction_type === 'Void' || b.transaction_type === 'Exchange' || b.transaction_type === 'Return') return acc;
    return acc + 1;
  }, 0);
  const avgOrderValue = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;

  // Returns, Exchanges, Refunds count
  const totalReturns    = filtered.filter(b => b.transaction_type === 'Return' && !(b.jenny === true || b.jenny === 'true' || b.jenny === 1)).length;
  const totalExchanges  = filtered.filter(b => b.transaction_type === 'Exchange' && !(b.jenny === true || b.jenny === 'true' || b.jenny === 1)).length;
  const totalRefunds    = totalReturns + totalExchanges; // combined

  // Jenny promoted sales count
  const totalJennySales = filtered.filter(b => b.jenny === true || b.jenny === 'true' || b.jenny === 1).length;

  if (showForm) {
    return (
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
        <div className="page-title">{editingBill ? 'Edit Sales Invoice' : 'Add Sales Invoice'}</div>
        <div className="page-subtitle">{editingBill ? `Editing Invoice TXID: ${editingBill.id}` : 'Create Sales Invoice Terminal'}</div>
        <div className="card card-p-lg static" style={{ border: '2px solid #000' }}>
          <SalesInvoiceForm 
            onSave={handleAddInvoice} 
            onClose={() => { handleCancelForm(); setPrefilledData(null); }} 
            productsList={productsList} 
            editingBill={editingBill}
            prefilledData={prefilledData}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="page-title">Sales History</div>
      <div className="page-subtitle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <span>
          {selectedMonth === 'ALL' ? (
            `Transaction archive — showing all recorded sales events (Total: ${filtered.length} of ${billsList.length})`
          ) : (
            `Transaction archive — showing sales for ${monthLabel(selectedMonth === 'LATEST' ? latestMonthStr : selectedMonth)} (Total: ${filtered.length} of ${billsList.length} total)`
          )}
        </span>
        <span style={{ fontSize: '0.78rem', color: 'var(--citrus)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
          [ {filteredBreakdown.sales} Sales ({filteredBreakdown.jennys} Jenny Excluded) · {filteredBreakdown.exchanges} Exchanges (+Balance) · {filteredBreakdown.returns} Returns (-Deducted) ]
        </span>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Revenue" value={totalRevenue} prefix="AED " icon={DollarSign} iconBg="var(--citrus)" trend="up" trendVal="+12.4%" chartData={[32000, 38000, 41000, 45000, 50000, 52000, totalRevenue]} chartColor="#d8ff36" />
        <StatCard label="Transactions" value={totalTransactions} icon={ShoppingBag} iconBg="var(--green-soft)" trend="up" trendVal="+8" chartData={[95, 102, 108, 112, 119, 124, totalTransactions]} chartColor="#10b981" />
        <StatCard label="Avg Order Value" value={avgOrderValue} prefix="AED " icon={TrendingUp} iconBg="var(--purple-soft)" trend="up" trendVal="+$12" chartData={[380, 395, 402, 410, 420, 424, avgOrderValue]} chartColor="#8b5cf6" />
        <StatCard
          label="Returns / Exchanges"
          value={totalRefunds}
          suffix={`(${totalReturns} Returns · ${totalExchanges} Exchanges)`}
          icon={RotateCcw}
          iconBg="rgba(255,0,127,0.15)"
          trend={totalRefunds > 5 ? 'down' : 'up'}
          trendVal={`${totalReturns} Returns, ${totalExchanges} Exchanges`}
          chartData={[2, 3, 1, 4, 2, 3, totalRefunds]}
          chartColor="#ff007f"
        />
        <StatCard
          label="Jenny Sales"
          value={totalJennySales}
          icon={Heart}
          iconBg="rgba(236,72,153,0.15)"
          trend="up"
          trendVal={`${totalJennySales} promoted`}
          chartData={[1, 2, 3, 2, 4, 3, totalJennySales]}
          chartColor="#ec4899"
        />
      </div>

      <div className="card card-p-lg static">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Transaction Log</h3>
          
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button 
              type="button" 
              className="btn btn-ghost" 
              style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={handleExportPDF}
            >
              <FileText size={12} /> Export PDF Report
            </button>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={14} /> Add Sales Invoice
            </button>
          </div>
        </div>

        {/* Dedicated Filter Bar */}
        <div style={{ 
          display: 'flex', 
          gap: 10, 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          background: 'var(--bg-input, rgba(0,0,0,0.02))', 
          padding: '10px 14px', 
          borderRadius: 8, 
          border: '1px solid var(--border-light)', 
          marginBottom: 16 
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 220px' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              className="field-input" 
              style={{ paddingLeft: 32, paddingRight: 10, paddingTop: 6, paddingBottom: 6, fontSize: '0.8rem', width: '100%' }} 
              placeholder="Search logs..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>

          {/* Payment Mode Selector */}
          <CustomSelect 
            value={filter} 
            onChange={setFilter} 
            options={[
              { value: 'ALL', label: 'All Payments' },
              { value: 'Cash', label: 'Cash' },
              { value: 'Card', label: 'Card' },
              { value: 'Mixed', label: 'Mixed' },
              { value: 'Tabby', label: 'Tabby' },
              { value: 'Tamara', label: 'Tamara' },
              { value: 'Bank Transfer', label: 'Bank Transfer' },
              { value: 'Payment Link', label: 'Payment Link' },
              { value: 'Nil', label: 'Nil' }
            ]} 
            placeholder="Filter Mode" 
            style={{ height: '34px', minHeight: 'unset', minWidth: '150px' }}
          />

          {/* Tx Type Selector */}
          <CustomSelect 
            value={txTypeFilter} 
            onChange={setTxTypeFilter} 
            options={[
              { value: 'ALL', label: 'All Tx Types' },
              { value: 'Sale', label: 'Sales Only' },
              { value: 'Exchange', label: 'Exchanges Only' },
              { value: 'Return', label: 'Returns Only' },
              { value: 'Void', label: 'Voids Only' }
            ]} 
            placeholder="Filter Tx Type" 
            style={{ height: '34px', minHeight: 'unset', minWidth: '150px' }}
          />

          {/* Month Selector */}
          <CustomSelect 
            value={selectedMonth} 
            onChange={setSelectedMonth} 
            options={uniqueMonths} 
            placeholder="Filter Month" 
            style={{ height: '34px', minHeight: 'unset', minWidth: '140px' }}
          />

          {/* Date Picker */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input 
              type="date"
              className="field-input"
              style={{ paddingTop: 6, paddingBottom: 6, fontSize: '0.8rem', width: '150px', height: '34px' }}
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            />
            {dateFilter && (
              <button 
                type="button" 
                className="btn btn-ghost" 
                style={{ padding: '6px 10px', fontSize: '0.8rem' }} 
                onClick={() => setDateFilter('')}
              >
                Clear Date
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div>{[...Array(5)].map((_, i) => <Skeleton key={i} h={42} mb={8} />)}</div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead><tr><th>Order No</th><th>Date</th><th>Customer</th><th>Product Model</th><th>MOP</th><th>Type</th><th>Amount</th><th>Actions</th></tr></thead>
              <tbody>
                {displayed.map(r => (
                  <motion.tr key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }}>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>#{billOrderMap[r.id] || r.id}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{r.date}</td>
                    <td>
                      {r.customer_name || 'Walk-in'}
                      {r.jenny === 1 && (
                        <span className="badge badge-pink" style={{ fontSize: '0.58rem', padding: '1px 5px', marginLeft: 8 }}>JENNY</span>
                      )}
                    </td>
                    <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.model ? r.model.split('|')[0] : 'Multi-product order'}
                    </td>
                    <td><span style={{ fontSize: '0.82rem' }}>{r.payment_mode}</span></td>
                    <td><span className={`badge ${statusBadge(r.transaction_type)}`}>{r.transaction_type}</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                      AED {r.transaction_type === 'Exchange' ? r.exch_balance : r.price}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => {
                          setEditingBill(r);
                          setShowForm(true);
                        }}>
                          Edit
                        </button>
                        <button 
                          type="button"
                          className="btn btn-ghost" 
                          style={{ padding: '4px 10px', fontSize: '0.72rem', borderColor: 'var(--yellow-green)' }} 
                          onClick={() => window.open(`/api/bills/${r.id}/pdf`, '_blank')}
                        >
                          PDF
                        </button>
                        <button className="btn btn-pink" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => handleDeleteBill(r.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   PANEL: PRODUCT DATABASE
   ========================================================= */

function ProductDbPanel({ productsList, setProductsList }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Extract unique brands dynamically to populate filter categories
  const uniqueBrands = ['ALL', ...new Set(productsList.map(p => p.brand))].sort();
  const categories = uniqueBrands.slice(0, 10).map(brand => ({
    value: brand,
    label: brand === 'ALL' ? 'All Brands' : brand
  }));

  const filtered = productsList.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'ALL' || p.brand === category;
    return matchesSearch && matchesCategory;
  });

  // Performance slice: only render the first 60 rows matching
  const displayed = filtered.slice(0, 60);

  const handleAddProduct = async (newProduct) => {
    const apiPayload = {
      dta: newProduct.code,
      model: newProduct.name,
      brand: newProduct.brand,
      price: newProduct.price
    };
    try {
      const res = await fetch(getApiUrl('/api/products'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload)
      });
      if (res.ok) {
        setProductsList([newProduct, ...productsList]);
      } else {
        alert("Failed to save product to database.");
      }
    } catch (err) {
      console.error("Error saving product:", err);
    }
  };

  const handleUploadProducts = async (newProducts) => {
    const apiPayload = newProducts.map(p => ({
      dta: p.code,
      model: p.name,
      brand: p.brand,
      price: p.price
    }));
    try {
      const res = await fetch(getApiUrl('/api/products'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload)
      });
      if (res.ok) {
        setProductsList([...newProducts, ...productsList]);
      } else {
        alert("Failed to upload products to database.");
      }
    } catch (err) {
      console.error("Error uploading products:", err);
    }
  };

  return (
    <div>
      <div className="page-title">Product Database</div>
      <div className="page-subtitle">Catalog of all registered products and SKUs (Total: {productsList.length})</div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="field-input" style={{ paddingLeft: 38, width: '100%' }} placeholder="Search model or DTA SKU..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <CustomSelect 
          value={category} 
          onChange={setCategory} 
          options={categories} 
          placeholder="Filter Brand" 
        />
        <button className="btn btn-secondary" onClick={() => setShowScanner(true)}>
          <span style={{ marginRight: 6 }}>📷</span> Scan Sticker to Add
        </button>
        <button className="btn btn-primary" onClick={() => setAddModalOpen(true)}>
          <Plus size={14} /> Add Product
        </button>
        <button className="btn btn-citrus" onClick={() => setUploadModalOpen(true)}>
          <Upload size={14} /> Upload CSV
        </button>
      </div>

      <div className="card static">
        <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-light-color)', background: 'var(--bg)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          SHOWING {displayed.length} OF {filtered.length} MATCHES
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>SKU</th><th>Product Name</th><th>Brand</th><th>In Stock</th><th>Unit Price</th><th>Status</th></tr></thead>
            <tbody>
              {displayed.map((p, i) => (
                <motion.tr key={p.code} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.4) }}>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8rem' }}>{p.code}</span></td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td><span className="badge badge-gray">{p.brand}</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{p.qty}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>AED {p.price}</td>
                  <td><span className={`badge ${p.qty > 20 ? 'badge-green' : p.qty > 5 ? 'badge-citrus' : 'badge-pink'}`}>{p.qty > 20 ? 'IN STOCK' : p.qty > 5 ? 'LOW' : 'CRITICAL'}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddProductModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} onSave={handleAddProduct} />
      <UploadProductModal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} onUpload={handleUploadProducts} />
      <StickerScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} mode="db" onCompleted={(newProduct) => {
        setProductsList(prev => [newProduct, ...prev]);
      }} />
    </div>
  );
}

/* =========================================================
   PANEL: DISPLAY PIECES
   ========================================================= */

function DisplayPiecesPanel() {
  const [pieces, setPieces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [isMobileView, setIsMobileView] = useState(() => {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Date Helpers
  const getTodayInputStr = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const toApiDate = (inputDateStr) => {
    if (!inputDateStr) return '';
    const parts = inputDateStr.split('-');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return inputDateStr;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayInputStr());

  // Add Manual Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addDta, setAddDta] = useState('');
  const [addBrand, setAddBrand] = useState('');
  const [addModel, setAddModel] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Scanner state
  const [showScanner, setShowScanner] = useState(false);

  // Load pieces
  const loadPieces = useCallback(async () => {
    setLoading(true);
    try {
      const activeDate = toApiDate(selectedDate);
      const res = await fetch(getApiUrl(`/api/display?date=${activeDate}`));
      if (res.ok) {
        const data = await res.json();
        setPieces(data || []);
      }
    } catch (e) {
      console.error('Failed to load display pieces:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadPieces();
    const interval = setInterval(loadPieces, 5000);
    return () => clearInterval(interval);
  }, [loadPieces]);

  // Adjust display quantity
  const handleAdjustQty = async (dta, delta, currentQty) => {
    if (delta === -1 && currentQty <= 1) {
      if (!window.confirm(`Are you sure you want to remove ${dta} from display pieces?`)) return;
    }
    try {
      const activeDate = toApiDate(selectedDate);
      if (delta === 1) {
        const res = await fetch(getApiUrl('/api/display'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dta, force: true, date: activeDate })
        });
        if (res.ok) loadPieces();
      } else if (delta === -1) {
        const res = await fetch(getApiUrl(`/api/display/${encodeURIComponent(dta)}?date=${activeDate}`), {
          method: 'DELETE'
        });
        if (res.ok) loadPieces();
      }
    } catch (err) {
      console.error('Failed to adjust quantity:', err);
    }
  };

  const handleAdjustQtyDirect = async (dta, newValue, oldValue) => {
    const val = parseInt(newValue);
    if (isNaN(val) || val < 0) {
      loadPieces();
      return;
    }
    const delta = val - oldValue;
    if (delta === 0) return;
    
    // Perform serial requests
    if (delta > 0) {
      for (let i = 0; i < delta; i++) {
        await handleAdjustQty(dta, 1, oldValue);
      }
    } else {
      for (let i = 0; i < Math.abs(delta); i++) {
        await handleAdjustQty(dta, -1, oldValue);
      }
    }
  };

  // Delete display piece
  const handleDeletePiece = async (dta, qty) => {
    let msg = `Remove device ${dta} from active Display Pieces?`;
    if (qty > 1) {
      msg = `Reduce the quantity of display laptop ${dta} by 1?\n(Currently on display: ${qty} units)`;
    }
    if (!window.confirm(msg)) return;
    await handleAdjustQty(dta, -1, qty);
  };

  // Rollover display pieces
  const handleRollover = async () => {
    const activeDate = toApiDate(selectedDate);
    const curDateObj = new Date(selectedDate);
    const prevDateObj = new Date(curDateObj);
    prevDateObj.setDate(curDateObj.getDate() - 1);
    
    const dd = String(prevDateObj.getDate()).padStart(2, '0');
    const mm = String(prevDateObj.getMonth() + 1).padStart(2, '0');
    const yyyy = prevDateObj.getFullYear();
    const prevDateStr = `${dd}-${mm}-${yyyy}`;

    const confirmMsg = `Transfer all remaining unsold laptops from ${prevDateStr} to ${activeDate}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(getApiUrl('/api/display/rollover'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_date: prevDateStr, target_date: activeDate })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.copied > 0) {
          alert(`Successfully rolled over ${data.copied} laptop(s) to ${activeDate}!`);
        } else {
          alert(`No display laptops found to rollover from ${prevDateStr}.`);
        }
        loadPieces();
      }
    } catch (e) {
      console.error(e);
      alert('Rollover failed.');
    }
  };

  // Export PDF
  const handleExportPdf = () => {
    const activeDate = toApiDate(selectedDate);
    window.location.href = `/api/display/export-pdf?date=${activeDate}&t=${Date.now()}`;
  };

  // Manual DTA lookup
  const handleDtaLookup = async () => {
    const dta = addDta.trim().toUpperCase();
    if (!dta) return;
    try {
      const res = await fetch(getApiUrl(`/api/products/${encodeURIComponent(dta)}`));
      if (res.ok) {
        const product = await res.json();
        if (product && !product.error) {
          setAddBrand(product.brand || '');
          setAddModel(product.model || '');
        }
      }
    } catch (err) {
      console.error('DTA lookup failed:', err);
    }
  };

  // Save manual display piece
  const handleSaveManualDisplay = async (e) => {
    e.preventDefault();
    const dta = addDta.trim().toUpperCase();
    if (!dta) return;
    setIsAdding(true);
    try {
      const activeDate = toApiDate(selectedDate);
      const res = await fetch(getApiUrl('/api/display'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dta, brand: addBrand, model: addModel, date: activeDate })
      });
      if (res.ok) {
        setShowAddModal(false);
        setAddDta('');
        setAddBrand('');
        setAddModel('');
        loadPieces();
      }
    } catch (err) {
      console.error('Failed to save manual display:', err);
    } finally {
      setIsAdding(false);
    }
  };

  // Stats
  const displayPiecesCount = pieces.length;
  const totalDisplayQty = pieces.reduce((sum, p) => sum + (p.quantity || 1), 0);

  // Filtered pieces search
  const filteredPieces = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return pieces;
    return pieces.filter(p => 
      p.dta.toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q) ||
      (p.model || '').toLowerCase().includes(q)
    );
  }, [pieces, search]);

  return (
    <div style={{ paddingBottom: 60 }}>
      <div className="page-header-container" style={{ display: 'flex', flexDirection: isMobileView ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobileView ? 'flex-start' : 'center', marginBottom: 12, gap: 10 }}>
        <div>
          <div className="page-title">Display Pieces Registry</div>
          <div className="page-subtitle">Physical and digital showroom display tracker</div>
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobileView ? '1fr 1fr' : 'repeat(4, auto)', 
          gap: 8, 
          width: isMobileView ? '100%' : 'auto',
          marginTop: isMobileView ? 8 : 0 
        }}>
          <button type="button" className="btn btn-secondary" onClick={() => setShowScanner(true)} style={{ fontSize: isMobileView ? '0.78rem' : '0.85rem', padding: isMobileView ? '8px 10px' : '10px 14px' }}>
            <span style={{ marginRight: 6 }}>📷</span> Scan Sticker
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(true)} style={{ fontSize: isMobileView ? '0.78rem' : '0.85rem', padding: isMobileView ? '8px 10px' : '10px 14px' }}>
            + Register Laptop
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleRollover} style={{ fontSize: isMobileView ? '0.78rem' : '0.85rem', padding: isMobileView ? '8px 10px' : '10px 14px' }}>
            🔄 Rollover Day
          </button>
          <button type="button" className="btn btn-primary" onClick={handleExportPdf} style={{ fontSize: isMobileView ? '0.78rem' : '0.85rem', padding: isMobileView ? '8px 10px' : '10px 14px' }}>
            📄 Export PDF
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobileView ? '1fr' : 'repeat(3, 1fr)', 
        gap: 16, 
        marginBottom: 20 
      }}>
        <div className="card card-p-sm" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Laptops on Display</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 4, fontFamily: 'var(--font-heading)' }}>{displayPiecesCount}</div>
        </div>
        <div className="card card-p-sm" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Display Quantity</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 4, fontFamily: 'var(--font-heading)' }}>{totalDisplayQty}</div>
        </div>
        <div className="card card-p-sm" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Registry Date</div>
          <input type="date" className="modal-field-input" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ marginTop: 6, padding: '6px 10px', fontSize: '0.8rem', width: '100%' }} />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card card-p-sm" style={{ marginBottom: 20 }}>
        <input 
          type="text" 
          className="modal-field-input" 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="Filter by DTA code, brand, or model..." 
          style={{ width: '100%', fontSize: '0.8rem' }}
        />
      </div>

      {/* Registry Table or Mobile Cards */}
      <div className="card card-p-sm" style={{ overflowX: 'auto', border: isMobileView ? 'none' : '2px solid #000', background: 'transparent', padding: isMobileView ? 0 : 12 }}>
        {loading && pieces.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading registry...</div>
        ) : filteredPieces.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>No laptops currently on display. Register one above or scan its QR code.</div>
        ) : isMobileView ? (
          /* Mobile Card View */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredPieces.map((p, idx) => {
              const cleanModel = p.model ? p.model.split('|')[0].trim() : '—';
              const formattedTime = p.added_at ? new Date(p.added_at).toLocaleDateString('en-AE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
              return (
                <div 
                  key={p.dta + idx} 
                  className="card card-p-md" 
                  style={{ 
                    border: '2px solid #000', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 12, 
                    position: 'relative',
                    background: 'var(--bg-card)',
                    borderRadius: 8,
                    boxShadow: 'var(--shadow-flat-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-purple" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 900, background: 'var(--purple)', color: '#fff', border: '1.5px solid #000', padding: '3px 8px', borderRadius: 4 }}>
                      {p.dta}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => handleDeletePiece(p.dta, p.quantity || 1)} 
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        color: 'var(--pink)', 
                        fontSize: '1.25rem', 
                        fontWeight: 800, 
                        padding: '2px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {p.brand || 'No Brand'}
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                      {cleanModel}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, borderTop: '1px solid var(--border-light-color)', paddingTop: 12 }}>
                    <div className="qty-capsule" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button 
                        type="button" 
                        className="qty-capsule-btn" 
                        onClick={() => handleAdjustQty(p.dta, -1, p.quantity || 1)} 
                        style={{ 
                          width: 32, 
                          height: 32, 
                          fontSize: '1.2rem', 
                          fontWeight: 900, 
                          background: 'var(--bg)', 
                          border: '1.5px solid #000', 
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-primary)'
                        }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '1.05rem', fontWeight: 900, minWidth: 20, textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                        {p.quantity || 1}
                      </span>
                      <button 
                        type="button" 
                        className="qty-capsule-btn" 
                        onClick={() => handleAdjustQty(p.dta, 1, p.quantity || 1)} 
                        style={{ 
                          width: 32, 
                          height: 32, 
                          fontSize: '1.2rem', 
                          fontWeight: 900, 
                          background: 'var(--bg)', 
                          border: '1.5px solid #000', 
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-primary)'
                        }}
                      >
                        +
                      </button>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {formattedTime}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Desktop View Table */
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light-color)', textAlign: 'left' }}>
                <th style={{ padding: 10, fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)' }}>DTA CODE</th>
                <th style={{ padding: 10, fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)' }}>BRAND</th>
                <th style={{ padding: 10, fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)' }}>MODEL NAME</th>
                <th style={{ padding: 10, fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)', width: 140 }}>QUANTITY</th>
                <th style={{ padding: 10, fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)' }}>ADDED TIME</th>
                <th style={{ padding: 10, fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)', width: 80, textAlign: 'center' }}>REMOVE</th>
              </tr>
            </thead>
            <tbody>
              {filteredPieces.map((p, idx) => {
                const cleanModel = p.model ? p.model.split('|')[0].trim() : '—';
                const formattedTime = p.added_at ? new Date(p.added_at).toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
                return (
                  <tr key={p.dta + idx} style={{ borderBottom: '1px solid var(--border-light-color)', fontSize: '0.78rem' }}>
                    <td style={{ padding: 10 }}><code style={{ fontWeight: 700, color: 'var(--accent)' }}>{p.dta}</code></td>
                    <td style={{ padding: 10 }}>{p.brand || '—'}</td>
                    <td style={{ padding: 10 }}>{cleanModel}</td>
                    <td style={{ padding: 10 }}>
                      <div className="qty-capsule" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button type="button" className="qty-capsule-btn" onClick={() => handleAdjustQty(p.dta, -1, p.quantity || 1)} style={{ background: 'none', border: '1px solid var(--border-light)', width: 22, height: 22, cursor: 'pointer', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                        <input type="number" className="qty-capsule-input" value={p.quantity || 1} min="0" onChange={e => handleAdjustQtyDirect(p.dta, e.target.value, p.quantity || 1)} style={{ width: 40, textAlign: 'center', border: '1px solid var(--border-light)', borderRadius: 4, fontSize: '0.75rem', height: 22 }} />
                        <button type="button" className="qty-capsule-btn" onClick={() => handleAdjustQty(p.dta, 1, p.quantity || 1)} style={{ background: 'none', border: '1px solid var(--border-light)', width: 22, height: 22, cursor: 'pointer', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                      </div>
                    </td>
                    <td style={{ padding: 10, color: 'var(--text-secondary)', fontSize: '0.72rem' }}>{formattedTime}</td>
                    <td style={{ padding: 10, textAlign: 'center' }}>
                      <button type="button" className="btn btn-icon danger btn-delete-display" onClick={() => handleDeletePiece(p.dta, p.quantity || 1)} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pink)' }}>✕</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Register Manual Modal popup */}
      <AnimatePresence>
        {showAddModal && (
          <div onClick={() => setShowAddModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(5px)', padding: 20 }}>
            <motion.div onClick={e => e.stopPropagation()} initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} className="card card-p-lg" style={{ width: '100%', maxWidth: '440px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--border-light)', paddingBottom: 12 }}>
                <h3 className="font-heading" style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase' }}>
                  Register Display Laptop
                </h3>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', fontWeight: 800, cursor: 'pointer', color: 'var(--text-primary)' }}>✕</button>
              </div>

              <form onSubmit={handleSaveManualDisplay} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>DTA Code *</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input type="text" className="modal-field-input" value={addDta} onChange={e => setAddDta(e.target.value)} onBlur={handleDtaLookup} required placeholder="DTAX1048" style={{ textTransform: 'uppercase', flex: 1 }} />
                    <button type="button" className="btn btn-secondary" onClick={handleDtaLookup} style={{ padding: '0 10px', fontSize: '0.75rem' }}>Lookup</button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Brand Name</label>
                  <input type="text" className="modal-field-input" value={addBrand} onChange={e => setAddBrand(e.target.value)} placeholder="e.g. Lenovo" />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Model Name</label>
                  <input type="text" className="modal-field-input" value={addModel} onChange={e => setAddModel(e.target.value)} placeholder="e.g. Thinkpad X1 Carbon" />
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid var(--border-light-color)', paddingTop: 14, marginTop: 10 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)} disabled={isAdding}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={isAdding}>
                    {isAdding ? 'Saving...' : 'Register Laptop'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <StickerScannerModal 
        isOpen={showScanner} 
        onClose={() => setShowScanner(false)} 
        mode="display" 
        targetDate={toApiDate(selectedDate)} 
        onCompleted={loadPieces} 
      />
    </div>
  );
}


/* =========================================================
   MODAL: STICKER SCANNER MODAL (Continuous & Unified)
   ========================================================= */

function StickerScannerModal({ isOpen, onClose, mode, targetDate, onCompleted }) {
  const [cameraDevices, setCameraDevices] = useState([]);
  const [activeCamIdx, setActiveCamIdx] = useState(0);
  const [statusMsg, setStatusMsg] = useState('Camera active — Scan QR Code');
  const [isSaving, setIsSaving] = useState(false);
  const [ocrProgress, setOcrProgress] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [notifyMsg, setNotifyMsg] = useState(null);

  // Form states
  const [formDta, setFormDta] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formSpecs, setFormSpecs] = useState('');
  const [ocrApiKey, setOcrApiKey] = useState(localStorage.getItem('ocr_api_key') || 'K89034187088957');

  const handleApiKeyChange = (val) => {
    setOcrApiKey(val);
    localStorage.setItem('ocr_api_key', val);
  };

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanActiveRef = useRef(false);

  // Trigger notification toast
  const triggerNotify = (text, type = 'success') => {
    setNotifyMsg({ text, type });
    setTimeout(() => {
      setNotifyMsg(null);
    }, 2500);
  };

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {}
  };

  // Start video stream
  const startCamera = async (camIdx = 0) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }

    let constraints = { video: { facingMode: "environment" } };
    if (cameraDevices.length > 0) {
      const dev = cameraDevices[camIdx];
      if (dev) {
        constraints = { video: { deviceId: { exact: dev.deviceId } } };
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.muted = true;
        await videoRef.current.play();
      }

      // Enumerate lenses
      if (cameraDevices.length === 0) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        const rear = [];
        const other = [];
        videoInputs.forEach(d => {
          const lbl = (d.label || "").toLowerCase();
          if (lbl.includes("back") || lbl.includes("rear") || lbl.includes("environment") || lbl.includes("0")) {
            rear.push(d);
          } else {
            other.push(d);
          }
        });
        setCameraDevices([...rear, ...other]);
      }

      scanActiveRef.current = true;
      setStatusMsg('Camera active — Scan QR Code');
      requestAnimationFrame(tickScanner);
    } catch (err) {
      setStatusMsg('Camera access denied');
      console.error('Camera startup error:', err);
    }
  };

  const stopCamera = () => {
    scanActiveRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Switch camera lenses
  const switchCamera = () => {
    if (cameraDevices.length <= 1) return;
    const nextIdx = (activeCamIdx + 1) % cameraDevices.length;
    setActiveCamIdx(nextIdx);
    startCamera(nextIdx);
  };

  useEffect(() => {
    if (isOpen) {
      setShowReview(false);
      setPreviewImage('');
      setFormDta('');
      setFormBrand('');
      setFormModel('');
      setFormSpecs('');
      // Delay camera launch slightly to wait for ref binding
      setTimeout(() => startCamera(activeCamIdx), 150);
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  // Scanner tick loop
  const tickScanner = () => {
    if (!scanActiveRef.current || !isOpen || showReview) return;
    const video = videoRef.current;
    if (video && video.readyState >= video.HAVE_CURRENT_DATA && video.videoWidth > 0 && video.videoHeight > 0) {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        if (window.jsQR) {
          const code = window.jsQR(imgData.data, imgData.width, imgData.height, {
            inversionAttempts: "attemptBoth"
          });
          if (code && code.data) {
            const rawCode = code.data.trim();
            const dtaMatch = rawCode.match(/DTA[A-Z0-9]{3,10}/i);
            const dtaCode = dtaMatch ? dtaMatch[0].toUpperCase() : rawCode.toUpperCase();
            if (dtaCode) {
              scanActiveRef.current = false;
              playBeep();
              handleQrScanSuccess(dtaCode);
              return;
            }
          }
        }
      } catch (err) {
        console.warn("Scanner frame read error:", err);
      }
    }
    requestAnimationFrame(tickScanner);
  };

  // Handle QR Success
  const handleQrScanSuccess = async (dta) => {
    setStatusMsg(`Checking database for DTA ${dta}...`);
    try {
      const res = await fetch(getApiUrl(`/api/products/${encodeURIComponent(dta)}`));
      let product = null;
      if (res.ok) {
        product = await res.json();
      }

      const isExactMatch = product && product.dta && product.dta.toUpperCase() === dta.toUpperCase();

      if (mode === 'display') {
        if (!isExactMatch) {
          // Display mode, but product not cataloged yet
          triggerNotify(`DTA "${dta}" not found in catalog. Capture text label to register.`, 'info');
          setFormDta(dta);
          setStatusMsg('Sticker photo mode: Position specs horizontally and tap Capture');
        } else {
          // Product exists, add to display registry directly!
          const saveRes = await fetch(getApiUrl('/api/display'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dta, date: targetDate })
          });
          if (saveRes.ok) {
            const saveJson = await saveRes.json();
            if (saveJson.duplicate) {
              // Increment quantity silently
              await fetch(getApiUrl('/api/display'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dta, force: true, date: targetDate })
              });
              triggerNotify(`DTA ${dta} quantity incremented!`, 'success');
            } else {
              triggerNotify(`DTA ${dta} added to display!`, 'success');
            }
            if (onCompleted) onCompleted();
          }
          // Resume scanner after 1.8s delay
          setTimeout(() => {
            if (isOpen && !showReview) {
              scanActiveRef.current = true;
              setStatusMsg('Camera active — Scan QR Code');
              requestAnimationFrame(tickScanner);
            }
          }, 1800);
        }
      } else {
        // DB Mode (adding new catalog product)
        if (isExactMatch) {
          triggerNotify(`Product SKU ${dta} already exists in database catalog!`, 'info');
          // Resume scanner after 1.8s
          setTimeout(() => {
            if (isOpen && !showReview) {
              scanActiveRef.current = true;
              setStatusMsg('Camera active — Scan QR Code');
              requestAnimationFrame(tickScanner);
            }
          }, 1800);
        } else {
          // Prefill DTA code, guide user to photograph specs
          triggerNotify(`DTA "${dta}" not cataloged. Capture sticker specs to add.`, 'info');
          setFormDta(dta);
          setStatusMsg('Sticker photo mode: Position specs horizontally and tap Capture');
        }
      }
    } catch (e) {
      console.error(e);
      triggerNotify('Scan lookup failed.', 'error');
      // Resume scanning
      setTimeout(() => {
        if (isOpen && !showReview) {
          scanActiveRef.current = true;
          setStatusMsg('Camera active — Scan QR Code');
          requestAnimationFrame(tickScanner);
        }
      }, 2000);
    }
  };

  // Instant capture photo for OCR
  const captureStickerText = async () => {
    const video = videoRef.current;
    if (!video) return;
    
    setOcrProgress('Uploading image to OCR engine...');
    
    try {
      const vWidth = video.videoWidth;
      const vHeight = video.videoHeight;
      const elWidth = video.clientWidth || 360;
      const elHeight = video.clientHeight || 640;

      // Project center 320x160 viewfinder rectangle back onto video pixels
      const videoRatio = vWidth / vHeight;
      const elRatio = elWidth / elHeight;

      let scale = 1;
      let xOffset = 0;
      let yOffset = 0;

      if (videoRatio > elRatio) {
        scale = elHeight / vHeight;
        xOffset = (vWidth - elWidth / scale) / 2;
      } else {
        scale = elWidth / vWidth;
        yOffset = (vHeight - elHeight / scale) / 2;
      }

      const rectW = 320;
      const rectH = 160;
      const rectX = (elWidth - rectW) / 2;
      const rectY = (elHeight - rectH) / 2;

      const cropX = xOffset + rectX / scale;
      const cropY = yOffset + rectY / scale;
      const cropW = rectW / scale;
      const cropH = rectH / scale;

      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 320;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(
        video,
        Math.max(0, cropX), Math.max(0, cropY), Math.min(vWidth, cropW), Math.min(vHeight, cropH),
        0, 0, 640, 320
      );
      
      const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
      
      setPreviewImage(dataUrl);
      setShowReview(true);
      
      // Stop camera stream during review editing
      stopCamera();

      const res = await fetch(getApiUrl('/api/ocr/scan'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl, pending_dta: formDta, api_key: ocrApiKey })
      });

      if (res.ok) {
        const data = await res.json();
        setFormDta(data.dta || formDta);
        setFormBrand(data.brand || '');
        setFormModel(data.model || '');
        setFormSpecs(data.specs || '');
        setOcrProgress('OCR Completed. Please verify below.');
      } else {
        const err = await res.json();
        setOcrProgress(`OCR Failed: ${err.error || 'Server error'}. Enter manually.`);
      }
    } catch (e) {
      console.error(e);
      setOcrProgress('Connection failed. Enter details manually.');
    }
  };

  // Save parsed result
  const handleSaveResult = async (e) => {
    e.preventDefault();
    if (!formDta) return;
    setIsSaving(true);
    try {
      const fullModel = formSpecs ? `${formModel} | ${formSpecs}` : formModel;

      // 1. Always create/save product in database catalog
      const prodRes = await fetch(getApiUrl('/api/products'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dta: formDta, brand: formBrand, model: fullModel, price: 0 })
      });

      let addedProduct = null;
      if (prodRes.ok) {
        addedProduct = { code: formDta, brand: formBrand, name: fullModel, price: 0, qty: 0 };
      }

      // 2. If display mode, add to display registry as well
      if (mode === 'display') {
        const displayRes = await fetch(getApiUrl('/api/display'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dta: formDta, brand: formBrand, model: fullModel, date: targetDate })
        });
        if (displayRes.ok) {
          triggerNotify('Display item registered successfully!', 'success');
        }
      } else {
        triggerNotify('Product SKU cataloged successfully!', 'success');
      }

      if (onCompleted && addedProduct) {
        onCompleted(addedProduct);
      }

      // Reset back to scanning view to scan the next one!
      setShowReview(false);
      setPreviewImage('');
      setFormDta('');
      setFormBrand('');
      setFormModel('');
      setFormSpecs('');
      
      // Re-enable camera and loop
      setTimeout(() => startCamera(activeCamIdx), 150);
    } catch (err) {
      console.error(err);
      triggerNotify('Error saving details.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleScanNext = () => {
    setShowReview(false);
    setPreviewImage('');
    setFormDta('');
    setFormBrand('');
    setFormModel('');
    setFormSpecs('');
    setTimeout(() => startCamera(activeCamIdx), 150);
  };

  const magicParseText = (rawText) => {
    if (!rawText) return;
    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const fullText = lines.join(' ');

    // 1. DTA Code
    const dtaMatch = fullText.match(/\bDTA[A-Z0-9]{3,10}\b/i);
    if (dtaMatch) {
      setFormDta(dtaMatch[0].toUpperCase());
    }

    // 2. Brand
    const knownBrands = ["Lenovo", "Dell", "HP", "Asus", "Acer", "Apple", "MSI", "Samsung", "Toshiba", "Sony", "LG", "Huawei", "Microsoft", "Thinkpad"];
    let detectedBrand = "";
    for (const b of knownBrands) {
      if (fullText.toLowerCase().includes(b.toLowerCase())) {
        detectedBrand = b === "Thinkpad" ? "Lenovo" : b;
        break;
      }
    }
    if (detectedBrand) {
      setFormBrand(detectedBrand);
    }

    // 3. Model Line
    let modelLine = "";
    const brandKeywords = detectedBrand ? [detectedBrand.toLowerCase()] : [];
    if (detectedBrand === "Lenovo") brandKeywords.push("thinkpad");

    for (const l of lines) {
      if (brandKeywords.some(kw => l.toLowerCase().includes(kw))) {
        modelLine = l;
        break;
      }
    }

    if (!modelLine && lines.length > 0) {
      const cleanLines = lines.filter(l => !/DTA[A-Z0-9]/i.test(l) && l.length > 8);
      if (cleanLines.length > 0) {
        modelLine = cleanLines.sort((a, b) => b.length - a.length)[0];
      }
    }

    // Clean model name
    let modelName = modelLine || "";
    let extraSpecs = [];
    if (modelName.includes('|')) {
      const parts = modelName.split('|').map(p => p.trim()).filter(Boolean);
      if (parts.length > 1) {
        modelName = parts[0];
        extraSpecs = parts.slice(1);
      }
    }

    if (detectedBrand && modelName.toLowerCase().startsWith(detectedBrand.toLowerCase())) {
      modelName = modelName.slice(detectedBrand.length).trim();
    }
    if (detectedBrand === "Lenovo" && modelName.toLowerCase().startsWith("lenovo")) {
      modelName = modelName.slice(6).trim();
    }
    modelName = modelName.replace(/^[|/\-_\[\] ]+/, '').replace(/[|/\-_\[\] ]+$/, '').trim();
    if (modelName) {
      setFormModel(modelName);
    }

    // 4. Specs
    const specKeywords = ["intel", "amd", "core", "i3", "i5", "i7", "i9", "ryzen", "ram", "ssd", "gb", "tb", "hz", "ghz", "nvidia", "radeon", "graphics", "ddr", "celeron", "pentium", "generation", "gen", "pro"];
    const specLines = [...extraSpecs];

    for (const l of lines) {
      if (l === modelLine || (dtaMatch && l.toUpperCase().includes(dtaMatch[0].toUpperCase()))) {
        continue;
      }
      const lLower = l.toLowerCase();
      if (lLower.includes("dithari") || lLower.includes("ds193") || lLower.trim() === 'd') {
        continue;
      }

      if (l.includes('|')) {
        const parts = l.split('|').map(p => p.trim()).filter(Boolean);
        for (const p of parts) {
          const pLower = p.toLowerCase();
          const isSpec = specKeywords.some(kw => pLower.includes(kw)) ||
                         /\b\d+(?:gb|tb|g|t)\b/.test(pLower) ||
                         /i[3579]-\d+/.test(pLower) ||
                         /\b\d+\s*ssd\b/.test(pLower) ||
                         /\b\d+\s*ram\b/.test(pLower);
          if (isSpec) {
            let cleaned = p;
            if (detectedBrand && cleaned.toLowerCase().startsWith(detectedBrand.toLowerCase())) {
              cleaned = cleaned.slice(detectedBrand.length).trim();
            }
            cleaned = cleaned.replace(/^[|/\-_\[\] ]+/, '').replace(/[|/\-_\[\] ]+$/, '').trim();
            if (cleaned) specLines.push(cleaned);
          }
        }
      } else {
        const isSpec = specKeywords.some(kw => lLower.includes(kw)) ||
                       /\b\d+(?:gb|tb|g|t)\b/.test(lLower) ||
                       /i[3579]-\d+/.test(lLower) ||
                       /\b\d+\s*ssd\b/.test(lLower) ||
                       /\b\d+\s*ram\b/.test(lLower);
        if (isSpec) {
          let cleaned = l;
          if (detectedBrand && cleaned.toLowerCase().startsWith(detectedBrand.toLowerCase())) {
            cleaned = cleaned.slice(detectedBrand.length).trim();
          }
          cleaned = cleaned.replace(/^[|/\-_\[\] ]+/, '').replace(/[|/\-_\[\] ]+$/, '').trim();
          if (cleaned) specLines.push(cleaned);
        }
      }
    }

    setFormSpecs(specLines.join(' | '));
    triggerNotify('Magic parsed text successfully!', 'success');
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', flexDirection: 'column', zIndex: 99999 }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.85)', color: '#fff', zIndex: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            {mode === 'display' ? 'Display pieces scanner' : 'Product catalogue scanner'}
          </span>
          <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)' }}>{statusMsg}</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {!showReview && cameraDevices.length > 1 && (
            <button type="button" className="btn btn-secondary" onClick={switchCamera} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', fontSize: '0.75rem' }}>
              🔄 Switch Lens
            </button>
          )}
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', fontWeight: 800, cursor: 'pointer', color: '#fff' }}>✕</button>
        </div>
      </div>

      {/* Floating Status Notification */}
      {notifyMsg && (
        <div style={{
          position: 'absolute',
          top: 70,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '400px',
          background: notifyMsg.type === 'success' ? 'var(--green)' : notifyMsg.type === 'error' ? 'var(--pink)' : '#1e293b',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 8,
          fontSize: '0.8rem',
          fontWeight: 700,
          textAlign: 'center',
          zIndex: 999999,
          boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
          border: '2px solid #000'
        }}>
          {notifyMsg.text}
        </div>
      )}

      {/* Main View Area */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto', background: '#0f172a' }}>
        {!showReview ? (
          // View 1: Active camera stream
          <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} playsInline muted />
            
            {/* Target viewfinder box */}
            <div style={{ position: 'absolute', width: 320, height: 160, border: '3px solid var(--accent)', borderRadius: 12, boxShadow: '0 0 0 4000px rgba(0,0,0,0.5)', zIndex: 5, pointerEvents: 'none' }} />
          </div>
        ) : (
          // View 2: OCR Review Form
          <div style={{ width: '100%', maxWidth: '480px', background: 'var(--bg-card)', borderRadius: 12, padding: 24, margin: '20px auto', border: '3px solid #000', boxShadow: 'var(--shadow-flat)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: 10, marginBottom: 16 }}>
              <h3 className="font-heading" style={{ fontSize: '1.1rem', margin: 0, textTransform: 'uppercase' }}>Sticker Details</h3>
              <button type="button" className="btn btn-secondary" onClick={handleScanNext} style={{ padding: '4px 10px', fontSize: '0.72rem' }}>Scan Next</button>
            </div>
            
            {/* Status loading info */}
            <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-light)', borderRadius: 6, fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
              <strong>OCR Status:</strong> {ocrProgress}
            </div>

            {/* Taken photo preview */}
            <div style={{ width: '100%', height: 130, background: '#000', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
              <img src={previewImage} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Snapshot preview" />
            </div>

            <div style={{ background: 'rgba(0,0,0,0.02)', padding: 12, borderRadius: 8, border: '1px dashed var(--border-light-color)', marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>
                Magic Parse pasted label text:
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input 
                  type="text" 
                  className="modal-field-input" 
                  placeholder="Paste raw sticker text... e.g. Lenovo T490 Core i7..." 
                  style={{ fontSize: '0.75rem', flex: 1 }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      magicParseText(e.target.value);
                    }
                  }}
                  id="magic-parse-input"
                />
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ padding: '0 12px', fontSize: '0.72rem' }}
                  onClick={() => {
                    const input = document.getElementById('magic-parse-input');
                    if (input) magicParseText(input.value);
                  }}
                >
                  Parse
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveResult} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>DTA Code *</label>
                <input type="text" className="modal-field-input" value={formDta} onChange={e => setFormDta(e.target.value.toUpperCase())} required placeholder="DTAX1048" style={{ textTransform: 'uppercase', fontSize: '0.78rem' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Brand *</label>
                <input type="text" className="modal-field-input" value={formBrand} onChange={e => setFormBrand(e.target.value)} required placeholder="e.g. Lenovo" style={{ fontSize: '0.78rem' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Model *</label>
                <input type="text" className="modal-field-input" value={formModel} onChange={e => setFormModel(e.target.value)} required placeholder="e.g. Thinkpad X1 Carbon" style={{ fontSize: '0.78rem' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Specifications Details</label>
                <textarea className="modal-field-input" value={formSpecs} onChange={e => setFormSpecs(e.target.value)} placeholder="e.g. Core i7 | 16GB RAM | 512GB SSD" style={{ minHeight: 50, resize: 'none', fontSize: '0.78rem' }} />
              </div>

              <div style={{ marginTop: 10, borderTop: '1px dashed var(--border-light-color)', paddingTop: 10 }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>
                  <span>OCR API Key</span>
                  <a href="https://ocr.space/ocrapi" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Get Free Key</a>
                </label>
                <input 
                  type="text" 
                  className="modal-field-input" 
                  value={ocrApiKey} 
                  onChange={e => handleApiKeyChange(e.target.value)} 
                  placeholder="helloworld" 
                  style={{ fontSize: '0.72rem', padding: '4px 8px' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid var(--border-light-color)', paddingTop: 12, marginTop: 6 }}>
                <button type="button" className="btn btn-secondary" onClick={handleScanNext} disabled={isSaving}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save & Register'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Bottom controls footer bar */}
      {!showReview && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px 20px', background: 'rgba(0,0,0,0.95)', borderTop: '1px solid rgba(255,255,255,0.15)', gap: 16, zIndex: 10 }}>
          <button type="button" className="btn btn-primary" onClick={captureStickerText} style={{ padding: '12px 28px', fontSize: '0.85rem', fontWeight: 700 }}>
            📷 Capture Sticker Text
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', padding: '10px 24px' }}>
            Close Camera
          </button>
        </div>
      )}
    </div>
  );
}


/* =========================================================
   PANEL: DELIVERIES
   ========================================================= */

/* =========================================================
   PANEL: DELIVERIES
   ========================================================= */

function DeliveriesPanel({ productsList, onRefreshApprovals }) {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState('all'); // 'all' | 'daily' | 'monthly'
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Date helpers
  const getTodayInputStr = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayInputStr());
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formDate, setFormDate] = useState(getTodayInputStr());
  const [formPlace, setFormPlace] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDeliveryBy, setFormDeliveryBy] = useState('Delivery Guy');
  const [formPaymentMode, setFormPaymentMode] = useState('Cash');
  const [formStatus, setFormStatus] = useState('Pending');
  const [formDeliveryType, setFormDeliveryType] = useState('Product Delivery');
  const [formExchOldDta, setFormExchOldDta] = useState('');
  const [formExchOldDesc, setFormExchOldDesc] = useState('');
  const [formExchOldValue, setFormExchOldValue] = useState(0);
  const [formWarrantyAction, setFormWarrantyAction] = useState('');
  const [formJenny, setFormJenny] = useState(false);
  const [formProducts, setFormProducts] = useState([{ dta: '', brand: '', model: '', price: 0, quantity: 1 }]);
  const [showPreview, setShowPreview] = useState(false);
  const [exchSuggestions, setExchSuggestions] = useState([]);

  // Auto-set payment mode to Nil if Exchange balance is 0
  useEffect(() => {
    if (formDeliveryType === 'Exchange') {
      const sum = formProducts.reduce((acc, p) => acc + (parseFloat(p.price) || 0) * (parseInt(p.quantity) || 1), 0);
      const exValue = parseFloat(formExchOldValue) || 0;
      if (sum > 0 && exValue > 0 && sum === exValue) {
        setFormPaymentMode('Nil');
      }
    }
  }, [formDeliveryType, formProducts, formExchOldValue]);

  // Date conversion helpers
  const toApiDate = (val) => {
    if (!val) return '';
    const parts = val.split('-');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return val;
  };

  const toInputDate = (val) => {
    if (!val) return '';
    const parts = val.split('-');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return val;
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setFormCustomerName('');
    setFormDate(getTodayInputStr());
    setFormPlace('');
    setFormAddress('');
    setFormPhone('');
    setFormDeliveryBy('Delivery Guy');
    setFormPaymentMode('Cash');
    setFormStatus('Pending');
    setFormDeliveryType('Product Delivery');
    setFormExchOldDta('');
    setFormExchOldDesc('');
    setFormExchOldValue(0);
    setFormWarrantyAction('');
    setFormJenny(false);
    setFormProducts([{ dta: '', brand: '', model: '', price: 0, quantity: 1 }]);
  };

  // Fetch deliveries
  const loadDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/api/deliveries';
      if (deliveryMode === 'monthly') {
        url += `?month=${selectedMonth}-${selectedYear}`;
      } else if (deliveryMode === 'daily') {
        url += `?date=${toApiDate(selectedDate)}`;
      }
      const res = await fetch(getApiUrl(url));
      if (res.ok) {
        const data = await res.json();
        // Sort chronologically
        const sorted = [...data].sort((a, b) => {
          const parseDate = (dStr) => {
            if (!dStr) return new Date(0);
            const parts = dStr.split('-');
            if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0]);
            return new Date(0);
          };
          const dateA = parseDate(a.date);
          const dateB = parseDate(b.date);
          if (dateA.getTime() !== dateB.getTime()) return dateB - dateA;
          return (b.id || 0) - (a.id || 0);
        });
        setDeliveries(sorted);
      }
    } catch (err) {
      console.error('Failed to load deliveries:', err);
    } finally {
      setLoading(false);
    }
  }, [deliveryMode, selectedDate, selectedMonth, selectedYear]);

  // Live polling
  useEffect(() => {
    loadDeliveries();
    const interval = setInterval(loadDeliveries, 3000);
    return () => clearInterval(interval);
  }, [loadDeliveries]);

  // DTA autocomplete suggestion state per row
  const [dtaSuggestions, setDtaSuggestions] = useState({ index: null, list: [] });

  // Handle DTA typing — show live dropdown suggestions
  const handleDtaTyping = (index, value) => {
    const updated = [...formProducts];
    updated[index].dta = value;
    updated[index].dtaStatus = '';
    setFormProducts(updated);

    if (!value.trim()) {
      setDtaSuggestions({ index: null, list: [] });
      return;
    }
    const q = value.toLowerCase();
    const matches = productsList.filter(p =>
      (p.code && p.code.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.name && p.name.toLowerCase().includes(q))
    ).slice(0, 6);
    setDtaSuggestions({ index, list: matches });
  };

  // Select a suggestion from the dropdown
  const selectDtaSuggestion = (index, prod) => {
    const updated = [...formProducts];
    updated[index] = {
      ...updated[index],
      dta: prod.code,
      brand: prod.brand || '',
      model: prod.name || '',
      price: prod.price || 0,
      dtaStatus: 'ok'
    };
    setFormProducts(updated);
    setDtaSuggestions({ index: null, list: [] });
  };

  // Handle DTA blur — do exact local memory match
  const handleDtaLookup = (index, dtaValue) => {
    const dta = dtaValue.trim().toUpperCase();
    setDtaSuggestions({ index: null, list: [] });
    if (!dta) return;

    const found = productsList.find(p => p.code && p.code.toUpperCase() === dta);
    const updated = [...formProducts];
    if (found) {
      updated[index] = {
        ...updated[index],
        dta: found.code,
        brand: found.brand || '',
        model: found.name || '',
        price: found.price || 0,
        dtaStatus: 'ok'
      };
    } else {
      updated[index] = {
        ...updated[index],
        dta,
        dtaStatus: updated[index].brand ? '' : 'error'
      };
    }
    setFormProducts(updated);
  };

  // Exchanged old DTA lookup — local memory only
  const handleExchangeLookup = () => {
    const dta = formExchOldDta.trim().toUpperCase();
    if (!dta) return;
    const found = productsList.find(p => p.code && p.code.toUpperCase() === dta);
    if (found) {
      setFormExchOldDesc(`${found.brand} ${found.name}`.trim());
    }
  };

  const handleExchDtaTyping = (value) => {
    setFormExchOldDta(value);
    if (!value.trim()) {
      setExchSuggestions([]);
      return;
    }
    const q = value.toLowerCase();
    const matches = productsList.filter(p =>
      (p.code && p.code.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.name && p.name.toLowerCase().includes(q))
    ).slice(0, 6);
    setExchSuggestions(matches);
  };

  const selectExchSuggestion = (prod) => {
    setFormExchOldDta(prod.code || '');
    setFormExchOldDesc(`${prod.brand} ${prod.name}`.trim());
    setFormExchOldValue(parseFloat(prod.price) || 0);
    setExchSuggestions([]);
  };

  const handleExchBlur = () => {
    setTimeout(() => {
      setExchSuggestions([]);
      const dta = formExchOldDta.trim().toUpperCase();
      if (!dta) return;
      const found = productsList.find(p => p.code && p.code.toUpperCase() === dta);
      if (found) {
        setFormExchOldDta(found.code);
        setFormExchOldDesc(`${found.brand} ${found.name}`.trim());
      }
    }, 200);
  };

  // Recalculate price
  const calculateTotalPrice = () => {
    let sum = formProducts.reduce((acc, p) => acc + (parseFloat(p.price) || 0) * (parseInt(p.quantity) || 1), 0);
    if (formDeliveryType === 'Exchange') {
      sum -= (parseFloat(formExchOldValue) || 0);
    }
    return sum;
  };

  // Save delivery (Triggers Preview Modal)
  const saveDelivery = async (e) => {
    e.preventDefault();
    if (!formCustomerName || !formPlace || !formPhone) {
      alert("Please fill in customer name, phone, and place.");
      return;
    }
    if (formDeliveryType === 'Exchange' && !formExchOldDta) {
      alert("Please provide the returned DTA code for the exchange.");
      return;
    }
    if (formDeliveryType === 'Warranty (Return)' && !formWarrantyAction.trim()) {
      alert("Please provide the warranty issue details.");
      return;
    }

    setShowPreview(true);
  };

  // Execute Save Delivery (Actually POSTs/PUTs data to backend)
  const executeSaveDelivery = async () => {
    const payload = {
      date: toApiDate(formDate),
      customer_name: formCustomerName,
      place: formPlace,
      address: formAddress,
      phone: formPhone,
      delivery_by: formDeliveryBy,
      payment_mode: formPaymentMode,
      status: formStatus,
      price: calculateTotalPrice(),
      products_json: JSON.stringify(formProducts.map(p => ({
        dta: p.dta.toUpperCase(),
        brand: p.brand || 'Manual',
        model: p.model || 'Item',
        price: parseFloat(p.price) || 0,
        quantity: parseInt(p.quantity) || 1
      }))),
      delivery_type: formDeliveryType,
      exch_old_dta: formExchOldDta.toUpperCase(),
      exch_old_desc: formExchOldDesc,
      exch_old_value: parseFloat(formExchOldValue) || 0,
      warranty_action: formWarrantyAction,
      jenny: formJenny ? 1 : 0
    };

    try {
      const url = editingId 
        ? `/api/deliveries/${editingId}`
        : '/api/deliveries';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(getApiUrl(url), {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowPreview(false);
        setShowForm(false);
        const savedData = await res.json();
        const updatedRecord = {
          id: editingId || savedData.id,
          ...payload,
          dta_list: payload.products_json ? JSON.parse(payload.products_json).map(p => p.dta).join(", ") : ""
        };
        if (editingId) {
          setDeliveries(prev => prev.map(d => d.id === editingId ? updatedRecord : d));
        } else {
          setDeliveries(prev => [updatedRecord, ...prev]);
        }
        resetForm();
        if (onRefreshApprovals) onRefreshApprovals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete delivery
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this delivery record?")) return;
    try {
      const res = await fetch(getApiUrl(`/api/deliveries/${id}`), {
        method: 'DELETE'
      });
      if (res.ok) {
        setDeliveries(prev => prev.filter(d => d.id !== id));
        if (onRefreshApprovals) onRefreshApprovals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update status inline
  const handleStatusChange = async (id, newStatus) => {
    const original = deliveries.find(d => d.id === id);
    if (!original) return;
    const updated = { ...original, status: newStatus };
    try {
      const res = await fetch(getApiUrl(`/api/deliveries/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
        if (onRefreshApprovals) onRefreshApprovals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Edit delivery
  const startEdit = (d) => {
    setEditingId(d.id);
    setFormCustomerName(d.customer_name);
    setFormDate(toInputDate(d.date));
    setFormPlace(d.place);
    setFormAddress(d.address || '');
    setFormPhone(d.phone);
    setFormDeliveryBy(d.delivery_by || 'Delivery Guy');
    setFormPaymentMode(d.payment_mode || 'Cash');
    setFormStatus(d.status || 'Pending');
    setFormDeliveryType(d.delivery_type || 'Product Delivery');
    setFormExchOldDta(d.exch_old_dta || '');
    setFormExchOldDesc(d.exch_old_desc || '');
    setFormExchOldValue(d.exch_old_value || 0);
    setFormWarrantyAction(d.warranty_action || '');
    setFormJenny(Number(d.jenny) === 1);
    try {
      setFormProducts(JSON.parse(d.products_json || '[]'));
    } catch (e) {
      setFormProducts([{ dta: '', brand: '', model: '', price: 0, quantity: 1 }]);
    }
    setShowForm(true);
  };

  // Status Styling
  const getStatusStyles = (status) => {
    switch (status) {
      case 'Billed Pending':
        return { bg: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.25)' };
      case 'Pending':
        return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.25)' };
      case 'Out for Delivery':
        return { bg: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.25)' };
      case 'Delivered':
        return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)' };
      case 'Cancelled':
        return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.25)' };
      case 'Refunded':
        return { bg: 'rgba(190, 24, 93, 0.1)', color: '#be185d', border: '1px solid rgba(190, 24, 93, 0.25)' };
      default:
        return { bg: 'rgba(156, 163, 175, 0.1)', color: '#9ca3af', border: '1px solid rgba(156, 163, 175, 0.25)' };
    }
  };

  // Filter deliveries list
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(d => {
      // 1. Status Filter
      if (statusFilter !== 'All' && d.status !== statusFilter) return false;

      // 2. Search Text
      if (!search) return true;
      const query = search.toLowerCase().trim();

      let productMatch = false;
      try {
        const items = JSON.parse(d.products_json || '[]');
        productMatch = items.some(p => 
          (p.brand && p.brand.toLowerCase().includes(query)) ||
          (p.model && p.model.toLowerCase().includes(query)) ||
          (p.dta && p.dta.toLowerCase().includes(query))
        );
      } catch (e) {}

      return d.customer_name.toLowerCase().includes(query) ||
             d.phone.includes(query) ||
             d.place.toLowerCase().includes(query) ||
             (d.address && d.address.toLowerCase().includes(query)) ||
             d.status.toLowerCase().includes(query) ||
             productMatch;
    });
  }, [deliveries, statusFilter, search]);

  // Helper function to check if a delivery is a Jenny promoted item
  const isJennyItem = d => d.jenny === true || d.jenny === 'true' || d.jenny === 1 || Number(d.jenny) === 1 || String(d.jenny).trim().toLowerCase() === 'true';

  // Compute Metrics (Strictly excluding Cancelled/Refunded/Jenny from revenue sums)
  const metrics = useMemo(() => {
    const total = deliveries.length;
    const pendingIntake = deliveries.filter(d => d.status === 'Pending' || d.status === 'Billed Pending').length;
    const out = deliveries.filter(d => d.status === 'Out for Delivery').length;
    const delivered = deliveries.filter(d => d.status === 'Delivered').length;

    const totalRev = deliveries
      .filter(d => d.status !== 'Cancelled' && d.status !== 'Refunded' && !isJennyItem(d))
      .reduce((sum, d) => sum + (parseFloat(d.price) || 0.0), 0.0);

    const courierRev = deliveries
      .filter(d => d.delivery_by === 'Courier' && d.status !== 'Cancelled' && d.status !== 'Refunded' && !isJennyItem(d))
      .reduce((sum, d) => sum + (parseFloat(d.price) || 0.0), 0.0);

    const guyRev = deliveries
      .filter(d => d.delivery_by === 'Delivery Guy' && d.status !== 'Cancelled' && d.status !== 'Refunded' && !isJennyItem(d))
      .reduce((sum, d) => sum + (parseFloat(d.price) || 0.0), 0.0);

    const exchangeCount = deliveries.filter(d => d.delivery_type === 'Exchange').length;
    const refundCount = deliveries.filter(d => d.status === 'Refunded').length;

    return { total, pendingIntake, out, delivered, totalRev, courierRev, guyRev, exchangeCount, refundCount };
  }, [deliveries]);

  // Doughnut Math
  const doughnutSectors = useMemo(() => {
    const labels = ["Billed Pending", "Pending", "Out for Delivery", "Delivered", "Cancelled", "Refunded"];
    const colors = ["#fbbf24", "#f59e0b", "#6366f1", "#10b981", "#ef4444", "#be185d"];
    const total = deliveries.length;

    let accumulatedPercent = 0;
    return labels.map((label, idx) => {
      const val = deliveries.filter(d => d.status === label).length;
      const pct = total > 0 ? val / total : 0;
      const startAngle = accumulatedPercent * 360;
      accumulatedPercent += pct;
      const endAngle = accumulatedPercent * 360;
      return { label, val, pct, startAngle, endAngle, color: colors[idx] };
    }).filter(s => s.pct > 0);
  }, [deliveries]);

  // Polar to Cartesian Helper for Donut Arc Drawing
  const polarToCartesian = (cx, cy, r, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      cx, cy,
      x: cx + (r * Math.cos(angleInRadians)),
      y: cy + (r * Math.sin(angleInRadians))
    };
  };

  const getArcPath = (cx, cy, r, startAngle, endAngle) => {
    const delta = endAngle - startAngle;
    const actualEndAngle = delta >= 360 ? startAngle + 359.99 : endAngle;
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, actualEndAngle);
    const largeArcFlag = delta > 180 ? "1" : "0";
    return [
      "M", start.x, start.y,
      "A", r, r, 0, largeArcFlag, 1, end.x, end.y
    ].join(" ");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Simplified High-Contrast Stats Bar */}
      <div className="card card-p" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderRight: '1px solid var(--border-light-color)', paddingRight: 16 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Revenue</span>
          <span className="revenue-highlight" style={{ fontSize: '1.45rem', fontWeight: 800 }}>AED {metrics.totalRev.toLocaleString("en-AE", { minimumFractionDigits: 2 })}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderRight: '1px solid var(--border-light-color)', paddingRight: 16 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Deliveries</span>
          <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>{metrics.total} logs</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderRight: '1px solid var(--border-light-color)', paddingRight: 16 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Delivered Successfully</span>
          <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--green, #10b981)' }}>{metrics.delivered}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending / In Transit</span>
          <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f59e0b' }}>{metrics.pendingIntake}</span>
        </div>
      </div>

      {/* Unified Action Filter Card */}
      <div className="card card-p" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          
          {/* Mode Switcher */}
          <div style={{ display: 'flex', gap: 8, background: 'var(--bg-input, rgba(0,0,0,0.05))', padding: 4, borderRadius: 8, border: '1px solid var(--border-light)' }}>
            <button
              onClick={() => setDeliveryMode('all')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.8rem',
                backgroundColor: deliveryMode === 'all' ? 'var(--citrus)' : 'transparent',
                color: deliveryMode === 'all' ? '#000' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              All Deliveries
            </button>
            <button
              onClick={() => setDeliveryMode('daily')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.8rem',
                backgroundColor: deliveryMode === 'daily' ? 'var(--citrus)' : 'transparent',
                color: deliveryMode === 'daily' ? '#000' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              Daily View
            </button>
            <button
              onClick={() => setDeliveryMode('monthly')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.8rem',
                backgroundColor: deliveryMode === 'monthly' ? 'var(--citrus)' : 'transparent',
                color: deliveryMode === 'monthly' ? '#000' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              Monthly View
            </button>
          </div>

          {/* Date Selector Pager */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {deliveryMode === 'daily' ? (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button type="button" onClick={handlePrevDay} className="btn btn-secondary" style={{ padding: 4, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800 }}>&lt;</button>
                <input
                  type="date"
                  className="field-input"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  style={{ width: 148, padding: '6px 10px', borderRadius: 8 }}
                />
                <button type="button" onClick={handleNextDay} className="btn btn-secondary" style={{ padding: 4, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800 }}>&gt;</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 6 }}>
                <select
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="field-input"
                  style={{ padding: '6px 10px', borderRadius: 8 }}
                >
                  {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(m => (
                    <option key={m} value={m}>{new Date(2020, parseInt(m) - 1).toLocaleString('default', { month: 'short' })}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                  className="field-input"
                  style={{ padding: '6px 10px', borderRadius: 8 }}
                >
                  {[2026, 2025, 2024, 2023].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Quick Registry Action buttons */}
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={16} /> Register Delivery
            </button>
            <button className="btn btn-secondary" onClick={() => {
              const queryParam = deliveryMode === 'monthly' ? `month=${selectedMonth}-${selectedYear}` : `date=${toApiDate(selectedDate)}`;
              window.open(`/api/deliveries/export-pdf?${queryParam}`, '_blank');
            }}>
              <FileText size={16} style={{ marginRight: 4 }} /> Export PDF
            </button>
          </div>
        </div>

        {/* Row 2: Search & Status Dropdown */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
            <input
              type="text"
              placeholder="Search customer, phone, DTA product..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="field-input"
              style={{
                width: '100%',
                paddingLeft: '34px',
                outline: 'none'
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="field-input"
            style={{ padding: '8px 12px', width: 148 }}
          >
            <option value="All">All Statuses</option>
            <option value="Billed Pending">Billed Pending</option>
            <option value="Pending">Pending</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>



      {/* Creation/Edit Popup Modal Overlay */}
      <AnimatePresence>
        {showForm && (
          <div 
            onClick={() => { setShowForm(false); resetForm(); }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              backdropFilter: 'blur(5px)',
              padding: 20
            }}
          >
            <motion.div
              onClick={e => e.stopPropagation()} // Stop propagation to prevent overlay clicks from closing
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="modal-responsive"
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--border-light)', paddingBottom: 12 }}>
                <h3 className="font-heading" style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  {editingId ? 'Edit Dispatch Registry Entry' : 'New Customer Dispatch Log'}
                </h3>
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }} style={{ background: 'none', border: 'none', fontSize: '1.4rem', fontWeight: 800, cursor: 'pointer', color: 'var(--text-primary)' }}>✕</button>
              </div>

              {/* Modal Body / Form */}
              <form onSubmit={saveDelivery} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* ── Section A: Customer Details ── */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 3, height: 16, borderRadius: 2, background: 'var(--purple)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Customer Details</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Customer Name *</label>
                        <input type="text" className="modal-field-input" value={formCustomerName} onChange={e => setFormCustomerName(e.target.value)} required placeholder="Full name" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Phone Number *</label>
                        <input type="text" className="modal-field-input" value={formPhone} onChange={e => setFormPhone(e.target.value)} required placeholder="e.g. +971 50 123 4567" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Place / Region *</label>
                        <input type="text" className="modal-field-input" value={formPlace} onChange={e => setFormPlace(e.target.value)} placeholder="e.g. Dubai Marina, Ajman" required />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Full Address</label>
                      <input type="text" className="modal-field-input" value={formAddress} onChange={e => setFormAddress(e.target.value)} placeholder="Apartment, building, street, detailed location (optional)" />
                    </div>
                  </div>
                </div>

                {/* ── Section B: Logistics & Status ── */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 3, height: 16, borderRadius: 2, background: 'var(--cyan)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Logistics & Status</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Dispatch Date</label>
                      <input type="date" className="modal-field-input" value={formDate} onChange={e => setFormDate(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Carrier</label>
                      <select className="modal-field-input" value={formDeliveryBy} onChange={e => setFormDeliveryBy(e.target.value)}>
                        <option value="Delivery Guy">Delivery Guy</option>
                        <option value="Courier">Courier</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Payment Mode</label>
                      <select className="modal-field-input" value={formPaymentMode} onChange={e => setFormPaymentMode(e.target.value)}>
                        {['COD', 'Card', 'Cash', 'Tabby', 'Tamara', 'Bank Transfer', 'Payment Link', 'Nil'].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</label>
                      <select className="modal-field-input" value={formStatus} onChange={e => setFormStatus(e.target.value)}>
                        {['Billed Pending', 'Pending', 'Out for Delivery', 'Delivered', 'Cancelled', 'Refunded'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Delivery Type</label>
                      <select className="modal-field-input" value={formDeliveryType} onChange={e => setFormDeliveryType(e.target.value)}>
                        <option value="Product Delivery">Product Delivery</option>
                        <option value="Exchange">Exchange</option>
                        <option value="Refund">Refund</option>
                        <option value="Warranty Delivery">Warranty Delivery</option>
                        <option value="Warranty (Return)">Warranty Return</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* ── Section C: Dispatched Products ── */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 3, height: 16, borderRadius: 2, background: 'var(--green)', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Dispatched Products ({formProducts.length})</span>
                    </div>
                    <button type="button" className="btn btn-secondary" onClick={() => setFormProducts([...formProducts, { dta: '', brand: '', model: '', price: 0, quantity: 1, dtaStatus: '' }])} style={{ padding: '4px 10px', fontSize: '0.7rem' }}>
                      + Add Row
                    </button>
                  </div>

                  {/* Column header + rows — single scroll wrapper for mobile */}
                  <div className="form-row-scroll">
                  <div className="form-row-scroll-inner" style={{ minWidth: 440 }}>

                  {/* Column header labels */}
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 100px 1fr 88px 56px 36px', gap: 6, padding: '0 2px', marginBottom: 4 }}>
                    {['DTA Code', 'Brand', 'Model / Spec', 'Unit Price', 'Qty', ''].map((h, i) => (
                      <span key={i} style={{ fontSize: '0.63rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {formProducts.map((p, idx) => (
                      <div key={idx}>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 100px 1fr 88px 56px 36px', gap: 6, alignItems: 'center' }}>
                          {/* DTA Code with autocomplete */}
                          <div style={{ position: 'relative' }}>
                            <input
                              type="text"
                              placeholder="DTA Code"
                              className={`modal-field-input${p.dtaStatus === 'ok' ? ' dta-ok' : p.dtaStatus === 'error' ? ' dta-error' : ''}`}
                              value={p.dta}
                              style={{ textTransform: 'uppercase' }}
                              onChange={e => handleDtaTyping(idx, e.target.value)}
                              onBlur={e => {
                                const val = e.target.value;
                                setTimeout(() => {
                                  handleDtaLookup(idx, val);
                                }, 200);
                              }}
                            />
                            {/* Suggestions dropdown */}
                            {dtaSuggestions.index === idx && dtaSuggestions.list.length > 0 && (
                              <div style={{ zIndex: 9999, background: 'var(--bg-card)', border: '1px solid var(--border-light-color)', borderRadius: 6, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', overflow: 'hidden', marginTop: 4 }}>
                                {dtaSuggestions.list.map((prod, si) => (
                                  <div
                                    key={si}
                                    onMouseDown={e => { e.preventDefault(); selectDtaSuggestion(idx, prod); }}
                                    style={{ padding: '6px 10px', cursor: 'pointer', borderBottom: '1px solid var(--border-light-color)', display: 'flex', flexDirection: 'column', gap: 1 }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.08)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--purple)' }}>{prod.code}</span>
                                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{prod.brand} — {prod.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          {/* Brand */}
                          <input
                            type="text"
                            placeholder="Brand"
                            className="modal-field-input"
                            value={p.brand}
                            onChange={e => {
                              const updated = [...formProducts];
                              updated[idx].brand = e.target.value;
                              setFormProducts(updated);
                            }}
                          />
                          {/* Model Spec */}
                          <input
                            type="text"
                            placeholder="Model / Spec"
                            className="modal-field-input"
                            value={p.model}
                            onChange={e => {
                              const updated = [...formProducts];
                              updated[idx].model = e.target.value;
                              setFormProducts(updated);
                            }}
                          />
                          {/* Unit Price */}
                          <input
                            type="number"
                            placeholder="AED"
                            className="modal-field-input"
                            value={p.price || ''}
                            onChange={e => {
                              const updated = [...formProducts];
                              updated[idx].price = parseFloat(e.target.value) || 0;
                              setFormProducts(updated);
                            }}
                          />
                          {/* Qty */}
                          <input
                            type="number"
                            placeholder="1"
                            className="modal-field-input"
                            value={p.quantity}
                            min="1"
                            onChange={e => {
                              const updated = [...formProducts];
                              updated[idx].quantity = parseInt(e.target.value) || 1;
                              setFormProducts(updated);
                            }}
                          />
                          {/* Delete */}
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={() => {
                                if (formProducts.length > 1) {
                                  setFormProducts(formProducts.filter((_, i) => i !== idx));
                                }
                              }}
                              style={{ background: 'transparent', border: 'none', color: 'var(--pink)', fontSize: '1.1rem', cursor: 'pointer', padding: '4px 6px', borderRadius: 4, lineHeight: 1 }}
                              title="Remove row"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  </div>{/* form-row-scroll-inner */}
                  </div>{/* form-row-scroll */}
                </div>

                {/* Exchanged Details Section */}
                {formDeliveryType === 'Exchange' && (
                  <div style={{ background: 'rgba(255,0,127,0.04)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,0,127,0.2)' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--pink)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>↩ Exchange — Returned Item Details</div>
                  <div className="mobile-form-grid-3">
                      <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Returned DTA</label>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type="text" 
                            className="modal-field-input" 
                            value={formExchOldDta} 
                            onChange={e => handleExchDtaTyping(e.target.value)} 
                            onBlur={handleExchBlur} 
                            style={{ textTransform: 'uppercase' }} 
                            placeholder="e.g. DTAX0799" 
                          />
                          {exchSuggestions.length > 0 && (
                            <div style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              background: '#fff',
                              border: '2px solid #000',
                              borderRadius: '4px',
                              zIndex: 9999,
                              maxHeight: '150px',
                              overflowY: 'auto',
                              boxShadow: '4px 4px 0px #000',
                              marginTop: '4px'
                            }}>
                              {exchSuggestions.map((prod, sIdx) => (
                                <div
                                  key={sIdx}
                                  onClick={() => selectExchSuggestion(prod)}
                                  style={{
                                    padding: '6px 10px',
                                    cursor: 'pointer',
                                    fontSize: '0.78rem',
                                    borderBottom: '1px solid #eee',
                                    color: '#000',
                                    fontFamily: 'var(--font-mono)'
                                  }}
                                  onMouseDown={(e) => e.preventDefault()}
                                >
                                  <strong>{prod.code}</strong> - {prod.brand} {prod.name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Returned Item Description</label>
                        <input type="text" className="modal-field-input" value={formExchOldDesc} onChange={e => setFormExchOldDesc(e.target.value)} placeholder="Auto-filled on DTA lookup" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Returned Value (AED)</label>
                        <input type="number" className="modal-field-input" value={formExchOldValue || ''} onChange={e => setFormExchOldValue(parseFloat(e.target.value) || 0)} placeholder="0.00" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Warranty Issue Details Section */}
                {formDeliveryType === 'Warranty (Return)' && (
                  <div style={{ background: 'rgba(239,68,68,0.04)', padding: 12, borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>⚠ Warranty Issue Details *</label>
                    <input
                      type="text"
                      className="modal-field-input"
                      value={formWarrantyAction}
                      onChange={e => setFormWarrantyAction(e.target.value)}
                      placeholder="Describe the issue (e.g. Screen flickering, Keyboard error, Dead pixel)"
                      required
                    />
                  </div>
                )}

                {/* Bottom Row - Jenny & Pricing */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light-color)', paddingTop: 14 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.78rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formJenny} onChange={e => setFormJenny(e.target.checked)} />
                    <span style={{ color: 'var(--pink)', fontWeight: 700 }}>Jenny Promotion Logistics</span>
                  </label>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.63rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Net Price</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>AED {calculateTotalPrice().toFixed(2)}</div>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid var(--border-light-color)', paddingTop: 14 }}>
                  <button type="button" className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '0.8rem' }} onClick={() => { setShowForm(false); resetForm(); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.8rem', fontWeight: 700 }}>Save Dispatch Log</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Dispatch Details Preview Modal Overlay */}
      <AnimatePresence>
        {showPreview && (
          <div 
            onClick={() => setShowPreview(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              backdropFilter: 'blur(5px)',
              padding: 20
            }}
          >
            <motion.div
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card card-p-lg"
              style={{
                width: '100%',
                maxWidth: '520px',
                background: 'var(--bg-card)',
                border: '2px solid #000',
                borderRadius: 12,
                boxShadow: 'var(--shadow-flat-lg, 0 10px 0 #000)',
                padding: '24px',
                fontFamily: 'var(--font-mono, monospace)',
              }}
            >
              {/* Preview Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px dashed var(--border-light-color)', paddingBottom: 14, marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  🔍 Dispatch Review
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Verify details before logging to system</span>
              </div>

              {/* Preview Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.8rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
                  <strong>{formCustomerName}</strong>

                  <span style={{ color: 'var(--text-muted)' }}>Phone:</span>
                  <span>{formPhone}</span>

                  <span style={{ color: 'var(--text-muted)' }}>Region/Place:</span>
                  <span>{formPlace}</span>

                  {formAddress && (
                    <>
                      <span style={{ color: 'var(--text-muted)' }}>Address:</span>
                      <span style={{ fontStyle: 'italic' }}>{formAddress}</span>
                    </>
                  )}

                  <span style={{ color: 'var(--text-muted)' }}>Dispatch Date:</span>
                  <span>{formDate}</span>

                  <span style={{ color: 'var(--text-muted)' }}>Type:</span>
                  <span style={{ fontWeight: 700, color: 'var(--purple)' }}>{formDeliveryType}</span>

                  <span style={{ color: 'var(--text-muted)' }}>Carrier:</span>
                  <span>{formDeliveryBy}</span>

                  <span style={{ color: 'var(--text-muted)' }}>Payment Mode:</span>
                  <span>{formPaymentMode}</span>
                </div>

                {/* Exchanged Item Details */}
                {formDeliveryType === 'Exchange' && (
                  <div style={{ background: 'rgba(255,0,127,0.04)', border: '1px solid rgba(255,0,127,0.2)', padding: 10, borderRadius: 6, marginTop: 4 }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--pink)', textTransform: 'uppercase', marginBottom: 4 }}>Returned Item Details:</div>
                    <div>DTA: <strong>{formExchOldDta}</strong></div>
                    {formExchOldDesc && <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{formExchOldDesc}</div>}
                    <div style={{ fontSize: '0.72rem' }}>Credit Value: AED {formExchOldValue}</div>
                  </div>
                )}

                {/* Warranty Details */}
                {formDeliveryType === 'Warranty (Return)' && (
                  <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)', padding: 10, borderRadius: 6, marginTop: 4 }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', marginBottom: 4 }}>Warranty Issue Details:</div>
                    <div style={{ fontSize: '0.74rem' }}>{formWarrantyAction}</div>
                  </div>
                )}

                {/* Products List section */}
                <div style={{ borderTop: '2px dashed var(--border-light-color)', borderBottom: '2px dashed var(--border-light-color)', padding: '12px 0', margin: '8px 0' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>Dispatched Items:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {formProducts.map((p, idx) => (
                      <div key={idx} style={{ borderBottom: idx < formProducts.length - 1 ? '1px dashed var(--border-light-color)' : 'none', paddingBottom: idx < formProducts.length - 1 ? 8 : 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.76rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                          {p.brand} {p.model}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          <div>
                            <span>DTA: <strong style={{ color: 'var(--text-secondary)' }}>{p.dta.toUpperCase()}</strong></span>
                            <span style={{ margin: '0 8px', opacity: 0.3 }}>|</span>
                            <span>Qty: <strong style={{ color: 'var(--text-secondary)' }}>{p.quantity}</strong></span>
                          </div>
                          <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.74rem' }}>
                            AED {((parseFloat(p.price) || 0) * (parseInt(p.quantity) || 1)).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Promos */}
                {formJenny && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--pink)', fontWeight: 700 }}>
                    ★ Jenny Promotion Logistics Applied
                  </div>
                )}

                {/* Pricing summary */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '4px 0' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>TOTAL AMOUNT:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900 }} className="revenue-highlight">
                    AED {calculateTotalPrice().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 20, borderTop: '1px solid var(--border-light-color)', paddingTop: 14 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ flex: 1, padding: '10px 0', fontSize: '0.8rem', fontWeight: 700, justifyContent: 'center' }}
                  onClick={() => setShowPreview(false)}
                >
                  Edit Details
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ flex: 1.3, padding: '10px 0', fontSize: '0.8rem', fontWeight: 800, justifyContent: 'center' }}
                  onClick={executeSaveDelivery}
                >
                  Confirm & Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Standardized Ledger View */}
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Customer & Address</th>
              <th>Product details</th>
              <th style={{ textAlign: 'right' }}>Price</th>
              <th>Logistics</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeliveries.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '24px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  No deliveries registered for this query. Add one above!
                </td>
              </tr>
            ) : (
              filteredDeliveries.map((d, index) => {
                let itemsList = [];
                try {
                  itemsList = JSON.parse(d.products_json || '[]');
                } catch (e) {}

                const statusStyles = getStatusStyles(d.status);

                return (
                  <tr key={d.id}>
                    <td style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{index + 1}</td>
                    <td style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{d.date}</td>
                    <td>
                      <div>
                        <strong>{d.customer_name}</strong>
                        {Number(d.jenny) === 1 && (
                          <span style={{ fontSize: '0.62rem', fontWeight: 700, background: 'rgba(190,24,93,0.15)', color: '#be185d', padding: '1px 4px', borderRadius: 4, marginLeft: 6 }}>Jenny</span>
                        )}
                        {d.delivery_type && d.delivery_type !== 'Product Delivery' && (
                          <span style={{ fontSize: '0.62rem', fontWeight: 700, background: 'rgba(236,72,153,0.15)', color: '#ec4899', padding: '1px 4px', borderRadius: 4, marginLeft: 6 }}>{d.delivery_type}</span>
                        )}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: 2 }}>Ph: {d.phone} | Place: {d.place}</div>
                      {d.address && <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontStyle: 'italic' }}>{d.address}</div>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {itemsList.map((item, itemIdx) => (
                          <div key={itemIdx} style={{ borderBottom: itemIdx < itemsList.length - 1 ? '1px dashed var(--border-light)' : 'none', paddingBottom: 2 }}>
                            • <strong>{item.brand} {item.model}</strong> <span style={{ color: 'var(--purple)', fontWeight: 'bold' }}>(x{item.quantity})</span>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>DTA: {item.dta} | Price: AED {item.price}</div>
                          </div>
                        ))}
                        {d.delivery_type === 'Exchange' && d.exch_old_dta && (
                          <div style={{ padding: 6, background: 'rgba(236,72,153,0.06)', border: '1px solid rgba(236,72,153,0.12)', borderRadius: 6, color: '#ec4899', marginTop: 4 }}>
                            🔄 Exchanged Item: <strong>{d.exch_old_dta}</strong> ({d.exch_old_desc}) Value: AED {d.exch_old_value}
                          </div>
                        )}
                        {d.delivery_type === 'Warranty (Return)' && d.warranty_action && (
                          <div style={{ padding: 6, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: 6, color: '#ef4444', marginTop: 4 }}>
                            🔧 Issue: <strong>{d.warranty_action}</strong>
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.75rem', fontWeight: 700, textAlign: 'right' }} className="revenue-highlight">
                      AED {parseFloat(d.price).toFixed(2)}
                    </td>
                    <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <div>Carrier: <strong>{d.delivery_by}</strong></div>
                      <div>MOP: <strong>{d.payment_mode}</strong></div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <select
                          value={d.status}
                          onChange={(e) => handleStatusChange(d.id, e.target.value)}
                          style={{
                            backgroundColor: statusStyles.bg,
                            color: statusStyles.color,
                            border: statusStyles.border,
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            outline: 'none',
                            appearance: 'none',
                            textAlign: 'center',
                            minWidth: 120
                          }}
                        >
                          {['Billed Pending', 'Pending', 'Out for Delivery', 'Delivered', 'Cancelled', 'Refunded'].map(s => (
                            <option key={s} value={s} style={{ backgroundColor: '#18181b', color: '#fff' }}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button
                          className="btn btn-ghost"
                          onClick={() => startEdit(d)}
                          style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-pink"
                          onClick={() => handleDelete(d.id)}
                          style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr style={{ background: 'var(--bg-card)', fontWeight: 800, borderTop: '2px solid var(--border-light-color)' }}>
              <td colSpan="4" style={{ textAlign: 'right', padding: '12px 16px', fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                Total Revenue (Excluding Jenny):
              </td>
              <td style={{ textAlign: 'right', padding: '12px 10px', fontSize: '0.95rem', color: 'var(--citrus)' }} className="revenue-highlight">
                AED {filteredDeliveries
                  .filter(d => d.status !== 'Cancelled' && d.status !== 'Refunded' && !isJennyItem(d))
                  .reduce((sum, d) => sum + (parseFloat(d.price) || 0.0), 0.0)
                  .toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td colSpan="3" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', paddingLeft: 12 }}>
                {filteredDeliveries.filter(d => isJennyItem(d)).length} Jenny items excluded
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
function WarrantyPanel({ productsList = [] }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('Pending'); // 'Pending' | 'Resolved'
  const [search, setSearch] = useState('');

  // Date helpers
  const getTodayInputStr = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const toApiDate = (inputDateStr) => {
    if (!inputDateStr) return '';
    const parts = inputDateStr.split('-');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return inputDateStr;
  };

  const toInputDate = (apiDateStr) => {
    if (!apiDateStr) return '';
    const parts = apiDateStr.split('-');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return apiDateStr;
  };

  // Intake Form Modal State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formClaimDate, setFormClaimDate] = useState(getTodayInputStr());
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formPhoneNumber, setFormPhoneNumber] = useState('');
  const [formLocation, setFormLocation] = useState('');
  
  const [formFulfillmentType, setFormFulfillmentType] = useState('In-Store'); // 'In-Store' | 'Delivery'
  const [formIsOutside, setFormIsOutside] = useState(false);
  const [formWarrantyStatus, setFormWarrantyStatus] = useState('Warranty'); // 'Warranty' | 'Out of Warranty'
  
  const [formDta, setFormDta] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formIssueNote, setFormIssueNote] = useState('');

  // Resolve Modal State
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [resolveClaimId, setResolveClaimId] = useState(null);
  const [resolveStatus, setResolveStatus] = useState('Repaired'); // 'Repaired' | 'Replaced' | 'Returned Unfixed'
  const [resolveDate, setResolveDate] = useState(getTodayInputStr());
  const [resolveRepairNote, setResolveRepairNote] = useState('');
  const [resolveRepairCost, setResolveRepairCost] = useState(0);

  // Exchange resolution fields
  const [resolveNewDta, setResolveNewDta] = useState('');
  const [resolveNewBrand, setResolveNewBrand] = useState('');
  const [resolveNewModel, setResolveNewModel] = useState('');
  const [resolveExchNotes, setResolveExchNotes] = useState('');

  // Refund resolution fields
  const [resolveRefundAmount, setResolveRefundAmount] = useState(0);
  const [resolveRefundNotes, setResolveRefundNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  // Expansion state
  const [expandedRowId, setExpandedRowId] = useState(null);

  // Date and month filters state
  const [dateFilterMode, setDateFilterMode] = useState('All'); // 'All' | 'Daily' | 'Monthly'
  const [filterDate, setFilterDate] = useState(getTodayInputStr());
  const [filterMonth, setFilterMonth] = useState(() => {
    const d = new Date();
    return String(d.getMonth() + 1).padStart(2, '0');
  });
  const [filterYear, setFilterYear] = useState(() => String(new Date().getFullYear()));

  // Auto toggler outside product
  useEffect(() => {
    if (formIsOutside) {
      setFormWarrantyStatus('Out of Warranty');
    } else {
      setFormWarrantyStatus('Warranty');
    }
  }, [formIsOutside]);

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setFormClaimDate(getTodayInputStr());
    setFormCustomerName('');
    setFormPhoneNumber('');
    setFormLocation('');
    setFormFulfillmentType('In-Store');
    setFormIsOutside(false);
    setFormWarrantyStatus('Warranty');
    setFormDta('');
    setFormBrand('');
    setFormModel('');
    setFormIssueNote('');
  };

  const resetResolveForm = () => {
    setResolveClaimId(null);
    setResolveStatus('Repaired');
    setResolveDate(getTodayInputStr());
    setResolveRepairNote('');
    setResolveRepairCost(0);
    setResolveNewDta('');
    setResolveNewBrand('');
    setResolveNewModel('');
    setResolveExchNotes('');
    setResolveRefundAmount(0);
    setResolveRefundNotes('');
  };

  // Fetch claims
  const loadClaims = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/warranty'));
      if (res.ok) {
        const data = await res.json();
        setClaims(data || []);
      }
    } catch (err) {
      console.error('Failed to load warranty claims:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Live polling
  useEffect(() => {
    loadClaims();
    const interval = setInterval(loadClaims, 3000);
    return () => clearInterval(interval);
  }, [loadClaims]);

  // Autocomplete suggestions state
  const [dtaSuggestions, setDtaSuggestions] = useState([]);
  const [exchSuggestions, setExchSuggestions] = useState([]);

  const handleDtaTyping = (value) => {
    setFormDta(value);
    if (!value.trim()) {
      setDtaSuggestions([]);
      return;
    }
    const matches = productsList.filter(p =>
      (p.code && p.code.toLowerCase().includes(value.toLowerCase())) ||
      (p.brand && p.brand.toLowerCase().includes(value.toLowerCase())) ||
      (p.name && p.name.toLowerCase().includes(value.toLowerCase()))
    ).slice(0, 5);
    setDtaSuggestions(matches);
  };

  const selectDtaSuggestion = (prod) => {
    setFormDta(prod.code || '');
    setFormBrand(prod.brand || '');
    setFormModel(prod.name || '');
    setDtaSuggestions([]);
  };

  const handleExchDtaTyping = (value) => {
    setResolveNewDta(value);
    if (!value.trim()) {
      setExchSuggestions([]);
      return;
    }
    const matches = productsList.filter(p =>
      (p.code && p.code.toLowerCase().includes(value.toLowerCase())) ||
      (p.brand && p.brand.toLowerCase().includes(value.toLowerCase())) ||
      (p.name && p.name.toLowerCase().includes(value.toLowerCase()))
    ).slice(0, 5);
    setExchSuggestions(matches);
  };

  const selectExchSuggestion = (prod) => {
    setResolveNewDta(prod.code || '');
    setResolveNewBrand(prod.brand || '');
    setResolveNewModel(prod.name || '');
    setExchSuggestions([]);
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setFormClaimDate(c.claim_date || getTodayInputStr());
    setFormCustomerName(c.customer_name || '');
    setFormPhoneNumber(c.phone_number || '');
    setFormLocation(c.location || '');
    setFormFulfillmentType(c.fulfillment_type || 'In-Store');
    setFormIsOutside(c.is_outside === 1);
    setFormWarrantyStatus(c.warranty_status || 'Warranty');
    setFormDta(c.dta || '');
    setFormBrand(c.brand || '');
    setFormModel(c.model || '');
    setFormIssueNote(c.issue_note || '');
    setShowForm(true);
  };

  const startResolve = (id) => {
    setResolveClaimId(id);
    setResolveDate(getTodayInputStr());
    setResolveStatus('Repaired');
    setShowResolveForm(true);
  };

  const saveClaim = async (e) => {
    e.preventDefault();
    const payload = {
      claim_date: formClaimDate,
      customer_name: formCustomerName,
      phone_number: formPhoneNumber,
      location: formLocation,
      fulfillment_type: formFulfillmentType,
      is_outside: formIsOutside ? 1 : 0,
      warranty_status: formWarrantyStatus,
      dta: formDta,
      brand: formBrand,
      model: formModel,
      issue_note: formIssueNote,
      status: editingId ? claims.find(c => c.id === editingId)?.status || 'Pending' : 'Pending',
      products_json: JSON.stringify([{ dta: formDta, brand: formBrand, model: formModel, qty: 1 }])
    };

    try {
      const url = editingId 
        ? `/api/warranty/${editingId}/edit`
        : '/api/warranty';
      
      const res = await fetch(getApiUrl(url), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowForm(false);
        const savedData = await res.json();
        const updatedRecord = {
          id: editingId || savedData.id,
          ...payload
        };
        if (editingId) {
          setClaims(prev => prev.map(c => c.id === editingId ? updatedRecord : c));
        } else {
          setClaims(prev => [updatedRecord, ...prev]);
        }
        resetForm();
      }
    } catch (err) {
      console.error('Failed to save claim:', err);
    }
  };

  const saveResolution = async (e) => {
    e.preventDefault();
    const claim = claims.find(c => c.id === resolveClaimId);
    if (!claim) return;

    let updatePayload = {
      ...claim,
      status: resolveStatus,
      action_date: resolveDate,
      repair_note: resolveStatus === 'Repaired' ? resolveRepairNote : (resolveStatus === 'Replaced' ? resolveExchNotes : resolveRefundNotes),
      repair_cost: resolveStatus === 'Repaired' ? parseFloat(resolveRepairCost) || 0.0 : 0.0,
      exch_new_dta: resolveStatus === 'Replaced' ? resolveNewDta : '',
      exch_new_brand: resolveStatus === 'Replaced' ? resolveNewBrand : '',
      exch_new_model: resolveStatus === 'Replaced' ? resolveNewModel : '',
      refund_amount: resolveStatus === 'Returned Unfixed' ? parseFloat(resolveRefundAmount) || 0.0 : 0.0
    };

    setIsResolving(true);
    try {
      if (resolveStatus === 'Replaced') {
        const billPayload = {
          date: toApiDate(resolveDate),
          customer_name: claim.customer_name,
          payment_mode: "Cash",
          mixed_cash: 0.0,
          mixed_card: 0.0,
          mixed_tabby: 0.0,
          mixed_tamara: 0.0,
          mixed_bank: 0.0,
          note: `Warranty Exchange: ${resolveExchNotes.trim()}`,
          transaction_type: "Exchange",
          platform: "Regular Customer",
          delivery: false,
          exch_new_brand: resolveNewBrand,
          exch_new_model: resolveNewModel,
          exch_new_dta: resolveNewDta,
          exch_new_price: 0.0,
          exch_old_brand: claim.brand,
          exch_old_model: claim.model,
          exch_old_dta: claim.dta,
          exch_old_price: 0.0,
          exch_balance: 0.0,
          source: "Inventory",
          warranty_claim_id: parseInt(resolveClaimId)
        };

        const billRes = await fetch(getApiUrl('/api/bills'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(billPayload)
        });
        if (!billRes.ok) console.error('Failed to create exchange bill transaction');
      }

      if (resolveStatus === 'Returned Unfixed') {
        const billPayload = {
          date: toApiDate(resolveDate),
          customer_name: claim.customer_name,
          brand: claim.brand,
          model: claim.model,
          dta: claim.dta,
          price: parseFloat(resolveRefundAmount) || 0.0,
          payment_mode: "Cash",
          note: `Warranty Return: ${resolveRefundNotes.trim()}`,
          transaction_type: "Return",
          platform: "Regular Customer",
          delivery: false,
          warranty_claim_id: parseInt(resolveClaimId)
        };

        const billRes = await fetch(getApiUrl('/api/bills'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(billPayload)
        });
        if (!billRes.ok) console.error('Failed to create return bill transaction');
      }

      const res = await fetch(getApiUrl(`/api/warranty/${resolveClaimId}/resolve`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });

      if (res.ok) {
        setShowResolveForm(false);
        setClaims(prev => prev.map(c => c.id === resolveClaimId ? updatePayload : c));
        resetResolveForm();
        alert('Warranty claim resolved successfully!');
      } else {
        alert('Failed to save resolution. Please try again.');
      }
    } catch (err) {
      console.error('Failed to resolve claim:', err);
      alert('Error connecting to the server. Please check your connection.');
    } finally {
      setIsResolving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this claim log?')) return;
    try {
      const res = await fetch(getApiUrl(`/api/warranty/${id}`), {
        method: 'DELETE'
      });
      if (res.ok) {
        setClaims(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete claim:', err);
    }
  };

  // Filter logic: Pending (status === 'Pending') vs Resolved (status !== 'Pending')
  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      const matchTab = currentTab === 'Resolved' ? c.status !== 'Pending' : c.status === 'Pending';
      if (!matchTab) return false;

      // Filter by Date Mode
      if (dateFilterMode === 'Daily') {
        if (filterDate && c.claim_date !== filterDate) return false;
      } else if (dateFilterMode === 'Monthly') {
        if (filterMonth && filterYear) {
          const targetPrefix = `${filterYear}-${filterMonth}`;
          if (!c.claim_date || !c.claim_date.startsWith(targetPrefix)) return false;
        }
      }

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (c.customer_name || '').toLowerCase().includes(q) ||
        (c.phone_number || '').toLowerCase().includes(q) ||
        (c.location || '').toLowerCase().includes(q) ||
        (c.dta || '').toLowerCase().includes(q) ||
        (c.brand || '').toLowerCase().includes(q) ||
        (c.model || '').toLowerCase().includes(q) ||
        (c.issue_note || '').toLowerCase().includes(q)
      );
    });
  }, [claims, currentTab, search, dateFilterMode, filterDate, filterMonth, filterYear]);

  const metrics = useMemo(() => {
    const total = claims.length;
    const pending = claims.filter(c => c.status === 'Pending').length;
    const resolved = total - pending;
    const totalCost = claims.reduce((acc, c) => acc + (parseFloat(c.repair_cost) || 0), 0);
    return { total, pending, resolved, totalCost };
  }, [claims]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      {/* Metrics Row */}
      <div className="card card-p" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderRight: '1px solid var(--border-light-color)', paddingRight: 16 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Intake</span>
          <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>{metrics.total} logs</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderRight: '1px solid var(--border-light-color)', paddingRight: 16 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending Claims</span>
          <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f59e0b' }}>{metrics.pending} pending</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderRight: '1px solid var(--border-light-color)', paddingRight: 16 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Resolved Claims</span>
          <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--green, #10b981)' }}>{metrics.resolved}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Repair Cost</span>
          <span className="revenue-highlight" style={{ fontSize: '1.45rem', fontWeight: 800 }}>AED {metrics.totalCost.toLocaleString("en-AE", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Action Filters Card */}
      <div className="card card-p" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Row 1: Queue Switcher (left) & Actions (right) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          {/* Tabs switch */}
          <div style={{ display: 'flex', gap: 8, background: 'var(--bg-input, rgba(0,0,0,0.05))', padding: 4, borderRadius: 8, border: '1px solid var(--border-light)', position: 'relative' }}>
            <button
              onClick={() => setCurrentTab('Pending')}
              style={{
                position: 'relative',
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.8rem',
                backgroundColor: 'transparent',
                color: currentTab === 'Pending' ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                zIndex: 1
              }}
            >
              {currentTab === 'Pending' && (
                <motion.div
                  layoutId="activeTabIndicator"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'var(--purple)',
                    borderRadius: '6px',
                    zIndex: -1
                  }}
                  transition={{ type: 'tween', ease: 'easeInOut', duration: 0.22 }}
                />
              )}
              ⏳ Pending Claims
            </button>
            <button
              onClick={() => setCurrentTab('Resolved')}
              style={{
                position: 'relative',
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.8rem',
                backgroundColor: 'transparent',
                color: currentTab === 'Resolved' ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                zIndex: 1
              }}
            >
              {currentTab === 'Resolved' && (
                <motion.div
                  layoutId="activeTabIndicator"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'var(--purple)',
                    borderRadius: '6px',
                    zIndex: -1
                  }}
                  transition={{ type: 'tween', ease: 'easeInOut', duration: 0.22 }}
                />
              )}
              ✔ Resolved / Repaired
            </button>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: '0.78rem', height: '34px' }} onClick={() => window.open(`/api/warranty/export-pdf?status=${currentTab}&search=${encodeURIComponent(search)}`, '_blank')}>
              <FileText size={14} /> EXPORT PDF
            </button>
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: '0.78rem', fontWeight: 700, height: '34px' }} onClick={() => { resetForm(); setShowForm(true); }}>
              <Plus size={14} /> INTAKE NEW CLAIM
            </button>
          </div>
        </div>

        {/* Row 2: Search & Filter Parameters (split horizontally) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderTop: '1px solid var(--border-light-color)', paddingTop: 12 }}>
          {/* Date Filter pills & Pickers */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 2, background: 'var(--bg-input, rgba(0,0,0,0.05))', padding: 3, borderRadius: 8, border: '1px solid var(--border-light)', position: 'relative' }}>
              {['All', 'Daily', 'Monthly'].map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDateFilterMode(mode)}
                  style={{
                    position: 'relative',
                    padding: '4px 10px',
                    fontSize: '0.76rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: dateFilterMode === mode ? 700 : 600,
                    backgroundColor: 'transparent',
                    color: dateFilterMode === mode ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    zIndex: 1
                  }}
                >
                  {dateFilterMode === mode && (
                    <motion.div
                      layoutId="activeDateIndicator"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'var(--purple)',
                        borderRadius: '6px',
                        zIndex: -1
                      }}
                      transition={{ type: 'tween', ease: 'easeInOut', duration: 0.22 }}
                    />
                  )}
                  {mode}
                </button>
              ))}
            </div>

            {/* Date selector (Daily) */}
            {dateFilterMode === 'Daily' && (
              <input
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="field-input"
                style={{ padding: '6px 10px', borderRadius: 8, width: 140, fontSize: '0.78rem', height: '32px' }}
              />
            )}

            {/* Month/Year selectors (Monthly) */}
            {dateFilterMode === 'Monthly' && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <select
                  value={filterMonth}
                  onChange={e => setFilterMonth(e.target.value)}
                  className="field-input"
                  style={{ padding: '6px 10px', borderRadius: 8, width: 110, fontSize: '0.78rem', height: '32px' }}
                >
                  <option value="01">January</option>
                  <option value="02">February</option>
                  <option value="03">March</option>
                  <option value="04">April</option>
                  <option value="05">May</option>
                  <option value="06">June</option>
                  <option value="07">July</option>
                  <option value="08">August</option>
                  <option value="09">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
                <select
                  value={filterYear}
                  onChange={e => setFilterYear(e.target.value)}
                  className="field-input"
                  style={{ padding: '6px 10px', borderRadius: 8, width: 80, fontSize: '0.78rem', height: '32px' }}
                >
                  {Array.from({ length: 6 }, (_, i) => String(2024 + i)).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
            <input
              type="text"
              placeholder="Search customer, phone, DTA..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="field-input"
              style={{ width: '100%', paddingLeft: '32px', outline: 'none', fontSize: '0.78rem', height: '32px' }}
            />
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Intake Date</th>
              <th>Customer Details</th>
              <th>Product Details</th>
              <th>Fulfillment</th>
              <th>Type</th>
              <th>Fault reported</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClaims.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ padding: '24px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  No claims found in this queue.
                </td>
              </tr>
            ) : (
              filteredClaims.map((c, index) => {
                const isExpanded = expandedRowId === c.id;
                return (
                  <React.Fragment key={c.id}>
                    <tr onClick={() => toggleRowExpansion(c.id)} style={{ cursor: 'pointer' }}>
                      <td style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{index + 1}</td>
                      <td style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{c.claim_date}</td>
                      <td>
                        <div><strong>{c.customer_name}</strong></div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{c.phone_number} | {c.location || 'N/A'}</div>
                      </td>
                      <td>
                        <div><strong>{c.brand} {c.model}</strong></div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>DTA: {c.dta || '—'}</div>
                      </td>
                      <td style={{ fontSize: '0.78rem' }}>{c.fulfillment_type || 'In-Store'}</td>
                      <td>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: c.warranty_status === 'Warranty' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: c.warranty_status === 'Warranty' ? '#10b981' : '#ef4444' }}>
                          {c.warranty_status || 'Warranty'}
                        </span>
                        {c.is_outside === 1 && <span style={{ display: 'block', fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 2 }}>(Outside)</span>}
                      </td>
                      <td style={{ fontSize: '0.78rem', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.issue_note}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${c.status === 'Pending' ? 'badge-citrus' : (c.status === 'Repaired' ? 'badge-green' : (c.status === 'Replaced' ? 'badge-purple' : 'badge-pink'))}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                          {c.status === 'Pending' && (
                            <button className="btn btn-primary" onClick={() => startResolve(c.id)} style={{ padding: '4px 10px', fontSize: '0.72rem', fontWeight: 700 }}>Resolve</button>
                          )}
                          <button className="btn btn-ghost" onClick={() => startEdit(c)} style={{ padding: '4px 10px', fontSize: '0.72rem' }}>Edit</button>
                          <button className="btn btn-pink" onClick={() => handleDelete(c.id)} style={{ padding: '4px 10px', fontSize: '0.72rem' }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expandable row breakdown details */}
                    {isExpanded && (
                      <tr>
                        <td colSpan="9" style={{ backgroundColor: 'var(--bg-input, rgba(0,0,0,0.02))', padding: '14px 20px', borderBottom: '1px solid var(--border-light-color)' }}>
                          <div className="mobile-form-grid" style={{ gap: 24 }}>
                            <div>
                              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Service Product breakdown</div>
                              <div className="card card-p" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)' }}>
                                <div>
                                  <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{c.brand} {c.model}</div>
                                  <code style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>DTA: {c.dta || '—'}</code>
                                </div>
                                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Qty: 1</span>
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Service Diagnostics brief</div>
                              <div className="card card-p" style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--bg-card)' }}>
                                <div>
                                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>FAULT REPORTED:</div>
                                  <p style={{ fontSize: '0.8rem', margin: '4px 0 0 0', color: 'var(--text-primary)' }}>{c.issue_note}</p>
                                </div>
                                {c.status !== 'Pending' && (
                                  <div style={{ borderTop: '1px dashed var(--border-light)', paddingTop: 10 }}>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--green, #10b981)', fontWeight: 700 }}>RESOLUTION DETAILS:</div>
                                    <div style={{ fontSize: '0.78rem', marginTop: 4, lineHeight: 1.4 }}>
                                      <strong>Status:</strong> {c.status} on {c.action_date}<br />
                                      {c.exch_new_dta && (
                                        <>
                                          <strong>Swapped for:</strong> {c.exch_new_brand} {c.exch_new_model} (DTA: {c.exch_new_dta})<br />
                                        </>
                                      )}
                                      {c.refund_amount > 0 && (
                                        <>
                                          <strong>Refunded amount:</strong> AED {c.refund_amount.toFixed(2)}<br />
                                        </>
                                      )}
                                      <strong>Notes:</strong> {c.repair_note}<br />
                                      <strong>Repair cost:</strong> AED {parseFloat(c.repair_cost || 0).toFixed(2)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Intake / Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <div onClick={() => { setShowForm(false); resetForm(); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(5px)', padding: 20 }}>
            <motion.div onClick={e => e.stopPropagation()} initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} className="card card-p-lg" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--border-light)', paddingBottom: 12 }}>
                <h3 className="font-heading" style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  {editingId ? 'Edit Warranty Claim Entry' : 'Warranty Claim Intake Form'}
                </h3>
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }} style={{ background: 'none', border: 'none', fontSize: '1.4rem', fontWeight: 800, cursor: 'pointer', color: 'var(--text-primary)' }}>✕</button>
              </div>

              <form onSubmit={saveClaim} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Customer Section */}
                <div className="modal-section-group" style={{ background: 'rgba(0,0,0,0.01)', border: '1px solid var(--border-light)', padding: 16, borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 3, height: 14, background: 'var(--purple)', borderRadius: 1.5 }} />
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>1. Customer & Fulfillment info</span>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                      <input type="checkbox" checked={formIsOutside} onChange={e => setFormIsOutside(e.target.checked)} />
                      <span>Outside Product</span>
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Intake Date *</label>
                      <input type="date" className="modal-field-input" value={formClaimDate} onChange={e => setFormClaimDate(e.target.value)} required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Customer Name *</label>
                      <input type="text" className="modal-field-input" value={formCustomerName} onChange={e => setFormCustomerName(e.target.value)} required placeholder="Full name" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Phone Number *</label>
                      <input type="text" className="modal-field-input" value={formPhoneNumber} onChange={e => setFormPhoneNumber(e.target.value)} required placeholder="e.g. 0501234567" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Customer Location</label>
                      <input type="text" className="modal-field-input" value={formLocation} onChange={e => setFormLocation(e.target.value)} placeholder="City or area" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Fulfillment Type *</label>
                      <select className="modal-field-input" value={formFulfillmentType} onChange={e => setFormFulfillmentType(e.target.value)} required>
                        <option value="In-Store">In-Store Drop-off</option>
                        <option value="Delivery">Courier Pickup</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Warranty Status</label>
                      <select className="modal-field-input" value={formWarrantyStatus} onChange={e => setFormWarrantyStatus(e.target.value)} disabled={formIsOutside} required>
                        <option value="Warranty">Under Warranty</option>
                        <option value="Out of Warranty">Out of Warranty</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Product Section */}
                <div className="modal-section-group" style={{ background: 'rgba(0,0,0,0.01)', border: '1px solid var(--border-light)', padding: 16, borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <div style={{ width: 3, height: 14, background: 'var(--purple)', borderRadius: 1.5 }} />
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>2. Product details</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                    <div style={{ position: 'relative' }}>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>DTA Code {formIsOutside ? '(Optional)' : '*'}</label>
                      <input type="text" className="modal-field-input" value={formDta} onChange={e => handleDtaTyping(e.target.value)} placeholder="LT-HP-001" required={!formIsOutside} />
                      {dtaSuggestions.length > 0 && (
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: '100%',
                          background: 'var(--bg-card)',
                          border: '2px solid #000',
                          zIndex: 9999,
                          borderRadius: '4px',
                          boxShadow: 'var(--shadow-flat-sm)',
                          maxHeight: '150px',
                          overflowY: 'auto',
                          marginTop: 4
                        }}>
                          {dtaSuggestions.map(p => (
                            <div 
                              key={p.code} 
                              onClick={() => selectDtaSuggestion(p)} 
                              style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid var(--border-light-color)', fontSize: '0.75rem' }}
                            >
                              <strong>{p.code}</strong> - {p.brand} {p.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Brand</label>
                      <input type="text" className="modal-field-input" value={formBrand} onChange={e => setFormBrand(e.target.value)} readOnly={!formIsOutside} placeholder={formIsOutside ? "Type brand" : "Auto-filled"} required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Model</label>
                      <input type="text" className="modal-field-input" value={formModel} onChange={e => setFormModel(e.target.value)} readOnly={!formIsOutside} placeholder={formIsOutside ? "Type model" : "Auto-filled"} required />
                    </div>
                  </div>
                </div>

                {/* Diagnostics note */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Fault / Issue Description *</label>
                  <textarea className="modal-field-input" value={formIssueNote} onChange={e => setFormIssueNote(e.target.value)} placeholder="Describe the problem in detail..." style={{ minHeight: 80, resize: 'none' }} required />
                </div>

                {/* Footer buttons */}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid var(--border-light-color)', paddingTop: 14 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Submit Claim</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Resolve Modal popup */}
      <AnimatePresence>
        {showResolveForm && (
          <div onClick={() => { setShowResolveForm(false); resetResolveForm(); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(5px)', padding: 20 }}>
            <motion.div onClick={e => e.stopPropagation()} initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} className="card card-p-lg" style={{ width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--border-light)', paddingBottom: 12 }}>
                <h3 className="font-heading" style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  Resolve Warranty Claim
                </h3>
                <button type="button" onClick={() => { setShowResolveForm(false); resetResolveForm(); }} style={{ background: 'none', border: 'none', fontSize: '1.4rem', fontWeight: 800, cursor: 'pointer', color: 'var(--text-primary)' }}>✕</button>
              </div>

              <form onSubmit={saveResolution} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Final Status *</label>
                  <select className="modal-field-input" value={resolveStatus} onChange={e => setResolveStatus(e.target.value)} required>
                    <option value="Repaired">Repaired / Fixed</option>
                    <option value="Replaced">Replaced / Exchanged</option>
                    <option value="Returned Unfixed">Returned Unfixed</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Action Date *</label>
                  <input type="date" className="modal-field-input" value={resolveDate} onChange={e => setResolveDate(e.target.value)} required />
                </div>

                {/* Repaired view details */}
                {resolveStatus === 'Repaired' && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Repair / Action Details *</label>
                      <textarea className="modal-field-input" value={resolveRepairNote} onChange={e => setResolveRepairNote(e.target.value)} placeholder="e.g. Replaced battery, reinstalled Windows" required style={{ minHeight: 70, resize: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Repair Cost (AED) *</label>
                      <input type="number" className="modal-field-input" value={resolveRepairCost} onChange={e => setResolveRepairCost(e.target.value)} placeholder="0.00" min="0" step="0.01" required />
                    </div>
                  </>
                )}

                {/* Replaced view details */}
                {resolveStatus === 'Replaced' && (
                  <>
                    <div style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-light)', padding: 12, borderRadius: 6, fontSize: '0.78rem' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.63rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Original Device (Returned)</div>
                      <strong>{claims.find(c => c.id === resolveClaimId)?.brand} {claims.find(c => c.id === resolveClaimId)?.model}</strong> (DTA: {claims.find(c => c.id === resolveClaimId)?.dta})
                    </div>
                    <div style={{ position: 'relative' }}>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>New Exchanged DTA Code *</label>
                      <input type="text" className="modal-field-input" value={resolveNewDta} onChange={e => handleExchDtaTyping(e.target.value)} required placeholder="LT-HP-002" />
                      {exchSuggestions.length > 0 && (
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: '100%',
                          background: 'var(--bg-card)',
                          border: '2px solid #000',
                          zIndex: 9999,
                          borderRadius: '4px',
                          boxShadow: 'var(--shadow-flat-sm)',
                          maxHeight: '150px',
                          overflowY: 'auto',
                          marginTop: 4
                        }}>
                          {exchSuggestions.map(p => (
                            <div 
                              key={p.code} 
                              onClick={() => selectExchSuggestion(p)} 
                              style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid var(--border-light-color)', fontSize: '0.75rem' }}
                            >
                              <strong>{p.code}</strong> - {p.brand} {p.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>New Brand</label>
                      <input type="text" className="modal-field-input" value={resolveNewBrand} readOnly placeholder="Auto-filled" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>New Model</label>
                      <input type="text" className="modal-field-input" value={resolveNewModel} readOnly placeholder="Auto-filled" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Exchange Notes</label>
                      <textarea className="modal-field-input" value={resolveExchNotes} onChange={e => setResolveExchNotes(e.target.value)} placeholder="Swapped under warranty." style={{ minHeight: 50, resize: 'none' }} />
                    </div>
                  </>
                )}

                {/* Returned Unfixed view details */}
                {resolveStatus === 'Returned Unfixed' && (
                  <>
                    <div style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-light)', padding: 12, borderRadius: 6, fontSize: '0.78rem' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.63rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Returned Device</div>
                      <strong>{claims.find(c => c.id === resolveClaimId)?.brand} {claims.find(c => c.id === resolveClaimId)?.model}</strong> (DTA: {claims.find(c => c.id === resolveClaimId)?.dta})
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Refunded Amount (AED) *</label>
                      <input type="number" className="modal-field-input" value={resolveRefundAmount} onChange={e => setResolveRefundAmount(e.target.value)} placeholder="0.00" min="0" step="0.01" required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Refund / Action Notes</label>
                      <textarea className="modal-field-input" value={resolveRefundNotes} onChange={e => setResolveRefundNotes(e.target.value)} placeholder="Unfixable, issued refund." style={{ minHeight: 60, resize: 'none' }} />
                    </div>
                  </>
                )}

                {/* Footer buttons */}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid var(--border-light-color)', paddingTop: 14 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowResolveForm(false); resetResolveForm(); }} disabled={isResolving}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={isResolving}>
                    {isResolving ? 'Saving...' : 'Save Resolution'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* =========================================================
   PANEL: CUSTOMER CRM (Customer Relationship Management)
   ========================================================= */

function CustomerCrmPanel() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Form Modal State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formSerialNo, setFormSerialNo] = useState('');
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formMobileNumber, setFormMobileNumber] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPlace, setFormPlace] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl(`/api/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`));
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const resetForm = () => {
    setEditingId(null);
    setFormSerialNo('');
    setFormCustomerName('');
    setFormMobileNumber('');
    setFormEmail('');
    setFormPlace('');
    setFormNotes('');
  };

  const startEdit = (cust) => {
    setEditingId(cust.id);
    setFormSerialNo(cust.serial_no || '');
    setFormCustomerName(cust.customer_name || '');
    setFormMobileNumber(cust.mobile_number || '');
    setFormEmail(cust.email || '');
    setFormPlace(cust.place || '');
    setFormNotes(cust.notes || '');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer entry from CRM?')) return;
    try {
      const res = await fetch(getApiUrl(`/api/customers/${id}`), { method: 'DELETE' });
      if (res.ok) {
        setCustomers(prev => prev.filter(c => c.id !== id));
        setToastMessage('Customer removed from CRM.');
        setTimeout(() => setToastMessage(''), 2500);
      }
    } catch (err) {
      console.error('Failed to delete customer:', err);
    }
  };

  const handleAutoImport = async () => {
    try {
      const res = await fetch(getApiUrl('/api/customers/import-sales'), { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setToastMessage(`Auto-imported ${data.imported_count || 0} unique contacts from past sales & deliveries!`);
        setTimeout(() => setToastMessage(''), 3000);
        loadCustomers();
      }
    } catch (err) {
      console.error('Failed to auto-import contacts:', err);
    }
  };

  const handleExportCsv = () => {
    if (customers.length === 0) return alert('No customer records to export.');
    let csv = 'S.No,Customer Name,Mobile Number,Email,Place,Notes,Registered Date\n';
    customers.forEach(c => {
      csv += `"${c.serial_no || ''}","${(c.customer_name || '').replace(/"/g, '""')}","${c.mobile_number || ''}","${c.email || ''}","${(c.place || '').replace(/"/g, '""')}","${(c.notes || '').replace(/"/g, '""')}","${c.created_at || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `BUYOLOGY_CRM_CUSTOMERS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saveCustomer = async (e) => {
    e.preventDefault();
    if (!formCustomerName.trim() || !formMobileNumber.trim()) {
      return alert('Customer Name and Mobile Number are required.');
    }

    const payload = {
      serial_no: formSerialNo,
      customer_name: formCustomerName,
      mobile_number: formMobileNumber,
      email: formEmail,
      place: formPlace,
      notes: formNotes
    };

    try {
      const url = editingId ? `/api/customers/${editingId}` : '/api/customers';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(getApiUrl(url), {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowForm(false);
        resetForm();
        setToastMessage(editingId ? 'Customer updated successfully!' : 'New customer registered in CRM!');
        setTimeout(() => setToastMessage(''), 2500);
        loadCustomers();
      }
    } catch (err) {
      console.error('Failed to save customer:', err);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(c => 
      (c.customer_name || '').toLowerCase().includes(q) ||
      (c.mobile_number || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.place || '').toLowerCase().includes(q) ||
      (c.serial_no || '').toLowerCase().includes(q)
    );
  }, [customers, search]);

  const metrics = useMemo(() => {
    const total = customers.length;
    const mobiles = customers.filter(c => c.mobile_number && c.mobile_number.trim()).length;
    const emails = customers.filter(c => c.email && c.email.trim()).length;
    const places = new Set(customers.map(c => (c.place || '').trim()).filter(Boolean)).size;
    return { total, mobiles, emails, places };
  }, [customers]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ padding: '10px 16px', background: 'var(--citrus)', color: '#000', fontWeight: 900, borderRadius: 'var(--radius-md)', border: '2px solid #000', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          ✨ {toastMessage}
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="card card-p" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderRight: '1px solid var(--border-light-color)', paddingRight: 16 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total CRM Customers</span>
          <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-primary)' }}>{metrics.total} Contacts</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderRight: '1px solid var(--border-light-color)', paddingRight: 16 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mobile Phone Numbers</span>
          <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--purple)' }}>{metrics.mobiles}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderRight: '1px solid var(--border-light-color)', paddingRight: 16 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email Addresses</span>
          <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--cyan)' }}>{metrics.emails}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Regions / Cities</span>
          <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--orange)' }}>{metrics.places}</span>
        </div>
      </div>

      {/* Control Action Bar */}
      <div className="card card-p" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          
          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }} style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 900 }}>
              <Plus size={16} /> + Add Customer
            </button>

            <button className="btn btn-ghost" onClick={handleExportCsv} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Download size={15} /> 📥 Export CSV
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: 240, flex: 1, maxWidth: 320 }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
            <input
              type="text"
              placeholder="Search customer name, mobile, email, place..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="field-input"
              style={{ width: '100%', paddingLeft: 34, fontSize: '0.8rem', height: '36px' }}
            />
          </div>
        </div>
      </div>

      {/* CRM Customer Table */}
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>S N/NO</th>
              <th>Customer Name</th>
              <th>Mobile Number</th>
              <th>Email</th>
              <th>Place (Optional)</th>
              <th>Registered Date</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  {loading ? 'Loading CRM customers...' : 'No customer records found. Click "+ Add Customer" to add one.'}
                </td>
              </tr>
            ) : (
              filtered.map((c, index) => {
                return (
                  <tr key={c.id}>
                    <td style={{ fontSize: '0.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--purple)' }}>
                      {c.serial_no || String(index + 1).padStart(3, '0')}
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{c.customer_name}</strong>
                      {c.notes && (
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 2 }}>
                          📝 {c.notes}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {c.mobile_number}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: c.email ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {c.email || '—'}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: c.place ? 'var(--orange)' : 'var(--text-muted)', fontWeight: c.place ? 700 : 400 }}>
                      {c.place || '—'}
                    </td>
                    <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {c.created_at ? c.created_at.slice(0, 10) : '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button
                          className="btn btn-ghost"
                          onClick={() => startEdit(c)}
                          style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-pink"
                          onClick={() => handleDelete(c.id)}
                          style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form Overlay for Create / Edit */}
      <AnimatePresence>
        {showForm && (
          <div onClick={() => { setShowForm(false); resetForm(); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(5px)', padding: 20 }}>
            <motion.div onClick={e => e.stopPropagation()} initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} className="card card-p-lg" style={{ width: '100%', maxWidth: '520px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--border-light)', paddingBottom: 12 }}>
                <h3 className="font-heading" style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  {editingId ? 'Edit CRM Customer Record' : 'Register New CRM Customer'}
                </h3>
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }} style={{ background: 'none', border: 'none', fontSize: '1.4rem', fontWeight: 800, cursor: 'pointer', color: 'var(--text-primary)' }}>✕</button>
              </div>

              <form onSubmit={saveCustomer} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, marginBottom: 4, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>S N/NO (Serial No / Code)</label>
                  <input type="text" className="modal-field-input" value={formSerialNo} onChange={e => setFormSerialNo(e.target.value)} placeholder="Auto-generated if left empty (e.g. 001, 002)" />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, marginBottom: 4, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Customer Name *</label>
                  <input type="text" className="modal-field-input" value={formCustomerName} onChange={e => setFormCustomerName(e.target.value)} required placeholder="Full customer name" />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, marginBottom: 4, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Mobile Number *</label>
                  <input type="text" className="modal-field-input" value={formMobileNumber} onChange={e => setFormMobileNumber(e.target.value)} required placeholder="e.g. +971 50 123 4567" />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, marginBottom: 4, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Email Address</label>
                  <input type="email" className="modal-field-input" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="e.g. customer@example.com" />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, marginBottom: 4, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Place / Location (Optional)</label>
                  <input type="text" className="modal-field-input" value={formPlace} onChange={e => setFormPlace(e.target.value)} placeholder="e.g. Dubai, Sharjah, Abu Dhabi" />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, marginBottom: 4, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Notes / Preferred Requirements</label>
                  <textarea className="modal-field-input" value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder="Optional CRM notes (e.g. Interested in Dell Workstation)" style={{ minHeight: 60, resize: 'none' }} />
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid var(--border-light-color)', paddingTop: 14 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ fontWeight: 900 }}>
                    {editingId ? 'Update Customer' : 'Save to CRM'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* =========================================================
   PANEL: INVENTORY CENTER
   ========================================================= */

function InventoryPanel() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const loadInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/inventory'));
      if (res.ok) {
        const data = await res.json();
        setUnits(data);
      }
    } catch (err) {
      console.error('Failed to load inventory units:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const filtered = useMemo(() => {
    if (!search.trim()) return units;
    const q = search.toLowerCase();
    return units.filter(u => 
      String(u.dta || '').toLowerCase().includes(q) ||
      String(u.model || '').toLowerCase().includes(q) ||
      String(u.serial_number || '').toLowerCase().includes(q) ||
      String(u.status || '').toLowerCase().includes(q)
    );
  }, [units, search]);

  const totalUnits = units.length;
  const inStockCount = units.filter(u => u.status === 'In Stock' || u.status === 'Available').length;
  const soldCount = units.filter(u => u.status === 'Sold' || u.status === 'Delivered').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div className="page-title">Inventory Center</div>
          <div className="page-subtitle">Live serial numbers, stock tracking, and unit statuses</div>
        </div>
        <button className="btn btn-citrus" onClick={loadInventory} style={{ gap: 6 }}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Inventory</span>
        </button>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Units Managed" value={totalUnits} icon={Box} iconBg="var(--citrus)" delay={0} />
        <StatCard label="Available In Stock" value={inStockCount} icon={TrendingUp} iconBg="var(--purple-soft)" delay={0.05} />
        <StatCard label="Units Sold / Delivered" value={soldCount} icon={ShoppingBag} iconBg="var(--pink-soft)" delay={0.1} />
      </div>

      <div className="card card-p" style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <h4 style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase' }}>
            Managed Inventory Units ({filtered.length})
          </h4>
          <div style={{ position: 'relative', width: 280 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input
              type="text"
              placeholder="Search serial, DTA, or model..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 6, paddingBottom: 6, fontSize: '0.82rem' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', opacity: 0.7 }}>Loading live inventory units...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', opacity: 0.6 }}>No inventory units found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table" style={{ width: '100%', fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th>DTA / Code</th>
                  <th>Model / Item</th>
                  <th>Serial Number</th>
                  <th>Status</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 100).map((u, i) => (
                  <tr key={u.id || i}>
                    <td style={{ fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{u.dta || '-'}</td>
                    <td>{u.model || u.brand || '-'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{u.serial_number || u.unit_id || '-'}</td>
                    <td>
                      <span className={`badge ${u.status === 'In Stock' || u.status === 'Available' ? 'badge-citrus' : 'badge-pink'}`}>
                        {u.status || 'In Stock'}
                      </span>
                    </td>
                    <td style={{ opacity: 0.8 }}>{u.location || u.warehouse || 'Store Warehouse'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   PANEL: ANALYTICS DASHBOARD (FRAMER MOTION REDESIGN)
   ========================================================= */

function DayByDayRevenueTrend({ billsList }) {
  const viewportRef = useRef(null);
  const [dragLimit, setDragLimit] = useState(0);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const dailyTrendData = useMemo(() => {
    const dailyMap = {};
    billsList.forEach(b => {
      if (b.jenny === true || b.jenny === 'true' || b.jenny === 1 || Number(b.jenny) === 1) return;
      if (b.transaction_type === 'Void') return;
      const dateStr = b.date;
      if (!dateStr) return;
      const val = b.transaction_type === 'Return' ? -(b.price || 0) : (b.transaction_type === 'Exchange' ? (b.exch_balance || 0) : (b.price || 0));
      dailyMap[dateStr] = (dailyMap[dateStr] || 0) + val;
    });

    const parseDate = (str) => {
      const parts = str.split('-');
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    };

    const sortedDates = Object.keys(dailyMap).sort((a, b) => parseDate(a) - parseDate(b));
    const finalDates = sortedDates.slice(-35); // Show last 35 active days
    return finalDates.map(dateStr => {
      const p = dateStr.split('-');
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const displayLabel = `${p[0]} ${months[parseInt(p[1]) - 1] || ''}`;
      return {
        label: displayLabel,
        value: Math.round(dailyMap[dateStr])
      };
    });
  }, [billsList]);

  const w = 1200; // Fixed width of the panning path container
  const h = 220;
  const padX = 40;
  const padY = 30;

  useEffect(() => {
    if (!viewportRef.current) return;
    const handleResize = () => {
      const vw = viewportRef.current.getBoundingClientRect().width;
      setDragLimit(Math.max(0, w - vw));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dailyTrendData]);

  const maxVal = useMemo(() => {
    if (dailyTrendData.length === 0) return 1000;
    const max = Math.max(...dailyTrendData.map(d => d.value));
    return max > 0 ? max * 1.15 : 1000;
  }, [dailyTrendData]);

  const minVal = useMemo(() => {
    if (dailyTrendData.length === 0) return 0;
    const min = Math.min(...dailyTrendData.map(d => d.value), 0);
    return min < 0 ? min * 1.15 : 0;
  }, [dailyTrendData]);

  const pts = useMemo(() => {
    if (dailyTrendData.length === 0) return [];
    return dailyTrendData.map((d, i) => {
      const x = padX + (i / (dailyTrendData.length - 1)) * (w - 2 * padX);
      const range = maxVal - minVal;
      const y = h - padY - ((d.value - minVal) / range) * (h - 2 * padY);
      return { x, y, value: d.value, label: d.label };
    });
  }, [dailyTrendData, maxVal, minVal]);

  const linePath = useMemo(() => {
    if (pts.length === 0) return '';
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return path;
  }, [pts]);

  const areaPath = useMemo(() => {
    if (pts.length === 0) return '';
    const line = linePath;
    const range = maxVal - minVal;
    const baselineY = h - padY - ((0 - minVal) / range) * (h - 2 * padY);
    return `${line} L ${pts[pts.length - 1].x} ${baselineY} L ${pts[0].x} ${baselineY} Z`;
  }, [pts, linePath, minVal, maxVal]);

  const handleMouseMove = useCallback((e) => {
    if (pts.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * w;

    let closestDist = Infinity;
    let closestPoint = null;
    let closestIndex = null;
    pts.forEach((p, idx) => {
      const dist = Math.abs(p.x - clickX);
      if (dist < closestDist) {
        closestDist = dist;
        closestPoint = p;
        closestIndex = idx;
      }
    });

    if (closestPoint) {
      setHoveredPoint(closestPoint);
      setHoveredIdx(closestIndex);
    }
  }, [pts]);

  const handleMouseLeave = useCallback(() => {
    setHoveredPoint(null);
    setHoveredIdx(null);
  }, []);

  return (
    <div className="card card-p-lg" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Day-by-Day Revenue Trend</h3>
        <span className="badge badge-citrus" style={{ fontSize: '0.58rem', fontWeight: 800 }}>← Drag to pan timeline →</span>
      </div>

      <div style={{ display: 'flex', flex: 1, gap: 8, position: 'relative', overflow: 'hidden' }}>
        {/* Left Scale Sidebar (Static) */}
        <div style={{ width: 38, position: 'relative', height: h, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: padY, paddingTop: padY, borderRight: '1px solid rgba(0,0,0,0.03)', pointerEvents: 'none', zIndex: 3 }}>
          {[1, 0.75, 0.5, 0.25, 0].map((pct, idx) => {
            const val = minVal + pct * (maxVal - minVal);
            return (
              <span key={idx} style={{ fontSize: '0.58rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textAlign: 'left', fontWeight: 700 }}>
                {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : Math.round(val)}
              </span>
            );
          })}
        </div>

        {/* Draggable timeline viewport */}
        <div ref={viewportRef} style={{ flex: 1, overflow: 'hidden', position: 'relative', height: h + 30 }}>
          <motion.div
            drag="x"
            dragConstraints={{ left: -dragLimit, right: 0 }}
            dragElastic={0.15}
            style={{ width: w, position: 'relative', height: '100%' }}
          >
            {/* Horizontal grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const y = h - padY - pct * (h - 2 * padY);
              return (
                <div key={idx} style={{ position: 'absolute', top: y, left: 0, right: 0, height: 1, borderBottom: '1px dashed var(--text-muted)', opacity: 0.05, pointerEvents: 'none' }} />
              );
            })}

            <svg
              viewBox={`0 0 ${w} ${h}`}
              preserveAspectRatio="none"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ overflow: 'visible', cursor: 'grab', width: '100%', height: h, position: 'absolute', left: 0, top: 0, zIndex: 2 }}
            >
              <defs>
                <linearGradient id="panning-revenue-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--purple)" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="var(--purple)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {areaPath && (
                <path d={areaPath} fill="url(#panning-revenue-grad)" />
              )}

              {linePath && (
                <path d={linePath} stroke="var(--purple)" strokeWidth="2" fill="none" />
              )}

              {hoveredPoint && (
                <line
                  x1={hoveredPoint.x}
                  y1={padY}
                  x2={hoveredPoint.x}
                  y2={h - padY}
                  stroke="var(--purple)"
                  strokeOpacity="0.25"
                  strokeWidth="1.5"
                  strokeDasharray="3,3"
                />
              )}
            </svg>

            {/* HTML circles overlay - Aspect-Ratio Locked */}
            {pts.map((p, i) => {
              const isHovered = hoveredIdx === i;
              const isLast = i === pts.length - 1;
              const showDot = isHovered || isLast;
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: p.x,
                    top: p.y,
                    width: isHovered ? '8px' : '6px',
                    height: isHovered ? '8px' : '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--purple)',
                    border: '1.5px solid #fff',
                    transform: 'translate(-50%, -50%)',
                    opacity: showDot ? 1 : 0.25,
                    pointerEvents: 'none',
                    transition: 'all 0.12s ease',
                    boxShadow: isHovered ? '0 0 6px rgba(139, 92, 246, 0.35)' : 'none',
                    zIndex: 3
                  }}
                />
              );
            })}

            {/* Draggable X-axis labels */}
            <div style={{ position: 'absolute', bottom: 6, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', paddingLeft: padX, paddingRight: padX }}>
              {pts.filter((_, idx) => idx % 3 === 0 || idx === pts.length - 1).map((p, i) => (
                <span key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  {p.label}
                </span>
              ))}
            </div>

            {/* Draggable point Tooltip */}
            <AnimatePresence>
              {hoveredPoint && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: -26, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  style={{
                    position: 'absolute',
                    left: hoveredPoint.x,
                    top: hoveredPoint.y,
                    transform: 'translate(-50%, -100%)',
                    background: '#000',
                    color: '#fff',
                    border: `1.5px solid var(--purple)`,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                  }}
                >
                  <div style={{ color: 'var(--citrus)', fontSize: '0.58rem', textTransform: 'uppercase', marginBottom: 2 }}>{hoveredPoint.label}</div>
                  AED {hoveredPoint.value.toLocaleString()}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsDashPanel({ billsList }) {
  // Date filter state
  const [filterMode, setFilterMode] = useState('Month'); // 'All' | 'Today' | 'Week' | 'Month' | 'Custom' | 'CalendarMonth'
  const [selectedCalendarMonth, setSelectedCalendarMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Date parsing helper
  const parseBillDate = (dStr) => {
    if (!dStr) return null;
    const parts = dStr.split('-');
    if (parts.length !== 3) return null;
    return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
  };

  // Find latest month in database to default selected calendar month
  const latestMonthStr = useMemo(() => {
    if (!billsList || billsList.length === 0) {
      const now = new Date();
      return `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
    }
    let latestDate = null;
    let latestMonth = '';
    billsList.forEach(b => {
      if (!b.date) return;
      const parts = b.date.split('-');
      if (parts.length === 3) {
        const [d, m, y] = parts;
        const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        if (!latestDate || dateObj > latestDate) {
          latestDate = dateObj;
          latestMonth = `${m}-${y}`;
        }
      }
    });
    return latestMonth;
  }, [billsList]);

  // Set initial calendar month on load
  useEffect(() => {
    if (latestMonthStr && !selectedCalendarMonth) {
      setSelectedCalendarMonth(latestMonthStr);
    }
  }, [latestMonthStr, selectedCalendarMonth]);

  // Dynamic calendar months in DB
  const uniqueCalendarMonths = useMemo(() => {
    const monthsSet = new Set();
    billsList.forEach(b => {
      if (!b.date) return;
      const parts = b.date.split('-');
      if (parts.length === 3) {
        monthsSet.add(`${parts[1]}-${parts[2]}`);
      }
    });
    const monthsArray = Array.from(monthsSet).sort((a, b) => {
      const [mA, yA] = a.split('-').map(Number);
      const [mB, yB] = b.split('-').map(Number);
      if (yA !== yB) return yB - yA;
      return mB - mA;
    });
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthsArray.map(my => {
      const [m, y] = my.split('-');
      return {
        value: my,
        label: `${monthNames[parseInt(m) - 1]} ${y}`
      };
    });
  }, [billsList]);

  const handlePillClick = (mode) => {
    setFilterMode(mode);
    setSelectedCalendarMonth(''); // Clear calendar month select
  };

  const handleMonthSelect = (val) => {
    setFilterMode('CalendarMonth');
    setSelectedCalendarMonth(val);
  };

  // Filter bills by selected date criteria
  const filteredBills = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return billsList.filter(b => {
      if (!b.date) return false;
      const bDate = parseBillDate(b.date);
      if (!bDate) return false;

      if (filterMode === 'Today') {
        return bDate.getTime() === today.getTime();
      }

      if (filterMode === 'Week') {
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        return bDate.getTime() >= lastWeek.getTime() && bDate.getTime() <= today.getTime() + 86400000;
      }

      if (filterMode === 'Month') {
        const lastMonth = new Date(today);
        lastMonth.setDate(lastMonth.getDate() - 30);
        return bDate.getTime() >= lastMonth.getTime() && bDate.getTime() <= today.getTime() + 86400000;
      }

      if (filterMode === 'CalendarMonth') {
        if (!selectedCalendarMonth) return true;
        const parts = b.date.split('-');
        if (parts.length === 3) {
          return `${parts[1]}-${parts[2]}` === selectedCalendarMonth;
        }
        return false;
      }

      if (filterMode === 'Custom') {
        if (!startDate || !endDate) return true;
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return bDate.getTime() >= start.getTime() && bDate.getTime() <= end.getTime();
      }

      return true; // 'All'
    });
  }, [billsList, filterMode, selectedCalendarMonth, startDate, endDate]);

  // Compute key metrics
  const metrics = useMemo(() => {
    let salesCount = 0;
    let returnsCount = 0;
    let exchangesCount = 0;
    let voidsCount = 0;
    let grossSales = 0;
    let returnLoss = 0;
    let exchangeBalance = 0;

    filteredBills.forEach(b => {
      if (b.jenny === true || b.jenny === 'true' || b.jenny === 1 || Number(b.jenny) === 1) {
        return;
      }
      if (b.transaction_type === 'Void') {
        voidsCount += 1;
        return;
      }
      if (b.transaction_type === 'Sale') {
        salesCount += 1;
        grossSales += parseFloat(b.price) || 0;
      } else if (b.transaction_type === 'Return') {
        returnsCount += 1;
        returnLoss += parseFloat(b.price) || 0;
      } else if (b.transaction_type === 'Exchange') {
        exchangesCount += 1;
        exchangeBalance += parseFloat(b.exch_balance) || 0;
      }
    });

    const netRevenue = grossSales + exchangeBalance - returnLoss;
    const totalTransactions = salesCount; // Exchange and Return add 0 to transaction count
    const aov = totalTransactions > 0 ? (netRevenue / totalTransactions) : 0;
    
    const totalEntries = salesCount + returnsCount + exchangesCount + voidsCount;
    const voidRate = totalEntries > 0 ? (voidsCount / totalEntries) * 100 : 0;

    // Jenny promoted sales
    const jennySalesCount = filteredBills.filter(b =>
      b.jenny === true || b.jenny === 'true' || b.jenny === 1
    ).length;

    return {
      netRevenue,
      totalTransactions,
      aov,
      voidRate,
      salesCount,
      returnsCount,
      exchangesCount,
      voidsCount,
      jennySalesCount
    };
  }, [filteredBills]);

  // Payment mode distribution
  const paymentModeStats = useMemo(() => {
    const counts = { Cash: 0, Card: 0, Tabby: 0, Tamara: 0, Bank: 0, "Payment Link": 0, Mixed: 0 };
    let totalPaidTx = 0;
    filteredBills.forEach(b => {
      if (b.jenny === true || b.jenny === 'true' || b.jenny === 1) return;
      if (b.transaction_type === 'Void') return;
      const mode = b.payment_mode || 'Cash';
      let key = 'Cash';
      if (mode.includes('Card')) key = 'Card';
      else if (mode.includes('Tabby')) key = 'Tabby';
      else if (mode.includes('Tamara')) key = 'Tamara';
      else if (mode.includes('Bank')) key = 'Bank';
      else if (mode.includes('Link')) key = 'Payment Link';
      else if (mode.includes('Mixed')) key = 'Mixed';
      
      counts[key] = (counts[key] || 0) + 1;
      totalPaidTx += 1;
    });

    const colors = {
      Cash: '#10b981', // green
      Card: '#3b82f6', // blue
      Tabby: '#f59e0b', // orange
      Tamara: '#db2777', // pink
      Bank: '#8b5cf6', // purple
      "Payment Link": '#f97316', // orange/amber
      Mixed: '#06b6d4' // cyan
    };

    return Object.keys(counts).map(k => ({
      name: k,
      value: counts[k],
      pct: totalPaidTx > 0 ? (counts[k] / totalPaidTx) * 100 : 0,
      color: colors[k] || '#9ca3af'
    })).sort((a, b) => b.value - a.value);
  }, [filteredBills]);

  // Platforms channel stats
  const platformStats = useMemo(() => {
    const counts = {};
    let totalPlatTx = 0;
    filteredBills.forEach(b => {
      if (b.jenny === true || b.jenny === 'true' || b.jenny === 1) return;
      if (b.transaction_type === 'Void') return;
      const plat = b.platform || 'Regular Customer';
      counts[plat] = (counts[plat] || 0) + 1;
      totalPlatTx += 1;
    });

    const colors = [
      'var(--purple)',
      'var(--citrus)',
      '#10b981',
      '#f59e0b',
      '#3b82f6',
      '#db2777'
    ];

    return Object.keys(counts).map((k, index) => ({
      name: k,
      value: counts[k],
      pct: totalPlatTx > 0 ? (counts[k] / totalPlatTx) * 100 : 0,
      color: colors[index % colors.length]
    })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [filteredBills]);

  // Top products leaderboard
  const topProducts = useMemo(() => {
    const productMap = {};
    let grandProductsRevenue = 0;

    filteredBills.forEach(b => {
      if (b.jenny === true || b.jenny === 'true' || b.jenny === 1) return;
      if (b.transaction_type === 'Void' || b.transaction_type === 'Return') return;
      let items = [];
      try {
        if (b.products_json) items = JSON.parse(b.products_json);
      } catch (e) {}
      
      if (items.length === 0 && (b.brand || b.model)) {
        items = [{ brand: b.brand, model: b.model, quantity: 1, price: b.price }];
      }

      items.forEach(item => {
        const name = `${item.brand || ''} ${item.model || ''}`.trim() || 'Generic Item';
        const qty = parseInt(item.quantity) || 1;
        const price = parseFloat(item.price) || 0;
        const totalVal = price * qty;

        if (!productMap[name]) {
          productMap[name] = { name, qty: 0, revenue: 0 };
        }
        productMap[name].qty += qty;
        productMap[name].revenue += totalVal;
        grandProductsRevenue += totalVal;
      });
    });

    return Object.values(productMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
      .map(p => ({
        ...p,
        pct: grandProductsRevenue > 0 ? (p.revenue / grandProductsRevenue) * 100 : 0
      }));
  }, [filteredBills]);

  // Delivery ratios
  const deliveryRatio = useMemo(() => {
    let deliveryCount = 0;
    let instoreCount = 0;
    filteredBills.forEach(b => {
      if (b.jenny === true || b.jenny === 'true' || b.jenny === 1) return;
      if (b.transaction_type !== 'Sale' && b.transaction_type !== 'Exchange') return;
      const isDelivery = b.delivery === true || b.delivery === 1 || String(b.delivery) === 'true' || String(b.delivery) === '1';
      if (isDelivery) {
        deliveryCount += 1;
      } else {
        instoreCount += 1;
      }
    });
    const total = deliveryCount + instoreCount;
    return {
      deliveryCount,
      instoreCount,
      deliveryPct: total > 0 ? (deliveryCount / total) * 100 : 0,
      instorePct: total > 0 ? (instoreCount / total) * 100 : 0
    };
  }, [filteredBills]);

  // Daily Returns vs Exchanges chart data
  const returnExchangeDaily = useMemo(() => {
    const parseDate = (str) => {
      const parts = str.split('-');
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    };
    const dayMap = {};
    filteredBills.forEach(b => {
      if (b.jenny === true || b.jenny === 'true' || b.jenny === 1) return;
      if (!b.date) return;
      if (b.transaction_type !== 'Return' && b.transaction_type !== 'Exchange') return;
      if (!dayMap[b.date]) dayMap[b.date] = { returns: 0, exchanges: 0 };
      if (b.transaction_type === 'Return') dayMap[b.date].returns += 1;
      if (b.transaction_type === 'Exchange') dayMap[b.date].exchanges += 1;
    });
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return Object.keys(dayMap)
      .sort((a, b) => parseDate(a) - parseDate(b))
      .slice(-20)
      .map(d => {
        const p = d.split('-');
        return { label: `${p[0]} ${months[parseInt(p[1])-1]||''}`, returns: dayMap[d].returns, exchanges: dayMap[d].exchanges };
      });
  }, [filteredBills]);

  // Daily Jenny Sales chart data
  const jennyDaily = useMemo(() => {
    const parseDate = (str) => {
      const parts = str.split('-');
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    };
    const dayMap = {};
    filteredBills.forEach(b => {
      if (!b.date) return;
      const isJenny = b.jenny === true || b.jenny === 'true' || b.jenny === 1;
      if (!isJenny) return;
      dayMap[b.date] = (dayMap[b.date] || 0) + 1;
    });
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return Object.keys(dayMap)
      .sort((a, b) => parseDate(a) - parseDate(b))
      .slice(-20)
      .map(d => {
        const p = d.split('-');
        return { label: `${p[0]} ${months[parseInt(p[1])-1]||''}`, value: dayMap[d] };
      });
  }, [filteredBills]);

  // Recent transactions list
  const recentTransactions = useMemo(() => {
    return [...filteredBills].sort((a, b) => {
      const parseDate = (str) => {
        const parts = str.split('-');
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      };
      const diff = parseDate(b.date) - parseDate(a.date);
      if (diff !== 0) return diff;
      return (b.id || 0) - (a.id || 0);
    }).slice(0, 5);
  }, [filteredBills]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title">Analytics Dashboard</div>
          <div className="page-subtitle">Understand performance — real-time sales metrics, baskets, and ledger audits</div>
        </div>

        {/* Unified Date Filters Pills & Dropdown */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 2, background: 'var(--bg-input, rgba(0,0,0,0.05))', padding: 3, borderRadius: 8, border: '1px solid var(--border-light)', position: 'relative' }}>
            {['All', 'Today', 'Week', 'Month', 'Custom'].map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => handlePillClick(mode)}
                style={{
                  position: 'relative',
                  padding: '5px 12px',
                  fontSize: '0.74rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontWeight: filterMode === mode ? 700 : 600,
                  backgroundColor: 'transparent',
                  color: filterMode === mode ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  zIndex: 1
                }}
              >
                {filterMode === mode && (
                  <motion.div
                    layoutId="dashFilterIndicator"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'var(--purple)',
                      borderRadius: '6px',
                      zIndex: -1
                    }}
                    transition={{ type: 'tween', ease: 'easeInOut', duration: 0.22 }}
                  />
                )}
                {mode === 'Week' ? '7 Days' : (mode === 'Month' ? '30 Days' : mode)}
              </button>
            ))}
          </div>

          <CustomSelect
            value={filterMode === 'CalendarMonth' ? selectedCalendarMonth : ''}
            onChange={handleMonthSelect}
            options={uniqueCalendarMonths}
            placeholder="Select Calendar Month"
            style={{ 
              padding: '5px 12px', 
              fontSize: '0.74rem', 
              height: '34px',
              minHeight: 'unset',
              minWidth: '170px',
              fontFamily: 'var(--font-mono)', 
              fontWeight: 700 
            }}
          />

          {/* Custom Pickers */}
          {filterMode === 'Custom' && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="field-input"
                style={{ padding: '5px 8px', borderRadius: 6, fontSize: '0.74rem', width: 125, height: '30px' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>to</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="field-input"
                style={{ padding: '5px 8px', borderRadius: 6, fontSize: '0.74rem', width: 125, height: '30px' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="card card-p" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
        <div className="mobile-no-border" style={{ display: 'flex', flexDirection: 'column', gap: 4, borderRight: '1px solid var(--border-light-color)', paddingRight: 16 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Net Revenue</span>
          <span className="revenue-highlight" style={{ fontSize: '1.45rem', fontWeight: 800 }}>
            AED {metrics.netRevenue.toLocaleString("en-AE", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="mobile-no-border" style={{ display: 'flex', flexDirection: 'column', gap: 4, borderRight: '1px solid var(--border-light-color)', paddingRight: 16 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Transactions</span>
          <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {metrics.totalTransactions} bills
          </span>
        </div>
        <div className="mobile-no-border" style={{ display: 'flex', flexDirection: 'column', gap: 4, borderRight: '1px solid var(--border-light-color)', paddingRight: 16 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Average Basket (AOV)</span>
          <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--purple)' }}>
            AED {metrics.aov.toLocaleString("en-AE", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="mobile-no-border" style={{ display: 'flex', flexDirection: 'column', gap: 4, borderRight: '1px solid var(--border-light-color)', paddingRight: 16 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Registry Void Rate</span>
          <span style={{ fontSize: '1.45rem', fontWeight: 800, color: metrics.voidRate > 5 ? '#ef4444' : 'var(--text-primary)' }}>
            {metrics.voidRate.toFixed(1)}%
          </span>
        </div>
        {/* NEW: Returns / Exchanges */}
        <div className="mobile-no-border" style={{ display: 'flex', flexDirection: 'column', gap: 4, borderRight: '1px solid var(--border-light-color)', paddingRight: 16 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Returns / Exchanges</span>
          <span style={{ fontSize: '1.45rem', fontWeight: 800, color: (metrics.returnsCount + metrics.exchangesCount) > 0 ? '#ff007f' : 'var(--text-primary)' }}>
            {metrics.returnsCount + metrics.exchangesCount}
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {metrics.returnsCount} Returns &middot; {metrics.exchangesCount} Exchanges
          </span>
        </div>
        {/* NEW: Jenny Sales */}
        <div className="mobile-no-border" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Jenny Sales</span>
          <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ec4899' }}>
            {metrics.jennySalesCount}
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>Promoted Sales</span>
        </div>
      </div>

      {/* Main Graph & Channels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        <div className="grid-span-2-desktop">
          <DayByDayRevenueTrend billsList={filteredBills} />
        </div>

        {/* Payment mode breakdowns */}
        <div className="card card-p-lg" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h4 style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border-light-color)', paddingBottom: 8, margin: 0 }}>
            Payment Modes
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, justifyContent: 'center' }}>
            {paymentModeStats.map(m => (
              <div key={m.name} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', fontWeight: 700 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{m.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{m.value} bills ({m.pct.toFixed(1)}%)</span>
                </div>
                <div style={{ height: 8, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 999, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${m.pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{ height: '100%', backgroundColor: m.color, borderRadius: 999 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Channels & Products */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        {/* Sales Channels Platforms */}
        <div className="card card-p-lg" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h4 style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border-light-color)', paddingBottom: 8, margin: 0 }}>
            Sales Channels
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, justifyContent: 'center' }}>
            {platformStats.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.74rem' }}>No data logged.</div>
            ) : (
              platformStats.map(p => (
                <div key={p.name} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', fontWeight: 700 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{p.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{p.value} sales ({p.pct.toFixed(1)}%)</span>
                  </div>
                  <div style={{ height: 8, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 999, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${p.pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      style={{ height: '100%', backgroundColor: p.color, borderRadius: 999 }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Courier dispatch ratios */}
        <div className="card card-p-lg" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h4 style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border-light-color)', paddingBottom: 8, margin: 0 }}>
            Logistics Distribution
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700 }}>
                <span style={{ color: 'var(--text-secondary)' }}>🚛 Courier / Courier Deliveries</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{deliveryRatio.deliveryCount} logs ({deliveryRatio.deliveryPct.toFixed(1)}%)</span>
              </div>
              <div style={{ height: 10, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 999, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${deliveryRatio.deliveryPct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  style={{ height: '100%', backgroundColor: 'var(--purple)', borderRadius: 999 }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700 }}>
                <span style={{ color: 'var(--text-secondary)' }}>🛍 In-Store Collections</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{deliveryRatio.instoreCount} logs ({deliveryRatio.instorePct.toFixed(1)}%)</span>
              </div>
              <div style={{ height: 10, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 999, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${deliveryRatio.instorePct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  style={{ height: '100%', backgroundColor: 'var(--citrus)', borderRadius: 999 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Returns/Exchanges & Jenny Sales Line Charts */}
      {(function ChartRow() {
        const W = 520, H = 170, padX = 38, padY = 18;
        const chartH = H - padY * 2 - 22; // room for x labels

        function bezierCurve(pts) {
          if (pts.length < 2) return '';
          let d = `M ${pts[0].x} ${pts[0].y}`;
          for (let i = 0; i < pts.length - 1; i++) {
            const a = pts[i], b = pts[i + 1], cx = a.x + (b.x - a.x) / 2;
            d += ` C ${cx} ${a.y}, ${cx} ${b.y}, ${b.x} ${b.y}`;
          }
          return d;
        }

        /* ── Returns / Exchanges ── */
        function RetExChart() {
          const [hov, setHov] = React.useState(null);
          const data = returnExchangeDaily;
          if (data.length < 2) return (
            <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:170,color:'var(--text-muted)',fontSize:'0.74rem' }}>
              Need at least 2 days of data to draw a line.
            </div>
          );
          const maxV = Math.max(...data.map(d => Math.max(d.returns, d.exchanges)), 1);
          const mkPts = key => data.map((d, i) => ({
            x: padX + (i / (data.length - 1)) * (W - 2 * padX),
            y: padY + chartH - (d[key] / maxV) * chartH,
            v: d[key], label: d.label
          }));
          const rPts = mkPts('returns'), ePts = mkPts('exchanges');
          const rLine = bezierCurve(rPts), eLine = bezierCurve(ePts);
          const rArea = rLine + ` L ${rPts[rPts.length-1].x} ${padY+chartH} L ${rPts[0].x} ${padY+chartH} Z`;
          const eArea = eLine + ` L ${ePts[ePts.length-1].x} ${padY+chartH} L ${ePts[0].x} ${padY+chartH} Z`;
          const sw = data.length > 1 ? (W - 2 * padX) / (data.length - 1) : W;
          return (
            <div style={{ position:'relative' }}>
              {hov !== null && (
                <div style={{
                  position:'absolute', top:-10,
                  left: `${Math.min(Math.max((rPts[hov].x / W) * 100, 15), 85)}%`,
                  transform:'translateX(-50%)',
                  background: 'rgba(24, 24, 27, 0.88)',
                  backdropFilter: 'blur(8px)',
                  border: '1.5px solid rgba(128, 128, 128, 0.25)',
                  borderRadius:8, padding:'8px 12px', fontSize:'0.72rem', fontWeight:700,
                  zIndex:20, pointerEvents:'none', whiteSpace:'nowrap',
                  boxShadow:'0 8px 32px rgba(0,0,0,0.35)'
                }}>
                  <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:'0.65rem', marginBottom:5 }}>{data[hov].label}</div>
                  <div style={{ display:'flex', gap:14 }}>
                    <span style={{ color:'#ff007f', display:'flex', alignItems:'center', gap:4 }}>
                      <span style={{ width:6, height:6, borderRadius:'50%', backgroundColor:'#ff007f', display:'inline-block' }} />
                      Returns: <strong>{data[hov].returns}</strong>
                    </span>
                    <span style={{ color:'#f59e0b', display:'flex', alignItems:'center', gap:4 }}>
                      <span style={{ width:6, height:6, borderRadius:'50%', backgroundColor:'#f59e0b', display:'inline-block' }} />
                      Exchanges: <strong>{data[hov].exchanges}</strong>
                    </span>
                  </div>
                </div>
              )}
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', minWidth:260, height:H, display:'block' }}>
                <defs>
                  <linearGradient id="rGr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff007f" stopOpacity="0.22"/>
                    <stop offset="100%" stopColor="#ff007f" stopOpacity="0"/>
                  </linearGradient>
                  <linearGradient id="eGr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.18"/>
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {[0,0.33,0.67,1].map((t,i) => {
                  const y = padY + t*chartH;
                  const val = Math.round(maxV * (1 - t));
                  return (
                    <g key={i}>
                      <line x1={padX} x2={W-padX} y1={y} y2={y}
                        stroke="rgba(128,128,128,0.1)" strokeWidth="1"/>
                      <text x={padX - 8} y={y + 3} fontSize="8"
                        fill="var(--text-muted)" textAnchor="end" fontFamily="var(--font-mono)">
                        {val}
                      </text>
                    </g>
                  );
                })}
                <path d={rArea} fill="url(#rGr)"/>
                <path d={eArea} fill="url(#eGr)"/>
                <motion.path d={rLine} fill="none" stroke="#ff007f" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"
                  initial={{pathLength:0,opacity:0}} animate={{pathLength:1,opacity:1}} transition={{duration:0.9,ease:'easeOut'}}/>
                <motion.path d={eLine} fill="none" stroke="#f59e0b" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"
                  initial={{pathLength:0,opacity:0}} animate={{pathLength:1,opacity:1}} transition={{duration:0.9,ease:'easeOut',delay:0.15}}/>
                {hov !== null && (
                  <line x1={rPts[hov].x} x2={rPts[hov].x} y1={padY} y2={padY+chartH}
                    stroke="rgba(180,180,180,0.35)" strokeWidth="1" strokeDasharray="4 3"/>
                )}
                {rPts.map((p,i) => {
                  const showLabel = i === hov || i === 0 || i === data.length - 1 || i % Math.ceil(data.length / 5) === 0;
                  return (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r={hov===i?5.5:3.5} fill="#ff007f" stroke="var(--bg-card,#fff)" strokeWidth="2"/>
                      {showLabel && (
                        <text x={p.x} y={H-6} fontSize="8"
                          fill={hov===i?'var(--text-primary)':'var(--text-muted)'}
                          textAnchor="middle" fontWeight={hov===i?'800':'500'}>{p.label}</text>
                      )}
                    </g>
                  );
                })}
                {ePts.map((p,i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={hov===i?5.5:3.5} fill="#f59e0b" stroke="var(--bg-card,#fff)" strokeWidth="2"/>
                ))}
                {data.map((_,i) => (
                  <rect key={i} x={rPts[i].x - sw/2} y={0} width={sw} height={H-18}
                    fill="transparent" style={{cursor:'crosshair'}}
                    onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}/>
                ))}
              </svg>
            </div>
          );
        }

        /* ── Jenny Sales ── */
        function JennyChart() {
          const [hov, setHov] = React.useState(null);
          const data = jennyDaily;
          if (data.length < 2) return (
            <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:170,color:'var(--text-muted)',fontSize:'0.74rem' }}>
              Need at least 2 days of data to draw a line.
            </div>
          );
          const maxV = Math.max(...data.map(d => d.value), 1);
          const pts = data.map((d,i) => ({
            x: padX + (i / (data.length - 1)) * (W - 2 * padX),
            y: padY + chartH - (d.value / maxV) * chartH,
            v: d.value, label: d.label
          }));
          const line = bezierCurve(pts);
          const area = line + ` L ${pts[pts.length-1].x} ${padY+chartH} L ${pts[0].x} ${padY+chartH} Z`;
          const sw = data.length > 1 ? (W - 2 * padX) / (data.length - 1) : W;
          return (
            <div style={{ position:'relative' }}>
              {hov !== null && (
                <div style={{
                  position:'absolute', top:-10,
                  left:`${Math.min(Math.max((pts[hov].x / W) * 100, 15), 85)}%`,
                  transform:'translateX(-50%)',
                  background: 'rgba(24, 24, 27, 0.88)',
                  backdropFilter: 'blur(8px)',
                  border: '1.5px solid rgba(236, 72, 153, 0.35)',
                  borderRadius:8, padding:'8px 12px', fontSize:'0.72rem', fontWeight:700,
                  zIndex:20, pointerEvents:'none', whiteSpace:'nowrap',
                  boxShadow:'0 8px 32px rgba(236,72,153,0.18)'
                }}>
                  <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:'0.65rem', marginBottom:5 }}>{data[hov].label}</div>
                  <span style={{ color:'#ec4899', display:'flex', alignItems:'center', gap:4 }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', backgroundColor:'#ec4899', display:'inline-block' }} />
                    Jenny Sales: <strong>{data[hov].value}</strong>
                  </span>
                </div>
              )}
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', minWidth:260, height:H, display:'block' }}>
                <defs>
                  <linearGradient id="jGr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity="0.28"/>
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {[0,0.33,0.67,1].map((t,i) => {
                  const y = padY + t*chartH;
                  const val = Math.round(maxV * (1 - t));
                  return (
                    <g key={i}>
                      <line x1={padX} x2={W-padX} y1={y} y2={y}
                        stroke="rgba(128,128,128,0.1)" strokeWidth="1"/>
                      <text x={padX - 8} y={y + 3} fontSize="8"
                        fill="var(--text-muted)" textAnchor="end" fontFamily="var(--font-mono)">
                        {val}
                      </text>
                    </g>
                  );
                })}
                <path d={area} fill="url(#jGr)"/>
                <motion.path d={line} fill="none" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  initial={{pathLength:0,opacity:0}} animate={{pathLength:1,opacity:1}} transition={{duration:1,ease:'easeOut'}}/>
                {hov !== null && (
                  <line x1={pts[hov].x} x2={pts[hov].x} y1={padY} y2={padY+chartH}
                    stroke="rgba(236,72,153,0.35)" strokeWidth="1" strokeDasharray="4 3"/>
                )}
                {pts.map((p,i) => {
                  const showLabel = i === hov || i === 0 || i === data.length - 1 || i % Math.ceil(data.length / 5) === 0;
                  return (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r={hov===i?6:4} fill="#ec4899" stroke="var(--bg-card,#fff)" strokeWidth="2"/>
                      <text x={p.x} y={p.y - 8} fontSize="9" fill="#ec4899" textAnchor="middle" fontWeight="800"
                        opacity={hov===i||data.length<=8?1:0} style={{transition:'opacity 0.15s'}}>{p.v}</text>
                      {showLabel && (
                        <text x={p.x} y={H-6} fontSize="8"
                          fill={hov===i?'var(--text-primary)':'var(--text-muted)'}
                          textAnchor="middle" fontWeight={hov===i?'800':'500'}>{p.label}</text>
                      )}
                    </g>
                  );
                })}
                {data.map((_,i) => (
                  <rect key={i} x={pts[i].x - sw/2} y={0} width={sw} height={H-18}
                    fill="transparent" style={{cursor:'crosshair'}}
                    onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}/>
                ))}
              </svg>
            </div>
          );
        }

        return (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:18 }}>
            <div className="card card-p-lg" style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <h4 style={{ fontFamily:'var(--font-mono)', fontWeight:800, fontSize:'0.8rem', textTransform:'uppercase', letterSpacing:'0.04em', margin:0 }}>Returns vs Exchanges</h4>
                <div style={{ display:'flex', gap:12, fontSize:'0.68rem', fontWeight:700 }}>
                  <span style={{ display:'flex', alignItems:'center', gap:5 }}><span style={{ width:10, height:3, borderRadius:2, background:'#ff007f', display:'inline-block' }}/>Returns</span>
                  <span style={{ display:'flex', alignItems:'center', gap:5 }}><span style={{ width:10, height:3, borderRadius:2, background:'#f59e0b', display:'inline-block' }}/>Exchanges</span>
                </div>
              </div>
              <RetExChart/>
              <div style={{ display:'flex', gap:20, paddingTop:6, borderTop:'1px solid var(--border-light-color)' }}>
                <div><span style={{ fontSize:'0.65rem', color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', display:'block' }}>Total Returns</span><span style={{ fontSize:'1.1rem', fontWeight:800, color:'#ff007f' }}>{metrics.returnsCount}</span></div>
                <div><span style={{ fontSize:'0.65rem', color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', display:'block' }}>Total Exchanges</span><span style={{ fontSize:'1.1rem', fontWeight:800, color:'#f59e0b' }}>{metrics.exchangesCount}</span></div>
              </div>
            </div>
            <div className="card card-p-lg" style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <h4 style={{ fontFamily:'var(--font-mono)', fontWeight:800, fontSize:'0.8rem', textTransform:'uppercase', letterSpacing:'0.04em', margin:0 }}>♥ Jenny Promoted Sales</h4>
                <span style={{ fontSize:'0.68rem', color:'#ec4899', fontWeight:700, background:'rgba(236,72,153,0.12)', padding:'2px 10px', borderRadius:6 }}>{metrics.jennySalesCount} total</span>
              </div>
              <JennyChart/>
              <div style={{ paddingTop:6, borderTop:'1px solid var(--border-light-color)' }}>
                <span style={{ fontSize:'0.68rem', color:'var(--text-muted)', fontWeight:600 }}>Tracked across {jennyDaily.length} active day{jennyDaily.length!==1?'s':''} in selected period.</span>
              </div>
            </div>
          </div>
        );
      })()}


      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        {/* Leaderboard table */}
        <div className="card static" style={{ flex: 1.4, display: 'flex', flexDirection: 'column', gap: 12, padding: 18 }}>
          <h4 style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border-light-color)', paddingBottom: 8, margin: 0 }}>
            Top Products Leaderboard
          </h4>
          <div className="data-table-wrap" style={{ flex: 1 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Revenue</th>
                  <th style={{ textAlign: 'right' }}>% Share</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '24px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                      No product sales recorded in this period.
                    </td>
                  </tr>
                ) : (
                  topProducts.map((p, idx) => (
                    <tr key={p.name}>
                      <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>{idx + 1}</td>
                      <td style={{ fontWeight: 700, fontSize: '0.74rem' }}>{p.name}</td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--purple)', fontWeight: 'bold' }}>{p.qty}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.74rem' }} className="revenue-highlight">
                        AED {p.revenue.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {p.pct.toFixed(1)}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monospace activity log */}
        <div className="card card-p-lg" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h4 style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border-light-color)', paddingBottom: 8, margin: 0 }}>
            Recent Activity Log
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, justifyContent: 'flex-start', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            {recentTransactions.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 24 }}>No transactions logged.</div>
            ) : (
recentTransactions.map((tx, idx) => {
                const badgeColor = tx.transaction_type === 'Void' ? '#ef4444' : (tx.transaction_type === 'Return' ? '#be185d' : (tx.transaction_type === 'Exchange' ? '#8b5cf6' : '#10b981'));
                return (
                  <div key={tx.id || idx} style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 8, borderBottom: idx < recentTransactions.length - 1 ? '1px dashed var(--border-light-color)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: badgeColor, textTransform: 'uppercase', fontSize: '0.66rem', background: 'rgba(0,0,0,0.03)', padding: '2px 6px', borderRadius: 4 }}>
                        {tx.transaction_type}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>{tx.date}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Ph: {tx.customer_name || 'Anonymous'}</span>
                      <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>AED {parseFloat(tx.price || 0).toFixed(2)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PANEL: MARKETING PLATFORMS
   ========================================================= */

// Helper function to draw smooth bezier curves (defined outside to avoid nested updates)
function mktBezierCurve(pts) {
  if (!pts || pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], cx = a.x + (b.x - a.x) / 2;
    d += ` C ${cx} ${a.y}, ${cx} ${b.y}, ${b.x} ${b.y}`;
  }
  return d;
}

// Dedicated Trend Graph Section component defined at the top-level to prevent React 19 unmount loops
function ChannelTrendSection({ p, allDays, selectedMonth }) {
  const [hoveredPt, setHoveredPt] = useState(null);

  const dailyPts = useMemo(() => {
    if (!allDays || allDays.length === 0) return [];
    return allDays.map((day, idx) => {
      const val = p.daily[day] || 0;
      return {
        day,
        val,
        x: 50 + (idx / Math.max(1, allDays.length - 1)) * 900 // Width W = 1000, padX = 50, 1000 - 50*2 = 900
      };
    });
  }, [allDays, p]);

  const maxVal = Math.max(...dailyPts.map(pt => pt.val), 1);
  
  const pts = dailyPts.map(pt => ({
    x: pt.x,
    y: 30 + 370 - (Math.max(0, pt.val) / maxVal) * 370,
    val: pt.val,
    day: pt.day
  }));

  const linePath = mktBezierCurve(pts);
  const areaPath = linePath ? `${linePath} L ${pts[pts.length - 1].x} 400 L ${pts[0].x} 400 Z` : '';
  const sw = pts.length > 1 ? 900 / (pts.length - 1) : 900;

  const peakPt = dailyPts.reduce((max, cur) => cur.val > max.val ? cur : max, { day: '—', val: 0 });
  const mopOrder = ["Cash", "Card", "Installments", "Bank"];
  const preferredMop = mopOrder.reduce((max, cur) => p.mopPercentages[cur] > p.mopPercentages[max] ? cur : max, "Cash");

  const formatXLabel = (dayStr) => {
    if (!selectedMonth) return dayStr;
    const [m, y] = selectedMonth.split('-');
    const shortMonths = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthIdx = parseInt(m) - 1;
    const monthName = shortMonths[monthIdx] || '';
    return `${dayStr} ${monthName}`;
  };

  return (
    <div className="card card-p-lg" style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', boxShadow: 'none', border: '1px solid var(--border-light-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', margin: 0, color: p.colors.main }}>
          {p.name} Daily Revenue Trend
        </h4>
        <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Acquisition Channel
        </span>
      </div>

      {/* Hover Tooltip Box (Clean flat style, no shadow) */}
      {hoveredPt !== null && (
        <div style={{
          position: 'absolute', top: 52,
          left: `${Math.min(Math.max((pts[hoveredPt].x / 1000) * 100, 10), 90)}%`,
          transform: 'translateX(-50%)',
          background: 'var(--bg-card,#ffffff)',
          border: `1.5px solid ${p.colors.main}`,
          borderRadius: 6, padding: '6px 10px', fontSize: '0.72rem', fontWeight: 700,
          zIndex: 20, pointerEvents: 'none', whiteSpace: 'nowrap',
          boxShadow: 'none',
          color: 'var(--text-primary)'
        }}>
          <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.58rem', marginBottom: 2 }}>
            Day {pts[hoveredPt].day} of Month
          </div>
          <span>
            Revenue: <strong>AED {Math.round(pts[hoveredPt].val).toLocaleString()}</strong>
          </span>
        </div>
      )}

      {allDays.length < 2 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240, color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          Not enough sales data to plot a trend line.
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240 }}>
          <svg viewBox="0 0 1000 440" style={{ width: '100%', height: 220, display: 'block', overflow: 'visible' }}>
            <defs>
              <linearGradient id={`spark-tab-${p.name.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={p.colors.main} stopOpacity="0.16"/>
                <stop offset="100%" stopColor={p.colors.main} stopOpacity="0"/>
              </linearGradient>
            </defs>

            {/* Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((t, idx) => {
              const y = 30 + t * 370;
              const val = Math.round(maxVal * (1 - t));
              return (
                <g key={idx}>
                  <line x1="50" x2="950" y1={y} y2={y} stroke="rgba(128,128,128,0.12)" strokeWidth="2.5" />
                  <text x="40" y={y + 8} fontSize="22" fontWeight="bold" fill="var(--text-muted)" textAnchor="end" fontFamily="var(--font-mono)">
                    {val}
                  </text>
                </g>
              );
            })}

            {areaPath && (
              <path d={areaPath} fill={`url(#spark-tab-${p.name.replace(/\s+/g, '')})`} />
            )}

            {linePath && (
              <motion.path 
                d={linePath} 
                fill="none" 
                stroke={p.colors.main} 
                strokeWidth="7.0" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
            )}

            {hoveredPt !== null && (
              <line 
                x1={pts[hoveredPt].x} 
                x2={pts[hoveredPt].x} 
                y1={30} 
                y2={400} 
                stroke="rgba(128,128,128,0.25)" 
                strokeWidth="3.5" 
                strokeDasharray="6 5" 
              />
            )}

            {/* Circular dot markers on every trend point */}
            {pts.map((pt, idx) => {
              const isHovered = hoveredPt === idx;
              return (
                <circle 
                  key={idx} 
                  cx={pt.x} 
                  cy={pt.y} 
                  r={isHovered ? 14 : 9} 
                  fill={p.colors.main} 
                  stroke="var(--bg-card,#fff)" 
                  strokeWidth={isHovered ? 5.5 : 4} 
                  style={{ transition: 'r 0.15s ease, stroke-width 0.15s ease', cursor: 'pointer' }}
                />
              );
            })}

            {/* X-Axis Labels (Formatted as DD MMM, e.g. 11 Jun) */}
            {pts.map((ptPoint, i) => {
              const showLabel = i === hoveredPt || i === 0 || i === pts.length - 1 || i % Math.ceil(pts.length / 5) === 0;
              return showLabel ? (
                <text 
                  key={i} 
                  x={ptPoint.x} 
                  y="428" 
                  fontSize="22" 
                  fill={hoveredPt === i ? 'var(--text-primary)' : 'var(--text-muted)'}
                  fontWeight="bold" 
                  textAnchor="middle"
                >
                  {formatXLabel(ptPoint.day)}
                </text>
              ) : null;
            })}

            <line x1="50" x2="950" y1="400" y2="400" stroke="var(--border-light-color)" strokeWidth="3" />

            {/* Transparent hover catcher rects */}
            {pts.map((pt, idx) => (
              <rect 
                key={idx}
                x={pt.x - sw/2}
                y={10}
                width={sw}
                height={400}
                fill="transparent"
                style={{ cursor: 'crosshair' }}
                onMouseEnter={() => setHoveredPt(idx)}
                onMouseLeave={() => setHoveredPt(null)}
              />
            ))}
          </svg>
        </div>
      )}


      {/* Summary Line under the chart, matching the reference design */}
      <div style={{
        marginTop: 6,
        paddingTop: 12,
        borderTop: '1px solid var(--border-light-color)',
        fontSize: '0.74rem',
        color: 'var(--text-muted)',
        fontWeight: 500
      }}>
        Tracked across {dailyPts.filter(pt => pt.val > 0).length} active days in selected period.
      </div>
    </div>
  );
}

function MktPlatformsPanel({ billsList = [] }) {
  const [selectedMonth, setSelectedMonth] = useState('');

  // 1. Gather all unique months from the transactions database
  const availableMonths = useMemo(() => {
    const monthsSet = new Set();
    billsList.forEach(b => {
      if (!b.date) return;
      const parts = b.date.split('-');
      if (parts.length === 3) {
        monthsSet.add(`${parts[1]}-${parts[2]}`);
      }
    });

    if (monthsSet.size === 0) {
      const now = new Date();
      monthsSet.add(`${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`);
    }

    return Array.from(monthsSet).sort((a, b) => {
      const partsA = a.split('-');
      const partsB = b.split('-');
      return new Date(partsA[1], partsA[0] - 1) - new Date(partsB[1], partsB[0] - 1);
    });
  }, [billsList]);

  // Default selectedMonth to the latest month available
  useEffect(() => {
    if (availableMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(availableMonths[availableMonths.length - 1]);
    }
  }, [availableMonths, selectedMonth]);

  const monthLabel = (mVal) => {
    if (!mVal) return '';
    const [m, y] = mVal.split('-');
    const names = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    return `${names[parseInt(m) - 1]} ${y}`;
  };

  // 2. Filter transactions and compute metrics for the active month
  const analytics = useMemo(() => {
    if (!selectedMonth) return null;

    const monthBills = billsList.filter(b => {
      if (!b.date) return false;
      const isJenny = b.jenny === 1 || b.jenny === '1' || b.jenny === true || b.jenny === 'true';
      if (isJenny) return false;
      const parts = b.date.split('-');
      return `${parts[1]}-${parts[2]}` === selectedMonth;
    });

    const totalTx = monthBills.length;
    let totalRevenue = 0;
    let totalSalesCount = 0;
    let totalReturnsCount = 0;

    const channels = ["Instagram", "TikTok", "Reference", "Regular Customer"];
    const channelColors = {
      "Instagram": { main: '#a855f7', bg: 'rgba(168,85,247,0.06)' },
      "TikTok": { main: '#f97316', bg: 'rgba(249,115,22,0.06)' },
      "Reference": { main: '#3b82f6', bg: 'rgba(59,130,246,0.06)' },
      "Regular Customer": { main: '#10b981', bg: 'rgba(16,185,129,0.06)' }
    };

    const channelData = {};
    channels.forEach(ch => {
      channelData[ch] = {
        name: ch,
        total: 0,
        sales: 0,
        returns: 0,
        exchanges: 0,
        revenue: 0,
        daily: {},
        delivery: 0,
        paymentModes: { Cash: 0, Card: 0, Installments: 0, Bank: 0 }
      };
    });

    monthBills.forEach(b => {
      if (b.jenny === true || b.jenny === 'true' || b.jenny === 1 || Number(b.jenny) === 1) return;
      
      const ch = b.platform || "Regular Customer";
      const data = channelData[ch] || channelData["Regular Customer"];
      const txType = b.transaction_type;
      
      data.total += 1;
      let billVal = 0;

      if (txType === "Sale") {
        data.sales += 1;
        totalSalesCount += 1;
        billVal = parseFloat(b.price || 0);
        data.revenue += billVal;
        totalRevenue += billVal;
      } else if (txType === "Return") {
        data.returns += 1;
        totalReturnsCount += 1;
        billVal = parseFloat(b.price || 0);
        data.revenue -= billVal;
        totalRevenue -= billVal;
      } else if (txType === "Exchange") {
        data.sales += 1;
        data.exchanges += 1;
        totalSalesCount += 1;
        billVal = parseFloat(b.exch_balance || 0);
        data.revenue += billVal;
        totalRevenue += billVal;
      }

      const day = (b.date || "").split("-")[0];
      if (day) {
        const sign = txType === "Return" ? -1 : 1;
        data.daily[day] = (data.daily[day] || 0) + (sign * billVal);
      }

      if (b.delivery === 1 || b.delivery === '1' || b.delivery === true || b.delivery === 'true') {
        data.delivery += 1;
      }

      const mop = b.payment_mode || "POS";
      const sign = txType === "Return" ? -1 : 1;
      const amountToRecord = txType === "Exchange" ? Math.max(0, parseFloat(b.exch_balance || 0)) : parseFloat(b.price || 0);
      
      if (mop === "Mixed") {
        data.paymentModes.Cash += sign * parseFloat(b.mixed_cash || 0);
        data.paymentModes.Card += sign * parseFloat(b.mixed_card || 0);
        data.paymentModes.Installments += sign * (parseFloat(b.mixed_tabby || 0) + parseFloat(b.mixed_tamara || 0));
        data.paymentModes.Bank += sign * parseFloat(b.mixed_bank || 0);
      } else if (mop === "Cash") {
        data.paymentModes.Cash += sign * amountToRecord;
      } else if (mop === "Card") {
        data.paymentModes.Card += sign * amountToRecord;
      } else if (mop === "Tabby" || mop === "Tamara") {
        data.paymentModes.Installments += sign * amountToRecord;
      } else if (mop === "Bank Transfer" || mop === "Bank") {
        data.paymentModes.Bank += sign * amountToRecord;
      }
    });

    const leaderboard = channels.map(ch => {
      const d = channelData[ch];
      const volShare = totalTx > 0 ? (d.total / totalTx) * 100 : 0;
      const revShare = totalRevenue > 0 ? (d.revenue / totalRevenue) * 100 : 0;
      const aov = d.sales > 0 ? d.revenue / d.sales : 0;

      const mopTotal = Math.max(1, Object.values(d.paymentModes).reduce((a, b) => a + Math.max(0, b), 0));
      const mopPercentages = {
        Cash: Math.round((Math.max(0, d.paymentModes.Cash) / mopTotal) * 100),
        Card: Math.round((Math.max(0, d.paymentModes.Card) / mopTotal) * 100),
        Installments: Math.round((Math.max(0, d.paymentModes.Installments) / mopTotal) * 100),
        Bank: Math.round((Math.max(0, d.paymentModes.Bank) / mopTotal) * 100)
      };

      return {
        ...d,
        volShare,
        revShare,
        aov,
        colors: channelColors[ch],
        mopPercentages
      };
    });

    const bestChannel = leaderboard.reduce((max, cur) => cur.revenue > max.revenue ? cur : max, leaderboard[0]);
    const highAovChannel = leaderboard.reduce((max, cur) => cur.aov > max.aov ? cur : max, leaderboard[0]);
    const deliveryLeader = leaderboard.reduce((max, cur) => {
      const curRatio = cur.total > 0 ? cur.delivery / cur.total : 0;
      const maxRatio = max.total > 0 ? max.delivery / max.total : 0;
      return curRatio > maxRatio ? cur : max;
    }, leaderboard[0]);

    // Extract all days sorted chronologically
    const allDays = Array.from(new Set(monthBills.map(b => (b.date || "").split("-")[0]))).filter(Boolean).sort((a,b) => parseInt(a) - parseInt(b));

    return {
      totalTx,
      totalRevenue,
      totalSalesCount,
      totalReturnsCount,
      leaderboard,
      bestChannel,
      highAovChannel,
      deliveryLeader,
      allDays
    };
  }, [billsList, selectedMonth]);

  const handleExportPDF = () => {
    if (!selectedMonth) return;
    const url = `/api/export-pdf-marketing?month=${selectedMonth}&mode=platforms`;
    window.open(url, '_blank');
  };

  if (!selectedMonth || !analytics) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
        Analyzing marketing records...
      </div>
    );
  }

  return (
    <div>
      {/* Header and Filter Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <div>
          <div className="page-title">Platforms Compare</div>
          <div className="page-subtitle">Dynamic marketing channel performance and revenue analytics</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select 
            className="field-input" 
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem', minWidth: 160, fontWeight: 700 }}
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          >
            {availableMonths.map(m => (
              <option key={m} value={m}>{monthLabel(m)}</option>
            ))}
          </select>
          <button 
            className="btn btn-ghost"
            onClick={handleExportPDF}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: '0.8rem' }}
          >
            <FileText size={14} /> Export PDF Report
          </button>
        </div>
      </div>

      {/* 1. Main Stats Cards Grid (Clean KPIs, flat borders, no shadows) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18, marginBottom: 28 }}>
        {analytics.leaderboard.map((p, i) => (
          <motion.div 
            key={p.name} 
            className="card card-p-lg" 
            initial={{ opacity: 0, y: 16 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.06 }}
            style={{ position: 'relative', overflow: 'hidden', boxShadow: 'none', border: '1px solid var(--border-light-color)' }}
          >
            <div style={{ height: 6, background: p.colors.main, position: 'absolute', top: 0, left: 0, right: 0 }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <h4 style={{ fontWeight: 800, margin: 0, fontSize: '0.94rem' }}>{p.name}</h4>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, color: p.colors.main, background: p.colors.bg, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
                {p.revenue >= 0 ? `${p.revShare.toFixed(1)}% rev` : 'Loss'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Net Revenue</div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: p.revenue >= 0 ? 'var(--text-primary)' : 'var(--text-pink)' }}>
                  AED {Math.round(p.revenue).toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Average Ticket</div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                  AED {Math.round(p.aov).toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Transactions</div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                  {p.total} <span style={{ fontSize: '0.66rem', fontWeight: 500, color: 'var(--text-muted)' }}>({p.volShare.toFixed(0)}%)</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Shipments</div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                  {p.delivery} <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 500 }}>({p.total > 0 ? ((p.delivery / p.total) * 100).toFixed(0) : 0}%)</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 2. Channel Trend Graphs in a 2x2 Box Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 18, marginBottom: 28 }}>
        {analytics.leaderboard.map(p => (
          <ChannelTrendSection key={p.name} p={p} allDays={analytics.allDays} selectedMonth={selectedMonth} />
        ))}
      </div>

      {/* 3. Campaign Summary Insights Card */}
      <div className="card card-p-lg static" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28, boxShadow: 'none', border: '1px solid var(--border-light-color)' }}>
        <h4 style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', margin: 0, color: 'var(--purple)' }}>
          💡 Campaign monthly overview summary
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.78rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          <div>
            ⭐ <strong>Top Channel:</strong> The primary revenue driver this month is <strong>{analytics.bestChannel.name}</strong>, contributing <strong>AED {Math.round(analytics.bestChannel.revenue).toLocaleString()}</strong> ({analytics.bestChannel.revShare.toFixed(1)}% of all volume).
          </div>
          <div>
            💎 <strong>Premium Purchases:</strong> <strong>{analytics.highAovChannel.name}</strong> generated the highest Average Order Value (AOV) at <strong>AED {Math.round(analytics.highAovChannel.aov).toLocaleString()}</strong>, indicating buyers there target high-ticket items.
          </div>
          <div>
            🚚 <strong>Fulfillment Preference:</strong> Customers acquired from <strong>{analytics.deliveryLeader.name}</strong> have the highest delivery order preference, with <strong>{((analytics.deliveryLeader.delivery / Math.max(1, analytics.deliveryLeader.total)) * 100).toFixed(0)}%</strong> of transactions requiring shipment.
          </div>
        </div>
      </div>

      {/* 4. Payment Preference Matrix */}
      <div className="card static" style={{ overflow: 'hidden', boxShadow: 'none', border: '1px solid var(--border-light-color)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light-color)', background: 'rgba(0,0,0,0.01)' }}>
          <h4 style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', margin: 0 }}>
            Acquisition Payment preferences matrix
          </h4>
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Acquisition Channel</th>
                <th style={{ textAlign: 'center' }}>💵 Cash Ratio</th>
                <th style={{ textAlign: 'center' }}>💳 Card Ratio</th>
                <th style={{ textAlign: 'center' }}>🕒 Installments (Tabby/Tamara)</th>
                <th style={{ textAlign: 'center' }}>🏦 Bank Transfer</th>
              </tr>
            </thead>
            <tbody>
              {analytics.leaderboard.map(p => (
                <tr key={p.name}>
                  <td style={{ fontWeight: 700 }}>{p.name}</td>
                  <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {p.mopPercentages.Cash}%
                  </td>
                  <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {p.mopPercentages.Card}%
                  </td>
                  <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--purple)', fontWeight: 700 }}>
                    {p.mopPercentages.Installments}%
                  </td>
                  <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {p.mopPercentages.Bank}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PANEL: PURCHASE COMPARE
   ========================================================= */

// Dedicated Trend Chart for Fulfillment channels (defined at module level)
function FulfillmentTrendCard({ title, color, pts, path, area, allDays, selectedMonth, maxVal }) {
  const [hoveredPt, setHoveredPt] = useState(null);
  const sw = pts.length > 1 ? 900 / (pts.length - 1) : 900;

  const formatXLabel = (dayStr) => {
    if (!selectedMonth) return dayStr;
    const [m, y] = selectedMonth.split('-');
    const shortMonths = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthIdx = parseInt(m) - 1;
    const monthName = shortMonths[monthIdx] || '';
    return `${dayStr} ${monthName}`;
  };

  return (
    <div className="card card-p-lg" style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', boxShadow: 'none', border: '1px solid var(--border-light-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', margin: 0, color: color }}>
          {title}
        </h4>
        <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Fulfillment Channel
        </span>
      </div>

      {/* Hover Tooltip Box */}
      {hoveredPt !== null && (
        <div style={{
          position: 'absolute', top: 52,
          left: `${Math.min(Math.max((pts[hoveredPt].x / 1000) * 100, 10), 90)}%`,
          transform: 'translateX(-50%)',
          background: 'var(--bg-card,#ffffff)',
          border: `1.5px solid ${color}`,
          borderRadius: 6, padding: '6px 10px', fontSize: '0.72rem', fontWeight: 700,
          zIndex: 20, pointerEvents: 'none', whiteSpace: 'nowrap',
          boxShadow: 'none',
          color: 'var(--text-primary)'
        }}>
          <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.58rem', marginBottom: 2 }}>
            Day {pts[hoveredPt].day} of Month
          </div>
          <span>
            Revenue: <strong>AED {Math.round(pts[hoveredPt].val).toLocaleString()}</strong>
          </span>
        </div>
      )}

      {allDays.length < 2 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240, color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          Not enough sales data to plot a trend line.
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240 }}>
          <svg viewBox="0 0 1000 440" style={{ width: '100%', height: 220, display: 'block', overflow: 'visible' }}>
            <defs>
              <linearGradient id={`ful-grad-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.16"/>
                <stop offset="100%" stopColor={color} stopOpacity="0"/>
              </linearGradient>
            </defs>

            {/* Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((t, idx) => {
              const y = 30 + t * 370;
              const val = Math.round(maxVal * (1 - t));
              return (
                <g key={idx}>
                  <line x1="50" x2="950" y1={y} y2={y} stroke="rgba(128,128,128,0.12)" strokeWidth="2.5" />
                  <text x="40" y={y + 8} fontSize="22" fontWeight="bold" fill="var(--text-muted)" textAnchor="end" fontFamily="var(--font-mono)">
                    {val}
                  </text>
                </g>
              );
            })}

            {area && (
              <path d={area} fill={`url(#ful-grad-${title.replace(/\s+/g, '')})`} />
            )}

            {path && (
              <motion.path 
                d={path} 
                fill="none" 
                stroke={color} 
                strokeWidth="7.0" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
            )}

            {hoveredPt !== null && (
              <line 
                x1={pts[hoveredPt].x} 
                x2={pts[hoveredPt].x} 
                y1={30} 
                y2={400} 
                stroke="rgba(128,128,128,0.25)" 
                strokeWidth="3.5" 
                strokeDasharray="6 5" 
              />
            )}

            {/* Circular dot markers on every trend point */}
            {pts.map((pt, idx) => {
              const isHovered = hoveredPt === idx;
              return (
                <circle 
                  key={idx} 
                  cx={pt.x} 
                  cy={pt.y} 
                  r={isHovered ? 14 : 9} 
                  fill={color} 
                  stroke="var(--bg-card,#fff)" 
                  strokeWidth={isHovered ? 5.5 : 4} 
                  style={{ transition: 'r 0.15s ease, stroke-width 0.15s ease', cursor: 'pointer' }}
                />
              );
            })}

            {/* X-Axis Labels */}
            {pts.map((ptPoint, i) => {
              const showLabel = i === hoveredPt || i === 0 || i === pts.length - 1 || i % Math.ceil(pts.length / 5) === 0;
              return showLabel ? (
                <text 
                  key={i} 
                  x={ptPoint.x} 
                  y="428" 
                  fontSize="22" 
                  fill={hoveredPt === i ? 'var(--text-primary)' : 'var(--text-muted)'}
                  fontWeight="bold" 
                  textAnchor="middle"
                >
                  {formatXLabel(ptPoint.day)}
                </text>
              ) : null;
            })}

            <line x1="50" x2="950" y1="400" y2="400" stroke="var(--border-light-color)" strokeWidth="3" />

            {/* Transparent hover catcher rects */}
            {pts.map((pt, idx) => (
              <rect 
                key={idx}
                x={pt.x - sw/2}
                y={10}
                width={sw}
                height={400}
                fill="transparent"
                style={{ cursor: 'crosshair' }}
                onMouseEnter={() => setHoveredPt(idx)}
                onMouseLeave={() => setHoveredPt(null)}
              />
            ))}
          </svg>
        </div>
      )}

      {/* Summary Line under the chart */}
      <div style={{
        marginTop: 6,
        paddingTop: 12,
        borderTop: '1px solid var(--border-light-color)',
        fontSize: '0.74rem',
        color: 'var(--text-muted)',
        fontWeight: 500
      }}>
        Tracked daily performance across {pts.filter(pt => pt.val > 0).length} active days in selected period.
      </div>
    </div>
  );
}

function MktPurchasePanel({ billsList = [] }) {
  const [selectedMonth, setSelectedMonth] = useState('');

  // 1. Gather unique months from transactions database
  const availableMonths = useMemo(() => {
    const monthsSet = new Set();
    billsList.forEach(b => {
      if (!b.date) return;
      const parts = b.date.split('-');
      if (parts.length === 3) {
        monthsSet.add(`${parts[1]}-${parts[2]}`);
      }
    });

    if (monthsSet.size === 0) {
      const now = new Date();
      monthsSet.add(`${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`);
    }

    return Array.from(monthsSet).sort((a, b) => {
      const partsA = a.split('-');
      const partsB = b.split('-');
      return new Date(partsA[1], partsA[0] - 1) - new Date(partsB[1], partsB[0] - 1);
    });
  }, [billsList]);

  // Default selectedMonth to the latest month available
  useEffect(() => {
    if (availableMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(availableMonths[availableMonths.length - 1]);
    }
  }, [availableMonths, selectedMonth]);

  const monthLabel = (mVal) => {
    if (!mVal) return '';
    const [m, y] = mVal.split('-');
    const names = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    return `${names[parseInt(m) - 1]} ${y}`;
  };

  const formatXLabel = (dayStr) => {
    if (!selectedMonth) return dayStr;
    const [m, y] = selectedMonth.split('-');
    const shortMonths = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthIdx = parseInt(m) - 1;
    const monthName = shortMonths[monthIdx] || '';
    return `${dayStr} ${monthName}`;
  };

  const handleExportPDF = () => {
    if (!selectedMonth) return;
    const url = `/api/export-pdf-marketing?month=${selectedMonth}&mode=purchase`;
    window.open(url, '_blank');
  };

  // 2. Filter transactions and compute metrics for active month
  const analytics = useMemo(() => {
    if (!selectedMonth) return null;

    const monthBills = billsList.filter(b => {
      if (!b.date) return false;
      const isJenny = b.jenny === 1 || b.jenny === '1' || b.jenny === true || b.jenny === 'true';
      if (isJenny) return false;
      const parts = b.date.split('-');
      return `${parts[1]}-${parts[2]}` === selectedMonth;
    });

    const totalTx = monthBills.length;
    let totalRevenue = 0;

    const segData = {
      "In-Store": { name: "In-Store", total: 0, sales: 0, returns: 0, exchanges: 0, revenue: 0, daily: {}, mop: { Cash: 0, Card: 0, Installments: 0, Bank: 0 }, color: '#8b5cf6' },
      "Delivery": { name: "Delivery", total: 0, sales: 0, returns: 0, exchanges: 0, revenue: 0, daily: {}, mop: { Cash: 0, Card: 0, Installments: 0, Bank: 0 }, color: '#14b8a6' }
    };

    monthBills.forEach(b => {
      if (b.jenny === true || b.jenny === 'true' || b.jenny === 1 || Number(b.jenny) === 1) return;

      const isDelivery = b.delivery === 1 || b.delivery === '1' || b.delivery === true || b.delivery === 'true';
      const seg = isDelivery ? "Delivery" : "In-Store";
      const d = segData[seg];
      const txType = b.transaction_type;

      d.total += 1;
      let billVal = 0;

      if (txType === "Sale") {
        d.sales += 1;
        billVal = parseFloat(b.price || 0);
        d.revenue += billVal;
        totalRevenue += billVal;
      } else if (txType === "Return") {
        d.returns += 1;
        billVal = parseFloat(b.price || 0);
        d.revenue -= billVal;
        totalRevenue -= billVal;
      } else if (txType === "Exchange") {
        d.sales += 1;
        d.exchanges += 1;
        billVal = parseFloat(b.exch_balance || 0);
        d.revenue += billVal;
        totalRevenue += billVal;
      }

      const day = (b.date || "").split("-")[0];
      if (day) {
        const sign = txType === "Return" ? -1 : 1;
        d.daily[day] = (d.daily[day] || 0) + (sign * billVal);
      }

      const mop = b.payment_mode || "POS";
      const sign = txType === "Return" ? -1 : 1;
      const amountToRecord = txType === "Exchange" ? Math.max(0, parseFloat(b.exch_balance || 0)) : parseFloat(b.price || 0);

      if (mop === "Mixed") {
        d.mop.Cash += sign * parseFloat(b.mixed_cash || 0);
        d.mop.Card += sign * parseFloat(b.mixed_card || 0);
        d.mop.Installments += sign * (parseFloat(b.mixed_tabby || 0) + parseFloat(b.mixed_tamara || 0));
        d.mop.Bank += sign * parseFloat(b.mixed_bank || 0);
      } else if (mop === "Cash") {
        d.mop.Cash += sign * amountToRecord;
      } else if (mop === "Card") {
        d.mop.Card += sign * amountToRecord;
      } else if (mop === "Tabby" || mop === "Tamara") {
        d.mop.Installments += sign * amountToRecord;
      } else if (mop === "Bank Transfer" || mop === "Bank") {
        d.mop.Bank += sign * amountToRecord;
      }
    });

    const totalRevVal = Math.max(1, Math.abs(totalRevenue));

    ["In-Store", "Delivery"].forEach(key => {
      const d = segData[key];
      d.aov = d.sales > 0 ? d.revenue / d.sales : 0;
      d.share = totalTx > 0 ? (d.total / totalTx) * 100 : 0;
      d.revShare = totalRevenue !== 0 ? (d.revenue / totalRevVal) * 100 : 0;

      const mopSum = Math.max(1, Object.values(d.mop).reduce((sum, v) => sum + Math.max(0, v), 0));
      d.mopPercentages = {
        Cash: Math.round((Math.max(0, d.mop.Cash) / mopSum) * 100),
        Card: Math.round((Math.max(0, d.mop.Card) / mopSum) * 100),
        Installments: Math.round((Math.max(0, d.mop.Installments) / mopSum) * 100),
        Bank: Math.round((Math.max(0, d.mop.Bank) / mopSum) * 100)
      };
    });

    const allDays = Array.from(new Set(monthBills.map(b => (b.date || "").split("-")[0]))).filter(Boolean).sort((a,b) => parseInt(a) - parseInt(b));

    return {
      segData,
      allDays,
      totalRevenue,
      totalTx
    };
  }, [billsList, selectedMonth]);

  const [hoveredPt, setHoveredPt] = useState(null);

  const dailyPts = useMemo(() => {
    if (!analytics || analytics.allDays.length === 0) return [];
    return analytics.allDays.map((day, idx) => {
      const storeVal = analytics.segData["In-Store"].daily[day] || 0;
      const deliveryVal = analytics.segData["Delivery"].daily[day] || 0;
      return {
        day,
        storeVal,
        deliveryVal,
        x: 50 + (idx / Math.max(1, analytics.allDays.length - 1)) * 900 // Width W = 1000, padX = 50, 1000 - 50*2 = 900
      };
    });
  }, [analytics]);

  const maxVal = useMemo(() => {
    if (dailyPts.length === 0) return 1;
    return Math.max(...dailyPts.map(pt => Math.max(pt.storeVal, pt.deliveryVal)), 1);
  }, [dailyPts]);

  const storePts = dailyPts.map(pt => ({
    x: pt.x,
    y: 30 + 370 - (Math.max(0, pt.storeVal) / maxVal) * 370,
    val: pt.storeVal,
    day: pt.day
  }));

  const deliveryPts = dailyPts.map(pt => ({
    x: pt.x,
    y: 30 + 370 - (Math.max(0, pt.deliveryVal) / maxVal) * 370,
    val: pt.deliveryVal,
    day: pt.day
  }));

  const storePath = mktBezierCurve(storePts);
  const storeArea = storePath ? `${storePath} L ${storePts[storePts.length - 1].x} 400 L ${storePts[0].x} 400 Z` : '';

  const deliveryPath = mktBezierCurve(deliveryPts);
  const deliveryArea = deliveryPath ? `${deliveryPath} L ${deliveryPts[deliveryPts.length - 1].x} 400 L ${deliveryPts[0].x} 400 Z` : '';

  const sw = dailyPts.length > 1 ? 900 / (dailyPts.length - 1) : 900;

  if (!selectedMonth || !analytics) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
        Analyzing fulfillment compare records...
      </div>
    );
  }

  const storeRev = analytics.segData["In-Store"].revenue;
  const delivRev = analytics.segData["Delivery"].revenue;
  const storeAov = analytics.segData["In-Store"].aov;
  const delivAov = analytics.segData["Delivery"].aov;
  const higherRevSeg = storeRev > delivRev ? "In-Store" : "Delivery";
  const higherAovSeg = storeAov > delivAov ? "In-Store" : "Delivery";

  return (
    <div>
      {/* Header and Filter Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <div>
          <div className="page-title">Fulfillment Compare</div>
          <div className="page-subtitle">In-Store vs. Delivery fulfillment channel performance comparison</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select 
            className="field-input" 
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem', minWidth: 160, fontWeight: 700 }}
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          >
            {availableMonths.map(m => (
              <option key={m} value={m}>{monthLabel(m)}</option>
            ))}
          </select>
          <button 
            className="btn btn-ghost"
            onClick={handleExportPDF}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: '0.8rem' }}
          >
            <FileText size={14} /> Export PDF Report
          </button>
        </div>
      </div>

      {/* 1. Comparative KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18, marginBottom: 28 }}>
        {["In-Store", "Delivery"].map((key) => {
          const p = analytics.segData[key];
          return (
            <motion.div 
              key={key} 
              className="card card-p-lg" 
              style={{ position: 'relative', overflow: 'hidden', boxShadow: 'none', border: '1px solid var(--border-light-color)' }}
            >
              <div style={{ height: 6, background: p.color, position: 'absolute', top: 0, left: 0, right: 0 }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <h4 style={{ fontWeight: 800, margin: 0, fontSize: '0.94rem' }}>{key} Fulfillment</h4>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: p.color, background: `${p.color}0d`, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
                  {p.revenue >= 0 ? `${p.revShare.toFixed(1)}% rev share` : 'Loss'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Net Revenue</div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: p.revenue >= 0 ? 'var(--text-primary)' : 'var(--text-pink)' }}>
                    AED {Math.round(p.revenue).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Average Ticket</div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                    AED {Math.round(p.aov).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Transactions</div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                    {p.total} <span style={{ fontSize: '0.66rem', fontWeight: 500, color: 'var(--text-muted)' }}>({p.share.toFixed(0)}%)</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Returns Ratio</div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                    {p.returns} <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 500 }}>({p.total > 0 ? ((p.returns / p.total) * 100).toFixed(0) : 0}%)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 2. Side-by-Side Fulfillment Daily Sales Trend Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 18, marginBottom: 28 }}>
        <FulfillmentTrendCard 
          title="In-Store Daily Sales Trend" 
          color="#8b5cf6" 
          pts={storePts} 
          path={storePath} 
          area={storeArea} 
          allDays={analytics.allDays} 
          selectedMonth={selectedMonth} 
          maxVal={maxVal} 
        />
        <FulfillmentTrendCard 
          title="Delivery Daily Sales Trend" 
          color="#14b8a6" 
          pts={deliveryPts} 
          path={deliveryPath} 
          area={deliveryArea} 
          allDays={analytics.allDays} 
          selectedMonth={selectedMonth} 
          maxVal={maxVal} 
        />
      </div>

      {/* 3. Campaign Summary Insights Card */}
      <div className="card card-p-lg static" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28, boxShadow: 'none', border: '1px solid var(--border-light-color)' }}>
        <h4 style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', margin: 0, color: 'var(--purple)' }}>
          💡 Fulfillment comparison overview summary
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.78rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          <div>
            ⭐ <strong>Top Channel:</strong> The primary revenue driver this month is <strong>{higherRevSeg}</strong>, contributing <strong>AED {Math.round(higherRevSeg === "In-Store" ? storeRev : delivRev).toLocaleString()}</strong> ({analytics.segData[higherRevSeg].revShare.toFixed(1)}% of total volume).
          </div>
          <div>
            💎 <strong>Premium Purchases:</strong> <strong>{higherAovSeg}</strong> generated the highest Average Order Value (AOV) at <strong>AED {Math.round(higherAovSeg === "In-Store" ? storeAov : delivAov).toLocaleString()}</strong>, indicating buyers there target higher ticket sales.
          </div>
          <div>
            🕒 <strong>Installments & Credit Habits:</strong> Delivery transactions see <strong>{analytics.segData["Delivery"].mopPercentages.Installments}%</strong> installment checkout choice (via Tabby/Tamara) compared to <strong>{analytics.segData["In-Store"].mopPercentages.Installments}%</strong> for in-store walk-in buyers.
          </div>
        </div>
      </div>

      {/* 4. Payment Preference Matrix */}
      <div className="card static" style={{ overflow: 'hidden', boxShadow: 'none', border: '1px solid var(--border-light-color)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light-color)', background: 'rgba(0,0,0,0.01)' }}>
          <h4 style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', margin: 0 }}>
            Fulfillment Payment preferences matrix
          </h4>
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fulfillment Channel</th>
                <th style={{ textAlign: 'center' }}>💵 Cash Ratio</th>
                <th style={{ textAlign: 'center' }}>💳 Card Ratio</th>
                <th style={{ textAlign: 'center' }}>🕒 Installments (Tabby/Tamara)</th>
                <th style={{ textAlign: 'center' }}>🏦 Bank Transfer</th>
              </tr>
            </thead>
            <tbody>
              {["In-Store", "Delivery"].map(key => {
                const p = analytics.segData[key];
                return (
                  <tr key={key}>
                    <td style={{ fontWeight: 700 }}>{key}</td>
                    <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                      {p.mopPercentages.Cash}%
                    </td>
                    <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                      {p.mopPercentages.Card}%
                    </td>
                    <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--purple)', fontWeight: 700 }}>
                      {p.mopPercentages.Installments}%
                    </td>
                    <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                      {p.mopPercentages.Bank}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PANEL: STAFF ACCOUNTS
   ========================================================= */

function StaffPanel() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [selectedPerms, setSelectedPerms] = useState([]);

  const AVAILABLE_PERMISSIONS = [
    { id: 'today-bill', name: "Today's Bill" },
    { id: 'sales-history', name: "Sales History" },
    { id: 'product-db', name: "Product Database" },
    { id: 'display-pieces', name: "Display Pieces" },
    { id: 'deliveries', name: "Deliveries" },
    { id: 'warranty-claims', name: "Warranty Claims" },
    { id: 'customer-crm', name: "Customer CRM" },
    { id: 'whatsapp-catalog', name: "WhatsApp Price List" },
    { id: 'dashboard', name: "Dashboard Analytics" },
    { id: 'marketing', name: "Marketing" },
  ];

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/staff'));
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      }
    } catch (err) {
      console.error("Failed to load staff list:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenRegister = () => {
    setEditingUser(null);
    setUsername('');
    setPassword('');
    setRole('staff');
    setSelectedPerms(['today-bill', 'sales-history', 'dashboard']);
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setUsername(user.username);
    setPassword('');
    setRole(user.role);
    setSelectedPerms(user.permissions || []);
    setShowModal(true);
  };

  const handleTogglePerm = (permId) => {
    setSelectedPerms(prev => 
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!username.trim()) return alert("Username is required");
    if (!editingUser && !password.trim()) return alert("Password is required");

    const payload = {
      username: username.trim(),
      role,
      permissions: selectedPerms
    };
    if (password.trim()) {
      payload.password = password.trim();
    }

    try {
      let url = '/api/staff';
      let method = 'POST';
      
      if (editingUser) {
        url = `/api/staff/${editingUser.id}`;
        method = 'PUT';
      }

      const res = await fetch(getApiUrl(url), {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowModal(false);
        const savedData = await res.json();
        const updatedRecord = {
          id: editingUser ? editingUser.id : savedData.id,
          username: username.trim(),
          role,
          permissions: selectedPerms
        };
        if (editingUser) {
          setStaff(prev => prev.map(u => u.id === editingUser.id ? updatedRecord : u));
        } else {
          setStaff(prev => [...prev, updatedRecord].sort((a, b) => a.username.localeCompare(b.username)));
        }
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to save user account");
      }
    } catch (err) {
      console.error("Error saving user:", err);
      alert("Error contacting server.");
    }
  };

  const handleRemove = async (userId, userName) => {
    if (userName === 'admin') {
      return alert("The main system admin account cannot be removed.");
    }
    if (!window.confirm(`Are you sure you want to remove user "${userName}"?`)) {
      return;
    }

    try {
      const res = await fetch(getApiUrl(`/api/staff/${userId}`), {
        method: 'DELETE'
      });
      if (res.ok) {
        setStaff(prev => prev.filter(u => u.id !== userId));
      } else {
        alert("Failed to delete user account.");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div>
          <div className="page-title">Staff Accounts</div>
          <div className="page-subtitle">Admin users and permission roles</div>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleOpenRegister}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={14} /> Register New Staff
        </button>
      </div>

      <div className="card static">
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Username</th>
                <th>Role</th>
                <th>Permissions</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Loading user accounts...
                  </td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No staff accounts found.
                  </td>
                </tr>
              ) : (
                staff.map((s, i) => (
                  <motion.tr key={s.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{i + 1}</td>
                    <td style={{ fontWeight: 700 }}>{s.username}</td>
                    <td>
                      <span className={`badge ${s.role === 'admin' ? 'badge-purple' : 'badge-cyan'}`}>
                        {s.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {s.role === 'admin' ? (
                          <span style={{ fontSize: '0.66rem', color: 'var(--purple)', fontWeight: 800 }}>ROOT / ALL PERMISSIONS</span>
                        ) : s.permissions && s.permissions.length > 0 ? (
                          s.permissions.map(p => (
                            <span 
                              key={p} 
                              style={{ 
                                fontSize: '0.62rem', 
                                background: 'rgba(0,0,0,0.03)', 
                                padding: '2px 6px', 
                                borderRadius: 4, 
                                fontWeight: 700,
                                textTransform: 'uppercase'
                              }}
                            >
                              {p.replace('-', ' ')}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>None</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button 
                          className="btn btn-ghost" 
                          style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                          onClick={() => handleOpenEdit(s)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-pink"  
                          style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                          onClick={() => handleRemove(s.id, s.username)}
                          disabled={s.username === 'admin'}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register/Edit User Modal */}
      <AnimatePresence>
        {showModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: 16
          }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card card-p-lg"
              style={{
                width: '100%',
                maxWidth: 460,
                border: '2px solid #000',
                backgroundColor: 'var(--bg-card)',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, textTransform: 'uppercase', marginBottom: 16 }}>
                {editingUser ? 'Edit Staff Account' : 'Register New Staff'}
              </h3>
              
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Username (Email / Identifier)
                  </label>
                  <input 
                    type="text" 
                    className="field-input" 
                    required 
                    placeholder="e.g. saidali@buyology"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Password {editingUser && <span style={{ opacity: 0.5 }}>(Leave empty to keep current)</span>}
                  </label>
                  <input 
                    type="password" 
                    className="field-input" 
                    required={!editingUser}
                    placeholder="Enter password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Account Role
                  </label>
                  <select 
                    className="field-input" 
                    value={role}
                    onChange={e => setRole(e.target.value)}
                  >
                    <option value="staff">Staff (Custom Permissions)</option>
                    <option value="admin">Administrator (ROOT access)</option>
                  </select>
                </div>

                {role === 'staff' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Granular Permissions
                    </label>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: 8, 
                      padding: 12, 
                      background: 'rgba(0,0,0,0.02)', 
                      borderRadius: 6,
                      border: '1px solid var(--border-light-color)'
                    }}>
                      {AVAILABLE_PERMISSIONS.map(perm => (
                        <label 
                          key={perm.id} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 8, 
                            fontSize: '0.74rem', 
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}
                        >
                          <input 
                            type="checkbox" 
                            checked={selectedPerms.includes(perm.id)}
                            onChange={() => handleTogglePerm(perm.id)}
                          />
                          <span>{perm.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    Save Account
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-ghost" 
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   PANEL: PENDING IMPORTS (MULTIPLE PDF INVOICES)
   ========================================================= */

function PendingImportsPanel({ pendingBills, setPendingBills, productsList, setProductsList, billsList, setBillsList }) {
  const [dragActive, setDragActive] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [activePrefill, setActivePrefill] = useState(null);
  const [loading, setLoading] = useState(false);

  const scanLocalFolder = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/local-pdfs'));
      if (res.ok) {
        const filenames = await res.json();
        const existingNames = pendingBills.map(b => b.fileName);
        const newFiles = filenames.filter(name => !existingNames.includes(name));
        
        const newPending = [];
        for (const filename of newFiles) {
          try {
            const fileRes = await fetch(getApiUrl(`/api/local-pdfs/${encodeURIComponent(filename)}`));
            if (fileRes.ok) {
              const arrayBuffer = await fileRes.arrayBuffer();
              const fileObj = new File([arrayBuffer], filename, { type: "application/pdf" });
              const result = await parseInvoicePdf(fileObj, productsList, setProductsList);
              newPending.push({
                id: Date.now() + Math.random().toString(36).substr(2, 5),
                fileName: filename,
                isLocalFile: true,
                ...result
              });
            }
          } catch (err) {
            console.error("Error parsing local PDF file: " + filename, err);
          }
        }
        if (newPending.length > 0) {
          setPendingBills(prev => [...prev, ...newPending]);
        }
      }
    } catch (err) {
      console.error("Failed to scan local folder:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    scanLocalFolder();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFiles = async (files) => {
    setLoading(true);
    const newPending = [];
    for (const file of files) {
      if (file.type !== "application/pdf" && !file.name.endsWith('.pdf')) {
        continue;
      }
      try {
        const result = await parseInvoicePdf(file, productsList, setProductsList);
        newPending.push({
          id: Date.now() + Math.random().toString(36).substr(2, 5),
          fileName: file.name,
          ...result
        });
      } catch (err) {
        console.error("Error parsing pdf: ", file.name, err);
      }
    }
    if (newPending.length > 0) {
      setPendingBills(prev => [...prev, ...newPending]);
    }
    setLoading(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await processFiles(e.target.files);
    }
  };

  const handleDismiss = async (pb) => {
    setPendingBills(prev => prev.filter(b => b.id !== pb.id));
    if (pb.isLocalFile) {
      try {
        await fetch(getApiUrl(`/api/local-pdfs/${encodeURIComponent(pb.fileName)}`), {
          method: 'DELETE'
        });
      } catch (err) {
        console.error("Failed to delete local PDF:", err);
      }
    }
  };

  const handleSaveInvoice = async (newInvoice) => {
    try {
      const res = await fetch(getApiUrl('/api/bills'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvoice)
      });
      if (res.ok) {
        const respData = await res.json();
        setBillsList([{ ...newInvoice, id: respData.id }, ...billsList]);
        
        if (activePrefill) {
          setPendingBills(prev => prev.filter(b => b.id !== activePrefill.id));
          
          if (activePrefill.isLocalFile) {
            try {
              await fetch(getApiUrl(`/api/local-pdfs/${encodeURIComponent(activePrefill.fileName)}`), {
                method: 'DELETE'
              });
            } catch (err) {
              console.error("Failed to delete local PDF:", err);
            }
          }
        }
      } else {
        alert("Failed to save transaction to database.");
      }
    } catch (err) {
      console.error("Error saving bill:", err);
    }
    setShowForm(false);
    setActivePrefill(null);
  };

  // Date Filtering logic
  const filteredBills = pendingBills.filter(b => {
    if (!dateFilter) return true;
    const parts = dateFilter.split('-'); // [YYYY, MM, DD]
    if (parts.length === 3) {
      const formattedFilter = `${parts[2]}-${parts[1]}-${parts[0]}`; // DD-MM-YYYY
      return b.invoiceDate === formattedFilter;
    }
    return true;
  });

  if (showForm && activePrefill) {
    return (
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
        <div className="page-title">Process Imported Invoice</div>
        <div className="page-subtitle">File: {activePrefill.fileName}</div>
        <div className="card card-p-lg static" style={{ border: '2px solid #000' }}>
          <SalesInvoiceForm 
            onSave={handleSaveInvoice} 
            onClose={() => { setShowForm(false); setActivePrefill(null); }} 
            productsList={productsList} 
            editingBill={null}
            prefilledData={activePrefill}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="page-title">Pending Imports</div>
      <div className="page-subtitle">Batch invoice import queue — upload and verify details before logging</div>

      {/* Drag & Drop uploader area */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('multi-pdf-upload').click()}
        style={{
          border: dragActive ? '3px dashed var(--cyan)' : '2px dashed var(--border-color, #ccc)',
          backgroundColor: dragActive ? 'rgba(6, 182, 212, 0.08)' : 'rgba(0,0,0,0.02)',
          borderRadius: 8,
          padding: '40px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12
        }}
      >
        <input 
          type="file" 
          id="multi-pdf-upload" 
          accept=".pdf" 
          multiple 
          onChange={handleFileSelect} 
          style={{ display: 'none' }}
        />
        <Upload size={36} style={{ color: dragActive ? 'var(--cyan)' : 'var(--text-muted)' }} />
        <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>
          {loading ? 'Parsing PDF Invoices...' : 'Drag & Drop PDF Invoices here, or Click to Browse'}
        </div>
        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          Supports multiple PDF files selection (Invoice details will be auto-extracted)
        </span>
      </div>

      {/* Filter and purge actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase' }}>Filter Date:</span>
          <input 
            type="date" 
            className="field-input" 
            style={{ width: 150, padding: '6px 10px', fontSize: '0.8rem' }}
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          />
          {dateFilter && (
            <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: '0.8rem' }} onClick={() => setDateFilter('')}>
              Clear
            </button>
          )}
          <button 
            type="button"
            className="btn btn-ghost" 
            style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }} 
            onClick={scanLocalFolder}
          >
            <RefreshCw size={12} /> Scan Folder
          </button>
        </div>
        
        {pendingBills.length > 0 && (
          <button 
            type="button" 
            className="btn btn-pink" 
            style={{ padding: '8px 14px', fontSize: '0.78rem', fontWeight: 700 }}
            onClick={async () => {
              if (window.confirm("Are you sure you want to clear all pending imported invoices?")) {
                // Delete local files on backend
                for (const pb of pendingBills) {
                  if (pb.isLocalFile) {
                    try {
                      await fetch(getApiUrl(`/api/local-pdfs/${encodeURIComponent(pb.fileName)}`), {
                        method: 'DELETE'
                      });
                    } catch (err) {
                      console.error("Failed to delete local PDF:", err);
                    }
                  }
                }
                setPendingBills([]);
              }
            }}
          >
            Clear All ({pendingBills.length})
          </button>
        )}
      </div>

      {/* Pending bills list */}
      <div className="card static">
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Customer</th>
                <th>Invoice Date</th>
                <th>Product (DTA)</th>
                <th>Amount (incl. VAT)</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                    No pending invoices found. Drag and drop PDF files above, or save them in your invoices_pdf/ folder and click "Scan Folder"!
                  </td>
                </tr>
              ) : (
                filteredBills.map(pb => (
                  <tr key={pb.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600 }}>{pb.fileName}</td>
                    <td style={{ fontWeight: 700 }}>{pb.customerName}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{pb.invoiceDate || 'N/A'}</td>
                    <td>{pb.products[0]?.model || 'N/A'} ({pb.products[0]?.dta || 'N/A'})</td>
                    <td style={{ fontWeight: 800 }}>AED {parseFloat((pb.products[0]?.price || 0) * (pb.products[0]?.qty || 1)).toFixed(2)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '0.74rem' }}
                          onClick={() => {
                            setActivePrefill(pb);
                            setShowForm(true);
                          }}
                        >
                          Process Invoice
                        </button>
                        <button 
                          className="btn btn-ghost" 
                          style={{ padding: '6px 10px', fontSize: '0.74rem' }}
                          onClick={() => handleDismiss(pb)}
                        >
                          Dismiss
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PANEL ROUTER
   ========================================================= */

/* =========================================================
   DELIVERY APPROVALS MODAL
   ========================================================= */

function DeliveryApprovalsModal({ isOpen, onClose, pendingApprovals, onApprove, onDismiss, onDismissAll }) {
  const [filterDate, setFilterDate] = useState('');

  const filtered = useMemo(() => {
    if (!filterDate) return pendingApprovals;
    const parts = filterDate.split('-'); // [YYYY, MM, DD]
    if (parts.length !== 3) return pendingApprovals;
    const formatted = `${parts[2]}-${parts[1]}-${parts[0]}`; // DD-MM-YYYY
    return pendingApprovals.filter(d => d.date === formatted);
  }, [pendingApprovals, filterDate]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="brutal-card" 
        style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          backgroundColor: 'var(--bg-card)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '2px solid #000', paddingBottom: 12 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
            🔔 PENDING DELIVERY APPROVALS
          </h2>
          <button 
            className="btn btn-ghost" 
            style={{ padding: '6px 12px', fontSize: '0.85rem' }} 
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {/* Date Filter Row */}
        <div style={{ 
          display: 'flex', 
          gap: 12, 
          alignItems: 'center', 
          marginBottom: 16, 
          background: 'var(--bg)', 
          padding: '10px 14px', 
          border: '2px solid #000', 
          borderRadius: '4px',
          flexWrap: 'wrap'
        }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>Filter Pending by Date:</label>
          <input 
            type="date" 
            className="field-input" 
            style={{ padding: '6px 10px', fontSize: '0.82rem', width: 'auto', border: '1px solid #000' }} 
            value={filterDate} 
            onChange={e => setFilterDate(e.target.value)} 
          />
          {filterDate && (
            <button 
              className="btn btn-ghost" 
              style={{ padding: '4px 10px', fontSize: '0.74rem', background: '#fff' }} 
              onClick={() => setFilterDate('')}
            >
              Clear Filter
            </button>
          )}
          {filtered.length > 0 && (
            <button 
              className="btn btn-ghost" 
              style={{ 
                padding: '6px 12px', 
                fontSize: '0.82rem', 
                color: 'var(--pink)', 
                borderColor: 'var(--pink)',
                borderWidth: '2px',
                fontWeight: 800
              }} 
              onClick={() => onDismissAll(filtered)}
            >
              Dismiss All ({filtered.length})
            </button>
          )}
          <span style={{ fontSize: '0.8rem', marginLeft: 'auto', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            Showing: {filtered.length} of {pendingApprovals.length}
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 20 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: 12 }}>{filterDate ? '🔍' : '🎉'}</span>
              <p style={{ fontWeight: 700 }}>{filterDate ? 'No pending deliveries found for this date.' : 'No pending deliveries require approval.'}</p>
              <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: 4 }}>
                {filterDate ? 'Try clearing the filter or checking another date.' : 'All submitted staff deliveries have been processed.'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="brutal-table font-mono" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-dark)', color: 'var(--text-on-dark)' }}>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '0.74rem' }}>DATE / CUSTOMER</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '0.74rem' }}>TYPE / CARRIER</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '0.74rem' }}>ITEMS</th>
                    <th style={{ padding: '10px', textAlign: 'right', fontSize: '0.74rem' }}>AMOUNT</th>
                    <th style={{ padding: '10px', textAlign: 'center', fontSize: '0.74rem' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(d => {
                    let items = [];
                    try {
                      items = JSON.parse(d.products_json || '[]');
                    } catch(e){}

                    return (
                      <tr key={d.id} style={{ borderBottom: '1px solid var(--border-light-color)' }}>
                        <td style={{ padding: '12px 10px', fontSize: '0.8rem' }}>
                          <div style={{ fontWeight: 800 }}>{d.customer_name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                            Date: {d.date} | Phone: {d.phone || '—'}
                          </div>
                        </td>
                        <td style={{ padding: '12px 10px', fontSize: '0.8rem' }}>
                          <span className="badge" style={{ 
                            fontSize: '0.68rem', 
                            padding: '2px 6px', 
                            background: d.delivery_type === 'Exchange' ? 'rgba(139,92,246,0.1)' : (d.delivery_type === 'Warranty (Return)' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)'),
                            color: d.delivery_type === 'Exchange' ? 'var(--purple)' : (d.delivery_type === 'Warranty (Return)' ? 'var(--pink)' : 'var(--green)'),
                            border: `1px solid ${d.delivery_type === 'Exchange' ? 'rgba(139,92,246,0.2)' : (d.delivery_type === 'Warranty (Return)' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)')}`,
                            borderRadius: '4px',
                            fontWeight: 700
                          }}>
                            {d.delivery_type}
                          </span>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                            Via: {d.delivery_by}
                          </div>
                        </td>
                        <td style={{ padding: '12px 10px', fontSize: '0.78rem' }}>
                          {d.delivery_type === 'Exchange' ? (
                            <div style={{ fontSize: '0.74rem' }}>
                              <div style={{ color: 'var(--green)', fontWeight: 700 }}>➕ New: {d.exch_new_dta || d.dta_list}</div>
                              <div style={{ color: 'var(--pink)', fontWeight: 700, marginTop: 2 }}>➖ Old: {d.exch_old_dta} (Value: AED {d.exch_old_value})</div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              {items.map((it, idx) => (
                                <div key={idx}>
                                  • {it.brand} {it.model} (x{it.quantity})
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 800, fontSize: '0.85rem' }}>
                          AED {parseFloat(d.price || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                            <button 
                              className="btn btn-primary" 
                              style={{ padding: '5px 10px', fontSize: '0.74rem', background: 'var(--citrus)', color: '#000' }}
                              onClick={() => onApprove(d)}
                            >
                              Approve
                            </button>
                            <button 
                              className="btn btn-ghost" 
                              style={{ padding: '5px 10px', fontSize: '0.74rem', color: 'var(--pink)' }}
                              onClick={() => onDismiss(d)}
                            >
                              Dismiss
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function PanelRouter({ id, productsList, setProductsList, billsList, setBillsList, pendingBills, setPendingBills, onRefreshApprovals }) {
  const map = {
    'today-bill':      <TodayBillPanel billsList={billsList} setBillsList={setBillsList} productsList={productsList} setProductsList={setProductsList} />,
    'sales-history':   <SalesHistoryPanel billsList={billsList} setBillsList={setBillsList} productsList={productsList} setProductsList={setProductsList} />,
    'product-db':      <ProductDbPanel productsList={productsList} setProductsList={setProductsList} />,
    'display-pieces':  <DisplayPiecesPanel />,
    'deliveries':      <DeliveriesPanel productsList={productsList} onRefreshApprovals={onRefreshApprovals} />,
    'warranty-claims': <WarrantyPanel productsList={productsList} />,
    'customer-crm':    <CustomerCrmPanel />,
    'whatsapp-catalog':<WhatsAppCatalogPanel productsList={productsList} />,
    'inventory-center':<InventoryPanel />,
    'dashboard':       <AnalyticsDashPanel billsList={billsList} />,
    'mkt-platforms':   <MktPlatformsPanel billsList={billsList} />,
    'mkt-purchase':    <MktPurchasePanel billsList={billsList} />,
    'staff-accounts':  <StaffPanel />
  };
  return map[id] || <AnalyticsDashPanel billsList={billsList} />;
}

/* =========================================================
   TICKER DATA
   ========================================================= */

const TICKER_ITEMS = [
  { label: 'SALES TODAY', val: 'AED 4,280', pos: true },
  { label: 'ACTIVE SESSIONS', val: '34', pos: true },
  { label: 'CONVERSION', val: '14.28%', pos: true },
  { label: 'BOUNCE RATE', val: '42.1%', pos: false },
  { label: 'AVG ORDER', val: 'AED 428', pos: true },
  { label: 'PENDING ORDERS', val: '7', pos: false },
  { label: 'ACTIVE CARTS', val: '19', pos: true },
];

/* =========================================================
   MAIN DASHBOARD COMPONENT
   ========================================================= */

export default function Dashboard({ user, onLogout, isStrapiOnline, onChangeTheme, currentTheme, onChangeUiStyle, currentUiStyle }) {
  const [isMobileSize, setIsMobileSize] = useState(() => {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileSize(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [active, setActive] = useState(() => {
    return localStorage.getItem('activePanel') || 'dashboard';
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  const handleSelectPanel = (panelId) => {
    setActive(panelId);
    localStorage.setItem('activePanel', panelId);
  };

  // Lifted up productsList state
  const [productsList, setProductsList] = useState(() => {
    return productsSeed.map(p => {
      const skuDigits = String(p.dta || '').replace(/\D/g, '');
      const simulatedQty = skuDigits ? (parseInt(skuDigits, 10) % 80 + 3) : 15;
      return {
        code: p.dta,
        name: p.model,
        brand: p.brand,
        qty: simulatedQty,
        price: p.price || 1200
      };
    });
  });

  // Lifted up billsList state — start empty, real data fetched from Flask API immediately.
  // billsSeed kept as emergency offline fallback only if API call fails on first load.
  const [billsList, setBillsList] = useState(billsSeed);

  const [pendingBills, setPendingBills] = useState(() => {
    try {
      const saved = localStorage.getItem('pending_imported_bills');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('pending_imported_bills', JSON.stringify(pendingBills));
  }, [pendingBills]);

  // Top-level deliveries state for approvals list
  const [allDeliveries, setAllDeliveries] = useState([]);
  const [showApprovalsModal, setShowApprovalsModal] = useState(false);

  const pendingApprovals = useMemo(() => {
    return allDeliveries.filter(d => 
      d.status !== 'Cancelled' && 
      (!d.bill_id || d.bill_id === 0 || d.bill_id === '0' || d.bill_id === '')
    );
  }, [allDeliveries]);

  const loadAllDeliveries = useCallback(async () => {
    try {
      const res = await fetch(getApiUrl('/api/deliveries'));
      if (res.ok) {
        const data = await res.json();
        setAllDeliveries(data);
      }
    } catch (e) {
      console.error('Failed to load all deliveries:', e);
    }
  }, []);

  useEffect(() => {
    loadAllDeliveries();
    const interval = setInterval(loadAllDeliveries, 5000);
    return () => clearInterval(interval);
  }, [loadAllDeliveries]);

  const handleApproveDelivery = async (delivery) => {
    let billPayload = {
      date: delivery.date,
      customer_name: delivery.customer_name,
      price: parseFloat(delivery.price) || 0,
      payment_mode: delivery.payment_mode || 'Cash',
      note: `Approved Delivery #${delivery.id}${delivery.note ? ' - ' + delivery.note : ''}`,
      delivery: 1,
      jenny: delivery.jenny ? 1 : 0
    };

    if (delivery.delivery_type === 'Exchange') {
      billPayload.transaction_type = 'Exchange';
      billPayload.exch_old_dta = delivery.exch_old_dta || '';
      billPayload.exch_old_desc = delivery.exch_old_desc || '';
      billPayload.exch_old_value = parseFloat(delivery.exch_old_value) || 0;
      billPayload.exch_balance = parseFloat(delivery.price) || 0;
      billPayload.exch_old_price = parseFloat(delivery.exch_old_value) || 0;

      try {
        const pList = JSON.parse(delivery.products_json || '[]');
        if (pList.length > 0) {
          billPayload.exch_new_brand = pList[0].brand || '';
          billPayload.exch_new_model = pList[0].model || '';
          billPayload.exch_new_dta = pList[0].dta || '';
          billPayload.exch_new_price = parseFloat(pList[0].price) || 0;
          billPayload.price = parseFloat(pList[0].price) || 0;
        }
      } catch (e) {
        console.error('Failed to parse products_json for exchange:', e);
      }
    } else if (delivery.delivery_type === 'Warranty (Return)') {
      billPayload.transaction_type = 'Return';
      billPayload.products_json = delivery.products_json;
      try {
        const pList = JSON.parse(delivery.products_json || '[]');
        if (pList.length > 0) {
          billPayload.brand = pList[0].brand || '';
          billPayload.model = pList[0].model || '';
          billPayload.dta = pList[0].dta || '';
        }
      } catch (e) {}
    } else {
      billPayload.transaction_type = 'Sale';
      billPayload.products_json = delivery.products_json;
      try {
        const pList = JSON.parse(delivery.products_json || '[]');
        if (pList.length > 0) {
          billPayload.brand = pList[0].brand || '';
          billPayload.model = pList[0].model || '';
          billPayload.dta = pList[0].dta || '';
        }
      } catch (e) {}
    }

    try {
      const billRes = await fetch(getApiUrl('/api/bills'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billPayload)
      });

      if (billRes.ok) {
        const savedBill = await billRes.json();
        const newBillId = savedBill.id;

        const updatedDelivery = {
          ...delivery,
          bill_id: newBillId,
          status: 'Delivered'
        };

        const deliveryRes = await fetch(getApiUrl(`/api/deliveries/${delivery.id}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedDelivery)
        });

        if (deliveryRes.ok) {
          alert('Delivery successfully approved and recorded as a bill!');
          loadAllDeliveries();
          fetchLatestBills();
        } else {
          alert('Bill was created, but updating delivery status failed.');
        }
      } else {
        alert('Failed to save bill.');
      }
    } catch (err) {
      console.error('Error approving delivery:', err);
      alert('Network error while approving delivery.');
    }
  };

  const handleDismissDelivery = async (delivery) => {
    if (!window.confirm('Are you sure you want to dismiss this delivery? It will remain in the database but will not be recorded as a bill.')) return;
    
    const updatedDelivery = {
      ...delivery,
      bill_id: -1
    };

    try {
      const res = await fetch(getApiUrl(`/api/deliveries/${delivery.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDelivery)
      });

      if (res.ok) {
        alert('Delivery dismissed successfully.');
        loadAllDeliveries();
      } else {
        alert('Failed to dismiss delivery.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to the server. Failed to dismiss delivery.');
    }
  };

  const handleDismissAllDeliveries = async (deliveriesToDismiss) => {
    if (deliveriesToDismiss.length === 0) return;
    const confirmMessage = `Are you sure you want to dismiss all ${deliveriesToDismiss.length} filtered pending deliveries? They will remain in the database but will not be recorded as bills.`;
    if (!window.confirm(confirmMessage)) return;

    try {
      const promises = deliveriesToDismiss.map(d => {
        const updatedDelivery = {
          ...d,
          bill_id: -1
        };
        return fetch(getApiUrl(`/api/deliveries/${d.id}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedDelivery)
        });
      });

      const results = await Promise.all(promises);
      const failures = results.filter(res => !res.ok);
      
      if (failures.length > 0) {
        alert(`Failed to dismiss ${failures.length} delivery records.`);
      } else {
        alert('Successfully dismissed all selected deliveries.');
      }
      loadAllDeliveries();
    } catch (err) {
      console.error('Error dismissing all deliveries:', err);
      alert('An error occurred while dismissing deliveries.');
    }
  };

  // Dynamic real-time sqlite polling sync (without refresh)
  const fetchLatestBills = useCallback(async () => {
    try {
      const res = await fetch(getApiUrl('/api/bills?all=true'));
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setBillsList(data);
        }
      }
    } catch (err) {
      console.log('Skipping real-time database sync (backend offline):', err);
    }
  }, []);

  const fetchLatestProducts = useCallback(async () => {
    try {
      const res = await fetch(getApiUrl('/api/products'));
      if (res.ok) {
        const data = await res.json();
        
        // Map database products
        const dbMapped = (data || []).map(p => {
          const skuDigits = String(p.dta || '').replace(/\D/g, '');
          const simulatedQty = skuDigits ? (parseInt(skuDigits, 10) % 80 + 3) : 15;
          return {
            code: p.dta,
            name: p.model,
            brand: p.brand,
            qty: simulatedQty,
            price: p.price || 1200
          };
        });

        // Set of database product codes
        const dbCodes = new Set(dbMapped.map(p => String(p.code || '').toUpperCase()));

        // Map seed products
        const seedMapped = productsSeed.map(p => {
          const skuDigits = String(p.dta || '').replace(/\D/g, '');
          const simulatedQty = skuDigits ? (parseInt(skuDigits, 10) % 80 + 3) : 15;
          return {
            code: p.dta,
            name: p.model,
            brand: p.brand,
            qty: simulatedQty,
            price: p.price || 1200
          };
        });

        // Filter out seeds that already exist in DB
        const extraSeeds = seedMapped.filter(p => !dbCodes.has(String(p.code || '').toUpperCase()));

        // Combine them
        setProductsList([...dbMapped, ...extraSeeds]);
      }
    } catch (err) {
      // fail silently
    }
  }, []);

  useEffect(() => {
    fetchLatestBills();
    fetchLatestProducts();

    const intervalBills = setInterval(fetchLatestBills, 3000);
    const intervalProducts = setInterval(fetchLatestProducts, 10000);

    return () => {
      clearInterval(intervalBills);
      clearInterval(intervalProducts);
    };
  }, [fetchLatestBills, fetchLatestProducts]);

  const getBreadcrumb = () => {
    const all = NAV.flatMap(s => s.items.flatMap(i => i.sub ? i.sub : [i]));
    const found = all.find(i => i.id === active);
    return found?.label || 'Dashboard';
  };

  return (
    <div className={`app-layout ${isSidebarHovered || isMobileMenuOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      <Sidebar 
        active={active} 
        onSelect={handleSelectPanel} 
        onLogout={onLogout} 
        isStrapiOnline={isStrapiOnline} 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        pendingBills={pendingBills} 
        isHovered={isSidebarHovered}
        onHoverChange={setIsSidebarHovered}
      />

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: '#000',
              zIndex: 99,
              cursor: 'pointer'
            }}
          />
        )}
      </AnimatePresence>

      <div className="main-content">
        {/* Ticker */}
        <div className="ticker">
          <div className="ticker-inner">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
              <span className="ticker-item" key={i}>
                <span style={{ opacity: 0.45 }}>{t.label}</span>
                <span className={t.pos ? 'val pos' : 'val neg'}>{t.val}</span>
                <span style={{ opacity: 0.2, margin: '0 4px' }}>|</span>
              </span>
            ))}
          </div>
        </div>

        {/* Top Header */}
        <header className="top-header" style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Hamburger Button on Mobile */}
            <button
              className="mobile-hamburger-btn"
              onClick={() => setIsMobileMenuOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                padding: 4,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Menu size={20} />
            </button>

            <div className="header-breadcrumb">
              Analytics <ChevronRight size={12} style={{ display: 'inline', marginBottom: -2 }} />
              <span> {getBreadcrumb()}</span>
            </div>
          </div>

          <div className="header-actions">
            <button 
              className="btn btn-ghost hide-mobile" 
              style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }} 
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={12} /> Sync SQLite
            </button>
            <div className="status-pill hide-mobile">
              <span className={`status-dot ${isStrapiOnline ? 'online' : 'offline'}`} />
              {isStrapiOnline ? 'Strapi Live' : 'Sandbox Mode'}
            </div>
            {user && !isMobileSize && (
              <button 
                className="btn btn-ghost" 
                style={{ 
                  position: 'relative', 
                  padding: '8px', 
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: pendingApprovals.length > 0 ? 'rgba(249, 115, 22, 0.08)' : 'transparent',
                  border: pendingApprovals.length > 0 ? '1px solid rgba(249, 115, 22, 0.25)' : '1px solid transparent',
                  cursor: 'pointer'
                }} 
                onClick={() => setShowApprovalsModal(true)}
                title="Pending Approvals"
              >
                <Bell size={18} style={{ color: pendingApprovals.length > 0 ? 'var(--orange)' : 'inherit' }} />
                {pendingApprovals.length > 0 && (
                  <span 
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: 'var(--orange, #f97316)',
                      color: '#ffffff',
                      fontSize: '0.62rem',
                      fontWeight: 900,
                      minWidth: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--bg-card)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      padding: '0 2px'
                    }}
                  >
                    {pendingApprovals.length}
                  </span>
                )}
              </button>
            )}
            <UserProfileDropdown 
              user={user} 
              onLogout={onLogout} 
              isStrapiOnline={isStrapiOnline} 
              onChangeTheme={onChangeTheme} 
              currentTheme={currentTheme} 
            />
            <div className="hide-mobile">
              <UIThemeSelector currentTheme={currentTheme} onChangeTheme={onChangeTheme} />
            </div>
            <button 
              className="theme-btn hide-mobile" 
              onClick={() => {
                const STYLES = ['neo-brutalist', 'saas-clean', 'liquid-glass'];
                const nextIdx = (STYLES.indexOf(currentUiStyle) + 1) % STYLES.length;
                onChangeUiStyle(STYLES[nextIdx]);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 12px',
                fontWeight: 800,
                textTransform: 'uppercase'
              }}
            >
              <LayoutDashboard size={13} />
              <span>UX Style: {
                currentUiStyle === 'neo-brutalist' ? 'Neo-Brutalist' : 
                currentUiStyle === 'saas-clean' ? 'Clean SaaS' : 'Liquid Glass'
              }</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-body">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <PanelRouter 
                id={active} 
                productsList={productsList} 
                setProductsList={setProductsList} 
                billsList={billsList}
                setBillsList={setBillsList}
                pendingBills={pendingBills}
                setPendingBills={setPendingBills}
                onRefreshApprovals={loadAllDeliveries}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showApprovalsModal && (
          <DeliveryApprovalsModal 
            isOpen={showApprovalsModal}
            onClose={() => setShowApprovalsModal(false)}
            pendingApprovals={pendingApprovals}
            onApprove={handleApproveDelivery}
            onDismiss={handleDismissDelivery}
            onDismissAll={handleDismissAllDeliveries}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

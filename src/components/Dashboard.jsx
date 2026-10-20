import React, { useState, useEffect } from 'react';
import { Laptop, Sparkles } from 'lucide-react';
import WhatsAppCatalogPanel from './WhatsAppCatalogPanel';

export default function Dashboard() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [activeMarket, setActiveMarket] = useState(() => {
    try {
      return localStorage.getItem('buyology_active_market') || 'AE';
    } catch {
      return 'AE';
    }
  });

  const handleMarketChange = (newMarket) => {
    setActiveMarket(newMarket);
    try {
      localStorage.setItem('buyology_active_market', newMarket);
    } catch {}
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-primary)', width: '100%', maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
      {/* Streamlined Pixelvine White Header */}
      <header style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        padding: isMobile ? '10px 14px' : '14px 32px',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 4px rgba(15, 23, 42, 0.04)',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: isMobile ? 36 : 42,
            height: isMobile ? 36 : 42,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #311b92 0%, #4a148c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(49, 27, 146, 0.25)',
            flexShrink: 0
          }}>
            <Laptop size={isMobile ? 18 : 22} color="#ffffff" strokeWidth={2} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: isMobile ? '1.05rem' : '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
                BUYOLOGY
              </h1>
              <span style={{
                background: '#fef3c7',
                color: '#b45309',
                fontSize: '0.62rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '9999px',
                border: '1px solid #fde68a',
                letterSpacing: '0.04em'
              }}>
                PRO CATALOG
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500, marginTop: 1 }}>
              Laptop Stock & Direct WhatsApp Quotes
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Market Switcher: UAE (AED) / Oman (OMR) */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#f1f5f9',
            padding: '3px',
            borderRadius: '9999px',
            border: '1px solid #e2e8f0',
            gap: 2
          }}>
            <button
              onClick={() => handleMarketChange('AE')}
              style={{
                padding: isMobile ? '4px 8px' : '5px 12px',
                fontSize: isMobile ? '0.68rem' : '0.74rem',
                fontWeight: 800,
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                background: activeMarket === 'AE' ? '#311b92' : 'transparent',
                color: activeMarket === 'AE' ? '#ffffff' : '#64748b',
                boxShadow: activeMarket === 'AE' ? '0 2px 6px rgba(49, 27, 146, 0.25)' : 'none',
                transition: 'all 0.15s ease'
              }}
              title="UAE Market (AED)"
            >
              🇦🇪 UAE (AED)
            </button>
            <button
              onClick={() => handleMarketChange('OM')}
              style={{
                padding: isMobile ? '4px 8px' : '5px 12px',
                fontSize: isMobile ? '0.68rem' : '0.74rem',
                fontWeight: 800,
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                background: activeMarket === 'OM' ? '#047857' : 'transparent',
                color: activeMarket === 'OM' ? '#ffffff' : '#64748b',
                boxShadow: activeMarket === 'OM' ? '0 2px 6px rgba(4, 120, 87, 0.25)' : 'none',
                transition: 'all 0.15s ease'
              }}
              title="Oman Market (OMR)"
            >
              🇴🇲 Oman (OMR)
            </button>
          </div>

          {!isMobile && (
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              background: '#f3e8ff',
              color: '#311b92',
              padding: '6px 14px',
              borderRadius: '9999px',
              border: '1px solid #ddd6fe',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}>
              <Sparkles size={13} color="#fbbf24" fill="#fbbf24" /> WHATSAPP STOCK MATCHER
            </span>
          )}
        </div>
      </header>

      {/* Main WhatsApp Application */}
      <main style={{ padding: isMobile ? '10px 8px 75px 8px' : '20px 24px', maxWidth: '1600px', margin: '0 auto', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
        <WhatsAppCatalogPanel activeMarket={activeMarket} onMarketChange={handleMarketChange} />
      </main>
    </div>
  );
}

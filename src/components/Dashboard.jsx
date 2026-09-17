import React, { useState, useEffect } from 'react';
import WhatsAppCatalogPanel from './WhatsAppCatalogPanel';

export default function Dashboard() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-primary)', maxWidth: '100vw', overflowX: 'hidden' }}>
      {/* Streamlined App Header */}
      <header style={{
        display: 'flex',
        flexDirection: isMobile ? 'row' : 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        padding: isMobile ? '10px 14px' : '14px 24px',
        background: 'var(--bg-card)',
        borderBottom: '2px solid #000',
        boxShadow: 'var(--shadow-flat-sm)',
        maxWidth: '100vw',
        overflowX: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }}>💻</span>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? '0.95rem' : '1.15rem', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>
              BUYOLOGY CATALOG
            </h1>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              Laptop Stock & Quotes
            </div>
          </div>
        </div>

        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: 900, 
              fontFamily: 'var(--font-mono)',
              background: 'var(--citrus)',
              color: '#000',
              padding: '5px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '2px solid #000'
            }}>
              ⚡ WHATSAPP ONLY MODE
            </span>
          </div>
        )}
      </header>

      {/* Main WhatsApp Application */}
      <main style={{ padding: isMobile ? '8px 4px 60px 4px' : '16px', maxWidth: '1600px', margin: '0 auto', width: '100%', overflowX: 'hidden' }}>
        <WhatsAppCatalogPanel />
      </main>
    </div>
  );
}

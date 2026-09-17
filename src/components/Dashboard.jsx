import React, { useState, useEffect } from 'react';
import { Laptop, Sparkles } from 'lucide-react';
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
      {/* Streamlined Pixelvine White Header */}
      <header style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        padding: isMobile ? '12px 16px' : '14px 32px',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 4px rgba(15, 23, 42, 0.04)',
        maxWidth: '100vw',
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

        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
          </div>
        )}
      </header>

      {/* Main WhatsApp Application */}
      <main style={{ padding: isMobile ? '12px 8px 70px 8px' : '20px 24px', maxWidth: '1600px', margin: '0 auto', width: '100%', overflowX: 'hidden' }}>
        <WhatsAppCatalogPanel />
      </main>
    </div>
  );
}

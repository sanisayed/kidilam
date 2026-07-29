import React, { useState } from 'react';
import productsSeed from '../services/products_seed.json';
import WhatsAppCatalogPanel from './WhatsAppCatalogPanel';

export default function Dashboard({ user, onLogout, isStrapiOnline, onChangeTheme, currentTheme }) {
  // Products list loaded from products_seed
  const [productsList] = useState(() => {
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      {/* Streamlined App Header */}
      <header style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        padding: '14px 24px',
        background: 'var(--bg-card)',
        borderBottom: '2px solid #000',
        boxShadow: 'var(--shadow-flat-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '1.5rem' }}>💻</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>
              BUYOLOGY WHATSAPP CATALOG
            </h1>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              Multi-Photo Laptop Catalog & Instant Quote Generator
            </div>
          </div>
        </div>

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
      </header>

      {/* Main WhatsApp Application */}
      <main style={{ padding: '16px', maxWidth: '1600px', margin: '0 auto' }}>
        <WhatsAppCatalogPanel productsList={productsList} />
      </main>
    </div>
  );
}

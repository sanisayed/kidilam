import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Copy, Check, Filter, Trash2, Edit3, X, FileUp, Sparkles, Share2, Layers, Cpu, Monitor, Zap, CheckCircle2, MessageSquare, Briefcase, ChevronDown
} from 'lucide-react';

/* =========================================================
   OPTIONAL SAMPLE TEMPLATE FOR REFERENCE
   ========================================================= */

const EXAMPLE_TEMPLATE = `*PRODUCT LIST*
*21- 07- 2026 - Updated*

*DELL SERIES*

*💻 Dell Latitude 5310*
  Processor – Intel core i5 10 th Generation
  RAM – 8 GB 
  Storage – 256 GB SSD
  Display – 14 Inch 
  OS – Windows 11 pro
  Charger.
Price@~999/-AED~
*Offer Price @699/- AED* 💰

*💻 Dell Latitude 5310 2 IN 1*
  Processor – Intel Core i7-10th
  RAM – 16GB
  Storage – 512 GB SSD
  Display – 13.3 Inch , Touch
  OS – Windows 11 pro
  Charger.
@~1499/- Aed~
*Offer price @1299/- AED* 💰

*💻 DELL PRECISION 7670* 
Processor – Intel Core i7 12850HX 16-CORE
RAM – 32GB RAM DDR5
Storage – 512GB SSD
GPU- Intel iris XE
Graphics - 12 GB RTX A3000
Display – 16 Inch FHD+ 8K SUPPORT
OS – Windows 11 pro
 @~6999 AED~/- 
 *Offer Price @3999/- AED💰*

*HP SERIES*

💻 *HP EliteBook 840 G8*
  Processor – Intel core i5-11 th
  RAM – 16GB
  Storage – 512GB SSD
  Display – 14 Inch
  GPU- intel iris XE
  OS – Windows 11 pro
  Charger.
Offer Price @1399/- AED💰`;

/* =========================================================
   TEXT PARSER UTILITIES
   ========================================================= */

function parseWhatsAppCatalog(rawText) {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/);
  const products = [];
  
  let currentGroup = 'GENERAL CATALOG';
  let currentBlock = [];

  const finalizeBlock = (blockLines) => {
    if (blockLines.length === 0) return;
    const fullBlockText = blockLines.join('\n').trim();
    if (!fullBlockText) return;

    let titleLine = blockLines.find(l => l.includes('💻')) || blockLines[0];
    let cleanTitle = titleLine
      .replace(/[*💻•]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    let processor = '';
    let gen = '';
    let ram = 0;
    let storage = 0;
    let display = '';
    let isTouch = false;
    let is2in1 = false;
    let gpuParts = [];
    let gpuVram = 0;
    let os = '';
    let originalPrice = '';
    let offerPrice = 0;

    blockLines.forEach(l => {
      const lower = l.toLowerCase();

      // Processor
      if (lower.includes('processor') || lower.includes('cpu') || lower.includes('intel') || lower.includes('ultra') || lower.includes('ryzen') || lower.includes('apple') || lower.includes('i9') || lower.includes('i7') || lower.includes('i5') || lower.includes('i3')) {
        processor = l.replace(/^[^–:-]*[–:-]/, '').replace(/\*/g, '').trim();
      }

      // Generation extraction (e.g. 4th, 6th, 8th, 10th, 11th, 12th, 13th Gen)
      if (lower.includes('generation') || lower.includes('th') || lower.includes('gen') || /i[3579]-\d+/.test(lower)) {
        const m = l.match(/(\d+)\s*(th|st|nd|rd)?\s*(gen|generation)?/i) || l.match(/i[3579]-(\d+)/i);
        if (m && parseInt(m[1]) < 20) {
          gen = `${m[1]}th Gen`;
        }
      }

      // RAM
      if (lower.includes('ram')) {
        const rMatch = l.match(/(\d+)\s*gb/i);
        if (rMatch) ram = parseInt(rMatch[1], 10);
      }

      // Storage
      if (lower.includes('storage') || lower.includes('ssd') || lower.includes('hdd')) {
        const sMatch = l.match(/(\d+)\s*(gb|tb)/i);
        if (sMatch) {
          let num = parseInt(sMatch[1], 10);
          if (sMatch[2].toLowerCase() === 'tb') num *= 1024;
          storage = num;
        }
      }

      // Display
      if (lower.includes('display') || lower.includes('inch') || lower.includes('screen')) {
        display = l.replace(/^[^–:-]*[–:-]/, '').replace(/\*/g, '').trim();
      }

      // Touch & 2in1
      if (lower.includes('touch') || lower.includes('x360') || lower.includes('2in1') || lower.includes('2 in 1')) {
        isTouch = true;
      }
      if (lower.includes('2in1') || lower.includes('2 in 1') || lower.includes('x360')) {
        is2in1 = true;
      }

      // GPU / Graphics parsing
      const isGpuLine = lower.includes('gpu') || lower.includes('graphics') || lower.includes('rtx') || lower.includes('radeon') || lower.includes('nvidia') || lower.includes('geforce') || /\d+\s*gb\s*(graphics|rtx|gtx|gpu)/i.test(lower);
      
      if (isGpuLine) {
        const cleanGpuVal = l.replace(/^[^–:-]*[–:-]/, '').replace(/\*/g, '').trim();
        if (cleanGpuVal && !gpuParts.includes(cleanGpuVal)) {
          gpuParts.push(cleanGpuVal);
        }

        const vramMatch = l.match(/(\d+)\s*gb/i);
        if (vramMatch) {
          const vVal = parseInt(vramMatch[1], 10);
          if (vVal > gpuVram && vVal <= 24) {
            gpuVram = vVal;
          }
        }
      }

      // OS
      if (lower.includes('os') || lower.includes('windows') || lower.includes('mac')) {
        os = l.replace(/^[^–:-]*[–:-]/, '').replace(/\*/g, '').trim();
      }

      // Original Price
      if (l.includes('~') || (lower.includes('price@') && !lower.includes('offer'))) {
        const origMatch = l.match(/@?~?\s*(?:AED\s*)?(\d+)\/?-?\s*(?:AED)?~?/i);
        if (origMatch) {
          originalPrice = origMatch[1];
        }
      }

      // Offer Price
      if (lower.includes('offer price') || lower.includes('offerprice') || lower.includes('@') || lower.includes('price@')) {
        const pMatch = l.match(/@?\s*(\d+)\s*\/?-?\s*AED/i) || l.match(/(\d+)\/-\s*AED/i) || l.match(/(\d+)\s*AED/i);
        if (pMatch) {
          const val = parseInt(pMatch[1], 10);
          if (val > 50) offerPrice = val;
        }
      }
    });

    const fullGpuText = gpuParts.join(' / ');
    const fullGpuLower = fullGpuText.toLowerCase();

    // Dedicated GPU hardware flag (vram >= 2GB or RTX/NVIDIA/Radeon/GTX/A3000)
    const isDedicatedGpu = gpuVram >= 2 || /rtx|gtx|nvidia|radeon|geforce|a3000|a2000|t500|t600|\b\d+\s*gb\b/i.test(fullGpuLower);
    const isIrisXe = fullGpuLower.includes('iris');

    // Laptop Category Classification (Workstation, Business, Executive, Convertible)
    let category = 'BUSINESS';
    const textLower = (cleanTitle + ' ' + fullBlockText).toLowerCase();
    if (textLower.includes('precision') || textLower.includes('zbook') || textLower.includes('p14 s') || textLower.includes('p14s') || textLower.includes('thinkpad p') || textLower.includes('workstation') || textLower.includes('rtx') || textLower.includes('a3000')) {
      category = 'WORKSTATION';
    } else if (textLower.includes('spectre') || textLower.includes('envy') || textLower.includes('x1 carbon') || textLower.includes('macbook') || textLower.includes('surface')) {
      category = 'EXECUTIVE';
    } else if (is2in1 || isTouch) {
      category = 'CONVERTIBLE';
    } else if (textLower.includes('latitude') || textLower.includes('elitebook') || textLower.includes('thinkpad t') || textLower.includes('thinkpad l') || textLower.includes('vostro') || textLower.includes('probook')) {
      category = 'BUSINESS';
    }

    let brand = 'OTHER';
    const titleUpper = cleanTitle.toUpperCase();
    if (titleUpper.includes('DELL')) brand = 'DELL';
    else if (titleUpper.includes('HP') || titleUpper.includes('SPECTRE') || titleUpper.includes('ENVY') || titleUpper.includes('ZBOOK')) brand = 'HP';
    else if (titleUpper.includes('LENOVO') || titleUpper.includes('THINKPAD') || titleUpper.includes('IDEAPAD')) brand = 'LENOVO';
    else if (titleUpper.includes('MICROSOFT') || titleUpper.includes('SURFACE')) brand = 'SURFACE';
    else if (titleUpper.includes('MACBOOK') || titleUpper.includes('APPLE')) brand = 'MACBOOK';

    const stableId = 'prod_' + cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');

    products.push({
      id: stableId,
      rawText: fullBlockText,
      title: cleanTitle,
      brand,
      category,
      group: currentGroup,
      processor: processor || 'Intel Processor',
      gen,
      ram: ram || 8,
      storage: storage || 256,
      display: display || '14 Inch',
      isTouch,
      is2in1,
      gpu: fullGpuText,
      gpuVram,
      isDedicatedGpu,
      isIrisXe,
      hasAnyGpu: gpuParts.length > 0,
      os: os || 'Windows 11 Pro',
      originalPrice,
      offerPrice: offerPrice || 999
    });
  };

  const isNewProductStartLine = (l) => {
    if (l.includes('💻')) return true;
    const lower = l.toLowerCase().replace(/[*•]/g, '').trim();
    if (/^\*?(dell|hp|lenovo|microsoft|surface|macbook|thinkpad|latitude|precision|vostro|elitebook|zbook|spectre|envy|ideapad)\b/i.test(lower)) {
      if (!lower.includes('series') && !lower.includes('models') && !lower.includes('list')) {
        return true;
      }
    }
    return false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('*') && line.endsWith('*') && (line.includes('SERIES') || line.includes('MODELS') || line.includes('MACBOOK'))) {
      if (currentBlock.length > 0) {
        finalizeBlock(currentBlock);
        currentBlock = [];
      }
      currentGroup = line.replace(/\*/g, '').trim();
      continue;
    }

    if (isNewProductStartLine(line)) {
      if (currentBlock.length > 0) {
        finalizeBlock(currentBlock);
        currentBlock = [];
      }
      currentBlock.push(line);
    } else if (currentBlock.length > 0) {
      currentBlock.push(line);
    }
  }

  if (currentBlock.length > 0) {
    finalizeBlock(currentBlock);
  }

  return products;
}

/* =========================================================
   FULL-WIDTH EXECUTIVE WHATSAPP CATALOG PANEL
   ========================================================= */

function convertProductsListToText(productsList) {
  if (!productsList || productsList.length === 0) return EXAMPLE_TEMPLATE;

  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  const validProds = productsList.filter(p => p && (p.model || p.name || p.title));
  if (validProds.length === 0) return EXAMPLE_TEMPLATE;

  const brandGroups = {};
  validProds.forEach(p => {
    const brand = (p.brand || 'GENERAL').trim().toUpperCase();
    if (!brandGroups[brand]) brandGroups[brand] = [];
    brandGroups[brand].push(p);
  });

  let result = `*BUYOLOGY LIVE STOCK CATALOG*\n*${todayStr} - Live Updated*\n\n`;
  const sortedBrands = Object.keys(brandGroups).sort();
  
  sortedBrands.forEach(brand => {
    result += `*${brand} SERIES*\n\n`;
    brandGroups[brand].slice(0, 50).forEach(item => {
      const model = item.model || item.name || item.title || 'Laptop';
      const parts = model.split('|').map(s => s.trim());
      const title = parts[0] || model;
      const price = item.price && parseFloat(item.price) > 0 ? Math.round(parseFloat(item.price)) : 999;
      const origPrice = Math.round(price * 1.35);

      result += `💻 *${title}*\n`;
      parts.slice(1).forEach(pt => {
        result += `  ${pt}\n`;
      });
      result += `  Charger included.\n`;
      result += `Price@~${origPrice}/-AED~\n`;
      result += `*Offer Price @${price}/- AED* 💰\n\n`;
    });
  });

  return result.trim();
}

export default function WhatsAppCatalogPanel({ productsList = [] }) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [rawText, setRawText] = useState(() => {
    const cached = localStorage.getItem('whatsapp_catalog_raw_text');
    if (cached && cached.trim().length > 0) return cached;
    return EXAMPLE_TEMPLATE;
  });

  // Fetch shared catalog text from database on mount so mobile and laptop stay 100% in sync
  useEffect(() => {
    fetch('/api/whatsapp-catalog-text')
      .then(res => res.json())
      .then(data => {
        if (data && data.raw_text && data.raw_text.trim().length > 0) {
          setRawText(data.raw_text);
          localStorage.setItem('whatsapp_catalog_raw_text', data.raw_text);
        }
      })
      .catch(() => {});
  }, []);

  const updateAndSaveRawText = (newText) => {
    setRawText(newText);
    localStorage.setItem('whatsapp_catalog_raw_text', newText);
    fetch('/api/whatsapp-catalog-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_text: newText })
    }).catch(() => {});
  };

  const products = useMemo(() => parseWhatsAppCatalog(rawText), [rawText]);

  // Clean Dropdown Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL'); // 'ALL' | 'WORKSTATION' | 'BUSINESS' | 'EXECUTIVE' | 'CONVERTIBLE'
  const [selectedBudget, setSelectedBudget] = useState('ALL');   // 'ALL' | '1000' | '1500' | '2000' | '2500' | '3000+'
  const [selectedBrand, setSelectedBrand] = useState('ALL');     // 'ALL' | 'DELL' | 'HP' | 'LENOVO' | 'SURFACE' | 'MACBOOK'
  const [selectedCpu, setSelectedCpu] = useState('ALL');       // 'ALL' | 'i5' | 'i7' | 'i9' | 'Ultra 7'
  const [selectedGen, setSelectedGen] = useState('ALL');       // 'ALL' | '8' | '10' | '11' | '12' | '13'
  const [selectedRam, setSelectedRam] = useState('ALL');       // 'ALL' | '8' | '16' | '32'
  const [selectedStorage, setSelectedStorage] = useState('ALL'); // 'ALL' | '256' | '512' | '1024'
  const [selectedGpu, setSelectedGpu] = useState('ALL');       // 'ALL' | 'dedicated' | '2gb' | '4gb' | '12gb' | 'iris'
  const [selectedFeature, setSelectedFeature] = useState('ALL'); // 'ALL' | 'touch' | '2in1' | 'large'
  const [showLivePreview, setShowLivePreview] = useState(true);

  // Copy Feedback State
  const [copiedId, setCopiedId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editorInput, setEditorInput] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // Filter products cleanly
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const fullText = `${p.title} ${p.processor} ${p.gen} ${p.ram}GB ${p.storage}GB ${p.brand} ${p.gpu} ${p.offerPrice}`.toLowerCase();

      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        if (q === '4gb gpu' || q === '4 gb gpu' || q === '4gb graphics' || q === '4 gb graphics') {
          if (!p.isDedicatedGpu || (p.gpuVram < 4 && !/\b4\s*gb\b/i.test(p.gpu))) return false;
        } else if (q === '2gb gpu' || q === '2 gb gpu' || q === '2gb graphics' || q === '2 gb graphics') {
          if (!p.isDedicatedGpu || (p.gpuVram !== 2 && !/\b2\s*gb\b/i.test(p.gpu))) return false;
        } else if (!fullText.includes(q)) {
          return false;
        }
      }

      // 2. Category / Purpose Filter (Workstation, Business, Executive, Convertible)
      if (selectedCategory !== 'ALL') {
        if (selectedCategory === 'WORKSTATION' && p.category !== 'WORKSTATION') return false;
        if (selectedCategory === 'BUSINESS' && p.category !== 'BUSINESS') return false;
        if (selectedCategory === 'EXECUTIVE' && p.category !== 'EXECUTIVE') return false;
        if (selectedCategory === 'CONVERTIBLE' && p.category !== 'CONVERTIBLE' && !p.is2in1) return false;
      }

      // 3. Quick Budget Filter
      if (selectedBudget !== 'ALL') {
        const b = parseInt(selectedBudget, 10);
        if (selectedBudget === '3000+') {
          if (p.offerPrice < 3000) return false;
        } else {
          if (p.offerPrice > b) return false;
        }
      }

      // 4. Brand
      if (selectedBrand !== 'ALL' && p.brand !== selectedBrand) return false;

      // 5. CPU (i3, i5, i7, i9, Ultra 7)
      if (selectedCpu !== 'ALL') {
        const cpuLower = (p.processor || '').toLowerCase() + ' ' + (p.title || '').toLowerCase();
        if (selectedCpu === 'i3' && !cpuLower.includes('i3')) return false;
        if (selectedCpu === 'i5' && !cpuLower.includes('i5')) return false;
        if (selectedCpu === 'i7' && !cpuLower.includes('i7')) return false;
        if (selectedCpu === 'i9' && !cpuLower.includes('i9')) return false;
        if (selectedCpu === 'Ultra 7' && !cpuLower.includes('ultra')) return false;
      }

      // 6. Gen (8th Gen+, 10th Gen+, 11th Gen+, 12th Gen+, 13th Gen+)
      if (selectedGen !== 'ALL') {
        const targetGen = parseInt(selectedGen, 10);
        const extractedGenNum = parseInt((p.gen || '').replace(/\D/g, ''), 10);
        if (extractedGenNum) {
          if (extractedGenNum < targetGen) return false;
        } else {
          const genMatch = fullText.match(/(\d+)\s*(th|st|nd|rd)?\s*gen/);
          if (genMatch) {
            if (parseInt(genMatch[1], 10) < targetGen) return false;
          }
        }
      }

      // 7. RAM Filter (8GB+, 16GB+, 32GB+)
      if (selectedRam !== 'ALL') {
        const ramVal = parseInt(selectedRam, 10);
        if (p.ram < ramVal) return false;
      }

      // 8. Storage Filter (256GB+, 512GB+, 1TB+ SSD)
      if (selectedStorage !== 'ALL') {
        const storageVal = parseInt(selectedStorage, 10);
        if (p.storage < storageVal) return false;
      }

      // 9. GPU / Graphics Filter
      if (selectedGpu !== 'ALL') {
        if (selectedGpu === 'dedicated') {
          if (!p.isDedicatedGpu) return false;
        } else if (selectedGpu === '2gb') {
          if (!p.isDedicatedGpu || (p.gpuVram !== 2 && !/\b2\s*gb\b/i.test(p.gpu))) return false;
        } else if (selectedGpu === '4gb') {
          if (!p.isDedicatedGpu || (p.gpuVram < 4 && !/\b4\s*gb\b/i.test(p.gpu))) return false;
        } else if (selectedGpu === '12gb') {
          if (!p.isDedicatedGpu || (p.gpuVram < 12 && !/\b12\s*gb\b/i.test(p.gpu))) return false;
        } else if (selectedGpu === 'iris') {
          if (!p.isIrisXe) return false;
        }
      }

      // 10. Feature Filter
      if (selectedFeature !== 'ALL') {
        if (selectedFeature === 'touch' && !p.isTouch && !fullText.includes('touch')) return false;
        if (selectedFeature === '2in1' && !p.is2in1 && !fullText.includes('2in1') && !fullText.includes('x360')) return false;
      }

      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedBudget, selectedBrand, selectedCpu, selectedGen, selectedRam, selectedStorage, selectedGpu, selectedFeature]);

  // Key KPI Metrics
  const stats = useMemo(() => {
    const total = products.length;
    const matched = filteredProducts.length;
    const minPrice = filteredProducts.length > 0 ? Math.min(...filteredProducts.map(p => p.offerPrice)) : 0;
    const dedicatedCount = filteredProducts.filter(p => p.isDedicatedGpu).length;
    const workstationCount = filteredProducts.filter(p => p.category === 'WORKSTATION').length;
    return { total, matched, minPrice, dedicatedCount, workstationCount };
  }, [products, filteredProducts]);

  // Construct Formatted Output (Clean product quotes without extra headers)
  const formattedOutputText = useMemo(() => {
    if (filteredProducts.length === 0) {
      return `*No laptops match your search filter.*`;
    }

    let result = ``;
    filteredProducts.forEach(p => {
      result += `${p.rawText}\n\n\n`;
    });
    return result.trim();
  }, [filteredProducts]);

  // Product Photos local state (stores arrays of photos per product)
  const [productPhotos, setProductPhotos] = useState(() => {
    try {
      const saved = localStorage.getItem('whatsapp_product_photos');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Track active photo index per product card
  const [activePhotoIndices, setActivePhotoIndices] = useState({});

  // Helper to generate 3 distinct default multi-angle photos for a product
  const createDefaultPhotosArrayForProduct = (title = 'Laptop', brand = 'DELL') => {
    try {
      const brandColor = brand === 'DELL' ? '#0284c7' : brand === 'HP' ? '#a855f7' : brand === 'LENOVO' ? '#f97316' : '#ec4899';

      // 1. Front Open Display View
      const c1 = document.createElement('canvas'); c1.width = 800; c1.height = 600;
      const ctx1 = c1.getContext('2d');
      ctx1.fillStyle = '#ffffff'; ctx1.fillRect(0, 0, 800, 600);
      ctx1.fillStyle = '#0f172a'; ctx1.fillRect(140, 50, 520, 340);
      ctx1.fillStyle = brandColor; ctx1.fillRect(160, 70, 480, 300);
      ctx1.fillStyle = '#ffffff'; ctx1.font = 'bold 30px sans-serif'; ctx1.textAlign = 'center'; ctx1.fillText(title, 400, 210);
      ctx1.fillStyle = '#64748b'; ctx1.fillRect(90, 390, 620, 24);
      ctx1.fillStyle = '#94a3b8'; ctx1.fillRect(350, 424, 100, 40);

      // 2. Keyboard & Trackpad Open Angle View
      const c2 = document.createElement('canvas'); c2.width = 800; c2.height = 600;
      const ctx2 = c2.getContext('2d');
      ctx2.fillStyle = '#f8fafc'; ctx2.fillRect(0, 0, 800, 600);
      ctx2.fillStyle = '#1e293b'; ctx2.fillRect(100, 80, 600, 340);
      ctx2.fillStyle = '#334155';
      for (let r = 0; r < 5; r++) {
        for (let col = 0; col < 12; col++) {
          ctx2.fillRect(130 + (col * 44), 110 + (r * 40), 38, 32);
        }
      }
      ctx2.fillStyle = '#64748b'; ctx2.fillRect(300, 330, 200, 70);
      ctx2.fillStyle = brandColor; ctx2.font = 'bold 22px sans-serif'; ctx2.textAlign = 'center'; ctx2.fillText(`${title} • Keyboard View`, 400, 480);

      // 3. Closed Lid Top Cover Profile
      const c3 = document.createElement('canvas'); c3.width = 800; c3.height = 600;
      const ctx3 = c3.getContext('2d');
      ctx3.fillStyle = '#f1f5f9'; ctx3.fillRect(0, 0, 800, 600);
      ctx3.fillStyle = '#334155'; ctx3.fillRect(120, 80, 560, 400);
      ctx3.fillStyle = brandColor; ctx3.beginPath(); ctx3.arc(400, 280, 50, 0, Math.PI * 2); ctx3.fill();
      ctx3.fillStyle = '#ffffff'; ctx3.font = 'bold 28px sans-serif'; ctx3.textAlign = 'center'; ctx3.fillText(brand, 400, 290);
      ctx3.fillStyle = '#0f172a'; ctx3.font = 'bold 22px sans-serif'; ctx3.fillText(`${title} • Top Cover Profile`, 400, 520);

      return [c1.toDataURL('image/jpeg', 0.88), c2.toDataURL('image/jpeg', 0.88), c3.toDataURL('image/jpeg', 0.88)];
    } catch (e) {
      return [];
    }
  };

  const getProductPhotosList = (p) => {
    if (!p) return [];
    const key1 = p.id;
    const key2 = p.title;
    const key3 = p.title?.toUpperCase();

    const entry = productPhotos[key1] || productPhotos[key2] || productPhotos[key3] || p.photos || p.photo || p.image_url;
    if (Array.isArray(entry) && entry.filter(Boolean).length > 0) return entry.filter(Boolean);
    if (typeof entry === 'string' && entry.trim().length > 0) return [entry];
    
    return createDefaultPhotosArrayForProduct(p.title, p.brand);
  };

  // Upload Image Resolution Size option: 1600 (Max HD), 1200 (HD Standard), 800 (Compact), 500 (Small)
  const [uploadImageMaxDim, setUploadImageMaxDim] = useState(() => {
    return localStorage.getItem('whatsapp_photo_upload_size') || '1200';
  });

  const handleUploadSizeChange = (newSize) => {
    setUploadImageMaxDim(newSize);
    try {
      localStorage.setItem('whatsapp_photo_upload_size', newSize);
    } catch (e) {}
  };

  // Calculate approximate file size of base64 image string
  const getImageDataSizeInfo = (base64Str) => {
    if (!base64Str || typeof base64Str !== 'string') return '';
    try {
      const stringLength = base64Str.length - (base64Str.indexOf(',') + 1);
      const sizeInBytes = Math.ceil(stringLength * 0.75);
      if (sizeInBytes > 1024 * 1024) {
        return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
      }
      return `${Math.round(sizeInBytes / 1024)} KB`;
    } catch (e) {
      return '';
    }
  };

  const addMultipleProductPhotos = (pObj, filesList) => {
    if (!filesList || filesList.length === 0) return;
    const fileArray = Array.from(filesList);
    const maxDim = parseInt(uploadImageMaxDim, 10) || 1200;

    const promises = fileArray.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let w = img.width, h = img.height;
            if (w > h && w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim; }
            else if (h > maxDim) { w = Math.round((w * maxDim) / h); h = maxDim; }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.88));
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(newPhotos => {
      const key1 = typeof pObj === 'object' ? pObj.id : pObj;
      const key2 = typeof pObj === 'object' ? pObj.title : pObj;
      const existing = getProductPhotosList(typeof pObj === 'object' ? pObj : { id: pObj, title: pObj });
      const combined = [...existing, ...newPhotos];

      const updatedMap = {
        ...productPhotos,
        [key1]: combined,
        [key2]: combined
      };
      setProductPhotos(updatedMap);
      try {
        localStorage.setItem('whatsapp_product_photos', JSON.stringify(updatedMap));
      } catch (e) {}
    });
  };

  // Download all photos attached to product (for 1-drag drop into WhatsApp Web)
  const downloadAllPhotos = async (p) => {
    const photoList = getProductPhotosList(p);
    if (photoList.length === 0) {
      alert('No photos attached to this product yet.');
      return;
    }

    for (let i = 0; i < photoList.length; i++) {
      const photoData = photoList[i];
      const a = document.createElement('a');
      a.href = photoData;
      a.download = `${(p.title || 'laptop').replace(/[^a-zA-Z0-9_-]/g, '_')}_photo_${i + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      await new Promise(res => setTimeout(res, 200));
    }
    setToastMessage(`⬇️ Downloaded ${photoList.length} photos to your downloads folder! Drag & drop into WhatsApp!`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const removeProductPhoto = (pObj, indexToRemove) => {
    const key1 = typeof pObj === 'object' ? pObj.id : pObj;
    const key2 = typeof pObj === 'object' ? pObj.title : pObj;
    const existing = getProductPhotosList(typeof pObj === 'object' ? pObj : { id: pObj, title: pObj });
    const updatedList = existing.filter((_, idx) => idx !== indexToRemove);

    const updatedMap = {
      ...productPhotos,
      [key1]: updatedList,
      [key2]: updatedList
    };
    setProductPhotos(updatedMap);
    try {
      localStorage.setItem('whatsapp_product_photos', JSON.stringify(updatedMap));
    } catch (e) {}

    // Reset active index if needed
    setActivePhotoIndices(prev => ({
      ...prev,
      [key1]: Math.max(0, (prev[key1] || 0) - 1)
    }));
  };

  // Helper: Base64 to Blob conversion
  const base64ToPngBlob = async (base64Data) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 800;
        canvas.height = img.height || 600;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      };
      img.onerror = () => reject(new Error('Failed to load image for blob'));
      img.src = base64Data;
    });
  };

  // Clean Product Photo Blob Generator for specific index or default
  const getCleanProductPhotoBlob = async (p, photoIdx = 0) => {
    const photoList = getProductPhotosList(p);
    const targetPhoto = photoList[photoIdx] || photoList[0];

    if (targetPhoto) {
      try {
        const blob = await base64ToPngBlob(targetPhoto);
        if (blob) return blob;
      } catch (e) {
        console.warn('Fallback to generated photo canvas:', e);
      }
    }

    // Generate high quality product image card canvas if no photo attached yet
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 600);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(150, 60, 500, 320);

    ctx.fillStyle = '#0284c7';
    ctx.fillRect(170, 80, 460, 280);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(p.title || 'Buyology Laptop', 400, 210);

    ctx.fillStyle = '#64748b';
    ctx.fillRect(100, 380, 600, 24);

    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(350, 415, 100, 50);

    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  };

  // Download ALL Photos & Copy Formatted Text Caption (for WhatsApp Web Multi-Photo Album Drag & Drop)
  const handleDownloadAndCopyCaption = async (p) => {
    const postText = p.rawText || `*💻 ${p.title}*\n  Processor – ${p.processor}\n  RAM – ${p.ram} GB\n  Storage – ${p.storage} GB SSD\n  Display – ${p.display}\n  OS – ${p.os}\n*Offer Price @${p.offerPrice}/- AED* 💰`;
    const photoList = getProductPhotosList(p);

    if (photoList.length === 0) {
      alert('No photos attached to this product yet.');
      return;
    }

    for (let i = 0; i < photoList.length; i++) {
      const a = document.createElement('a');
      a.href = photoList[i];
      a.download = `${(p.title || 'laptop').replace(/[^a-zA-Z0-9_-]/g, '_')}_photo_${i + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      await new Promise(res => setTimeout(res, 150));
    }

    try {
      await navigator.clipboard.writeText(postText);
    } catch (e) {}

    setCopiedId(`dl-copy-${p.id}`);
    setToastMessage(`⬇️ Downloaded ${photoList.length} Photos & Copied Text! Drag photos into WhatsApp Web & press Ctrl+V for caption!`);
    setTimeout(() => { setCopiedId(null); setToastMessage(''); }, 6000);
  };

  // Copy ALL Attached Photos + Formatted Text Caption in 1 Single Action (for WhatsApp Web Ctrl+V)
  const handleCopyAllPhotosAndText = async (p) => {
    const postText = p.rawText || `*💻 ${p.title}*\n  Processor – ${p.processor}\n  RAM – ${p.ram} GB\n  Storage – ${p.storage} GB SSD\n  Display – ${p.display}\n  OS – ${p.os}\n*Offer Price @${p.offerPrice}/- AED* 💰`;
    const photoList = getProductPhotosList(p);

    try {
      const clipboardItems = [];
      const textBlob = new Blob([postText], { type: 'text/plain' });

      if (photoList.length > 0) {
        for (let i = 0; i < photoList.length; i++) {
          const pngBlob = await base64ToPngBlob(photoList[i]);
          if (i === 0) {
            // First item contains BOTH image/png and text/plain for WhatsApp caption
            clipboardItems.push(new ClipboardItem({
              'image/png': pngBlob,
              'text/plain': textBlob
            }));
          } else {
            clipboardItems.push(new ClipboardItem({
              'image/png': pngBlob
            }));
          }
        }
      } else {
        const fallbackBlob = await getCleanProductPhotoBlob(p, 0);
        clipboardItems.push(new ClipboardItem({
          'image/png': fallbackBlob,
          'text/plain': textBlob
        }));
      }

      if (navigator.clipboard && window.ClipboardItem) {
        try {
          await navigator.clipboard.write(clipboardItems);
        } catch (e1) {
          // Fallback if browser limits multi-item array
          await navigator.clipboard.write([clipboardItems[0]]);
        }

        setCopiedId(`all-photos-${p.id}`);
        setToastMessage(`✅ ALL ${photoList.length || 1} Photos + Text Caption Copied! Press Ctrl+V in WhatsApp!`);
        setTimeout(() => { setCopiedId(null); setToastMessage(''); }, 4000);
      } else {
        handleCopy(postText, p.id);
      }
    } catch (err) {
      console.error('Copy all photos error:', err);
      handleCopy(postText, p.id);
    }
  };

  // Copy Pure Photo Blob to Clipboard (for WhatsApp Web Ctrl+V Image Attachment)
  const handleCopyPhoto = async (p, photoIdx = 0) => {
    try {
      const pngBlob = await getCleanProductPhotoBlob(p, photoIdx);

      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': pngBlob
          })
        ]);
        setCopiedId(`photo-${p.id}`);
        setToastMessage(`📷 Product Photo copied! Press Ctrl+V in WhatsApp chat!`);
        setTimeout(() => { setCopiedId(null); setToastMessage(''); }, 5000);
      } else {
        alert('Browser does not support direct image clipboard copy. Please use Mobile Share button.');
      }
    } catch (err) {
      console.error('Copy photo error:', err);
      alert('Could not copy image blob to clipboard: ' + err.message);
    }
  };

  // Share Native Photos + Formatted WhatsApp Text Caption (Mobile 1-Tap)
  const handleShareToWhatsApp = async (p) => {
    const postText = p.rawText || `*💻 ${p.title}*\n  Processor – ${p.processor}\n  RAM – ${p.ram} GB\n  Storage – ${p.storage} GB SSD\n  Display – ${p.display}\n  OS – ${p.os}\n*Offer Price @${p.offerPrice}/- AED* 💰`;
    const photoList = getProductPhotosList(p);

    try {
      const files = [];
      if (photoList.length > 0) {
        for (let i = 0; i < photoList.length; i++) {
          const blob = await base64ToPngBlob(photoList[i]);
          files.push(new File([blob], `${(p.title || 'laptop').replace(/\s+/g, '_')}_photo_${i + 1}.png`, { type: 'image/png' }));
        }
      } else {
        const fallbackBlob = await getCleanProductPhotoBlob(p, 0);
        files.push(new File([fallbackBlob], `${(p.title || 'laptop').replace(/\s+/g, '_')}.png`, { type: 'image/png' }));
      }

      if (navigator.share && navigator.canShare && navigator.canShare({ files })) {
        await navigator.share({
          title: p.title,
          text: postText,
          files
        });
        return;
      }
    } catch (err) {
      console.log('Mobile share fallback:', err);
    }
    const waUrl = `https://wa.me/?text=${encodeURIComponent(postText)}`;
    window.open(waUrl, '_blank');
  };

  // Copy Helper
  const handleCopy = (textToCopy, identifier = 'all') => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(identifier);
      setToastMessage('Copied formatted WhatsApp text to clipboard!');
      setTimeout(() => {
        setCopiedId(null);
        setToastMessage('');
      }, 2500);
    });
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      if (content) {
        updateAndSaveRawText(content);
        setEditorInput(content);
        setShowModal(false);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedBudget('ALL');
    setSelectedBrand('ALL');
    setSelectedCpu('ALL');
    setSelectedGen('ALL');
    setSelectedRam('ALL');
    setSelectedStorage('ALL');
    setSelectedGpu('ALL');
    setSelectedFeature('ALL');
  };

  const dropdownStyle = (isActive, activeBg = 'var(--citrus)', activeColor = '#000000') => ({
    width: '100%',
    height: '42px',
    padding: '0 32px 0 12px',
    fontSize: '0.84rem',
    fontWeight: 800,
    fontFamily: 'var(--font-mono)',
    backgroundColor: isActive ? activeBg : 'var(--bg-card)',
    color: isActive ? activeColor : 'var(--text-primary)',
    border: '2px solid #000000',
    borderRadius: 'var(--radius-sm)',
    boxShadow: isActive ? 'var(--shadow-flat-sm)' : 'none',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    outline: 'none',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', padding: '0 8px' }}>
      
      {/* 1. Header Banner & Executive KPI Metrics Bar */}
      <div className="card static card-p-lg" style={{ border: 'var(--border)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-flat)' }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: 16 }}>
          <div>
            <h2 className="font-display" style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 900, margin: 0, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>💻</span> WhatsApp Stock Matcher Console
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              Filter Workstations, Business & Executive Laptops — copy clean quotes directly for customer chat.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          {products.length > 0 && (
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12, alignItems: isMobile ? 'stretch' : 'center', width: isMobile ? '100%' : 'auto' }}>
              <div style={{ display: 'flex', justifyContent: isMobile ? 'space-between' : 'flex-start', gap: 12, padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border-light-color)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', width: isMobile ? '100%' : 'auto' }}>
                <div>Total Stock: <strong style={{ color: 'var(--purple)', fontSize: '0.95rem' }}>{stats.total}</strong></div>
                <div style={{ borderLeft: '1px solid var(--border-light-color)', paddingLeft: 12 }}>
                  Matched: <strong style={{ color: 'var(--citrus-dark)', fontSize: '0.95rem' }}>{stats.matched}</strong>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-light-color)', paddingLeft: 12 }}>
                  Workstations: <strong style={{ color: 'var(--orange)', fontSize: '0.95rem' }}>{stats.workstationCount}</strong>
                </div>
              </div>

              <button 
                className="btn btn-dark" 
                style={{ padding: '10px 16px', fontWeight: 800, width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}
                onClick={() => {
                  if (productsList && productsList.length > 0) {
                    const dbText = convertProductsListToText(productsList);
                    updateAndSaveRawText(dbText);
                    setToastMessage('Loaded live product database catalog!');
                    setTimeout(() => setToastMessage(''), 2500);
                  } else {
                    setEditorInput(rawText);
                    setShowModal(true);
                  }
                }}
                title="Load live stock catalog from database"
              >
                <Sparkles size={15} /> ⚡ Sync DB Stock
              </button>

              <button 
                className="btn btn-ghost" 
                style={{ padding: '10px 14px', fontWeight: 800, width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}
                onClick={() => { setEditorInput(rawText); setShowModal(true); }}
              >
                <Edit3 size={15} /> {rawText ? 'Edit List' : 'Paste List'}
              </button>

              <button 
                className="btn btn-primary" 
                style={{ padding: '10px 18px', fontWeight: 900, width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}
                onClick={() => handleCopy(formattedOutputText, 'top-all')}
              >
                {copiedId === 'top-all' ? <Check size={15} /> : <Copy size={15} />}
                <span>{copiedId === 'top-all' ? 'Copied!' : 'Copy Filtered Quotes'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Copy Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="alert alert-success"
            style={{ fontWeight: 800, fontSize: '0.88rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span>✅ {toastMessage}</span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>Ready to paste in WhatsApp chat</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* IF NO CATALOG LOADED YET */}
      {products.length === 0 ? (
        <div className="card static card-p-lg" style={{ border: 'var(--border)', textAlign: 'center', padding: '60px 24px' }}>
          <div 
            onDragEnter={handleDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragOver}
            onDrop={handleDrop}
            style={{
              border: dragOver ? '3px dashed var(--purple)' : '2px dashed var(--border-color)',
              background: dragOver ? 'var(--purple-soft)' : 'rgba(0,0,0,0.02)',
              borderRadius: 'var(--radius)',
              padding: '40px 20px',
              maxWidth: '600px',
              margin: '0 auto 24px',
              cursor: 'pointer'
            }}
            onClick={() => document.getElementById('file-picker-input').click()}
          >
            <input 
              type="file" 
              id="file-picker-input" 
              accept=".txt,.csv" 
              style={{ display: 'none' }} 
              onChange={e => e.target.files && handleFileUpload(e.target.files[0])}
            />
            <FileUp size={44} style={{ margin: '0 auto 12px', color: 'var(--purple)' }} />
            <h3 className="font-heading" style={{ fontSize: '1.2rem', marginBottom: 6 }}>
              {dragOver ? 'Drop your file here!' : 'Upload or Drag & Drop Product List (.txt / .csv)'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', margin: 0 }}>
              Or click to browse your computer
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-primary" 
              style={{ padding: '10px 22px', fontSize: '0.88rem', fontWeight: 900 }}
              onClick={() => { setEditorInput(rawText); setShowModal(true); }}
            >
              <Edit3 size={15} /> Paste Text List Directly
            </button>

            <button 
              className="btn btn-ghost" 
              style={{ padding: '10px 18px', fontSize: '0.85rem' }}
              onClick={() => { setRawText(EXAMPLE_TEMPLATE); setEditorInput(EXAMPLE_TEMPLATE); }}
            >
              <Sparkles size={15} /> Load Example Template
            </button>
          </div>
        </div>
      ) : (
        /* FULL-WIDTH FILTER & CATALOG CONSOLE */
        <>
          {/* 2. Buyology Custom Styled Dropdown Filter Matrix */}
          <div className="card static card-p-lg" style={{ border: 'var(--border)', display: 'flex', flexDirection: 'column', gap: 18, width: '100%' }}>
            
            {/* Search Input Bar */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input 
                  type="text" 
                  className="field-input" 
                  placeholder="🔍 Type customer specs (e.g. Precision, Workstation, i7, 16GB RAM, 4GB GPU, 512GB SSD)..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: 46, paddingRight: 40, fontSize: '0.98rem', height: '46px', width: '100%' }}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '1rem' }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {(searchQuery || selectedCategory !== 'ALL' || selectedBudget !== 'ALL' || selectedBrand !== 'ALL' || selectedCpu !== 'ALL' || selectedGen !== 'ALL' || selectedRam !== 'ALL' || selectedStorage !== 'ALL' || selectedGpu !== 'ALL' || selectedFeature !== 'ALL') && (
                <button 
                  className="btn btn-ghost" 
                  style={{ padding: '8px 16px', fontSize: '0.82rem', color: 'var(--pink)', fontWeight: 800, whiteSpace: 'nowrap' }}
                  onClick={resetAllFilters}
                >
                  Reset All Filters
                </button>
              )}
            </div>

            {/* MOBILE ONLY: Single Collapsible Filter Toggle Button */}
            {isMobile && (
              <button 
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'space-between', padding: '10px 14px', fontWeight: 900 }}
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Filter size={15} />
                  <span>⚡ Filter Stock {(selectedCategory !== 'ALL' || selectedBudget !== 'ALL' || selectedBrand !== 'ALL' || selectedCpu !== 'ALL' || selectedGen !== 'ALL' || selectedRam !== 'ALL' || selectedStorage !== 'ALL' || selectedGpu !== 'ALL') ? '(Active Filters)' : ''}</span>
                </span>
                <ChevronDown size={16} style={{ transform: showMobileFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
            )}

            {/* Custom Buyology Styled Dropdown Control Grid */}
            {(!isMobile || showMobileFilters) && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', 
                gap: 16, 
                paddingTop: 14, 
                borderTop: '1px solid var(--border-light-color)' 
              }}>
              
              {/* 1. Category / Purpose */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  🎯 Purpose / Category
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <select 
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    style={dropdownStyle(selectedCategory !== 'ALL', 'var(--orange)', '#ffffff')}
                  >
                    <option value="ALL">All Categories</option>
                    <option value="WORKSTATION">🖥️ Workstation & Heavy Duty (Precision, ZBook, ThinkPad P)</option>
                    <option value="BUSINESS">💼 Business & Commercial (Latitude, EliteBook, ThinkPad T/L)</option>
                    <option value="EXECUTIVE">✨ Executive & Ultraportable (Spectre, Envy, X1, Surface)</option>
                    <option value="CONVERTIBLE">🔄 2-in-1 Convertible Touch (X360, Yoga, Touch)</option>
                  </select>
                  <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: selectedCategory !== 'ALL' ? '#ffffff' : '#000000' }} />
                </div>
              </div>

              {/* 2. Customer Budget */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  💰 Customer Budget
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <select 
                    value={selectedBudget}
                    onChange={e => setSelectedBudget(e.target.value)}
                    style={dropdownStyle(selectedBudget !== 'ALL', 'var(--citrus)', '#000000')}
                  >
                    <option value="ALL">All Prices</option>
                    <option value="1000">Under 1000 AED</option>
                    <option value="1500">Under 1500 AED</option>
                    <option value="2000">Under 2000 AED</option>
                    <option value="2500">Under 2500 AED</option>
                    <option value="3000+">3000+ AED</option>
                  </select>
                  <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#000000' }} />
                </div>
              </div>

              {/* 3. Brand */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  🏷️ Brand
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <select 
                    value={selectedBrand}
                    onChange={e => setSelectedBrand(e.target.value)}
                    style={dropdownStyle(selectedBrand !== 'ALL', 'var(--purple)', '#ffffff')}
                  >
                    <option value="ALL">All Brands</option>
                    <option value="DELL">DELL</option>
                    <option value="HP">HP</option>
                    <option value="LENOVO">LENOVO</option>
                    <option value="SURFACE">MICROSOFT SURFACE</option>
                    <option value="MACBOOK">APPLE MACBOOK</option>
                  </select>
                  <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: selectedBrand !== 'ALL' ? '#ffffff' : '#000000' }} />
                </div>
              </div>

              {/* 4. Processor */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  ⚡ Processor
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <select 
                    value={selectedCpu}
                    onChange={e => setSelectedCpu(e.target.value)}
                    style={dropdownStyle(selectedCpu !== 'ALL', 'var(--cyan)', '#000000')}
                  >
                    <option value="ALL">All Processors</option>
                    <option value="i5">Intel Core i5</option>
                    <option value="i7">Intel Core i7</option>
                    <option value="i9">Intel Core i9</option>
                    <option value="Ultra 7">Intel Ultra 7</option>
                  </select>
                  <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#000000' }} />
                </div>
              </div>

              {/* 5. Generation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  🎓 Generation
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <select 
                    value={selectedGen}
                    onChange={e => setSelectedGen(e.target.value)}
                    style={dropdownStyle(selectedGen !== 'ALL', 'var(--green)', '#000000')}
                  >
                    <option value="ALL">Any Gen</option>
                    <option value="8">8th Gen+</option>
                    <option value="10">10th Gen+</option>
                    <option value="11">11th Gen+</option>
                    <option value="12">12th Gen+</option>
                    <option value="13">13th Gen+</option>
                  </select>
                  <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#000000' }} />
                </div>
              </div>

              {/* 6. RAM (Separate Dropdown) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  💾 Memory (RAM)
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <select 
                    value={selectedRam}
                    onChange={e => setSelectedRam(e.target.value)}
                    style={dropdownStyle(selectedRam !== 'ALL', 'var(--pink)', '#ffffff')}
                  >
                    <option value="ALL">Any RAM</option>
                    <option value="8">8GB+ RAM</option>
                    <option value="16">16GB+ RAM</option>
                    <option value="32">32GB+ RAM</option>
                  </select>
                  <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: selectedRam !== 'ALL' ? '#ffffff' : '#000000' }} />
                </div>
              </div>

              {/* 7. Storage SSD (Separate Dropdown) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  💿 Storage SSD
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <select 
                    value={selectedStorage}
                    onChange={e => setSelectedStorage(e.target.value)}
                    style={dropdownStyle(selectedStorage !== 'ALL', 'var(--purple)', '#ffffff')}
                  >
                    <option value="ALL">Any SSD</option>
                    <option value="256">256GB+ SSD</option>
                    <option value="512">512GB+ SSD</option>
                    <option value="1024">1TB+ SSD</option>
                  </select>
                  <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: selectedStorage !== 'ALL' ? '#ffffff' : '#000000' }} />
                </div>
              </div>

              {/* 8. GPU / Graphics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  🎮 Graphics & GPU
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <select 
                    value={selectedGpu}
                    onChange={e => setSelectedGpu(e.target.value)}
                    style={dropdownStyle(selectedGpu !== 'ALL', 'var(--orange)', '#ffffff')}
                  >
                    <option value="ALL">Any GPU</option>
                    <option value="dedicated">Dedicated GPU</option>
                    <option value="2gb">2GB Dedicated GPU</option>
                    <option value="4gb">4GB Dedicated GPU</option>
                    <option value="12gb">12GB Dedicated GPU</option>
                    <option value="iris">Intel Iris Xe</option>
                  </select>
                  <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: selectedGpu !== 'ALL' ? '#ffffff' : '#000000' }} />
                </div>
              </div>

            </div>
            )}
          </div>

          {/* 3. Executive Live Console Split View: Left (Card Grid) + Right (Live WhatsApp Quote Box) */}
          <div style={{ display: 'grid', gridTemplateColumns: (isMobile || !showLivePreview) ? '1fr' : '1fr 380px', gap: 20, width: '100%', alignItems: 'start' }}>
            
            {/* LEFT COLUMN: Laptop Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Header Bar */}
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: 12 }}>
                <span style={{ fontSize: '0.92rem', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                  Matched Stock: <span style={{ color: 'var(--purple)', fontSize: '1.15rem' }}>{filteredProducts.length}</span> Laptops
                </span>

                <div style={{ display: 'flex', gap: 10, width: isMobile ? '100%' : 'auto' }}>
                  <button 
                    className="btn btn-ghost"
                    style={{ fontSize: '0.78rem', padding: '6px 10px', flex: isMobile ? 1 : 'none', justifyContent: 'center', whiteSpace: 'nowrap' }}
                    onClick={() => setShowLivePreview(!showLivePreview)}
                  >
                    <MessageSquare size={14} /> {showLivePreview ? (isMobile ? 'Hide Quote' : 'Hide Live Quote Box') : (isMobile ? 'Show Quote' : 'Show Live Quote Box')}
                  </button>

                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '8px 14px', fontWeight: 900, fontSize: '0.82rem', flex: isMobile ? 1 : 'none', justifyContent: 'center', whiteSpace: 'nowrap' }}
                    onClick={() => handleCopy(formattedOutputText, 'bottom-all')}
                  >
                    {copiedId === 'bottom-all' ? <Check size={15} /> : <Copy size={15} />}
                    <span>{copiedId === 'bottom-all' ? 'Copied!' : (isMobile ? 'Copy All' : 'Copy Filtered Quotes')}</span>
                  </button>
                </div>
              </div>

                {/* Grid of Laptop Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(310px, 1fr))', gap: isMobile ? 10 : 18 }}>
                  {filteredProducts.length === 0 ? (
                    <div className="card static card-p-lg" style={{ gridColumn: '1 / -1', textAlign: 'center', border: 'var(--border)', padding: '50px 20px' }}>
                      <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 10 }}>🔍</span>
                      <h3 style={{ fontWeight: 900, marginBottom: 6 }}>No laptops match your exact filter combination.</h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>Try loosening RAM, Storage or GPU filter criteria.</p>
                      <button className="btn btn-primary" onClick={resetAllFilters}>Reset All Filters</button>
                    </div>
                  ) : (
                    filteredProducts.map(p => (
                      <motion.div 
                        key={p.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card static"
                        style={{
                          backgroundColor: 'var(--bg-card)',
                          borderRadius: 'var(--radius-lg)',
                          border: 'var(--border)',
                          boxShadow: 'var(--shadow-flat)',
                          padding: isMobile ? '16px' : '22px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: 14
                        }}
                      >
                        <div>
                          {/* Multi-Photo Gallery Preview & Upload Strip */}
                          {(() => {
                            const photosList = getProductPhotosList(p);
                            const activeIdx = activePhotoIndices[p.id] || 0;
                            const activePhoto = photosList[activeIdx] || photosList[0];

                            return (
                              <div style={{ marginBottom: 12 }}>
                                {photosList.length > 0 ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-light-color)', background: '#000' }}>
                                      <img src={activePhoto} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      
                                      <span style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(0,0,0,0.85)', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono)', display: 'flex', gap: 6, alignItems: 'center' }}>
                                        <span>Photo {activeIdx + 1} of {photosList.length}</span>
                                        {getImageDataSizeInfo(activePhoto) && <span style={{ opacity: 0.8, borderLeft: '1px solid rgba(255,255,255,0.4)', paddingLeft: 6 }}>{getImageDataSizeInfo(activePhoto)}</span>}
                                      </span>

                                      <button
                                        type="button"
                                        onClick={() => removeProductPhoto(p, activeIdx)}
                                        style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(239, 68, 68, 0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontWeight: 900, fontSize: '0.7rem' }}
                                        title="Remove this photo"
                                      >
                                        ✕
                                      </button>

                                      <label 
                                        style={{
                                          position: 'absolute',
                                          bottom: 6,
                                          right: 6,
                                          background: 'rgba(0,0,0,0.85)',
                                          color: '#fff',
                                          fontSize: '0.66rem',
                                          fontWeight: 800,
                                          padding: '4px 8px',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          fontFamily: 'var(--font-mono)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 4
                                        }}
                                      >
                                        <span>+ Add Photos</span>
                                        <input 
                                          type="file" 
                                          accept="image/*" 
                                          multiple
                                          capture="environment"
                                          style={{ display: 'none' }}
                                          onChange={e => e.target.files && addMultipleProductPhotos(p, e.target.files)}
                                        />
                                      </label>
                                    </div>

                                    {/* Gallery Thumbnail Strip & Download All Button */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                                      {photosList.length > 1 ? (
                                        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', flex: 1, paddingBottom: 2 }}>
                                          {photosList.map((ph, idx) => (
                                            <div 
                                              key={idx}
                                              onClick={() => setActivePhotoIndices(prev => ({ ...prev, [p.id]: idx }))}
                                              style={{
                                                width: 44,
                                                height: 44,
                                                borderRadius: 4,
                                                overflow: 'hidden',
                                                border: idx === activeIdx ? '2px solid var(--citrus, #a3e635)' : '1px solid var(--border-light-color)',
                                                cursor: 'pointer',
                                                opacity: idx === activeIdx ? 1 : 0.6,
                                                flexShrink: 0
                                              }}
                                            >
                                              <img src={ph} alt={`Thumb ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                          ))}
                                        </div>
                                      ) : <span />}

                                      <button
                                        type="button"
                                        className="btn btn-ghost"
                                        style={{ fontSize: '0.68rem', padding: '3px 8px', fontWeight: 800, whiteSpace: 'nowrap' }}
                                        onClick={() => downloadAllPhotos(p)}
                                        title="Download all photos to drag & drop into WhatsApp Web!"
                                      >
                                        ⬇️ Download All ({photosList.length})
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <label 
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: 4,
                                      padding: '14px 10px',
                                      border: '2px dashed var(--border-color)',
                                      borderRadius: 'var(--radius-sm)',
                                      background: 'var(--bg)',
                                      color: 'var(--text-secondary)',
                                      fontSize: '0.78rem',
                                      fontFamily: 'var(--font-mono)',
                                      fontWeight: 800,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <span style={{ fontSize: '1.2rem' }}>📷</span>
                                    <span>Add Multiple Photos (Gallery)</span>
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      multiple
                                      capture="environment"
                                      style={{ display: 'none' }}
                                      onChange={e => e.target.files && addMultipleProductPhotos(p, e.target.files)}
                                    />
                                  </label>
                                )}
                              </div>
                            );
                          })()}

                          {/* Category & Brand Badges */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                            <span className={`badge ${
                              p.brand === 'DELL' ? 'badge-cyan' :
                              p.brand === 'HP' ? 'badge-purple' :
                              p.brand === 'LENOVO' ? 'badge-orange' : 'badge-pink'
                            }`}>
                              {p.brand}
                            </span>

                            <span style={{ 
                              fontSize: '0.65rem', 
                              fontWeight: 800, 
                              background: p.category === 'WORKSTATION' ? 'var(--orange-soft)' : p.category === 'EXECUTIVE' ? 'var(--pink-soft)' : 'var(--bg)',
                              color: p.category === 'WORKSTATION' ? 'var(--orange)' : p.category === 'EXECUTIVE' ? 'var(--pink)' : 'var(--text-muted)',
                              padding: '2px 8px', 
                              borderRadius: '4px',
                              border: '1px solid var(--border-light-color)'
                            }}>
                              {p.category === 'WORKSTATION' ? '🖥️ WORKSTATION' : p.category === 'EXECUTIVE' ? '✨ EXECUTIVE' : '💼 BUSINESS'}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 style={{ margin: '0 0 10px 0', fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'baseline', gap: 6 }}>
                            <span>💻</span> {p.title}
                          </h3>

                          {/* Specs List */}
                          <div style={{ 
                            fontSize: isMobile ? '0.78rem' : '0.83rem', 
                            lineHeight: 1.5, 
                            fontFamily: 'var(--font-mono)',
                            padding: '10px 12px',
                            background: 'var(--bg)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-light-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4
                          }}>
                            <div style={{ fontWeight: 700 }}>
                              Processor – {p.processor} {p.gen && <span style={{ color: 'var(--purple)', fontWeight: 800 }}>({p.gen})</span>}
                            </div>
                            <div>RAM – <strong style={{ color: 'var(--pink)' }}>{p.ram} GB</strong></div>
                            <div>Storage – <strong style={{ color: 'var(--purple)' }}>{p.storage} GB SSD</strong></div>
                            <div>Display – {p.display}</div>
                            {p.gpu ? (
                              <div style={{ 
                                color: p.isDedicatedGpu ? 'var(--orange)' : 'var(--cyan)', 
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6
                              }}>
                                <span>🎮 GPU – {p.gpu}</span>
                                {p.isDedicatedGpu && (
                                  <span style={{ 
                                    fontSize: '0.62rem', 
                                    background: 'var(--orange)', 
                                    color: '#ffffff', 
                                    padding: '1px 5px', 
                                    borderRadius: '3px',
                                    fontWeight: 900
                                  }}>
                                    DEDICATED
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div style={{ opacity: 0.5, fontSize: '0.76rem' }}>
                                GPU – Integrated Graphics
                              </div>
                            )}
                            <div>OS – {p.os}</div>
                            <div style={{ opacity: 0.7, fontStyle: 'italic', fontSize: '0.74rem', marginTop: 2 }}>Charger included.</div>
                          </div>
                        </div>

                        {/* Price Tag & Copy Button Row */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 10, borderTop: '1px solid var(--border-light-color)' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                            {p.originalPrice ? (
                              <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                                AED {p.originalPrice}
                              </span>
                            ) : <span />}

                            <div style={{ 
                              fontSize: isMobile ? '0.86rem' : '1rem', 
                              fontWeight: 900, 
                              background: 'var(--citrus)',
                              color: '#000000',
                              padding: '5px 8px',
                              borderRadius: 'var(--radius-sm)',
                              border: '2px solid #000',
                              maxWidth: '100%',
                              boxSizing: 'border-box'
                            }}>
                              Offer Price @{p.offerPrice}/- AED 💰
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {/* Primary Button 1: Download All Photos & Copy Caption Text for 1-Drag WhatsApp Web Multi-Photo Album */}
                            <button 
                              className="btn btn-primary" 
                              style={{ 
                                width: '100%', 
                                fontSize: '0.86rem', 
                                fontWeight: 900,
                                justifyContent: 'center',
                                background: copiedId === `dl-copy-${p.id}` ? 'var(--green)' : 'var(--citrus)',
                                color: '#000000',
                                padding: '11px'
                              }}
                              onClick={() => handleDownloadAndCopyCaption(p)}
                              title="Downloads all attached laptop photos & copies specs text! Drag all downloaded photos into WhatsApp Web & press Ctrl+V for caption!"
                            >
                              {copiedId === `dl-copy-${p.id}` ? <Check size={16} /> : <span>⬇️</span>}
                              <span>{copiedId === `dl-copy-${p.id}` ? 'Downloaded Photos & Copied Text!' : `⬇️ Download All (${(productPhotos[p.id] || productPhotos[p.title] || p.photos || [1,2,3]).length || 3}) Photos & Copy Text`}</span>
                            </button>

                            <div style={{ display: 'flex', gap: 6 }}>
                              <button 
                                className="btn btn-ghost" 
                                style={{ 
                                  flex: 1, 
                                  fontSize: '0.76rem', 
                                  fontWeight: 800,
                                  justifyContent: 'center',
                                  background: copiedId === `photo-${p.id}` ? 'var(--green)' : 'var(--bg)',
                                  color: copiedId === `photo-${p.id}` ? '#000' : 'var(--text-primary)',
                                  border: '1px solid var(--border-light-color)'
                                }}
                                onClick={() => handleCopyPhoto(p, activePhotoIndices[p.id] || 0)}
                                title="Copy single active photo for Ctrl+V paste into WhatsApp Web"
                              >
                                <span>📷 Copy Photo #{(activePhotoIndices[p.id] || 0) + 1}</span>
                              </button>

                              <button 
                                className="btn btn-ghost" 
                                style={{ 
                                  flex: 1, 
                                  fontSize: '0.76rem', 
                                  fontWeight: 800,
                                  justifyContent: 'center',
                                  background: copiedId === p.id ? 'var(--green)' : 'var(--bg)',
                                  color: copiedId === p.id ? '#000' : 'var(--text-primary)',
                                  border: '1px solid var(--border-light-color)'
                                }}
                                onClick={() => handleCopy(p.rawText, p.id)}
                                title="Copy WhatsApp formatted text quote"
                              >
                                {copiedId === p.id ? <Check size={13} /> : <Copy size={13} />}
                                <span>{copiedId === p.id ? 'Text Copied' : '📋 Copy Text'}</span>
                              </button>

                              <button 
                                className="btn btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '0.76rem', fontWeight: 800 }}
                                onClick={() => handleShareToWhatsApp(p)}
                                title="Direct 1-Tap Share on Mobile WhatsApp with all photos & text"
                              >
                                <Share2 size={13} /> Share
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
              </div>
            </div>

            {/* RIGHT COLUMN: LIVE WHATSAPP QUOTE OUTPUT BOX */}
            {showLivePreview && (
              <div 
                className="card static card-p-lg" 
                style={{ 
                  border: 'var(--border)', 
                  background: 'var(--bg-card)', 
                  boxShadow: 'var(--shadow-flat)', 
                  position: isMobile ? 'static' : 'sticky', 
                  top: 20, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 12,
                  maxHeight: isMobile ? '400px' : 'calc(100vh - 120px)',
                  width: '100%'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: 8 }}>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                    📱 Live WhatsApp Output
                  </h4>
                  <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.74rem', fontWeight: 900 }} onClick={() => handleCopy(formattedOutputText, 'live-box')}>
                    {copiedId === 'live-box' ? 'Copied!' : 'Copy Text'}
                  </button>
                </div>

                <div style={{ 
                  flex: 1, 
                  overflowY: 'auto', 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: '0.76rem', 
                  lineHeight: 1.5, 
                  background: '#0d1117', 
                  color: '#7ee787', 
                  padding: '12px', 
                  borderRadius: 'var(--radius-sm)',
                  whiteSpace: 'pre-wrap'
                }}>
                  {formattedOutputText}
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
                  Auto-updates as you select dropdowns
                </div>
              </div>
            )}

          </div>
        </>
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {showModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(5px)',
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
              className="card card-p-lg static" 
              style={{
                width: '100%',
                maxWidth: '750px',
                maxHeight: '90vh',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                border: 'var(--border)',
                boxShadow: 'var(--shadow-flat-lg)',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '2px solid #000', paddingBottom: 10 }}>
                <h3 className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, textTransform: 'uppercase' }}>
                  📝 PASTE / EDIT PRODUCT LIST
                </h3>
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>✕</button>
              </div>

              <textarea 
                className="field-input" 
                style={{ flex: 1, minHeight: '300px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', lineHeight: 1.5, padding: '12px' }}
                value={editorInput}
                onChange={e => setEditorInput(e.target.value)}
                placeholder="Paste your WhatsApp product list text here..."
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 10 }}>
                <button className="btn btn-ghost" style={{ fontSize: '0.78rem' }} onClick={() => { updateAndSaveRawText(EXAMPLE_TEMPLATE); setEditorInput(EXAMPLE_TEMPLATE); }}>
                  <Sparkles size={13} /> Load Sample Template
                </button>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn btn-primary" style={{ fontWeight: 900 }} onClick={() => { updateAndSaveRawText(editorInput); setShowModal(false); }}>
                    Save & Parse List
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

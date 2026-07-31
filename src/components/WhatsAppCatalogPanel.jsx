import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Copy, Check, Filter, Trash2, Edit3, X, FileUp, Sparkles, Share2, Layers, Cpu, Monitor, Zap, CheckCircle2, MessageSquare, Briefcase, ChevronDown, Camera, ImagePlus, ZoomIn, ChevronLeft, ChevronRight, Folder
} from 'lucide-react';
import { uploadProductPhoto, deleteProductPhoto, urlToBlob, fetchFromGoogleDrive, getDriveDirectUrl, listProductPhotos, uploadAdminRequestsToSupabase, downloadAdminRequestsFromSupabase } from '../services/supabaseClient';

import { uploadPhotoToImgBB } from '../services/imgbbService';
import { saveCatalogToCloud, fetchCatalogFromCloud, savePhotosToCloud, fetchPhotosFromCloud, deletePhotoFromCloud, clearAllPhotosFromCloud } from '../services/catalogSyncService';
import { getApiUrl } from '../config';






/* =========================================================
   LIVE OFFICIAL CATALOG TEMPLATE (27-07-2026 UPDATED)
   ========================================================= */

const DEFAULT_STOCK_CATALOG = `*PRODUCT LIST*
*27- 07- 2026 - Updated*

*DELL SERIES*

*1. Latitude Series*

*💻 Dell Latitude E5440*
  Processor – Intel core i5 , 4th
  RAM – 8 GB 
  Storage – 256 GB SSD
  Display – 13 Inch 
  OS – Windows 11 pro
  
  Charger.
*Offer Price @399/- AED💰*


*💻 Dell Latitude 5310*
  Processor – Intel core i5 
 10 th Generation
  RAM – 8 GB 
  Storage – 256 GB SSD
  Display – 14 Inch 
  OS – Windows 11 pro
  
  Charger.
Price@~999/-AED~
*Offer Price @699/- AED* 💰


*💻 Dell Latitude 5410*
  Processor – Intel core i5 
 10 th Generation
  RAM – 8 GB 
  Storage – 256 GB SSD
  Display – 14 Inch 
  OS – Windows 11 pro
  
  Charger.
Price@~1099/-AED~
*Offer Price @799/- AED💰*


*💻 Dell Latitude 5411 [ H Series ]*
  Processor – Intel core i5 
 10 th Generation
  RAM – 8 GB 
  Storage – 256 GB SSD
  Display – 14 Inch 
  OS – Windows 11 pro
  
  Charger.
Price@~1199/-AED~
*Offer Price @899/- AED💰*


*💻 Dell Latitude 5310 2 IN 1*
  Processor – Intel Core i7-10th
  RAM – 16GB
  Storage – 512 GB SSD
  Display – 13.3 Inch , Touch
  OS – Windows 11 pro
  
  Charger.
@~1599/- Aed~
*Offer price @1299/- AED* 💰


*💻 Dell Latitude 5320*
  Processor – Intel core i5 , 11th
  RAM – 16 GB 
  Storage – 256 GB SSD
  Display – 14 Inch 
  OS – Windows 11 pro
  
  Charger.
Price@~1399/-AED~
*Offer Price @999/- AED💰*


*💻 Dell Latitude 7400*
  Processor – Intel core i7
  8 th Generation
  RAM – 16 GB 
  Storage – 256 GB SSD
  Display – 14 Inch 
  OS – Windows 11 pro
  
  Charger.
Price@~1299/-AED~
*Offer Price @999/- AED💰*

*💻 Dell Latitude 5420*
  Processor – Intel Core i7-11th
  RAM – 32GB
  Storage – 512 GB SSD
  Display – 14 inch
  GPU -intel iris xe
  OS – Windows 11 pro
  
  Charger.
@~1899/- Aed~
*Offer price @1699/- AED* 💰

*💻 Dell Latitude 5540*
  Processor – Intel Core i5-13th
  RAM – 16 GB
  Storage – 512 GB SSD
  Display – 15.6 inch
  GPU -intel iris xe
  OS – Windows 11 pro
  
  Charger.
@~1999/- Aed~
*Offer price @1799/- AED* 💰


*💻 DELL VOSTRO 5599*
  Processor – Intel Core i7-
  9 th Generation
  RAM – 16 GB
  Storage – 512 GB SSD
  Display – 15.6 inch
  GPU - 4 GB Graphics
  OS – Windows 11 pro
  
  Charger.
@~1699/- Aed~
*Offer price @1399/- AED* 💰

*2. Dell precision*


*💻 DELL PRECISION 3571*
Processor – Intel Core i5 , 12 th
RAM – 16 GB RAM
Storage – 512 GB SSD
Graphics - 4 GB
Display – 15.6 Inch 
OS – Windows 11 pro
Charger.
  @~2399 AED~/- 
 *Offer Price @1999/- AED💰*


*HP SERIES*


💻 *HP ELITE BOOK 1040 G9*
  Processor – Intel core i5
 12 th Generation
  RAM – 16 GB
  Storage – 256 GB SSD
  Display – 14 Inch 
  OS – Windows 11 pro
  Charger.
*Offer Price @1699/- AED* 💰


💻 *HP EliteBook 630 G11*
  Processor – Ultra 7
  RAM – 32GB
  Storage – 512GB SSD
  Display – 14 Inch 
  OS – Windows 11 pro
  Charger.
  @3299/- AED
*Offer Price @2599/- AED* 💰


*HP SPECTRE MODELS*


*💻 HP SPECTRE 13 X 360 2 IN 1*
  Processor – Intel core i7
  10 th Generation
  RAM – 16 GB
  Storage – 512 GB SSD
  Display – 13 Inch , Touch
  OS – Windows 11 pro
  Charger.

*Offer Price @2499/- AED💰*


*LENOVO THINKPAD SERIES*


💻 *LENOVO THINKPAD L14*
Processor – Intel Core i7
10 th Generation
RAM – 8 GB RAM
Storage –256 GB SSD
Display – 14 Inch
OS – Windows 11 pro
Charger.
 *Offer Price @999/- AED💰*


*💻 LENOVO THINKPAD L14*
  Processor – Intel core i7 
  10 th Generation
  RAM – 16 GB 
  Storage – 512 GB SSD
  Display – 14 Inch 
  OS – Windows 11 pro
  
  Charger.
*Offer Price @1299/- AED💰*


*💻 LENOVO THINKPAD L15 GEN 1*
  Processor – Intel core i5
  10 th Generation
  RAM – 8 GB 
  Storage – 256 GB SSD
  Display – 15.6 Inch
  OS – Windows 11 pro
  
  Charger.
*Offer Price @1199/- AED💰*

💻 *LENOVO THINKPAD P14 S*
Processor – Intel Core i7
10 th Generation
RAM – 16 GB RAM
Storage –512 GB SSD
Display – 14 Inch
Graphics - 2 GB
OS – Windows 11 pro
Charger.
 @~1999 AED~/- 
 *Offer Price @1699/- AED💰*


💻 *LENOVO THINKPAD P14 S*
Processor – Intel Core i7
11 th Generation
RAM – 16 GB RAM
Storage –512 GB SSD
Display – 14 Inch
Graphics - 4 GB
OS – Windows 11 pro
Charger.
 @~2099 AED~/- 
 *Offer Price @1899/- AED💰*


💻 *LENOVO THINKPAD T14 GEN 1*
Processor – Intel Core i7
10 th Generation
RAM – 16 GB RAM
Storage –512 GB SSD
Display – 14 Inch
OS – Windows 11 pro
Charger.
 @~AED1699/-~ 
 *Offer Price @1399/- AED💰*


💻 *LENOVO THINKPAD T14 GEN 3*
Processor – Intel Core i7
12 th Generation
RAM – 16 GB RAM
Storage –512 GB SSD
Display – 14 Inch
OS – Windows 11 pro
Charger.
 @~AED2199/-~ 
 *Offer Price @1899/- AED💰*


💻 *LENOVO THINKPAD X1 CARBON*
Processor – Intel Core i7
8 th Generation
RAM – 16 GB RAM
Storage –512 GB SSD
Display – 14 Inch
OS – Windows 11 pro
Charger.
 @~ AED~1599/- 
 *Offer Price @1299/- AED💰*


💻 *LENOVO THINKPAD L13*
Processor – i5-10th
RAM – 16 GB RAM
Storage –256 GB SSD
Display – 13.3 Inch
OS – Windows 11 pro
Charger.
 @~AED 1299/-~ 
 *Offer Price @899/- AED💰*


💻 *LENOVO THINKPAD X1 NANO GEN 1*
Processor – i5-11th
RAM – 16 GB RAM
Storage –256 GB SSD
Display – 13 Inch
OS – Windows 11 pro
Charger.
 @~AED 1999/-~ 
 *Offer Price @1699/- AED💰*

*💻 Lenovo ideapad 3 chromebook* 
* 4 GB RAM
* 32 GB Storage
* 12 inch Display
 *Offer Price @199/- AED💰*


*MICROSOFT SURFACE MODELS*


*💻 Microsoft Surface pro 7+* 
  Processor – Intel Core i7-11th
  RAM – 16 GB
  Storage – 256 GB SSD
  Display – 12.5 Inch Touch detachable Keyboard
  GPU-intel iris XE
  OS – Windows 11 pro
  
  Charger.
@~2199/- Aed~
*Offer price @1799/- AED*


*💻 Microsoft Surface 4* 
  Processor – Intel Core i7-11th
  RAM – 16 GB
  Storage – 512 GB SSD
  Display – 14 Inch Touch 
  GPU-intel iris XE
  OS – Windows 11 pro
  
  Charger.
@~2299/- Aed~
*Offer price @1899/- AED*


*MACBOOK SERIES*


*💻 MacBook A1466 2017*
  Processor – i5
  RAM – 8 GB
  Storage – 256 GB SSD
  OS: MAC OS
  Charger.
*Offer Price @799/- AED*`;

/* =========================================================
   TEXT PARSER UTILITIES
   ========================================================= */

function normalizeModelKey(title) {
  if (!title) return 'prod_unknown';
  const clean = title.toLowerCase()
    .replace(/\b\d+\s*(gb|tb|ssd|ram|aed|ghz)\b/gi, '')
    .replace(/\b(i3|i5|i7|i9|ryzen\s*\d*|core\s*ultra)\b/gi, '')
    .replace(/\b\d+(th|st|nd|rd)\s*gen\b/gi, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return 'prod_' + (clean || 'laptop');
}

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
    let embeddedPhotos = [];

    blockLines.forEach(l => {

      const lower = l.toLowerCase();

      // Processor
      if (lower.includes('processor') || lower.includes('cpu') || lower.includes('intel') || lower.includes('ultra') || lower.includes('ryzen') || lower.includes('apple') || lower.includes('i9') || lower.includes('i7') || lower.includes('i5') || lower.includes('i3')) {
        processor = l.replace(/^[^–:-]*[–:-]/, '').replace(/\*/g, '').trim();
      }

      // Generation extraction (e.g. 4th, 6th, 8th, 10th, 11th, 12th, 13th Gen)
      if (!lower.includes('display') && !lower.includes('inch') && !lower.includes('screen')) {
        if (lower.includes('generation') || lower.includes('th') || lower.includes('gen') || /i[3579]-\d+/.test(lower)) {
          const m = l.match(/(\d+)\s*(th|st|nd|rd)?\s*(gen|generation)/i) || l.match(/i[3579]-(\d+)/i) || l.match(/(\d+)\s*th\b/i);
          if (m && parseInt(m[1], 10) < 20 && parseInt(m[1], 10) >= 4) {
            gen = `${m[1]}th Gen`;
          }
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
          if (vVal >= 2 && vVal <= 24) {
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

      // Photo link parsing (Google Drive / CDN image URLs embedded in text)
      const photoUrlMatch = l.match(/(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|webp)|https?:\/\/lh3\.googleusercontent\.com\/[^\s]+|https?:\/\/drive\.google\.com\/[^\s]+)/i);
      if (photoUrlMatch) {
        const directUrl = getDriveDirectImageUrl(photoUrlMatch[1]);
        if (directUrl && !embeddedPhotos.some(ph => ph.url === directUrl)) {
          embeddedPhotos.push({ url: directUrl, label: `Photo ${embeddedPhotos.length + 1}` });
        }
      }
    });


    const fullGpuText = gpuParts.join(' / ');

    const fullGpuLower = fullGpuText.toLowerCase();
    const rawLowerText = fullBlockText.toLowerCase();

    // Dedicated GPU hardware flag (vram >= 2GB or RTX/NVIDIA/Radeon/GTX/A3000/2GB/4GB)
    const isDedicatedGpu = gpuVram >= 2 || 
      /rtx|gtx|nvidia|radeon|geforce|a3000|a2000|t500|t600/i.test(fullGpuLower) || 
      /graphics\s*-\s*\d+\s*gb/i.test(rawLowerText) || 
      /gpu\s*-\s*\d+\s*gb/i.test(rawLowerText) ||
      /\b[2481216]+\s*gb\s*(graphics|gpu|vram)\b/i.test(rawLowerText);
    const isIrisXe = (fullGpuLower.includes('iris') || rawLowerText.includes('intel iris')) && !isDedicatedGpu;

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

    const specParts = [
      processor ? processor.toLowerCase().replace(/[^a-z0-9]/g, '') : '',
      gen ? `${gen}th` : '',
      ram ? `${ram}gb` : '',
      storage ? `${storage}gb` : ''
    ].filter(Boolean).join('_');

    const modelBase = normalizeModelKey(cleanTitle);
    const stableId = specParts ? `${modelBase}_${specParts}` : modelBase;



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
      offerPrice: offerPrice || 999,
      embeddedPhotos
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
  // ── 1. ALL STATE DECLARATIONS AT VERY TOP ──
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [rawText, setRawText] = useState(() => {
    const cached = localStorage.getItem('whatsapp_catalog_raw_text');
    return (cached && cached.trim().length > 0) ? cached : DEFAULT_STOCK_CATALOG;
  });
  const [productPhotos, setProductPhotos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('product_photos_v2') || '{}'); }
    catch { return {}; }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSeries, setSelectedSeries] = useState('ALL');
  const [selectedBudget, setSelectedBudget] = useState('ALL');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedCpu, setSelectedCpu] = useState('ALL');
  const [selectedGen, setSelectedGen] = useState('ALL');
  const [selectedRam, setSelectedRam] = useState('ALL');
  const [selectedStorage, setSelectedStorage] = useState('ALL');
  const [selectedGpu, setSelectedGpu] = useState('ALL');
  const [selectedFeature, setSelectedFeature] = useState('ALL');
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editorInput, setEditorInput] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [photoUploading, setPhotoUploading] = useState({});
  const [activePhotoIdx, setActivePhotoIdx] = useState({});
  const [lightbox, setLightbox] = useState(null);
  const [sharingId, setSharingId] = useState(null);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [vaultSearch, setVaultSearch] = useState('');
  const [adminRequests, setAdminRequests] = useState({ approved: [], pending: [] });
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState(() => {
    try { return sessionStorage.getItem('pending_verification_email') || ''; } catch { return ''; }
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    try { return sessionStorage.getItem('catalog_admin_session') === 'true' || localStorage.getItem('catalog_admin_session') === 'true'; }
    catch { return false; }
  });
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '', processor: '', gen: '', ram: '', storage: '', display: '', gpu: '', os: '', offerPrice: ''
  });

  const DEFAULT_ADMIN_PIN = '1234';

  // ── 2. EFFECTS & DERIVED HOOKS ──
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateAndSaveRawText = useCallback((newText) => {
    setRawText(newText);
    try {
      localStorage.setItem('whatsapp_catalog_raw_text', newText);
    } catch {}
    saveCatalogToCloud(newText, productPhotos);
  }, [productPhotos]);

  const products = useMemo(() => parseWhatsAppCatalog(rawText), [rawText]);

  const activeMoreFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'ALL') count++;
    if (selectedGpu !== 'ALL') count++;
    if (selectedCpu !== 'ALL') count++;
    if (selectedGen !== 'ALL') count++;
    if (selectedRam !== 'ALL') count++;
    if (selectedStorage !== 'ALL') count++;
    if (selectedFeature !== 'ALL') count++;
    return count;
  }, [selectedCategory, selectedGpu, selectedCpu, selectedGen, selectedRam, selectedStorage, selectedFeature]);

  // ── 3. HANDLERS ──
  const handleUnlockAdmin = (e) => {
    e?.preventDefault();
    if (adminPinInput === DEFAULT_ADMIN_PIN || adminPinInput === '8888' || adminPinInput === '7777') {
      setIsAdmin(true);
      try {
        sessionStorage.setItem('catalog_admin_session', 'true');
        localStorage.setItem('catalog_admin_session', 'true');
      } catch {}
      setShowAdminPinModal(false);
      setAdminPinInput('');
      setToastMessage('🟢 Admin Mode Unlocked! Full Edit & Photo privileges active.');
      setTimeout(() => setToastMessage(''), 4000);
    } else {
      alert('Incorrect Admin Passcode. Default passcode is 1234.');
    }
  };

  const handleLockAdmin = () => {
    setIsAdmin(false);
    try {
      sessionStorage.removeItem('catalog_admin_session');
      localStorage.removeItem('catalog_admin_session');
    } catch {}
    setToastMessage('🔒 Admin Mode Locked. Viewers & Staff can view and share only.');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleOpenEditProduct = (p) => {
    setEditingProduct(p);
    setEditForm({
      title: p.title || '',
      processor: p.processor || '',
      gen: p.gen || '',
      ram: p.ram || 8,
      storage: p.storage || 256,
      display: p.display || '14 Inch',
      gpu: p.gpu || '',
      os: p.os || 'Windows 11 Pro',
    });
  };

  const handleSaveEditedProduct = () => {
    if (!editingProduct) return;
    const p = editingProduct;
    const newBlock = `*💻 ${editForm.title}*
  Processor – ${editForm.processor}${editForm.gen ? ` , ${editForm.gen}` : ''}
  RAM – ${editForm.ram} GB
  Storage – ${editForm.storage} GB SSD
  Display – ${editForm.display}${editForm.gpu ? `\n  GPU - ${editForm.gpu}` : ''}
  OS – ${editForm.os || 'Windows 11 pro'}
  
  Charger.
*Offer Price @${editForm.offerPrice}/- AED💰*`;

    let newRawText = rawText;
    if (p.rawText && newRawText.includes(p.rawText)) {
      newRawText = newRawText.replace(p.rawText, newBlock);
    } else {
      newRawText += `\n\n${newBlock}`;
    }

    updateAndSaveRawText(newRawText);
    saveCatalogToCloud(newRawText, productPhotos);
    setEditingProduct(null);
    setToastMessage(`✅ Saved changes for ${editForm.title}!`);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleDeleteSingleProduct = useCallback((p) => {
    if (!window.confirm(`⚠️ Are you sure you want to delete "${p.title}" from the catalog list?`)) return;
    const stableId = p.stableId || p.id;

    let newRawText = rawText;
    if (p.rawText && newRawText.includes(p.rawText)) {
      newRawText = newRawText.replace(p.rawText, '').replace(/\n\s*\n\s*\n/g, '\n\n');
    } else {
      const lines = newRawText.split('\n');
      const filtered = lines.filter(l => !l.toLowerCase().includes(p.title.toLowerCase()));
      newRawText = filtered.join('\n');
    }

    const newPhotos = { ...productPhotos };
    delete newPhotos[stableId];

    updateAndSaveRawText(newRawText);
    setProductPhotos(newPhotos);
    savePhotosToCloud(newPhotos);
    saveCatalogToCloud(newRawText, newPhotos);

    setToastMessage(`🗑️ Removed "${p.title}" from catalog.`);
    setTimeout(() => setToastMessage(''), 3500);
  }, [rawText, productPhotos, updateAndSaveRawText]);

  // Clear all uploaded catalog photos from cloud DB & local cache
  const handleClearAllPhotos = useCallback(async () => {
    if (window.confirm('⚠️ Are you sure you want to DELETE ALL uploaded catalog photos and clear all cache? This cannot be undone.')) {
      await clearAllPhotosFromCloud();
      setProductPhotos({});
      setToastMessage('🧹 All uploaded catalog photos & cache cleared cleanly!');
      setTimeout(() => setToastMessage(''), 4000);
    }
  }, []);







  // Master is always mahinshanavas1@gmail.com — no env var needed




  // Fetch admin approval requests from Backend API (Single source of truth via Supabase PostgreSQL)
  const refreshAdminRequests = useCallback(async () => {
    try {
      const res = await fetch(getApiUrl('/api/admin-requests'));
      if (res.ok) {
        const data = await res.json();
        setAdminRequests({
          approved: data.approved || [],
          pending: data.pending || []
        });
      }
    } catch (e) {
      console.warn('Failed to fetch admin requests:', e);
    }
  }, []);

  useEffect(() => {
    refreshAdminRequests();
    const interval = setInterval(refreshAdminRequests, 4000);
    return () => clearInterval(interval);
  }, [refreshAdminRequests]);

  const handleAdminAction = async (action, email) => {
    if (!email) return;
    const cleanEmail = String(email).toLowerCase().trim();

    // Optimistic local state update
    let newApproved = [...(adminRequests.approved || [])];
    let newPending = [...(adminRequests.pending || [])];

    if (action === 'request') {
      newApproved = newApproved.filter(e => e.toLowerCase() !== cleanEmail);
      if (!newPending.some(p => p.email === cleanEmail)) {
        newPending.push({ email: cleanEmail, requestedAt: new Date().toLocaleString() });
      }
    } else if (action === 'approve') {
      if (!newApproved.includes(cleanEmail)) newApproved.push(cleanEmail);
      newPending = newPending.filter(p => p.email !== cleanEmail);
    } else if (action === 'reject' || action === 'revoke') {
      newApproved = newApproved.filter(e => e.toLowerCase() !== cleanEmail);
      newPending = newPending.filter(p => p.email !== cleanEmail);
    }
    setAdminRequests({ approved: newApproved, pending: newPending });

    // Sync to backend
    try {
      const res = await fetch(getApiUrl('/api/admin-requests'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, email: cleanEmail })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setAdminRequests({
            approved: data.data.approved || [],
            pending: data.data.pending || []
          });
        }
        if (action !== 'request') {
          setToastMessage(`✅ "${action}" for ${cleanEmail}`);
          setTimeout(() => setToastMessage(''), 3000);
        }
      }
    } catch (e) {
      console.warn(`Admin action sync error: ${e.message}`);
    }

  };





  const isMobileShareSupported = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  // ── CENTRAL CLOUD SYNC ON MOUNT ──────────────────────────────────────────────
  // Fetch latest stock catalog text & photo mappings from central Supabase Cloud DB
  // so Mobile immediately loads all photos uploaded from Laptop!
  useEffect(() => {
    let active = true;
    fetchCatalogFromCloud().then(({ rawText: cloudText, productPhotos: cloudPhotos }) => {
      if (!active) return;
      if (cloudText && cloudText.trim().length > 0) {
        setRawText(cloudText);
      }
      if (cloudPhotos && Object.keys(cloudPhotos).length > 0) {
        setProductPhotos(prev => ({ ...prev, ...cloudPhotos }));
      }
    });
    return () => { active = false; };
  }, []);

  // ── LIVE PHOTO POLL (every 8s) ──────────────────────────────────────────────
  // All devices see new photos within 8 seconds — ADDITIVE ONLY (never deletes local photos).
  useEffect(() => {
    let active = true;
    const pollPhotos = async () => {
      try {
        const cloudPhotos = await fetchPhotosFromCloud();
        if (!active) return;
        if (!cloudPhotos || Object.keys(cloudPhotos).length === 0) return;
        setProductPhotos(prev => {
          let changed = false;
          const merged = { ...prev };
          Object.entries(cloudPhotos).forEach(([key, photos]) => {
            if (!Array.isArray(photos) || photos.length === 0) return;
            const prevPhotos = prev[key] || [];
            const newCloudPhotos = photos.filter(cp => !prevPhotos.some(lp => lp.url === cp.url));
            if (newCloudPhotos.length > 0) {
              merged[key] = [...prevPhotos, ...newCloudPhotos];
              changed = true;
            }
          });
          return changed ? merged : prev;
        });
      } catch {}
    };
    const interval = setInterval(pollPhotos, 8000);
    return () => { active = false; clearInterval(interval); };
  }, []);
  // ── AUTO-POLL FOR APPROVAL WHEN PENDING ─────────────────────────────────────
  // Every 5s: if we're showing the pending screen, check if master approved us
  useEffect(() => {
    if (!pendingVerificationEmail) return;
    const checkApproval = async () => {
      try {
        const res = await fetch(getApiUrl('/api/admin-requests'));
        if (!res.ok) return;
        const data = await res.json();
        const approvedList = (data.approved || []).map(e => String(e).toLowerCase().trim());
        const targetEmail = pendingVerificationEmail.toLowerCase().trim();

        if (approvedList.includes(targetEmail)) {
          // Master approved us! Restore pending token & email to log in automatically
          let token = '';
          let email = pendingVerificationEmail;
          try {
            token = sessionStorage.getItem('pending_google_token') || sessionStorage.getItem('google_drive_token') || 'approved_staff_session';
            const savedEmail = sessionStorage.getItem('pending_google_email');
            if (savedEmail) email = savedEmail;
          } catch {}

          setPendingVerificationEmail('');
          setAdminRequests({ approved: data.approved || [], pending: data.pending || [] });
          setToastMessage(`🎉 Account Approved! Edit controls unlocked.`);
          setTimeout(() => setToastMessage(''), 6000);
        }
      } catch {}
    };
    const interval = setInterval(checkApproval, 5000);
    return () => clearInterval(interval);
  }, [pendingVerificationEmail]);

  const handleCancelPendingVerification = () => {
    setPendingVerificationEmail('');
    try { sessionStorage.removeItem('pending_verification_email'); } catch {}
  };




  const saveProductPhotos = useCallback((updated) => {
    setProductPhotos(updated);
    saveCatalogToCloud(rawText, updated);
  }, [rawText]);



  const getPhotos = useCallback((stableId, p = null) => {
    let local = productPhotos[stableId] || [];

    // Fallback lookup by model title key if exact spec stableId isn't found
    if (local.length === 0 && p && p.title) {
      const altKey = normalizeModelKey(p.title);
      if (altKey && productPhotos[altKey]) {
        local = productPhotos[altKey];
      } else {
        const foundKey = Object.keys(productPhotos).find(k => k.includes(altKey) || altKey.includes(k));
        if (foundKey && productPhotos[foundKey]) {
          local = productPhotos[foundKey];
        }
      }
    }

    const seenUrls = new Set();
    const valid = [];
    local.forEach(ph => {
      if (ph && ph.url && typeof ph.url === 'string' && !ph.url.startsWith('data:') && !seenUrls.has(ph.url)) {
        seenUrls.add(ph.url);
        valid.push(ph);
      }
    });

    const embedded = (p?.embeddedPhotos || []).filter(ph => ph && ph.url && typeof ph.url === 'string' && !ph.url.startsWith('data:'));
    embedded.forEach(ph => {
      if (!seenUrls.has(ph.url)) {
        seenUrls.add(ph.url);
        valid.push(ph);
      }
    });

    return valid;
  }, [productPhotos]);

  const handleVaultDelete = useCallback(async (key, idx) => {
    const photos = productPhotos[key] || [];
    const photo = photos[idx];
    if (!photo) return;
    if (window.confirm(`Delete this photo from Vault?`)) {
      // Delete from cloud DB first — prevents poll from restoring it
      await deletePhotoFromCloud(key, photo.url);
      const updated = { ...productPhotos, [key]: photos.filter((_, i) => i !== idx) };
      setProductPhotos(updated);
    }
  }, [productPhotos]);

  const handleVaultUpload = useCallback(async (key, modelTitle, files) => {
    if (!files || files.length === 0) return;
    const existing = productPhotos[key] || [];
    const newPhotos = [...existing];

    setToastMessage(`Uploading ${files.length} photo(s)...`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const angleIdx = existing.length + i;
      try {
        const url = await uploadPhotoToImgBB(file, modelTitle, key);
        newPhotos.push({ url, label: `Photo ${angleIdx + 1}` });
      } catch (e) {
        console.warn('Vault upload error:', e);
        setToastMessage(`⚠️ Upload failed: ${e.message}`);
        setTimeout(() => setToastMessage(''), 4000);
      }
    }

    // Deduplicate photo URLs
    const seenUrls = new Set();
    const uniquePhotos = [];
    newPhotos.forEach(ph => {
      if (ph && ph.url && !seenUrls.has(ph.url)) {
        seenUrls.add(ph.url);
        uniquePhotos.push(ph);
      }
    });

    const updated = { ...productPhotos, [key]: uniquePhotos };
    setProductPhotos(updated);
    savePhotosToCloud(updated);
    setToastMessage(`✅ ${files.length} photo(s) uploaded — visible on all devices!`);
    setTimeout(() => setToastMessage(''), 4000);
  }, [productPhotos]);

  const handleAddPhotos = useCallback(async (p, files) => {
    if (!files || files.length === 0) return;
    const stableId = p.stableId || p.id;
    setPhotoUploading(prev => ({ ...prev, [stableId]: true }));

    const existing = productPhotos[stableId] || [];
    const newPhotos = [...existing];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const angleIdx = existing.length + i;
      try {
        const url = await uploadPhotoToImgBB(file, p.title || p.brand, stableId);
        const label = `Photo ${angleIdx + 1}`;
        newPhotos.push({ url, label });
      } catch (e) {
        console.warn('Photo upload failed:', e);
        setToastMessage(`⚠️ Photo upload failed: ${e.message}`);
        setTimeout(() => setToastMessage(''), 5000);
        setPhotoUploading(prev => ({ ...prev, [stableId]: false }));
        return;
      }
    }

    // Deduplicate photo URLs
    const seenUrls = new Set();
    const uniquePhotos = [];
    newPhotos.forEach(ph => {
      if (ph && ph.url && !seenUrls.has(ph.url)) {
        seenUrls.add(ph.url);
        uniquePhotos.push(ph);
      }
    });

    const updated = { ...productPhotos, [stableId]: uniquePhotos };
    setProductPhotos(updated);
    savePhotosToCloud(updated);
    setActivePhotoIdx(prev => ({ ...prev, [stableId]: uniquePhotos.length - 1 }));
    setPhotoUploading(prev => ({ ...prev, [stableId]: false }));
  }, [productPhotos]);











  const handleDeletePhoto = useCallback(async (p, idx) => {
    const stableId = p.stableId || p.id;
    const photos = productPhotos[stableId] || [];
    const photo = photos[idx];
    if (!photo) return;
    // Delete from cloud DB FIRST so poll doesn't restore it
    await deletePhotoFromCloud(stableId, photo.url);
    const updated = { ...productPhotos, [stableId]: photos.filter((_, i) => i !== idx) };
    setProductPhotos(updated);
    setActivePhotoIdx(prev => ({
      ...prev,
      [stableId]: Math.max(0, (prev[stableId] || 0) - 1)
    }));
  }, [productPhotos]);

  const handleAddDriveLink = useCallback((p) => {
    const inputUrl = prompt('Paste Google Drive (or direct photo) link:');
    if (!inputUrl || !inputUrl.trim()) return;
    const directUrl = getDriveDirectImageUrl(inputUrl.trim());
    if (!directUrl) {
      alert('Invalid URL. Please paste a valid Google Drive or image link.');
      return;
    }
    const stableId = p.stableId || p.id;
    const existing = productPhotos[stableId] || [];
    const newPhotos = [...existing, { url: directUrl, label: `Drive Angle ${existing.length + 1}` }];
    const updated = { ...productPhotos, [stableId]: newPhotos };
    saveProductPhotos(updated);
    setActivePhotoIdx(prev => ({ ...prev, [stableId]: newPhotos.length - 1 }));
    setToastMessage('✅ Google Drive photo attached to laptop!');
    setTimeout(() => setToastMessage(''), 3000);
  }, [productPhotos, saveProductPhotos]);

  // Smart Share: Mobile = navigator.share all photos + text. PC = clipboard or download.
  const handleSmartShare = useCallback(async (p) => {
    const stableId = p.stableId || p.id;
    const photos = getPhotos(stableId, p);

    const quoteText = p.rawText || `*💻 ${p.title}*\n  Processor – ${p.processor} ${p.gen ? `(${p.gen})` : ''}\n  RAM – ${p.ram} GB\n  Storage – ${p.storage} GB SSD\n  Display – ${p.display}\n  OS – ${p.os}\n  Charger.\n*Offer Price @${p.offerPrice}/- AED💰*`;

    setSharingId(stableId);

    try {
      // ── MOBILE: native Share Sheet with ALL photos ──
      if (isMobileShareSupported && photos.length > 0) {
        const files = await Promise.all(
          photos.map(async (ph, i) => {
            const blob = await urlToBlob(ph.url);
            return new File([blob], `${(p.title || 'laptop').replace(/[^a-z0-9]/gi, '_')}_photo_${i + 1}.jpg`, { type: 'image/jpeg' });
          })
        );
        await navigator.share({ title: p.title, text: quoteText, files });
        setToastMessage(`✅ Shared ${photos.length} photo(s) to WhatsApp!`);
        setTimeout(() => setToastMessage(''), 3000);
        return;
      }

      // ── MOBILE: no photos, just share text ──
      if (isMobileShareSupported && photos.length === 0) {
        await navigator.share({ title: p.title, text: quoteText });
        setToastMessage('✅ Text quote shared!');
        setTimeout(() => setToastMessage(''), 3000);
        return;
      }

      // ── PC: 1 photo → copy ACTUAL IMAGE FILE + text quote to clipboard ──
      if (photos.length === 1) {
        let pngBlob;
        try {
          pngBlob = await fetchDriveImageBlob(photos[0].url);
        } catch {
          const blob = await urlToBlob(photos[0].url);
          pngBlob = blob.type === 'image/png' ? blob : await convertToPng(blob);
        }

        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': pngBlob,
            'text/plain': new Blob([quoteText], { type: 'text/plain' })
          })
        ]);
        setToastMessage('✅ Real Photo + Text Quote copied! Press Ctrl+V in WhatsApp Web to paste.');
        setTimeout(() => setToastMessage(''), 4500);
        return;
      }

      // ── PC: 2+ photos → copy text + download all photo files for drag & drop ──
      if (photos.length > 1) {
        await navigator.clipboard.writeText(quoteText);
        for (let i = 0; i < photos.length; i++) {
          const blob = await urlToBlob(photos[i].url);
          const objUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = objUrl;
          a.download = `${(p.title || 'laptop').replace(/[^a-z0-9]/gi, '_')}_photo_${i + 1}.jpg`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(objUrl);
          await new Promise(r => setTimeout(r, 150));
        }
        setToastMessage(`✅ Text copied! ${photos.length} photos downloaded — paste text in WhatsApp Web, then drag & drop photos.`);
        setTimeout(() => setToastMessage(''), 6000);
        return;
      }

      // ── PC: no photos, just copy text ──
      await navigator.clipboard.writeText(quoteText);
      setToastMessage('✅ Text quote copied! Paste in WhatsApp chat.');
      setTimeout(() => setToastMessage(''), 3000);

    } catch (err) {
      console.warn('Share error:', err);
      // Last resort: copy text
      try { await navigator.clipboard.writeText(quoteText); } catch {}
      setToastMessage('✅ Text quote copied! Paste in WhatsApp chat.');
      setTimeout(() => setToastMessage(''), 3000);
    } finally {
      setSharingId(null);
    }
  }, [getPhotos, isMobileShareSupported]);


  // Convert image blob to PNG blob
  const convertToPng = (blob) => new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d').drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(resolve, 'image/png');
    };
    img.src = url;
  });

  // Filter products cleanly with 100% exact spec matching
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const rawLower = (p.rawText || '').toLowerCase();
      const fullText = `${p.title} ${p.processor} ${p.gen} ${p.ram}GB ${p.storage}GB ${p.brand} ${p.gpu} ${p.offerPrice}`.toLowerCase();

      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        if (q === '4gb gpu' || q === '4 gb gpu' || q === '4gb graphics' || q === '4 gb graphics') {
          const has4Gb = p.gpu.toLowerCase().includes('4 gb') || p.gpu.toLowerCase().includes('4gb') || rawLower.includes('4 gb graphics') || rawLower.includes('4 gb') || rawLower.includes('4gb');
          if (!has4Gb) return false;
        } else if (q === '2gb gpu' || q === '2 gb gpu' || q === '2gb graphics' || q === '2 gb graphics') {
          const has2Gb = p.gpu.toLowerCase().includes('2 gb') || p.gpu.toLowerCase().includes('2gb') || rawLower.includes('2 gb graphics') || rawLower.includes('2 gb');
          if (!has2Gb) return false;
        } else if (!fullText.includes(q) && !rawLower.includes(q)) {
          return false;
        }
      }

      // 2. Category / Purpose
      if (selectedCategory !== 'ALL') {
        if (selectedCategory === 'WORKSTATION' && p.category !== 'WORKSTATION') return false;
        if (selectedCategory === 'BUSINESS' && p.category !== 'BUSINESS') return false;
        if (selectedCategory === 'EXECUTIVE' && p.category !== 'EXECUTIVE') return false;
        if (selectedCategory === 'CONVERTIBLE' && p.category !== 'CONVERTIBLE' && !p.is2in1) return false;
      }

      // 3. Brand
      if (selectedBrand !== 'ALL' && p.brand !== selectedBrand) return false;

      // 4. Series / Model Line
      if (selectedSeries !== 'ALL') {
        const sLower = selectedSeries.toLowerCase();
        if (!fullText.includes(sLower) && !rawLower.includes(sLower)) return false;
      }

      // 5. Customer Budget
      if (selectedBudget !== 'ALL') {
        const b = parseInt(selectedBudget, 10);
        if (selectedBudget === '2000+') {
          if (p.offerPrice < 2000) return false;
        } else {
          if (p.offerPrice > b) return false;
        }
      }

      // 6. Processor / CPU
      if (selectedCpu !== 'ALL') {
        const cpuLower = (p.processor || '').toLowerCase() + ' ' + (p.title || '').toLowerCase();
        if (selectedCpu === 'i5' && !cpuLower.includes('i5')) return false;
        if (selectedCpu === 'i7' && !cpuLower.includes('i7')) return false;
        if (selectedCpu === 'Ultra 7' && !cpuLower.includes('ultra')) return false;
      }

      // 7. Generation (Exact Match)
      if (selectedGen !== 'ALL') {
        const targetGen = parseInt(selectedGen, 10);
        const extractedGenNum = parseInt((p.gen || '').replace(/\D/g, ''), 10);
        if (extractedGenNum) {
          if (extractedGenNum !== targetGen) return false;
        } else {
          const genStr = `${targetGen}th`;
          if (!fullText.includes(genStr) && !rawLower.includes(genStr) && !rawLower.includes(`${targetGen} th`)) return false;
        }
      }

      // 8. RAM (Exact Match)
      if (selectedRam !== 'ALL') {
        const ramVal = parseInt(selectedRam, 10);
        if (p.ram !== ramVal) return false;
      }

      // 9. Storage SSD (Exact Match)
      if (selectedStorage !== 'ALL') {
        const storageVal = parseInt(selectedStorage, 10);
        if (p.storage !== storageVal) return false;
      }

      // 10. GPU / Graphics (100% Mathematically Accurate)
      if (selectedGpu !== 'ALL') {
        const gpuText = (p.gpu || '').toLowerCase();
        const is4GbGpu = p.gpuVram === 4 || gpuText.includes('4 gb') || gpuText.includes('4gb') || /\b4\s*gb\s*(graphics|gpu|rtx|vram)\b/i.test(rawLower) || /graphics\s*-\s*4\s*gb/i.test(rawLower) || /gpu\s*-\s*4\s*gb/i.test(rawLower);
        const is2GbGpu = p.gpuVram === 2 || gpuText.includes('2 gb') || gpuText.includes('2gb') || /\b2\s*gb\s*(graphics|gpu|rtx|vram)\b/i.test(rawLower) || /graphics\s*-\s*2\s*gb/i.test(rawLower) || /gpu\s*-\s*2\s*gb/i.test(rawLower);

        if (selectedGpu === '4gb') {
          if (!is4GbGpu) return false;
        } else if (selectedGpu === '2gb') {
          if (!is2GbGpu) return false;
        } else if (selectedGpu === 'dedicated') {
          if (!p.isDedicatedGpu && !is4GbGpu && !is2GbGpu) return false;
        } else if (selectedGpu === 'iris') {
          if (!p.isIrisXe && !gpuText.includes('iris') && !rawLower.includes('iris xe')) return false;
        } else if (selectedGpu === 'integrated') {
          if (p.isDedicatedGpu || is4GbGpu || is2GbGpu) return false;
        }
      }

      // 11. Feature & Screen Size
      if (selectedFeature !== 'ALL') {
        if (selectedFeature === 'touch' && !p.isTouch) return false;
        if (selectedFeature === '2in1' && !p.is2in1) return false;
        if (selectedFeature === '13' && !p.display.includes('13') && !p.display.includes('12')) return false;
        if (selectedFeature === '14' && !p.display.includes('14')) return false;
        if (selectedFeature === '15' && !p.display.includes('15')) return false;
      }

      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedSeries, selectedBudget, selectedBrand, selectedCpu, selectedGen, selectedRam, selectedStorage, selectedGpu, selectedFeature]);



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
    setSelectedSeries('ALL');
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 20, width: '100%', maxWidth: '100vw', overflowX: 'hidden', padding: isMobile ? '0 2px' : '0 8px' }}>
      
      {/* 1. Header Banner & Executive KPI Metrics Bar */}
      <div className="card static card-p-lg" style={{ border: 'var(--border)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-flat)', overflow: 'hidden' }}>
        {/* Top Title & Metrics Row */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: 16, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border-light-color)' }}>
          <div>
            <h2 className="font-display" style={{ fontSize: isMobile ? '1.2rem' : '1.45rem', fontWeight: 900, margin: 0, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>💻</span> WhatsApp Stock Matcher Console
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              Filter Workstations, Business & Executive Laptops — copy clean quotes directly for customer chat.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          {products.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: isMobile ? '100%' : 'auto', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '0.73rem', fontWeight: 800, color: 'var(--green)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)', display: 'inline-block' }}></span>
                <span>Cloud Sync Active</span>
              </div>

              <div style={{ display: 'flex', gap: 12, padding: '8px 14px', background: 'var(--bg)', border: '1px solid var(--border-light-color)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', width: isMobile ? '100%' : 'auto', justifyContent: 'space-between', flexShrink: 0 }}>
                <div>Total Stock: <strong style={{ color: 'var(--purple)', fontSize: '0.95rem' }}>{stats.total}</strong></div>
                <div style={{ borderLeft: '1px solid var(--border-light-color)', paddingLeft: 12 }}>
                  Matched: <strong style={{ color: 'var(--citrus-dark)', fontSize: '0.95rem' }}>{stats.matched}</strong>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-light-color)', paddingLeft: 12 }}>
                  Workstations: <strong style={{ color: 'var(--orange)', fontSize: '0.95rem' }}>{stats.workstationCount}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Toolbar Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', width: '100%' }}>
          {/* Admin Role Toggle Button */}
          {isAdmin ? (
            <button 
              className="btn btn-ghost" 
              style={{ padding: '8px 14px', fontWeight: 900, color: 'var(--green)', border: '1px solid var(--green)', background: 'rgba(34, 197, 94, 0.08)' }}
              onClick={handleLockAdmin}
              title="Click to lock Admin Mode and return to Viewer Mode"
            >
              🟢 Admin Mode (Lock)
            </button>
          ) : (
            <button 
              className="btn btn-ghost" 
              style={{ padding: '8px 14px', fontWeight: 900, color: 'var(--purple)', border: '1px solid var(--purple-soft)', background: 'rgba(124, 58, 237, 0.06)' }}
              onClick={() => setShowAdminPinModal(true)}
              title="Unlock Admin Mode to edit stock, upload photos, or delete items"
            >
              🔐 Admin Access
            </button>
          )}

          {isAdmin && (
            <>
              <button 
                className="btn btn-ghost" 
                style={{ padding: '8px 14px', fontWeight: 800 }}
                onClick={() => { setEditorInput(rawText); setShowModal(true); }}
              >
                <Edit3 size={15} /> {rawText ? 'Edit / Paste List' : 'Paste List'}
              </button>

              <button 
                className="btn btn-ghost" 
                style={{ padding: '8px 12px', fontWeight: 800, color: 'var(--purple)', border: '1px solid var(--purple-soft)', background: 'rgba(124, 58, 237, 0.05)' }}
                onClick={() => setShowVaultModal(true)}
              >
                <Camera size={15} /> Photo Vault ({Object.keys(productPhotos).filter(k => (productPhotos[k] || []).length > 0).length})
              </button>

              <button 
                className="btn btn-ghost" 
                style={{ padding: '8px 12px', fontWeight: 800, color: 'var(--pink)', border: '1px solid var(--pink)', background: 'rgba(236, 72, 153, 0.05)' }}
                onClick={handleClearAllPhotos}
                title="Delete ALL uploaded product photos and clear cache completely"
              >
                <Trash2 size={15} /> Clear All Photos
              </button>
            </>
          )}


          <button 
            className="btn btn-primary" 
            style={{ padding: '8px 18px', fontWeight: 900, marginLeft: isMobile ? 0 : 'auto', width: isMobile ? '100%' : 'auto' }}
            onClick={() => handleCopy(formattedOutputText, 'top-all')}
          >
            {copiedId === 'top-all' ? <Check size={15} /> : <Copy size={15} />}
            <span>{copiedId === 'top-all' ? 'Copied!' : 'Copy Filtered Quotes'}</span>
          </button>
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
              style={{ padding: '12px 28px', fontSize: '0.92rem', fontWeight: 900 }}
              onClick={() => { setEditorInput(rawText); setShowModal(true); }}
            >
              <Edit3 size={16} /> Paste WhatsApp Product List
            </button>
          </div>
        </div>
      ) : (
        /* FULL-WIDTH FILTER & CATALOG CONSOLE */
        <>
          <div className="card static card-p-lg" style={{ border: 'var(--border)', display: 'flex', flexDirection: 'column', gap: 18, width: '100%' }}>
            
            {/* Responsive Filter Console (Clean Mobile 1-Tap Toggle + Desktop 1-Row Bar) */}
            {isMobile ? (
              /* MOBILE MINIMALISTIC FILTER BAR */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                {/* 1. Mobile Search Bar & Quick Chips */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                    <input 
                      type="text" 
                      className="field-input" 
                      placeholder="🔍 Search laptop specs (e.g. i7, 16GB, 4GB GPU)..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{ paddingLeft: 42, paddingRight: 36, fontSize: '0.9rem', height: '44px', width: '100%', borderRadius: '10px' }}
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800 }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Horizontal 1-Tap Quick Filter Chips Bar */}
                  <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                    {[
                      { label: 'ALL', isSelected: selectedBrand === 'ALL' && selectedCategory === 'ALL' && selectedGpu === 'ALL' && selectedCpu === 'ALL', action: () => resetAllFilters() },
                      { label: '🖥️ Workstations', isSelected: selectedCategory === 'WORKSTATION', action: () => setSelectedCategory(selectedCategory === 'WORKSTATION' ? 'ALL' : 'WORKSTATION') },
                      { label: 'DELL', isSelected: selectedBrand === 'DELL', action: () => setSelectedBrand(selectedBrand === 'DELL' ? 'ALL' : 'DELL') },
                      { label: 'HP', isSelected: selectedBrand === 'HP', action: () => setSelectedBrand(selectedBrand === 'HP' ? 'ALL' : 'HP') },
                      { label: 'LENOVO', isSelected: selectedBrand === 'LENOVO', action: () => setSelectedBrand(selectedBrand === 'LENOVO' ? 'ALL' : 'LENOVO') },
                      { label: 'Core i7', isSelected: selectedCpu === 'i7', action: () => setSelectedCpu(selectedCpu === 'i7' ? 'ALL' : 'i7') },
                      { label: '16GB RAM', isSelected: selectedRam === '16', action: () => setSelectedRam(selectedRam === '16' ? 'ALL' : '16') },
                      { label: '🎮 Dedicated GPU', isSelected: selectedGpu === 'dedicated', action: () => setSelectedGpu(selectedGpu === 'dedicated' ? 'ALL' : 'dedicated') },
                      { label: '💰 < 1500 AED', isSelected: selectedBudget === '1500', action: () => setSelectedBudget(selectedBudget === '1500' ? 'ALL' : '1500') },
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={chip.action}
                        style={{
                          flexShrink: 0,
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '0.76rem',
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                          whiteSpace: 'nowrap',
                          border: chip.isSelected ? '2px solid var(--purple)' : '1px solid var(--border-color)',
                          background: chip.isSelected ? 'var(--purple)' : 'var(--bg-card)',
                          color: chip.isSelected ? '#ffffff' : 'var(--text-primary)',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Mobile 1-Tap Filter Action Row */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button 
                    type="button"
                    className="btn btn-primary"
                    style={{ 
                      flex: 1, 
                      height: '42px', 
                      justifyContent: 'space-between', 
                      padding: '0 14px', 
                      fontWeight: 900, 
                      fontSize: '0.85rem',
                      background: (selectedBrand !== 'ALL' || selectedBudget !== 'ALL' || selectedSeries !== 'ALL' || selectedGpu !== 'ALL' || selectedCategory !== 'ALL' || selectedCpu !== 'ALL' || selectedRam !== 'ALL') ? 'var(--purple)' : 'var(--citrus)',
                      color: (selectedBrand !== 'ALL' || selectedBudget !== 'ALL' || selectedSeries !== 'ALL' || selectedGpu !== 'ALL' || selectedCategory !== 'ALL' || selectedCpu !== 'ALL' || selectedRam !== 'ALL') ? '#ffffff' : '#000000'
                    }}
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Filter size={15} />
                      <span>{showMobileFilters ? 'Hide Filters' : '⚡ More Filter Options'}</span>
                    </span>

                    {(selectedBrand !== 'ALL' || selectedBudget !== 'ALL' || selectedSeries !== 'ALL' || selectedGpu !== 'ALL' || selectedCategory !== 'ALL' || selectedCpu !== 'ALL' || selectedRam !== 'ALL') && (
                      <span style={{ background: '#ffffff', color: '#000000', fontSize: '0.68rem', fontWeight: 900, padding: '1px 7px', borderRadius: '10px' }}>
                        Active
                      </span>
                    )}
                    <ChevronDown size={15} style={{ transform: showMobileFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>

                  {(searchQuery || selectedCategory !== 'ALL' || selectedSeries !== 'ALL' || selectedBudget !== 'ALL' || selectedBrand !== 'ALL' || selectedCpu !== 'ALL' || selectedGen !== 'ALL' || selectedRam !== 'ALL' || selectedStorage !== 'ALL' || selectedGpu !== 'ALL' || selectedFeature !== 'ALL') && (
                    <button 
                      className="btn btn-ghost" 
                      style={{ padding: '0 12px', height: '42px', fontSize: '0.78rem', color: 'var(--pink)', fontWeight: 800, whiteSpace: 'nowrap' }}
                      onClick={resetAllFilters}
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* 3. Mobile Collapsible Filter Sheet */}
                <AnimatePresence>
                  {showMobileFilters && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 12, 
                        padding: '14px', 
                        background: 'var(--bg)', 
                        borderRadius: 'var(--radius)', 
                        border: '1px solid var(--border-light-color)',
                        marginTop: 4
                      }}
                    >
                      {/* Brand */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>🏷️ BRAND</label>
                        <div style={{ position: 'relative' }}>
                          <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} style={dropdownStyle(selectedBrand !== 'ALL', 'var(--purple)', '#ffffff')}>
                            <option value="ALL">All Brands</option>
                            <option value="DELL">DELL</option>
                            <option value="HP">HP</option>
                            <option value="LENOVO">LENOVO</option>
                            <option value="SURFACE">MICROSOFT SURFACE</option>
                            <option value="MACBOOK">APPLE MACBOOK</option>
                          </select>
                          <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        </div>
                      </div>

                      {/* Budget */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>💰 MAX BUDGET</label>
                        <div style={{ position: 'relative' }}>
                          <select value={selectedBudget} onChange={e => setSelectedBudget(e.target.value)} style={dropdownStyle(selectedBudget !== 'ALL', 'var(--citrus)', '#000000')}>
                            <option value="ALL">All Prices</option>
                            <option value="500">Under 500 AED</option>
                            <option value="1000">Under 1000 AED</option>
                            <option value="1500">Under 1500 AED</option>
                            <option value="2000">Under 2000 AED</option>
                            <option value="2000+">2000+ AED</option>
                          </select>
                          <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        </div>
                      </div>

                      {/* Model Series */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>💻 MODEL SERIES</label>
                        <div style={{ position: 'relative' }}>
                          <select value={selectedSeries} onChange={e => setSelectedSeries(e.target.value)} style={dropdownStyle(selectedSeries !== 'ALL', 'var(--cyan)', '#000000')}>
                            <option value="ALL">All Series</option>
                            <option value="Latitude">Dell Latitude</option>
                            <option value="Precision">Dell Precision</option>
                            <option value="Vostro">Dell Vostro</option>
                            <option value="Elite">HP EliteBook</option>
                            <option value="Spectre">HP Spectre</option>
                            <option value="ThinkPad">Lenovo ThinkPad</option>
                            <option value="IdeaPad">Lenovo IdeaPad</option>
                            <option value="Surface">Surface</option>
                            <option value="MacBook">MacBook</option>
                          </select>
                          <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        </div>
                      </div>

                      {/* GPU / Graphics */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>🎮 GRAPHICS & GPU</label>
                        <div style={{ position: 'relative' }}>
                          <select value={selectedGpu} onChange={e => setSelectedGpu(e.target.value)} style={dropdownStyle(selectedGpu !== 'ALL', 'var(--orange)', '#ffffff')}>
                            <option value="ALL">Any Graphics</option>
                            <option value="dedicated">🎮 Dedicated GPU (2GB & 4GB)</option>
                            <option value="4gb">🔥 4GB Dedicated</option>
                            <option value="2gb">⚡ 2GB Dedicated</option>
                            <option value="iris">💻 Intel Iris Xe</option>
                          </select>
                          <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        </div>
                      </div>

                      {/* Memory RAM & SSD Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>💾 RAM</label>
                          <select value={selectedRam} onChange={e => setSelectedRam(e.target.value)} style={dropdownStyle(selectedRam !== 'ALL', 'var(--pink)', '#ffffff')}>
                            <option value="ALL">Any RAM</option>
                            <option value="4">4 GB</option>
                            <option value="8">8 GB</option>
                            <option value="16">16 GB</option>
                            <option value="32">32 GB</option>
                          </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>💿 SSD</label>
                          <select value={selectedStorage} onChange={e => setSelectedStorage(e.target.value)} style={dropdownStyle(selectedStorage !== 'ALL', 'var(--purple)', '#ffffff')}>
                            <option value="ALL">Any SSD</option>
                            <option value="32">32 GB</option>
                            <option value="256">256 GB</option>
                            <option value="512">512 GB</option>
                          </select>
                        </div>
                      </div>

                      {/* CPU & Generation Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>⚡ CPU</label>
                          <select value={selectedCpu} onChange={e => setSelectedCpu(e.target.value)} style={dropdownStyle(selectedCpu !== 'ALL', 'var(--cyan)', '#000000')}>
                            <option value="ALL">Any CPU</option>
                            <option value="i5">Core i5</option>
                            <option value="i7">Core i7</option>
                            <option value="Ultra 7">Ultra 7</option>
                          </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>🎓 GEN</label>
                          <select value={selectedGen} onChange={e => setSelectedGen(e.target.value)} style={dropdownStyle(selectedGen !== 'ALL', 'var(--green)', '#000000')}>
                            <option value="ALL">Any Gen</option>
                            <option value="4">4th Gen</option>
                            <option value="8">8th Gen</option>
                            <option value="10">10th Gen</option>
                            <option value="11">11th Gen</option>
                            <option value="12">12th Gen</option>
                            <option value="13">13th Gen</option>
                          </select>
                        </div>
                      </div>

                      <button 
                        type="button"
                        className="btn btn-primary"
                        style={{ height: '42px', fontWeight: 900, justifyContent: 'center', marginTop: 6 }}
                        onClick={() => setShowMobileFilters(false)}
                      >
                        ✓ Done & View {filteredProducts.length} Laptops
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* DESKTOP 1-ROW MINIMALISTIC BAR */
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'nowrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                  <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                  <input 
                    type="text" 
                    className="field-input" 
                    placeholder="🔍 Type customer specs (e.g. Precision, i7, 16GB RAM, 4GB GPU, 512GB SSD)..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: 46, paddingRight: 40, fontSize: '0.94rem', height: '44px', width: '100%' }}
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

                <div style={{ position: 'relative', width: '150px' }}>
                  <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} style={dropdownStyle(selectedBrand !== 'ALL', 'var(--purple)', '#ffffff')}>
                    <option value="ALL">🏷️ All Brands</option>
                    <option value="DELL">DELL</option>
                    <option value="HP">HP</option>
                    <option value="LENOVO">LENOVO</option>
                    <option value="SURFACE">MICROSOFT</option>
                    <option value="MACBOOK">APPLE MAC</option>
                  </select>
                  <ChevronDown size={15} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: selectedBrand !== 'ALL' ? '#ffffff' : '#000000' }} />
                </div>

                <div style={{ position: 'relative', width: '150px' }}>
                  <select value={selectedBudget} onChange={e => setSelectedBudget(e.target.value)} style={dropdownStyle(selectedBudget !== 'ALL', 'var(--citrus)', '#000000')}>
                    <option value="ALL">💰 All Prices</option>
                    <option value="500">Under 500 AED</option>
                    <option value="1000">Under 1000 AED</option>
                    <option value="1500">Under 1500 AED</option>
                    <option value="2000">Under 2000 AED</option>
                    <option value="2000+">2000+ AED</option>
                  </select>
                  <ChevronDown size={15} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#000000' }} />
                </div>

                <div style={{ position: 'relative', width: '160px' }}>
                  <select value={selectedSeries} onChange={e => setSelectedSeries(e.target.value)} style={dropdownStyle(selectedSeries !== 'ALL', 'var(--cyan)', '#000000')}>
                    <option value="ALL">💻 All Series</option>
                    <option value="Latitude">Dell Latitude</option>
                    <option value="Precision">Dell Precision</option>
                    <option value="Vostro">Dell Vostro</option>
                    <option value="Elite">HP EliteBook</option>
                    <option value="Spectre">HP Spectre</option>
                    <option value="ThinkPad">Lenovo ThinkPad</option>
                    <option value="IdeaPad">Lenovo IdeaPad</option>
                    <option value="Surface">Surface</option>
                    <option value="MacBook">MacBook</option>
                  </select>
                  <ChevronDown size={15} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#000000' }} />
                </div>

                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{
                    height: '44px',
                    padding: '0 14px',
                    fontWeight: 900,
                    fontSize: '0.82rem',
                    border: showMoreFilters ? '2px solid var(--purple)' : '2px solid var(--border-color)',
                    background: showMoreFilters ? 'var(--purple-soft)' : 'var(--bg-card)',
                    color: showMoreFilters ? 'var(--purple)' : 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                  onClick={() => setShowMoreFilters(!showMoreFilters)}
                >
                  <Filter size={15} />
                  <span>+ More Specs</span>
                  {activeMoreFiltersCount > 0 && (
                    <span style={{ background: 'var(--purple)', color: '#fff', fontSize: '0.68rem', fontWeight: 900, padding: '1px 6px', borderRadius: '10px' }}>
                      {activeMoreFiltersCount}
                    </span>
                  )}
                  <ChevronDown size={14} style={{ transform: showMoreFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {(searchQuery || selectedCategory !== 'ALL' || selectedSeries !== 'ALL' || selectedBudget !== 'ALL' || selectedBrand !== 'ALL' || selectedCpu !== 'ALL' || selectedGen !== 'ALL' || selectedRam !== 'ALL' || selectedStorage !== 'ALL' || selectedGpu !== 'ALL' || selectedFeature !== 'ALL') && (
                  <button 
                    className="btn btn-ghost" 
                    style={{ padding: '0 12px', height: '44px', fontSize: '0.8rem', color: 'var(--pink)', fontWeight: 800, whiteSpace: 'nowrap' }}
                    onClick={resetAllFilters}
                  >
                    Reset
                  </button>
                )}
              </div>
            )}

            {/* Extended Specs Collapsible Drawer for Desktop (+ More Specs) */}
            {!isMobile && (
              <AnimatePresence>
                {showMoreFilters && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                      gap: 14, 
                      paddingTop: 16, 
                      borderTop: '1px solid var(--border-light-color)' 
                    }}
                  >
                    {/* GPU / Graphics */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        🎮 Graphics & GPU
                      </label>
                      <div style={{ position: 'relative', width: '100%' }}>
                        <select value={selectedGpu} onChange={e => setSelectedGpu(e.target.value)} style={dropdownStyle(selectedGpu !== 'ALL', 'var(--orange)', '#ffffff')}>
                          <option value="ALL">Any Graphics</option>
                          <option value="dedicated">🎮 Any Dedicated GPU</option>
                          <option value="4gb">🔥 4GB Dedicated</option>
                          <option value="2gb">⚡ 2GB Dedicated</option>
                          <option value="iris">💻 Intel Iris Xe</option>
                          <option value="integrated">💼 Integrated Only</option>
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: selectedGpu !== 'ALL' ? '#ffffff' : '#000000' }} />
                      </div>
                    </div>

                    {/* Category / Purpose */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        🎯 Category
                      </label>
                      <div style={{ position: 'relative', width: '100%' }}>
                        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={dropdownStyle(selectedCategory !== 'ALL', 'var(--orange)', '#ffffff')}>
                          <option value="ALL">All Categories</option>
                          <option value="WORKSTATION">🖥️ Workstation</option>
                          <option value="BUSINESS">💼 Business</option>
                          <option value="EXECUTIVE">✨ Executive</option>
                          <option value="CONVERTIBLE">🔄 2-in-1 Touch</option>
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: selectedCategory !== 'ALL' ? '#ffffff' : '#000000' }} />
                      </div>
                    </div>

                    {/* Processor */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        ⚡ CPU Processor
                      </label>
                      <div style={{ position: 'relative', width: '100%' }}>
                        <select value={selectedCpu} onChange={e => setSelectedCpu(e.target.value)} style={dropdownStyle(selectedCpu !== 'ALL', 'var(--cyan)', '#000000')}>
                          <option value="ALL">All CPUs</option>
                          <option value="i5">Intel Core i5</option>
                          <option value="i7">Intel Core i7</option>
                          <option value="Ultra 7">Intel Ultra 7</option>
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#000000' }} />
                      </div>
                    </div>

                    {/* Generation */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        🎓 Exact Gen
                      </label>
                      <div style={{ position: 'relative', width: '100%' }}>
                        <select value={selectedGen} onChange={e => setSelectedGen(e.target.value)} style={dropdownStyle(selectedGen !== 'ALL', 'var(--green)', '#000000')}>
                          <option value="ALL">Exact Gen (Any)</option>
                          <option value="4">4th Gen</option>
                          <option value="8">8th Gen</option>
                          <option value="9">9th Gen</option>
                          <option value="10">10th Gen</option>
                          <option value="11">11th Gen</option>
                          <option value="12">12th Gen</option>
                          <option value="13">13th Gen</option>
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#000000' }} />
                      </div>
                    </div>

                    {/* RAM */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        💾 RAM Memory
                      </label>
                      <div style={{ position: 'relative', width: '100%' }}>
                        <select value={selectedRam} onChange={e => setSelectedRam(e.target.value)} style={dropdownStyle(selectedRam !== 'ALL', 'var(--pink)', '#ffffff')}>
                          <option value="ALL">Exact RAM (Any)</option>
                          <option value="4">4 GB RAM</option>
                          <option value="8">8 GB RAM</option>
                          <option value="16">16 GB RAM</option>
                          <option value="32">32 GB RAM</option>
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: selectedRam !== 'ALL' ? '#ffffff' : '#000000' }} />
                      </div>
                    </div>

                    {/* Storage SSD */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        💿 Storage SSD
                      </label>
                      <div style={{ position: 'relative', width: '100%' }}>
                        <select value={selectedStorage} onChange={e => setSelectedStorage(e.target.value)} style={dropdownStyle(selectedStorage !== 'ALL', 'var(--purple)', '#ffffff')}>
                          <option value="ALL">Exact SSD (Any)</option>
                          <option value="32">32 GB Storage</option>
                          <option value="256">256 GB SSD</option>
                          <option value="512">512 GB SSD</option>
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: selectedStorage !== 'ALL' ? '#ffffff' : '#000000' }} />
                      </div>
                    </div>

                    {/* Feature & Display */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        ✨ Feature & Screen
                      </label>
                      <div style={{ position: 'relative', width: '100%' }}>
                        <select value={selectedFeature} onChange={e => setSelectedFeature(e.target.value)} style={dropdownStyle(selectedFeature !== 'ALL', 'var(--citrus)', '#000000')}>
                          <option value="ALL">All Displays</option>
                          <option value="touch">👉 Touchscreen</option>
                          <option value="2in1">🔄 2-in-1 Touch</option>
                          <option value="13">📐 13.3" Screen</option>
                          <option value="14">📐 14" Screen</option>
                          <option value="15">📐 15.6" Screen</option>
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#000000' }} />
                      </div>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
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
                    filteredProducts.map((p, pIdx) => (
                      <motion.div 
                        key={`${p.id}_${pIdx}`}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
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

                        {/* Price Tag */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, paddingTop: 10, borderTop: '1px solid var(--border-light-color)' }}>
                          {p.originalPrice ? (
                            <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                              AED {p.originalPrice}
                            </span>
                          ) : <span />}

                          <div style={{ 
                            fontSize: isMobile ? '0.86rem' : '0.96rem', 
                            fontWeight: 900, 
                            background: 'var(--citrus)',
                            color: '#000000',
                            padding: '5px 10px',
                            borderRadius: 'var(--radius-sm)',
                            border: '2px solid #000'
                          }}>
                            Offer Price @{p.offerPrice}/- AED 💰
                          </div>
                        </div>

                        {/* ── MULTI-ANGLE PHOTO GALLERY ── */}
                        {(() => {
                          const stableId = p.stableId || p.id;
                          const photos = getPhotos(stableId, p);
                          const activeIdx = activePhotoIdx[stableId] || 0;
                          const activePhoto = photos[activeIdx] || null;
                          const isUploading = photoUploading[stableId] || false;

                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                              {/* 1. HERO PHOTO PREVIEW AT TOP OF CARD */}
                              {activePhoto ? (
                                <div
                                  style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border-light-color)', background: '#000', cursor: 'zoom-in', aspectRatio: '16/9' }}
                                  onClick={() => setLightbox({ stableId, idx: activeIdx })}
                                >
                                  <img
                                    src={activePhoto.url}
                                    alt={activePhoto.label}
                                    onError={(e) => {
                                      const src = e?.target?.src;
                                      if (src && src.includes('lh3.googleusercontent.com/d/')) {
                                        const fileId = src.split('/d/')[1]?.split('=')[0];
                                        if (fileId) e.target.src = `https://drive.google.com/uc?export=view&id=${fileId}`;
                                      }
                                    }}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                  />

                                  {/* Floating Top Left Brand Badge */}
                                  <span className={`badge ${
                                    p.brand === 'DELL' ? 'badge-cyan' :
                                    p.brand === 'HP' ? 'badge-purple' :
                                    p.brand === 'LENOVO' ? 'badge-orange' : 'badge-pink'
                                  }`} style={{ position: 'absolute', top: 8, left: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                                    {p.brand}
                                  </span>

                                  {/* Floating Top Right Price Tag */}
                                  <div style={{
                                    position: 'absolute', top: 8, right: 8,
                                    fontSize: '0.82rem', fontWeight: 900,
                                    background: 'var(--citrus)', color: '#000000',
                                    padding: '3px 8px', borderRadius: '6px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.5)', border: '1px solid #000'
                                  }}>
                                    AED {p.offerPrice}/-
                                  </div>

                                  <span style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '0.6rem', fontWeight: 900, padding: '2px 7px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                                    {activeIdx + 1} / {photos.length}
                                  </span>
                                  {/* Prev/Next arrows */}
                                  {photos.length > 1 && (
                                    <>
                                      <button
                                        onClick={e => { e.stopPropagation(); setActivePhotoIdx(prev => ({ ...prev, [stableId]: (activeIdx - 1 + photos.length) % photos.length })); }}
                                        style={{ position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                                      ><ChevronLeft size={14} /></button>
                                      <button
                                        onClick={e => { e.stopPropagation(); setActivePhotoIdx(prev => ({ ...prev, [stableId]: (activeIdx + 1) % photos.length })); }}
                                        style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                                      ><ChevronRight size={14} /></button>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.02)', gap: 6, color: 'var(--text-muted)' }}>
                                  <Camera size={28} strokeWidth={1.5} />
                                  <span style={{ fontSize: '0.73rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>No photos uploaded</span>

                                  {/* Floating Top Left Brand Badge */}
                                  <span className={`badge ${
                                    p.brand === 'DELL' ? 'badge-cyan' :
                                    p.brand === 'HP' ? 'badge-purple' :
                                    p.brand === 'LENOVO' ? 'badge-orange' : 'badge-pink'
                                  }`} style={{ position: 'absolute', top: 8, left: 8 }}>
                                    {p.brand}
                                  </span>

                                  {/* Floating Top Right Price Tag */}
                                  <div style={{
                                    position: 'absolute', top: 8, right: 8,
                                    fontSize: '0.82rem', fontWeight: 900,
                                    background: 'var(--citrus)', color: '#000000',
                                    padding: '3px 8px', borderRadius: '6px', border: '1px solid #000'
                                  }}>
                                    AED {p.offerPrice}/-
                                  </div>
                                </div>
                              )}

                              {/* Thumbnail Strip */}
                              {photos.length > 0 && (
                                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
                                  {photos.map((ph, i) => (
                                    <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                                      <img
                                        src={ph.url}
                                        alt={ph.label}
                                        onClick={() => setActivePhotoIdx(prev => ({ ...prev, [stableId]: i }))}
                                        style={{
                                          width: 52, height: 38, objectFit: 'cover', borderRadius: 6, cursor: 'pointer',
                                          border: activeIdx === i ? '2px solid var(--purple)' : '1px solid var(--border-light-color)',
                                          opacity: activeIdx === i ? 1 : 0.65, transition: 'all 0.15s'
                                        }}
                                      />
                                      {isAdmin && (
                                        <button
                                          onClick={() => handleDeletePhoto(p, i)}
                                          style={{ position: 'absolute', top: -5, right: -5, background: 'var(--pink)', border: 'none', color: '#fff', borderRadius: '50%', width: 16, height: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: '0.6rem', fontWeight: 900 }}
                                          title="Delete this photo"
                                        >✕</button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* 2. LAPTOP TITLE & CATEGORY BADGE */}
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                  <h3 style={{ margin: 0, fontSize: isMobile ? '1.02rem' : '1.1rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span>💻</span> {p.title}
                                  </h3>
                                </div>

                                {/* 3. COMPACT MINIMALIST SPEC TAG PILLS */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                                  <span style={{ fontSize: '0.74rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--cyan)', border: '1px solid rgba(6, 182, 212, 0.2)', fontFamily: 'var(--font-mono)' }}>
                                    ⚡ {p.processor} {p.gen ? `(${p.gen})` : ''}
                                  </span>

                                  <span style={{ fontSize: '0.74rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: 'rgba(236, 72, 153, 0.1)', color: 'var(--pink)', border: '1px solid rgba(236, 72, 153, 0.2)', fontFamily: 'var(--font-mono)' }}>
                                    💾 {p.ram} GB RAM
                                  </span>

                                  <span style={{ fontSize: '0.74rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--purple)', border: '1px solid rgba(124, 58, 237, 0.2)', fontFamily: 'var(--font-mono)' }}>
                                    💿 {p.storage} GB SSD
                                  </span>

                                  {p.gpu && (
                                    <span style={{ fontSize: '0.74rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: p.isDedicatedGpu ? 'rgba(249, 115, 22, 0.12)' : 'var(--bg)', color: p.isDedicatedGpu ? 'var(--orange)' : 'var(--text-secondary)', border: '1px solid var(--border-light-color)', fontFamily: 'var(--font-mono)' }}>
                                      🎮 {p.gpu}
                                    </span>
                                  )}

                                  <span style={{ fontSize: '0.74rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border-light-color)', fontFamily: 'var(--font-mono)' }}>
                                    📐 {p.display}
                                  </span>
                                </div>
                              </div>

                              {/* Photo Upload (Admin Only) */}
                              {isAdmin && (
                                <label style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                  padding: '8px 0', border: '1.5px dashed var(--purple-soft)', borderRadius: 'var(--radius-sm)',
                                  cursor: isUploading ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 800,
                                  color: 'var(--purple)', background: 'rgba(124, 58, 237, 0.04)',
                                  opacity: isUploading ? 0.7 : 1, transition: 'all 0.15s', width: '100%'
                                }}>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    style={{ display: 'none' }}
                                    disabled={isUploading}
                                    onChange={e => e.target.files && handleAddPhotos(p, Array.from(e.target.files))}
                                  />
                                  <ImagePlus size={15} />
                                  {isUploading ? 'Uploading to Drive...' : photos.length === 0 ? '📷 Add Photos' : `📷 Add More (${photos.length})`}
                                </label>
                              )}

                              {/* 4. DUAL ACTION BUTTONS (Copy Text & Share) */}
                              <div style={{ display: 'flex', gap: 8, width: '100%', marginTop: 2 }}>
                                <button 
                                  className="btn btn-primary" 
                                  style={{ 
                                    flex: 1, 
                                    fontSize: '0.83rem', 
                                    fontWeight: 900,
                                    justifyContent: 'center',
                                    background: copiedId === p.id ? 'var(--green)' : 'var(--citrus)',
                                    color: '#000000',
                                    padding: '10px 8px',
                                    borderRadius: '8px'
                                  }}
                                  onClick={() => handleCopy(p.rawText, p.id)}
                                >
                                  {copiedId === p.id ? <Check size={15} /> : <Copy size={15} />}
                                  <span>{copiedId === p.id ? 'Copied!' : '📋 Copy Text'}</span>
                                </button>

                                <button
                                  className="btn btn-secondary"
                                  style={{
                                    flex: 1,
                                    padding: '10px 12px',
                                    fontSize: '0.83rem',
                                    fontWeight: 900,
                                    justifyContent: 'center',
                                    borderRadius: '8px',
                                    opacity: sharingId === (p.stableId || p.id) ? 0.7 : 1
                                  }}
                                  disabled={sharingId === (p.stableId || p.id)}
                                  onClick={() => handleSmartShare(p)}
                                >
                                  {sharingId === (p.stableId || p.id) ? (
                                    <span>⏳</span>
                                  ) : isMobileShareSupported ? (
                                    <Share2 size={15} />
                                  ) : (
                                    <Copy size={15} />
                                  )}
                                  <span>
                                    {sharingId === (p.stableId || p.id)
                                      ? 'Sharing...'
                                      : isMobileShareSupported
                                        ? photos.length > 0 ? `📲 Share ${photos.length} Photo${photos.length > 1 ? 's' : ''}` : '📲 Share'
                                        : photos.length === 1
                                          ? '📋 Copy Photo + Text'
                                          : photos.length > 1
                                            ? `📋 Copy + ${photos.length} Photos`
                                            : '📋 Copy'}
                                  </span>
                                </button>
                              </div>

                              {/* Admin Single Item Action Bar */}
                              {isAdmin && (
                                <div style={{ display: 'flex', gap: 6, width: '100%', marginTop: 2 }}>
                                  <button
                                    onClick={() => handleOpenEditProduct(p)}
                                    style={{
                                      flex: 1, padding: '6px 8px', background: 'rgba(6, 182, 212, 0.08)',
                                      color: 'var(--cyan)', border: '1px solid var(--cyan)', borderRadius: 'var(--radius-sm)',
                                      fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
                                    }}
                                  >
                                    <Edit3 size={13} /> Edit Item
                                  </button>

                                  <button
                                    onClick={() => handleDeleteSingleProduct(p)}
                                    style={{
                                      padding: '6px 10px', background: 'rgba(236, 72, 153, 0.08)',
                                      color: 'var(--pink)', border: '1px solid var(--pink)', borderRadius: 'var(--radius-sm)',
                                      fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
                                    }}
                                  >
                                    <Trash2 size={13} /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })()}
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
      {/* ── STICKY MOBILE BOTTOM FLOATING ACTION BAR ── */}
      {isMobile && products.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--bg-card)',
          borderTop: '2px solid var(--border-color)',
          padding: '10px 14px',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          gap: 10,
          zIndex: 9999
        }}>
          <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
            <span style={{ color: 'var(--text-muted)' }}>Stock:</span>{' '}
            <strong style={{ color: 'var(--citrus-dark)' }}>{stats.matched}</strong> / {stats.total}
          </div>

          <button
            className="btn btn-primary"
            style={{
              flex: 1,
              maxWidth: '220px',
              padding: '10px 12px',
              fontWeight: 900,
              fontSize: '0.82rem',
              justifyContent: 'center',
              background: 'var(--citrus)',
              color: '#000000'
            }}
            onClick={() => handleCopy(formattedOutputText, 'mobile-bottom')}
          >
            {copiedId === 'mobile-bottom' ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedId === 'mobile-bottom' ? 'Copied Quotes!' : '📋 Copy All Quotes'}</span>
          </button>
        </div>
      )}

      {/* ── LIGHTBOX OVERLAY ── */}
      <AnimatePresence>
        {lightbox && (() => {
          const photos = getPhotos(lightbox.stableId);
          const photo = photos[lightbox.idx];
          if (!photo) return null;
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.92)',
                backdropFilter: 'blur(8px)',
                zIndex: 99999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: 12, padding: 16
              }}
              onClick={() => setLightbox(null)}
            >
              {/* Close */}
              <button
                onClick={() => setLightbox(null)}
                style={{ position: 'absolute', top: 16, right: 20, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >✕</button>

              {/* Image */}
              <motion.img
                key={lightbox.idx}
                initial={{ scale: 0.93, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.93, opacity: 0 }}
                src={photo.url}
                alt={photo.label}
                onClick={e => e.stopPropagation()}
                style={{ maxWidth: '95vw', maxHeight: '78vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 8px 60px rgba(0,0,0,0.8)' }}
              />

              {/* Label + Counter */}
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: 1 }}>
                {photo.label} — {lightbox.idx + 1} / {photos.length}
              </div>

              {/* Prev/Next */}
              {photos.length > 1 && (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={e => { e.stopPropagation(); setLightbox(prev => ({ ...prev, idx: (prev.idx - 1 + photos.length) % photos.length })); }}
                    style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontWeight: 900, fontSize: '1rem' }}
                  >← Prev</button>
                  <button
                    onClick={e => { e.stopPropagation(); setLightbox(prev => ({ ...prev, idx: (prev.idx + 1) % photos.length })); }}
                    style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontWeight: 900, fontSize: '1rem' }}
                  >Next →</button>
                </div>
              )}

              {/* Thumbnail row */}
              {photos.length > 1 && (
                <div style={{ display: 'flex', gap: 8 }}>
                  {photos.map((ph, i) => (
                    <img
                      key={i}
                      src={ph.url}
                      alt={ph.label}
                      onClick={e => { e.stopPropagation(); setLightbox(prev => ({ ...prev, idx: i })); }}
                      style={{ width: 52, height: 38, objectFit: 'cover', borderRadius: 4, cursor: 'pointer', border: lightbox.idx === i ? '2px solid #fff' : '2px solid rgba(255,255,255,0.2)', opacity: lightbox.idx === i ? 1 : 0.55, transition: 'all 0.15s' }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ── PHOTO VAULT LIBRARY MODAL ── */}
      <AnimatePresence>
        {showVaultModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)',
              zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
            }}
            onClick={() => setShowVaultModal(false)}
          >
            <motion.div
              initial={{ scale: 0.94 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.94 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--bg-card)', width: '100%', maxWidth: 720, maxHeight: '85vh',
                borderRadius: 14, border: '2px solid var(--border-color)', display: 'flex',
                flexDirection: 'column', overflow: 'hidden', boxShadow: '0 12px 48px rgba(0,0,0,0.5)'
              }}
            >
              {/* Vault Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>📸</span> Product Photo Vault
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    High-speed ImgBB CDN hosting — zero logins required! Photos auto-link when you paste laptop quotes!
                  </p>
                </div>
                <button onClick={() => setShowVaultModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Action Banner */}
              <div style={{ padding: '10px 20px', background: 'rgba(124, 58, 237, 0.06)', borderBottom: '1px solid var(--border-light-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--purple)', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                  ⚡ Free ImgBB Storage: Permanent high-resolution image links
                </div>
                <button
                  onClick={handleClearAllPhotos}
                  style={{ padding: '4px 10px', background: 'rgba(236, 72, 153, 0.15)', color: 'var(--pink)', border: '1px solid var(--pink)', borderRadius: 6, fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Trash2 size={13} /> Clear All Photos
                </button>
              </div>

              {/* Search Bar */}
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-light-color)', background: 'var(--bg-card)' }}>
                <input
                  type="text"
                  placeholder="Search vault photo albums by model name (e.g. 5310, T14, ZBook)..."
                  value={vaultSearch}
                  onChange={e => setVaultSearch(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    border: '1px solid var(--border-color)', background: 'var(--bg)',
                    color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.84rem'
                  }}
                />
              </div>

              {/* Album List Grid */}
              <div style={{ padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
                {(() => {
                  const keys = Object.keys(productPhotos).filter(k => {
                    const list = productPhotos[k] || [];
                    if (list.length === 0) return false;
                    if (!vaultSearch.trim()) return true;
                    return k.toLowerCase().includes(vaultSearch.toLowerCase().replace(/[^a-z0-9]/g, ''));
                  });

                  if (keys.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                        No saved photo albums matching "{vaultSearch}".
                      </div>
                    );
                  }

                  return keys.map(k => {
                    const photos = productPhotos[k] || [];
                    const modelName = k.replace(/^prod_/, '').replace(/_/g, ' ').toUpperCase();

                    return (
                      <div key={k} style={{ padding: 14, borderRadius: 10, border: '1px solid var(--border-light-color)', background: 'var(--bg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                          <span style={{ fontWeight: 900, fontSize: '0.88rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                            💻 {modelName}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: '0.72rem', background: 'var(--purple-soft)', color: 'var(--purple)', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>
                              {photos.length} Drive Photos
                            </span>
                            {isAdmin && (
                              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--purple)', border: '1px solid var(--purple-soft)', borderRadius: 6, fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}>
                                <ImagePlus size={13} /> Add Photos
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  style={{ display: 'none' }}
                                  onChange={e => {
                                    if (e.target.files && e.target.files.length > 0) {
                                      handleVaultUpload(k, modelName, Array.from(e.target.files));
                                    }
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        </div>

                        {/* Thumbnails with 1-click Delete button */}
                        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                          {photos.map((ph, i) => (
                            <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                              <img
                                src={ph.url}
                                alt={ph.label}
                                style={{ width: 72, height: 54, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border-color)', display: 'block' }}
                              />
                              {isAdmin && (
                                <button
                                  onClick={() => handleVaultDelete(k, i)}
                                  style={{
                                    position: 'absolute', top: -6, right: -6,
                                    background: 'var(--pink)', color: '#fff', border: 'none',
                                    borderRadius: '50%', width: 20, height: 20,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                                  }}
                                  title="Delete photo from Vault"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                    );
                  });
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LIVE MASTER STAFF APPROVAL MODAL ── */}
      <AnimatePresence>
        {showApprovalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)',
              zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
            }}
            onClick={() => setShowApprovalModal(false)}
          >
            <motion.div
              initial={{ scale: 0.94 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.94 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--bg-card)', width: '100%', maxWidth: 640, maxHeight: '85vh',
                borderRadius: 14, border: '2px solid var(--border-color)', display: 'flex',
                flexDirection: 'column', overflow: 'hidden', boxShadow: '0 12px 48px rgba(0,0,0,0.5)'
              }}
            >
              {/* Modal Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>👥</span> Staff Access Approval Console
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    Approve staff members to grant them Admin photo upload permissions into your Master Drive!
                  </p>
                </div>
                <button onClick={() => setShowApprovalModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
                
                {/* 1. Pending Access Requests */}
                <div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.86rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--orange)', textTransform: 'uppercase' }}>
                    ⏳ Pending Access Requests ({(adminRequests.pending || []).length})
                  </h4>
                  {(adminRequests.pending || []).length === 0 ? (
                    <div style={{ padding: '12px 14px', background: 'var(--bg)', borderRadius: 8, fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      No pending staff requests right now.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(adminRequests.pending || []).map((req, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border-light-color)' }}>
                          <div>
                            <strong style={{ fontSize: '0.88rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{req.email}</strong>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Requested: {req.requestedAt}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => handleAdminAction('approve', req.email)}
                              style={{ background: 'var(--green)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontWeight: 900, fontSize: '0.76rem', cursor: 'pointer' }}
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => handleAdminAction('reject', req.email)}
                              style={{ background: 'var(--pink)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontWeight: 900, fontSize: '0.76rem', cursor: 'pointer' }}
                            >
                              ❌ Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Approved Staff Emails */}
                <div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.86rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--green)', textTransform: 'uppercase' }}>
                    🟢 Approved Master & Staff Admins ({(adminRequests.approved || []).length})
                  </h4>
                  {(adminRequests.approved || []).length === 0 ? (
                    <div style={{ padding: '12px 14px', background: 'var(--bg)', borderRadius: 8, fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      No approved staff yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(adminRequests.approved || []).map((email, idx) => {
                        const isMasterAccount = email.toLowerCase() === MASTER_EMAIL;
                        return (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border-light-color)' }}>
                            <span style={{ fontSize: '0.88rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>👑</span> {email}
                            </span>
                            {isMasterAccount ? (
                              <span style={{ fontSize: '0.72rem', background: 'rgba(34, 197, 94, 0.15)', color: 'var(--green)', border: '1px solid var(--green)', padding: '3px 10px', borderRadius: 6, fontWeight: 900 }}>
                                Master Owner
                              </span>
                            ) : (
                              <button
                                onClick={() => handleAdminAction('revoke', email)}
                                style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--pink)', padding: '4px 10px', borderRadius: 6, fontWeight: 800, fontSize: '0.72rem', cursor: 'pointer' }}
                              >
                                Revoke Access
                              </button>
                            )}
                          </div>
                        );
                      })}

                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ── ADMIN PASSCODE UNLOCK MODAL ── */}
      <AnimatePresence>
        {showAdminPinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
              zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
            }}
            onClick={() => setShowAdminPinModal(false)}
          >
            <motion.div
              initial={{ scale: 0.94 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.94 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--bg-card)', width: '100%', maxWidth: 420,
                borderRadius: 14, border: '2px solid var(--purple)', padding: 24,
                boxShadow: '0 12px 48px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', gap: 16
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🔐</span> Admin Mode Unlock
                </h3>
                <button onClick={() => setShowAdminPinModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                Enter Admin passcode to unlock stock editing, photo uploads, single item edits, and deletions.
              </p>

              <form onSubmit={handleUnlockAdmin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <input
                  type="password"
                  placeholder="Enter Passcode (Default: 1234)..."
                  value={adminPinInput}
                  onChange={e => setAdminPinInput(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 8,
                    border: '2px solid var(--purple-soft)', background: 'var(--bg)',
                    color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '1rem', textAlign: 'center'
                  }}
                />

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowAdminPinModal(false)}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg)', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '10px 14px', fontWeight: 900, justifyContent: 'center' }}
                  >
                    Unlock Admin
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SINGLE LAPTOP SPEC EDIT MODAL ── */}
      <AnimatePresence>
        {editingProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
              zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
            }}
            onClick={() => setEditingProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.94 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.94 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--bg-card)', width: '100%', maxWidth: 540, maxHeight: '90vh',
                borderRadius: 14, border: '2px solid var(--cyan)', overflow: 'hidden',
                boxShadow: '0 12px 48px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column'
              }}
            >
              {/* Modal Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>✏️</span> Edit Laptop Specs
                </h3>
                <button onClick={() => setEditingProduct(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Form Body */}
              <div style={{ padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>LAPTOP TITLE / MODEL</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg)', color: 'var(--text-primary)', fontWeight: 800 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>PROCESSOR (CPU)</label>
                    <input
                      type="text"
                      value={editForm.processor}
                      onChange={e => setEditForm({ ...editForm, processor: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>GENERATION</label>
                    <input
                      type="text"
                      placeholder="e.g. 10th"
                      value={editForm.gen}
                      onChange={e => setEditForm({ ...editForm, gen: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>RAM (GB)</label>
                    <input
                      type="number"
                      value={editForm.ram}
                      onChange={e => setEditForm({ ...editForm, ram: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>STORAGE (GB SSD)</label>
                    <input
                      type="number"
                      value={editForm.storage}
                      onChange={e => setEditForm({ ...editForm, storage: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>OFFER PRICE (AED)</label>
                    <input
                      type="number"
                      value={editForm.offerPrice}
                      onChange={e => setEditForm({ ...editForm, offerPrice: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--citrus)', background: 'var(--bg)', color: 'var(--text-primary)', fontWeight: 900 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>DISPLAY</label>
                    <input
                      type="text"
                      value={editForm.display}
                      onChange={e => setEditForm({ ...editForm, display: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>GRAPHICS / GPU (OPTIONAL)</label>
                  <input
                    type="text"
                    placeholder="e.g. 4GB Nvidia RTX A2000"
                    value={editForm.gpu}
                    onChange={e => setEditForm({ ...editForm, gpu: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-light-color)', display: 'flex', gap: 10, justifyContent: 'flex-end', background: 'var(--bg)' }}>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg)', fontWeight: 800, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveEditedProduct}
                  style={{ padding: '8px 20px', fontWeight: 900 }}
                >
                  Save Laptop Specs
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOAST NOTIFICATION ── */}


      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            style={{
              position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
              background: 'var(--bg-card)', color: 'var(--text-primary)',
              padding: '12px 22px', borderRadius: 10,
              border: '2px solid var(--green)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
              fontWeight: 800, fontSize: '0.86rem', zIndex: 100000,
              maxWidth: '90vw', textAlign: 'center', whiteSpace: 'pre-wrap'
            }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PENDING VERIFICATION OVERLAY SCREEN ── */}
      <AnimatePresence>
        {pendingVerificationEmail && (
          <motion.div
            key="pending-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 999999,
              background: 'linear-gradient(135deg, #0d0d0d 0%, #0a0a1a 50%, #0d0d0d 100%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '24px'
            }}
          >
            {/* Glowing ring animation */}
            <div style={{ position: 'relative', marginBottom: 36 }}>
              <div style={{
                width: 100, height: 100, borderRadius: '50%',
                border: '3px solid rgba(168, 85, 247, 0.3)',
                borderTopColor: '#a855f7',
                animation: 'spin 1.2s linear infinite',
                position: 'absolute', inset: 0
              }} />
              <div style={{
                width: 100, height: 100, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 38
              }}>
                ⏳
              </div>
            </div>

            <h2 style={{
              margin: '0 0 12px 0', fontSize: '1.6rem', fontWeight: 900,
              fontFamily: 'var(--font-sans, system-ui)', color: '#fff',
              textAlign: 'center', letterSpacing: '-0.5px'
            }}>
              Pending Master Approval
            </h2>
            <p style={{
              margin: '0 0 28px 0', fontSize: '0.95rem', color: 'rgba(255,255,255,0.55)',
              fontFamily: 'var(--font-mono, monospace)', textAlign: 'center', lineHeight: 1.6,
              maxWidth: 440
            }}>
              Your account is under review by the Master Admin.<br />
              You'll be granted access automatically once approved.
            </p>

            {/* Email badge */}
            <div style={{
              background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.35)',
              borderRadius: 10, padding: '10px 22px', marginBottom: 32,
              display: 'flex', alignItems: 'center', gap: 10
            }}>
              <span style={{ fontSize: 18 }}>📧</span>
              <span style={{
                fontSize: '0.9rem', fontWeight: 800, color: '#c084fc',
                fontFamily: 'var(--font-mono, monospace)'
              }}>
                {pendingVerificationEmail}
              </span>
            </div>

            {/* Live checking indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36,
              color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem',
              fontFamily: 'var(--font-mono, monospace)'
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', background: '#22c55e',
                animation: 'pulse 1.5s ease-in-out infinite'
              }} />
              Checking for approval every 5 seconds...
            </div>

            {/* Info box */}
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, padding: '16px 22px', maxWidth: 420, marginBottom: 28, width: '100%'
            }}>
              <p style={{
                margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)',
                fontFamily: 'var(--font-mono, monospace)', lineHeight: 1.7, textAlign: 'center'
              }}>
                📱 Ask <strong style={{ color: 'rgba(255,255,255,0.7)' }}>mahinshanavas1@gmail.com</strong> to open<br />
                the <strong style={{ color: '#a855f7' }}>👥 Staff Approvals</strong> panel and approve your request.
              </p>
            </div>

            {/* Cancel button */}
            <button
              onClick={handleCancelPendingVerification}
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.5)', padding: '9px 24px', borderRadius: 8,
                fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                fontFamily: 'var(--font-mono, monospace)',
                transition: 'all 0.2s'
              }}
            >
              ✕ Cancel & Go Back
            </button>

            {/* Inline keyframes */}
            <style>{`
              @keyframes spin { to { transform: rotate(360deg); } }
              @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

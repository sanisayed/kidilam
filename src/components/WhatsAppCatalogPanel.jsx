import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Copy, Check, Filter, Trash2, Edit3, X, FileUp, Sparkles, ChevronDown, 
  Camera, ImagePlus, ChevronLeft, ChevronRight, Laptop, Cpu, Zap, HardDrive, Layers, 
  Tablet, Tag, Briefcase, MessageCircle, Lock, Unlock, RotateCcw
} from 'lucide-react';
import { urlToBlob } from '../services/supabaseClient';
import { uploadPhotoToImgBB } from '../services/imgbbService';
import { saveCatalogToCloud, fetchCatalogFromCloud, savePhotosToCloud, deletePhotoFromCloud, clearAllPhotosFromCloud } from '../services/catalogSyncService';
import { getApiUrl } from '../config';






/* =========================================================
   LIVE OFFICIAL CATALOG TEMPLATE (16-09-2026 UPDATED)
   ========================================================= */

const DEFAULT_STOCK_CATALOG = `💻 *LAPTOP PRICE LIST 16-09-2026*

*💻 Dell Latitude 5290 2 IN 1*
  Processor – Intel Core i5-8th
  RAM – 8 GB DDR4
  Storage – 256 GB SSD
  Display –  12.5 inch , Touch screen ,HD
  
  Charger.
@~1299/- Aed~
*Offer price @899/- AED* 💰*
━━━━━━━━━━━━━━━
*💻 Dell Latitude 5510*
  Processor – Intel core  i7
  10 th Generation
  RAM – 16 GB RAM  
  Storage – 256 GB SSD
  Display –  13.3 Inch , Touch
  Ports  – USB, HDMI, Audio
  Connectivity -  Wi-Fi & Bluetooth
  Keyboard: Backlit Keyboard 
  GPU - integrated UHD
  OS –  Windows 11 pro
  
  Charger.
Price@~1499/-AED~
*Offer Price @999/- AED💰*
━━━━━━━━━━━━━━━
*💻 Dell Latitude 7410*
  Processor – Intel core  i7
  10 th Generation
  RAM – 16 GB RAM
  Storage – 256 GB SSD
  Display –  14 Inch Full HD 
  Connectivity -  Wi-Fi & Bluetooth
  Ports -  USB, HDMI, LAN & Audio
  Keyboard: Backlit Keyboard 
  GPU -integrated UHD
  OS –  Windows 11 pro
  
  Charger.
Price@~1599/-AED~
**Offer Price @1199/- AED* 💰
━━━━━━━━━━━━━━━
*💻 Dell Latitude 7430*
  Processor – Intel Core i7-12th
  RAM – 32GB DDR4
  Storage – 512 GB SSD
  Display –  14 Inch 
  Connectivity: Wi-Fi & Bluetooth
  Ports - USB-C / Thunderbolt, USB-A, HDMI & Audio Jack
  Keyboard: Backlit Keyboard 
  GPU - Intel®️ Iris Xe Graphics
  OS –  Windows 11 pro
  
  Charger.
@~2099/- Aed~
*Offer price @1799/- AED* 💰
━━━━━━━━━━━━━━━
*💻 Dell Latitude 5420*
  Processor – Intel Core i5-11th
  RAM – 8 GB
  Storage – 256 GB SSD
  Display –  14 inch 
  Connectivity -  Wi-Fi & Bluetooth
  Ports - USB, USB-C/Thunderbolt, HDMI,  Audio
  Keyboard Type: Backlit Keyboard 
  GPU -intel iris xe
  OS –  Windows 11 pro
  
  Charger.
@~1499/- Aed~
*Offer price @1099/- AED* 💰
━━━━━━━━━━━━━━━
*💻 Dell Latitude 5320*
  Processor – Intel Core i7-11th
  RAM – 16GB
  Storage – 256 GB SSD
  Display –  13.3 Inch 
  Connectivity: Wi-Fi & Bluetooth
  Ports -  Ports – USB, HDMI, Audio & USB Type-C
  Keyboard: Backlit Keyboard 
  GPU - Intel®️ Iris Xe Graphics
  OS –  Windows 11 pro
  
  Charger.
@~1499/- Aed~
*Offer price @1199/- AED* 💰
━━━━━━━━━━━━━━━
*💻 Dell Latitude 5320*
  Processor – Intel Core i7-11th
  RAM – 16GB
  Storage – 256 GB SSD
  Display –  13.3 Inch , Touch
  Connectivity: Wi-Fi & Bluetooth
  Ports -  Ports – USB, HDMI, Audio & USB Type-C
  Keyboard: Backlit Keyboard 
  GPU - Intel®️ Iris Xe Graphics
  OS –  Windows 11 pro
  
  Charger.
@~1599/- Aed~
*Offer price @1249/- AED* 💰
━━━━━━━━━━━━━━━
*💻 Dell Latitude 7430*
  Processor – Intel Core i7-12th
  RAM – 16GB DDR4
  Storage – 512 GB SSD
  Display –  14 Inch 
  Connectivity: Wi-Fi & Bluetooth
  Ports - USB-C / Thunderbolt, USB-A, HDMI & Audio Jack
  Keyboard: Backlit Keyboard 
  GPU - Intel®️ Iris Xe Graphics
  OS –  Windows 11 pro
  
  Charger.
@~1999/- Aed~
*Offer price @1699/- AED* 💰
━━━━━━━━━━━━━━━
*💻 Dell Latitude 7430*
  Processor – Intel Core i7-12th
  RAM – 32GB DDR4
  Storage – 512 GB SSD
  Display –  14 Inch 
  Connectivity: Wi-Fi & Bluetooth
  Ports - USB-C / Thunderbolt, USB-A, HDMI & Audio Jack
  Keyboard: Backlit Keyboard 
  GPU - Intel®️ Iris Xe Graphics
  OS –  Windows 11 pro
  
  Charger.
@~2099/- Aed~
*Offer price @1799/- AED* 💰
━━━━━━━━━━━━━━━
*💻 Dell Alienware M17 R2*
Processor – Intel Core i7
9 th Generation
RAM – 16 GB RAM
Storage – 512 GB  SSD
Display – 17  Inch , RGB Keyboard
Graphics -- Nvidia RTX 2070 MAX - Q  8 GB GPU
Connectivity - Wi-Fi & Bluetooth
 GPU - integrated UHD
 Ports -  USB, HDMI, Audio 
OS –  Windows 11 pro
Charger.
  @~3199/- Aed~
 *Offer Price @2799/- AED💰*
━━━━━━━━━━━━━━━
*DELL PRECISION*

*💻 DELL PRECISION 3571*
Processor – Intel Core i5 , 12 th
RAM – 16 GB RAM , DDR5
Storage – 512 GB  SSD
Graphics - Nvidia 4 GB
Display –  15.6 Inch
GPU- Intel iris XE
Keyboard: Full-size keyboard with Numeric Keypad
Connectivity: Wi-Fi 6, Bluetooth
Ports: USB, USB-C/Thunderbolt, HDMI, Audio Combo
OS –  Windows 11 pro
Charger.

  @~2399 AED~/- 
 *Offer Price @1999/- AED💰*
━━━━━━━━━━━━━━━
*HP SERIES*

*💻 HP ELITE X2 1013 G3* 
 Processor – Intel core i5 
 8 th Generation
 RAM – 8 GB RAM
 Storage – 256 GB SSD
 Display –  13.3 inch  , Touch, Detachable keyboard
 Connectivity: Wi-Fi & Bluetooth 
 Ports: USB-C, Thunderbolt, Audio
 GPU- Intel UHD Graphics
 OS –  Windows 11 pro
 Charger.

@~AED1299/-~ 
 *Offer Price @899/- AED💰*
━━━━━━━━━━━━━━━
*💻 HP ELITEBOOK 850 G6* 
 Processor – Intel core i7
 8 th Generation
 RAM – 8 GB RAM
 Storage – 256 GB SSD
 Display –  15.6 inch
 Connectivity: Wi-Fi & Bluetooth 
 Ports: USB-A, USB-C, HDMI & RJ-45
 GPU-  Intel UHD Graphics
 OS –  Windows 11 pro
 Charger.

@~AED1399/-~ 
 *Offer Price @999/- AED💰*
━━━━━━━━━━━━━━━
*💻 HP ZBOOK 14 U G6*
  Processor – Intel core i7 - 8 th
  RAM –16  GB RAM , DDR4
  Storage – 512GB SSD
  Display –  14 Inch 
  Graphics - 4 GB Graphics
  Connectivity: Wi-Fi & Bluetooth 
  Ports: USB-A, USB-C, HDMI & Audio Jack
  Keyboard: Backlit Keyboard 
  GPU- Intel UHD Graphics
  OS –  Windows 11 pro
  Charger.

  @~1799/- AED~
**Offer Price @1499/- AED💰*
━━━━━━━━━━━━━━━
💻 *HP Elitebook 630 G11*
  Processor – Ultra 7
  RAM – 32 GB DDR5
  Storage – 512 GB SSD
  Display –  13.3 Inch
  GPU- Intel iris XE
  Connectivity: Wi-Fi & Bluetooth 
  Ports - USB | USB-C | HDMI | Audio Jack 
  Keyboard -  Backlit Keyboard
  OS –  Windows 11 pro
  Charger.

 @~2999 AED~/-
*Offer Price @2599/- AED* 💰
━━━━━━━━━━━━━━━
💻 *HP ZBOOK FURRY G9*
  Processor – Intelcore i7 , 12 th
  RAM – 16 GB DDR5     
  Storage – 512 GB SSD
  Display –  16 Inch
  GPU- Intel iris XE
  Graphics - 8 GB GPU 
  Connectivity: Wi-Fi & Bluetooth 
  Ports -USB, USB-C / Thunderbolt, HDMI, Audio 
  Keyboard -  Backlit Keyboard
  OS –  Windows 11 pro
  Charger.

 @~3599AED~/-
*Offer Price @3199/- AED* 💰
━━━━━━━━━━━━━━━

*LENOVO THINKPAD SERIES*

*💻 LENOVO THINKPAD T470S*
  Processor – Intel core  i5
  7 th Generation
  RAM – 8 GB 
  Storage – 256 GB SSD
  Display –  14 Inch , HD
  Graphics:  integrated UHD
 Connectivity: Wi-Fi & Bluetooth 
 Ports: USB, USB-C, HDMI, Mini DisplayPort, , Audio, SD Card
 Keyboard: Backlit Keyboard
  OS –  Windows 11 pro
  
  Charger.
 @~AED 999/-~ 
**Offer Price @599/- AED💰*
━━━━━━━━━━━━━━━
*💻 LENOVO THINKPAD T490**
  Processor – Intel core  i7
  8 th Generation
  RAM – 16 GB 
  Storage – 256 GB SSD
  Display –  14 Inch
  Graphics:  integrated UHD
 Connectivity: Wi-Fi & Bluetooth 
 Ports: USB, USB-C/Thunderbolt , HDMI, Audio
 Keyboard: Backlit Keyboard
  OS –  Windows 11 pro
  
  Charger.
 @~AED 1299/-~ 
*Offer Price @999/- AED💰*
━━━━━━━━━━━━━━━
*💻 LENOVO THINKPAD T490*
  Processor – Intel core  i5
  8 th Generation
  RAM – 16 GB 
  Storage – 256 GB SSD
  Display –  14 Inch
  Graphics:  integrated UHD
 Connectivity: Wi-Fi & Bluetooth 
 Ports: USB, USB-C/Thunderbolt , HDMI, Audio
 Keyboard: Backlit Keyboard
  OS –  Windows 11 pro
  
  Charger.
 @~AED 1299/-~ 
*Offer Price @899/- AED💰*
━━━━━━━━━━━━━━━
*💻 LENOVO THINKPAD L15 GEN 1*
  Processor – Intel core  i5
  10 th Generation
  RAM – 8 GB , DDR4
  Storage – 256 GB SSD
  Display –  15.6 Inch
  GPU - integrated UHD
  Connectivity: Wi-Fi & Bluetooth 
  Ports: USB | USB-C | HDMI |  Audio Jack 
  Keyboard: Full-Size Keyboard with Numeric Keypad
  OS –  Windows 11 pro
  
  Charger.
@~AED 1499/-~ 
*Offer Price @1199/- AED💰*
━━━━━━━━━━━━━━━
*💻 LENOVO THINKPAD L13*
  Processor – Intel core  i7
  10 th Generation
  RAM – 16 GB , DDR4
  Storage – 512 GB SSD
  Display –  13.3 Inch
  Graphics:  integrated UHD
 Connectivity: Wi-Fi & Bluetooth 
 Ports: USB | USB-C | HDMI | Audio Jack 
 Keyboard: Backlit Keyboard
  OS –  Windows 11 pro
  
  Charger.
 @~AED 1599/-~ 
*Offer Price @1199/- AED💰*
━━━━━━━━━━━━━━━
💻 *LENOVO THINKPAD X13 YOGA 2 IN 1*
 Processor – Intel Core i5
 10 th Generation
 RAM – 16 GB RAM
 Storage –256 GB  SSD
 Display –  13.3 Inch 
 Connectivity: Wi-Fi & Bluetooth 
 GPU -  Intel iris XE
 Ports:  USB-C,  USB-A, HDMI, Audio Jack, MicroSD Card Reader
 Keyboard: Backlit Keyboard 
OS –  Windows 11 pro
Charger.

 @~AED 1499/-~ 
 *Offer Price @1199/- AED💰*
━━━━━━━━━━━━━━━
*💻 LENOVO THINKPAD T14 GEN 1*
  Processor – Intel core  i7
  10 th Generation
  RAM – 16 GB 
  Storage – 512 GB SSD
  Display –  14 Inch
  Graphics:  integrated UHD
 Connectivity: Wi-Fi & Bluetooth 
 Ports:USB-A, USB-C, HDMI, Audio, microSD
 Keyboard: Backlit Keyboard
  OS –  Windows 11 pro
  
  Charger.
 @~AED 1599/-~ 
*Offer Price @1299/- AED💰*
━━━━━━━━━━━━━━━
*💻 LENOVO THINKPAD T14 GEN2*
  Processor – Intel core  i5
  11 th Generation
  RAM – 16 GB 
  Storage – 512 GB SSD
  Display –  14 Inch
  Graphics:  Intel iris XE
 Connectivity: Wi-Fi & Bluetooth 
 Ports:  USB, USB Type-C, HDMI, Audio
 Keyboard: Backlit Keyboard
  OS –  Windows 11 pro
  
  Charger.
 @~AED 1599/-~ 
**Offer Price @1299/- AED💰*

━━━━━━━━━━━━━━━
💻 *LENOVO THINKPAD T14S*
 Processor – Intel Core i7
 10 th Generation
 RAM – 16 GB RAM , DDR4
 Storage –512 GB  SSD
 Display –  14 Inch 
 Connectivity: Wi-Fi & Bluetooth 
 GPU - integrated UHD
 Ports: USB-A, USB-C/Thunderbolt , HDMI, Audio
 Keyboard: Backlit Keyboard 
OS –  Windows 11 pro
Charger.

 @~AED 1699/-~ 
 *Offer Price @1399/- AED💰*
━━━━━━━━━━━━━━━
*💻 LENOVO THINKPAD T14 GEN2*
  Processor – Intel core  i7
  11 th Generation
  RAM – 16 GB 
  Storage – 512 GB SSD
  Display –  14 Inch
  Graphics:  Intel iris XE
 Connectivity: Wi-Fi & Bluetooth 
 Ports: USB, HDMI, Audio & USB Type-C 
 Keyboard: Backlit Keyboard
  OS –  Windows 11 pro
  
  Charger.
 @~AED 1799/-~ 
*Offer Price @1499/- AED💰*
━━━━━━━━━━━━━━━
*💻 LENOVO THINKPAD X1 CARBON GEN 8**
  Processor – Intel core  i7
  10 th Generation
  RAM – 16 GB , DDR4
  Storage – 512 GB SSD
  GPU - integrated UHD
  Display –  14 Inch
  Connectivity: Wi-Fi & Bluetooth 
  Ports: USB | USB-C / Thunderbolt | HDMI | Audio Jack 
  Keyboard: Backlit Keyboard 
  OS –  Windows 11 pro
  
  Charger.
 @~AED 1899/-~
*Offer Price @1599/- AED💰*
━━━━━━━━━━━━━━━
💻 *LENOVO THINKPAD P14S*
Processor – i7- 10th
RAM – 16 GB RAM , DDR4
Storage –512 GB  SSD
Display –  14
Graphics- 2 GB GPU
GPU - integrated UHD
Connectivity: Wi-Fi & Bluetooth 
 Ports:  USB-A, USB-C, Thunderbolt , HDMI , Audio
 Keyboard: Backlit Keyboard 
OS –  Windows 11 pro
Charger.
 @~AED 1999/-~ 
 **Offer Price @1699/- AED💰*
━━━━━━━━━━━━━━━
*💻 LENOVO THINKPAD P1 GEN 3*
  Processor – Intel core  i7
  10 th Generation
  RAM – 16 GB , DDR4
  Storage – 512 GB SSD
  Display –  15.6 Inch ,touch
  GPU - Intel iris Xe
  Graphics- 4 GB Graphics 
  Connectivity: Wi-Fi & Bluetooth 
  Ports:USB-C, USB-A,HDMI,Mini D
  Keyboard: Full-Size Keyboard with Numeric Keypad
  OS –  Windows 11 pro
  
  Charger.
@~AED 2599/-~ 
*Offer Price @2199/- AED💰*
━━━━━━━━━━━━━━━
*💻 LENOVO THINKPAD X1 CARBON GEN 10**
  Processor – Intel core  i7
  12 th Generation
  RAM – 32 GB , DDR5
  Storage – 512 GB SSD
  GPU - Intel iris Xe
  Display –  14 Inch
  Connectivity: Wi-Fi & Bluetooth 
  Ports:  Thunderbolt 4, USB-A, HDMI & Audio Jack
  Keyboard: Backlit Keyboard 
  OS –  Windows 11 pro
  
  Charger.
 @~AED 2699/-~
*Offer Price @2399/- AED💰*
━━━━━━━━━━━━━━━
*💻 Lenovo ideapad 3 chromebook* 
 4 GB RAM
 32 GB Storage
 12 inch Display
 Connectivity: Wi-Fi & Bluetooth 
 Keyboard: Full-Size Keyboard
 Operating System:  ChromeOS 

Charger
 @~AED 299/-~ 
 *Offer Price @199/- AED💰*
━━━━━━━━━━━━━━━
*MICROSOFT SURFACE MODELS*

*💻 Microsoft Surface pro 7  2 in 1* 
  Processor – Intel Core i5-10th
  RAM – 8 GB
  Storage – 256 GB SSD
  Display –  12.5 Inch Touch  detachable Keyboard
  Connectivity: Wi-Fi & Bluetooth 
  Ports: USB | USB-C | Audio Jack
  GPU - integrated UHD
  OS –  Windows 11 pro
  
  Charger.
@~1399/- Aed~
*Offer price @999/- AED*
━━━━━━━━━━━━━━━
*💻 Microsoft Surface Go 2  2 in 1* 
  Processor – Intel pentium
  RAM – 4 GB
  Storage – 60 GB 
  Display –  10 Inch Touch  detachable Keyboard
  Connectivity: Wi-Fi & Bluetooth 
  Ports: USB-C | Audio Jack 
  OS –  Windows 11 pro
  
  Charger.
@~999/- Aed~
*Offer price @499/- AED*
━━━━━━━━━━━━━━━
 
   *MACBOOK SERIES*

*💻 MacBook A1466  2017**
  Processor –  i5
  RAM – 8 GB
  Storage – 256 GB SSD
  Display - 14 inch
  Connectivity -  Wi-Fi & Bluetooth 
  Ports - USB | Thunderbolt | SD Card Reader | Audio Jack
  OS -  MAC OS

  Charger.
 @~999/- Aed~
*Offer Price @799/- AED*
━━━━━━━━━━━━━━━
*💻 MacBook Pro A2289 2020*
 Processor – Intel Core i5
 RAM – 16GB
 Storage – 256GB SSD
 Display: 13" Retina Display , Touch Bar 
 Graphics: 1.5 GB Graphics
 Connectivity: Wi-Fi & Bluetooth 
 Ports: USB-C / Thunderbolt | Audio Jack 
 Keyboard: Backlit Keyboard
 Operating System: macOS 
 
 Charger.
 @~2399/- Aed~
*Offer Price @1999/- AED*
━━━━━━━━━━━━━━━
*💻 Apple MacBook Pro A2251  , 2020*
  Processor – Intel Core i7
  RAM – 32 GB
  Storage – 1 TB SSD
  Display –  13-Inch Retina Display , Touch bar
  Connectivity -- Wi-Fi & Bluetooth 
  Ports --  USB-C / Thunderbolt | Audio Jack 
  Keyboard: Backlit Keyboard
  OS –  MAC OS
  
  Charger.
   @~2899/- Aed~
 *Offer price @ 2599/- AED 💰*
━━━━━━━━━━━━━━━
*💻 Apple MacBook Pro A2141  , 2019*
  Processor - Intelcore  i7
  RAM – 16 GB
  Storage – 500 GB SSD
  Display –  15.6-Inch
  Graphics - 4 GB GPU, Touchbar
  Connectivity: Wi-Fi & Bluetooth 
  Ports: USB-C / Thunderbolt | Audio Jack 
  Keyboard: Backlit Keyboard
  OS –  MAC OS
  
  Charger.
  @~2399/- Aed~
 *Offer price @ 2099/- AED 💰*
━━━━━━━━━━━━━━━
*💻 Apple MacBook Pro M1 A2338*
 Processor: Apple M1 Chip 
 RAM: 16 GB
 Storage: 256 GB SSD 
 Display: 13" Retina Display , Touch bar
 Graphics: Integrated Apple GPU
 Connectivity: Wi-Fi & Bluetooth 
 Ports: USB-C / Thunderbolt / Audio Jack 
 Keyboard: Backlit Keyboard 
 Operating System: macOS 

 Charger
  @~2899/- Aed~
 *Offer price @ 2599/- AED 💰*
━━━━━━━━━━━━━━━
*💻 Apple MacBook NEO OPEN BOX*
RAM - 8 GB RAM
SSD -512 GB SSD
Display: 13.6" Liquid Retina
Graphics: Integrated Apple GPU
OS: macOS
Under apple warranty 
Cycle count 1

Charger
  @~3399/- Aed~
 *Offer price @ 2999/- AED 💰*`;

/* =========================================================
   TEXT PARSER UTILITIES
   ========================================================= */

function normalizeModelKey(title) {
  if (!title) return 'prod_unknown';
  const clean = title.toLowerCase()
    .replace(/\b\d+\s*(gb|tb|ssd|ram|aed|ghz)\b/gi, '')
    .replace(/\b(i3|i5|i7|i9|ryzen\s*\d*|core\s*ultra|apple|m1|m2|m3)\b/gi, '')
    .replace(/\b\d+(th|st|nd|rd)\s*gen\b/gi, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return 'prod_' + (clean || 'laptop');
}

function getModelFingerprint(str) {
  if (!str) return { brand: '', modelCode: '', gen: '', subFamily: '', isYoga: false, tokens: [] };
  const s = str.toLowerCase().replace(/prod_/, '').replace(/[^a-z0-9]+/g, ' ');
  const tokens = s.split(/\s+/).filter(Boolean);

  let brand = '';
  if (tokens.includes('dell')) brand = 'dell';
  else if (tokens.includes('hp')) brand = 'hp';
  else if (tokens.includes('lenovo') || tokens.includes('thinkpad')) brand = 'lenovo';
  else if (tokens.includes('apple') || tokens.includes('macbook')) brand = 'apple';
  else if (tokens.includes('surface') || tokens.includes('microsoft')) brand = 'microsoft';

  let modelCode = '';
  if (tokens.includes('surface')) {
    if (tokens.includes('pro')) {
      const proIdx = tokens.indexOf('pro');
      const num = tokens[proIdx + 1];
      modelCode = num && /^\d+$/.test(num) ? `surface_pro_${num}` : 'surface_pro';
    } else if (tokens.includes('go')) {
      const goIdx = tokens.indexOf('go');
      const num = tokens[goIdx + 1];
      modelCode = num && /^\d+$/.test(num) ? `surface_go_${num}` : 'surface_go';
    } else if (tokens.includes('laptop')) {
      const lapIdx = tokens.indexOf('laptop');
      const num = tokens[lapIdx + 1];
      modelCode = num && /^\d+$/.test(num) ? `surface_laptop_${num}` : 'surface_laptop';
    } else {
      modelCode = 'surface';
    }
  } else if (tokens.includes('chromebook')) {
    const cbIdx = tokens.indexOf('chromebook');
    const prev = tokens[cbIdx - 1];
    const next = tokens[cbIdx + 1];
    const num = /^\d+$/.test(prev) ? prev : (/^\d+$/.test(next) ? next : '');
    modelCode = num ? `chromebook_${num}` : 'chromebook';
  } else {
    for (const t of tokens) {
      if (/^[a-z]?\d{3,5}[a-z]?$/i.test(t)) {
        modelCode = t;
        break;
      }
      if (/^(t14|t14s|t15|p14s|p1|p15|x13|x1|x2|l15|l14|l13|m17|m15)$/i.test(t)) {
        modelCode = t;
        break;
      }
    }
  }

  let gen = '';
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (/^gen_?\d+$/i.test(t)) {
      gen = t.replace('_', '');
    } else if (t === 'gen' && tokens[i + 1] && /^\d+$/.test(tokens[i + 1])) {
      gen = 'gen' + tokens[i + 1];
    } else if (/^g\d+$/i.test(t)) {
      gen = t;
    } else if (/^r\d+$/i.test(t)) {
      gen = t;
    } else if (/^(2017|2019|2020|2021|2022|2023|2024)$/.test(t)) {
      gen = t;
    }
  }

  let subFamily = '';
  if (tokens.includes('fury') || tokens.includes('furry')) subFamily = 'fury';
  else if (tokens.includes('firefly')) subFamily = 'firefly';
  else if (tokens.includes('studio')) subFamily = 'studio';
  else if (tokens.includes('spectre')) subFamily = 'spectre';
  else if (tokens.includes('carbon')) subFamily = 'carbon';
  else if (tokens.includes('alienware')) subFamily = 'alienware';

  const isYoga = tokens.includes('yoga') || tokens.includes('2in1') || (tokens.includes('2') && tokens.includes('1'));

  return { brand, modelCode, gen, subFamily, isYoga, tokens };
}

function findMatchingAlbumKey(p, productPhotos) {
  if (!p || (!p.title && !p.model) || !productPhotos) return null;
  const stableId = p.stableId || p.id;
  if (productPhotos[stableId] && productPhotos[stableId].length > 0) return stableId;

  const cleanTitle = (p.title || p.model || '').trim();
  const baseKey = normalizeModelKey(cleanTitle);
  const noPrefixBase = baseKey.replace(/^prod_/, '');

  if (productPhotos[baseKey] && productPhotos[baseKey].length > 0) return baseKey;
  if (productPhotos[noPrefixBase] && productPhotos[noPrefixBase].length > 0) return noPrefixBase;

  // Strict signature matching:
  // Must match brand, exact modelCode, subFamily, isYoga, and generation (if either has gen)
  const pFP = getModelFingerprint(cleanTitle + ' ' + (p.gen || ''));
  if (!pFP.modelCode && !pFP.subFamily) return null;

  for (const [key, photos] of Object.entries(productPhotos)) {
    if (!photos || photos.length === 0) continue;
    const kFP = getModelFingerprint(key);

    if (pFP.brand && kFP.brand && pFP.brand !== kFP.brand) continue;
    if (pFP.modelCode && kFP.modelCode !== pFP.modelCode) continue;
    if (pFP.subFamily || kFP.subFamily) {
      if (pFP.subFamily !== kFP.subFamily) continue;
    }
    if (pFP.isYoga !== kFP.isYoga) continue;
    if (pFP.gen || kFP.gen) {
      if (pFP.gen !== kFP.gen) continue;
    }
    return key;
  }
  return null;
}

function parseWhatsAppCatalog(rawText) {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/);
  const products = [];
  
  let currentGroup = 'GENERAL CATALOG';
  let currentBlock = [];

  const finalizeBlock = (blockLines) => {
    if (blockLines.length === 0) return;

    // Filter out pure separator lines like ━━━━━ from block ends/internal
    const cleanLines = blockLines.filter(l => !/^[━─=\-_*#]{4,}$/.test(l.trim()));
    if (cleanLines.length === 0) return;

    // The raw text as pasted, preserving original indentation and internal blank lines:
    let firstNonEmpty = 0;
    while (firstNonEmpty < cleanLines.length && !cleanLines[firstNonEmpty].trim()) {
      firstNonEmpty++;
    }
    let lastNonEmpty = cleanLines.length - 1;
    while (lastNonEmpty >= 0 && !cleanLines[lastNonEmpty].trim()) {
      lastNonEmpty--;
    }
    if (firstNonEmpty > lastNonEmpty) return;

    const fullBlockText = cleanLines.slice(firstNonEmpty, lastNonEmpty + 1).join('\n').trim();
    if (!fullBlockText) return;

    // Title line: line with 💻 or first non-empty line
    let titleLine = cleanLines.slice(firstNonEmpty).find(l => l.includes('💻')) || cleanLines[firstNonEmpty];
    let cleanTitle = titleLine
      .replaceAll('💻', '')
      .replace(/[*•]/gu, '')
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

    cleanLines.slice(firstNonEmpty).forEach(rawL => {
      const l = rawL.trim();
      if (!l) return;

      // Do not treat product title line as a spec line
      if (l === titleLine.trim() || (l.includes('💻') && l.replaceAll('💻', '').replace(/[*•]/gu, '').trim() === cleanTitle)) {
        return;
      }
      const lower = l.toLowerCase();

      // CPU / Processor
      const isExplicitProcessorLine = lower.includes('processor');
      const isCpuKeyword = lower.includes('cpu');
      const isGpuKeywordLine = lower.includes('gpu') || lower.includes('graphics') || lower.includes('rtx') || lower.includes('radeon') || lower.includes('nvidia') || lower.includes('geforce');

      if (!isGpuKeywordLine) {
        const val = l.replace(/^[^–:-]*[–:-]/, '').replace(/\*/g, '').trim();
        const valLower = val.toLowerCase();
        const valHasChip = valLower.includes('core i') || valLower.includes('intelcore') || valLower.includes('ultra') || valLower.includes('ryzen') || valLower.includes('apple m') || valLower.includes('m1') || valLower.includes('pentium') || valLower.includes('celeron') || valLower.includes('i9') || valLower.includes('i7') || valLower.includes('i5') || valLower.includes('i3');
        const currHasChip = processor.toLowerCase().includes('core i') || processor.toLowerCase().includes('ultra') || processor.toLowerCase().includes('ryzen') || processor.toLowerCase().includes('apple') || processor.toLowerCase().includes('m1') || processor.toLowerCase().includes('pentium');

        if (valHasChip) {
          processor = val;
        } else if (isExplicitProcessorLine && !currHasChip) {
          processor = val;
        } else if (!processor && (isCpuKeyword || lower.includes('intel'))) {
          processor = val;
        }
      }

      // Generation extraction (e.g. 7 th Generation, 10 Th, 12 th, 8th Gen, i5-11th)
      if (!lower.includes('display') && !lower.includes('inch') && !lower.includes('screen')) {
        const m = l.match(/(\d+)\s*(?:th|Th|st|nd|rd)?\s*(?:Gen|Generation)/i) || 
                  l.match(/i[3579]\s*-\s*(\d+)/i) || 
                  l.match(/(?:core\s*i[3579]|intelcore\s*i[3579]|i[3579])[\s,-]+(\d{1,2})\s*(?:th|Th)?\b/i) ||
                  l.match(/(\d+)\s*(?:th|Th)\b/i);
        if (m) {
          const num = parseInt(m[1], 10);
          if (num >= 4 && num <= 14) {
            gen = `${num}th Gen`;
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
      if (lower.includes('display') || lower.includes('inch') || lower.includes('screen') || /1\d(?:\.\d)?["”]/.test(l)) {
        display = l.replace(/^[^–:-]*[–:-]/, '').replace(/\*/g, '').trim();
      }

      // Touch & 2in1 (Excluding Touch Bar on MacBooks!)
      const hasTouchBar = lower.includes('touch bar') || lower.includes('touchbar');
      const hasTouchscreen = (lower.includes('touch') && !hasTouchBar) || lower.includes('touchscreen') || lower.includes('detachable');
      const has2in1 = lower.includes('2in1') || lower.includes('2 in 1') || lower.includes('x360') || lower.includes('detachable');

      if (hasTouchscreen) isTouch = true;
      if (has2in1) is2in1 = true;

      // GPU / Graphics
      const isGpuLine = lower.includes('gpu') || lower.includes('graphics') || lower.includes('rtx') || lower.includes('radeon') || lower.includes('nvidia') || lower.includes('geforce') || /\d+\s*gb\s*(graphics|rtx|gtx|gpu)/i.test(lower);
      
      if (isGpuLine) {
        const cleanGpuVal = l.replace(/^[^–:-]*[–:-]/, '').replace(/\*/g, '').trim();
        if (cleanGpuVal && !gpuParts.includes(cleanGpuVal)) {
          // If dedicated GPU, prioritize it at beginning of gpuParts array
          if (/rtx|gtx|nvidia|radeon|geforce|\b[24681216]+\s*gb/i.test(cleanGpuVal)) {
            gpuParts.unshift(cleanGpuVal);
          } else {
            gpuParts.push(cleanGpuVal);
          }
        }

        const vramMatch = l.match(/(?<![\d.])(\d+)\s*gb/i);
        if (vramMatch) {
          const vVal = parseInt(vramMatch[1], 10);
          if (vVal >= 2 && vVal <= 24 && vVal > gpuVram) {
            gpuVram = vVal;
          }
        }
      }

      // OS
      if (lower.includes('os') || lower.includes('operating system') || lower.includes('windows') || lower.includes('macos') || lower.includes('chromeos')) {
        os = l.replace(/^[^–:-]*[–:-]/, '').replace(/\*/g, '').trim();
      }

      // Original Strikethrough Price: @~999/-AED~, @~2699 AED~/- , @~AED 1499/-~, etc.
      if (l.includes('~')) {
        const origMatch = l.match(/@?~?\s*(?:AED\s*)?(\d{3,5})\s*(?:AED)?\/?-?\s*(?:AED)?~?/i);
        if (origMatch) {
          originalPrice = origMatch[1];
        }
      }

      // Offer Price: **Offer Price @699/- AED* 💰, *Offer price @ 2599/- AED 💰*, etc.
      if (lower.includes('offer price') || lower.includes('offerprice') || (lower.includes('@') && !l.includes('~'))) {
        const pMatch = l.match(/(?:offer\s*price|offerprice)[\s\S]*?(?:@\s*)?(?:aed\s*)?(\d{2,5})/i) || 
                      l.match(/@\s*(?:aed\s*)?(\d{2,5})/i) ||
                      l.match(/(\d{2,5})\s*(?:\/-\s*aed|aed)/i);
        if (pMatch) {
          const val = parseInt(pMatch[1], 10);
          if (val >= 99) offerPrice = val;
        }
      }
    });

    const fullGpuText = gpuParts.join(' / ');
    const fullGpuLower = fullGpuText.toLowerCase();
    const rawLowerText = fullBlockText.toLowerCase();

    // Dedicated GPU hardware flag
    const isDedicatedGpu = gpuVram >= 2 || 
      /rtx|gtx|nvidia|radeon|geforce|a3000|a2000|t500|t600/i.test(fullGpuLower) || 
      /graphics\s*-\s*\d+\s*gb/i.test(rawLowerText) || 
      /gpu\s*-\s*\d+\s*gb/i.test(rawLowerText) ||
      /\b[24681216]+\s*gb\s*(graphics|gpu|vram)/i.test(rawLowerText);
    const isIrisXe = (fullGpuLower.includes('iris') || rawLowerText.includes('intel iris')) && !isDedicatedGpu;

    // Brand Identification
    let brand = 'OTHER';
    const titleUpper = cleanTitle.toUpperCase();
    if (titleUpper.includes('DELL') || titleUpper.includes('ALIENWARE')) brand = 'DELL';
    else if (titleUpper.includes('HP') || titleUpper.includes('PROBOOK') || titleUpper.includes('ELITEBOOK') || titleUpper.includes('SPECTRE') || titleUpper.includes('ENVY') || titleUpper.includes('ZBOOK')) brand = 'HP';
    else if (titleUpper.includes('LENOVO') || titleUpper.includes('THINKPAD') || titleUpper.includes('IDEAPAD')) brand = 'LENOVO';
    else if (titleUpper.includes('MICROSOFT') || titleUpper.includes('SURFACE')) brand = 'SURFACE';
    else if (titleUpper.includes('MACBOOK') || titleUpper.includes('APPLE')) brand = 'MACBOOK';

    // Laptop Category Classification
    let category = 'BUSINESS';
    const textLower = (cleanTitle + ' ' + fullBlockText).toLowerCase();
    if (textLower.includes('precision') || textLower.includes('zbook') || textLower.includes('p14s') || textLower.includes('alienware') || (textLower.includes('g5') && isDedicatedGpu) || isDedicatedGpu) {
      category = 'WORKSTATION';
    } else if (textLower.includes('spectre') || textLower.includes('envy') || textLower.includes('x1 carbon') || brand === 'MACBOOK' || (brand === 'SURFACE' && !is2in1)) {
      category = 'EXECUTIVE';
    } else if (is2in1 || isTouch) {
      category = 'CONVERTIBLE';
    }

    // Smart Fallbacks for Processor & OS
    if (!processor) {
      if (brand === 'MACBOOK') processor = cleanTitle.includes('M1') ? 'Apple M1 Chip' : 'Apple Silicon';
      else if (textLower.includes('chromebook')) processor = 'Chromebook Processor';
      else processor = 'Intel Processor';
    }
    if (!os) {
      if (brand === 'MACBOOK') os = 'macOS';
      else if (textLower.includes('chromebook')) os = 'ChromeOS';
      else os = 'Windows 11 Pro';
    }

    // Clean display processor: strip trailing gen suffixes like ", 11th", "-8th", "- 8 th", ", 12 th", ", 10 Th"
    const displayProcessor = processor
      .replace(/[,–-]\s*\d+\s*(?:th|Th|st|nd|rd)\s*(?:gen|generation)?\s*$/i, '')
      .replace(/\s+\d+\s*(?:th|Th|st|nd|rd)\s*(?:gen|generation)?\s*$/i, '')
      .replace(/-\s*\d+\s*(?:th|Th)\s*$/i, '')
      .replace(/,\s*\d+\s*(?:th|Th)\s*$/i, '')
      .trim();

    // Clean stable ID generation with touch & price differentiation for sibling models
    const genNum = gen ? gen.replace(/\D/g, '') : '';
    const cleanProcId = (displayProcessor || processor).toLowerCase().replace(/[^a-z0-9]/g, '');
    const specParts = [
      cleanProcId,
      genNum ? `${genNum}th` : '',
      ram ? `${ram}gb` : '',
      storage ? `${storage}gb` : '',
      isTouch ? 'touch' : '',
      offerPrice ? `${offerPrice}` : ''
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
      processor: displayProcessor || processor,
      rawProcessor: processor,
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
      os,
      originalPrice,
      offerPrice: offerPrice || 999,
      embeddedPhotos
    });
  };

  const isHeaderLine = (l) => {
    const lower = l.replaceAll('💻', '').replace(/[*•]/gu, '').toLowerCase().trim();
    return lower.includes('laptop price list') || lower.includes('product list') || lower.includes('stock list') || /^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\s*updated/i.test(lower);
  };

  const isGroupHeaderLine = (l) => {
    const trimmed = l.trim();
    if (!trimmed.startsWith('*')) return false;
    const clean = trimmed.replace(/\*/g, '').trim().toUpperCase();
    return (
      clean.includes('SERIES') ||
      clean.includes('MODELS') ||
      clean === 'DELL PRECISION' ||
      clean === 'HP SERIES' ||
      clean === 'LENOVO THINKPAD SERIES' ||
      clean === 'MICROSOFT SURFACE MODELS' ||
      clean === 'MACBOOK SERIES'
    );
  };

  const isProductStartLine = (l) => {
    if (isHeaderLine(l) || isGroupHeaderLine(l)) return false;
    if (l.includes('💻')) return true;
    const lower = l.toLowerCase().replace(/[*•]/g, '').trim();
    return /^\*?(dell|hp|lenovo|microsoft|surface|macbook|apple|thinkpad|latitude|precision|vostro|elitebook|zbook|spectre|envy|ideapad|alienware)\b/i.test(lower);
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Divider line check
    if (/^[━─=\-_*#]{4,}$/.test(trimmed)) {
      if (currentBlock.length > 0) {
        finalizeBlock(currentBlock);
        currentBlock = [];
      }
      continue;
    }

    // Skip global list title
    if (isHeaderLine(trimmed)) {
      continue;
    }

    // Category / Group header
    if (isGroupHeaderLine(trimmed)) {
      if (currentBlock.length > 0) {
        finalizeBlock(currentBlock);
        currentBlock = [];
      }
      currentGroup = trimmed.replace(/\*/g, '').trim();
      continue;
    }

    // Product start line
    if (isProductStartLine(trimmed)) {
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

// Helper: Convert image blob to PNG blob for clipboard copy
function convertBlobToPng(blob) {
  return new Promise((resolve) => {
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
}

export default function WhatsAppCatalogPanel() {
  // ── 1. ALL STATE DECLARATIONS AT VERY TOP ──
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [rawText, setRawText] = useState(() => {
    const cached = localStorage.getItem('whatsapp_catalog_raw_text');
    if (cached && cached.trim().length > 0 && !cached.includes('09-09-2026')) {
      return cached;
    }
    return DEFAULT_STOCK_CATALOG;
  });
  const [productPhotos, setProductPhotos] = useState(() => {
    try {
      const cached = localStorage.getItem('product_photos_v2') || localStorage.getItem('product_photos_backup_v2');
      return cached ? JSON.parse(cached) : {};
    } catch { return {}; }
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

  const DEFAULT_ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '1234';

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
    if (adminPinInput === DEFAULT_ADMIN_PIN) {
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
      alert('Incorrect Admin Passcode. Please check your credentials.');
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
    let active = true;
    const poll = async () => {
      if (active) await refreshAdminRequests();
    };
    poll();
    const interval = setInterval(poll, 4000);
    return () => {
      active = false;
      clearInterval(interval);
    };
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
  // CRITICAL: The server is the SINGLE SOURCE OF TRUTH for the stock catalog text.
  // On boot, ALWAYS replace local state with server data so ALL devices are 100% in sync.
  useEffect(() => {
    let active = true;
    fetchCatalogFromCloud().then(({ rawText: cloudText, productPhotos: cloudPhotos }) => {
      if (!active) return;

      if (cloudText && cloudText.trim().length > 0 && !cloudText.includes('09-09-2026')) {
        // Server has catalog text — all devices take it as ground truth
        setRawText(cloudText);
        try { localStorage.setItem('whatsapp_catalog_raw_text', cloudText); } catch {}
      } else {
        // Server is empty or has old 09-09-2026 catalog — push 16-09-2026 catalog UP to server
        console.log('📤 Upgrading to 16-09-2026 catalog text...');
        setRawText(DEFAULT_STOCK_CATALOG);
        try { localStorage.setItem('whatsapp_catalog_raw_text', DEFAULT_STOCK_CATALOG); } catch {}
        saveCatalogToCloud(DEFAULT_STOCK_CATALOG, cloudPhotos || {}).catch(() => {});
      }

      if (cloudPhotos && Object.keys(cloudPhotos).length > 0) {
        setProductPhotos(prev => ({
          ...prev,
          ...cloudPhotos
        }));
      }
    });
    return () => { active = false; };
  }, []);

  // ── LIVE CATALOG & PHOTO POLL (every 8s) ──────────────────────────────────
  // All devices stay 100% in sync with exact same stock text & photo catalog
  useEffect(() => {
    let active = true;
    const pollCatalog = async () => {
      try {
        const { rawText: cloudText, productPhotos: cloudPhotos } = await fetchCatalogFromCloud();
        if (!active) return;
        if (cloudText && cloudText.trim().length > 0 && !cloudText.includes('09-09-2026')) {
          setRawText(prev => (prev !== cloudText ? cloudText : prev));
        }
        if (cloudPhotos && Object.keys(cloudPhotos).length > 0) {
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
        }
      } catch {}
    };
    const interval = setInterval(pollCatalog, 8000);
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
          // Master approved us! Unlock admin session automatically
          try {
            sessionStorage.setItem('catalog_admin_session', 'true');
            localStorage.setItem('catalog_admin_session', 'true');
          } catch {}
          setIsAdmin(true);
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

  const getPhotos = useCallback((stableId, p = null) => {
    let local = productPhotos[stableId] || [];

    // Multi-tier smart fallback with strict model & generation fingerprinting:
    // Guarantees photos NEVER leak across different generations or sub-models
    if (local.length === 0 && p && (p.title || p.model)) {
      const matchKey = findMatchingAlbumKey(p, productPhotos);
      if (matchKey && productPhotos[matchKey]) {
        local = productPhotos[matchKey];
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
    if (!window.confirm('Delete this photo?')) return;
    const stableId = p.stableId || p.id;
    let targetKey = stableId;
    let photos = productPhotos[stableId] || [];

    // Resolve target key using strict fingerprint matching
    if (photos.length === 0 && p && (p.title || p.model)) {
      const matchKey = findMatchingAlbumKey(p, productPhotos);
      if (matchKey && productPhotos[matchKey] && productPhotos[matchKey].length > 0) {
        targetKey = matchKey;
        photos = productPhotos[matchKey];
      }
    }

    const photo = photos[idx];
    if (!photo) return;
    // Delete from cloud DB FIRST so poll doesn't restore it
    await deletePhotoFromCloud(targetKey, photo.url);
    const updated = { ...productPhotos, [targetKey]: photos.filter((_, i) => i !== idx) };
    setProductPhotos(updated);
    setActivePhotoIdx(prev => ({
      ...prev,
      [stableId]: Math.max(0, (prev[stableId] || 0) - 1)
    }));
  }, [productPhotos]);

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
          pngBlob = blob.type === 'image/png' ? blob : await convertBlobToPng(blob);
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

  // Filter products cleanly with 100% exact spec matching
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const rawLower = (p.rawText || '').toLowerCase();
      const fullText = `${p.title} ${p.processor} ${p.gen} ${p.ram}GB ${p.storage}GB ${p.brand} ${p.gpu} ${p.offerPrice}`.toLowerCase();

      // 1. Search Query (Multi-term matching)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const terms = q.split(/\s+/).filter(Boolean);
        const matchesAll = terms.every(term => {
          if (term === '4gb' && (p.gpuVram === 4 || fullText.includes('4gb') || rawLower.includes('4 gb') || rawLower.includes('4gb'))) return true;
          if (term === '6gb' && (p.gpuVram === 6 || fullText.includes('6gb') || rawLower.includes('6 gb') || rawLower.includes('6gb'))) return true;
          if (term === '8gb' && (p.gpuVram === 8 || p.ram === 8 || fullText.includes('8gb') || rawLower.includes('8 gb') || rawLower.includes('8gb'))) return true;
          return fullText.includes(term) || rawLower.includes(term);
        });
        if (!matchesAll) return false;
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
        const cpuLower = ((p.processor || '') + ' ' + (p.title || '') + ' ' + (p.rawText || '')).toLowerCase();
        if (selectedCpu === 'i3' && !cpuLower.includes('i3') && !cpuLower.includes('core 3')) return false;
        if (selectedCpu === 'i5' && !cpuLower.includes('i5') && !cpuLower.includes('core 5')) return false;
        if (selectedCpu === 'i7' && !cpuLower.includes('i7') && !cpuLower.includes('core 7')) return false;
        if (selectedCpu === 'i9' && !cpuLower.includes('i9') && !cpuLower.includes('core 9')) return false;
        if (selectedCpu === 'Ultra 5' && !cpuLower.includes('ultra 5') && !cpuLower.includes('ultra5') && !(cpuLower.includes('ultra') && cpuLower.includes('5'))) return false;
        if (selectedCpu === 'Ultra 7' && !cpuLower.includes('ultra 7') && !cpuLower.includes('ultra7') && !(cpuLower.includes('ultra') && cpuLower.includes('7'))) return false;
        if (selectedCpu === 'Ultra 9' && !cpuLower.includes('ultra 9') && !cpuLower.includes('ultra9') && !(cpuLower.includes('ultra') && cpuLower.includes('9'))) return false;
        if (selectedCpu === 'Ryzen' && !cpuLower.includes('ryzen')) return false;
      }


      // 7. Generation (Exact Match)
      if (selectedGen !== 'ALL') {
        const targetGen = parseInt(selectedGen, 10);
        const extractedGenNum = parseInt((p.gen || '').replace(/\D/g, ''), 10);
        if (extractedGenNum) {
          if (extractedGenNum !== targetGen) return false;
        } else {
          const genStr = `${targetGen}th`;
          if (!fullText.includes(genStr) && !rawLower.includes(genStr) && !rawLower.includes(`${targetGen} th`) && !rawLower.includes(`${targetGen}th`)) return false;
        }
      }

      // 8. RAM (Exact Match)
      if (selectedRam !== 'ALL') {
        const ramVal = parseInt(selectedRam, 10);
        if (p.ram !== ramVal) return false;
      }

      // 9. Storage SSD (Exact Match + Flexible tiers)
      if (selectedStorage !== 'ALL') {
        const storageVal = parseInt(selectedStorage, 10);
        if (storageVal === 512) {
          if (p.storage !== 512 && p.storage !== 500) return false;
        } else if (storageVal === 1024) {
          if (p.storage !== 1024 && p.storage !== 1000) return false;
        } else {
          if (p.storage !== storageVal) return false;
        }
      }

      // 10. GPU / Graphics (Exact Dedicated VRAM Match)
      if (selectedGpu !== 'ALL') {
        const gpuText = (p.gpu || '').toLowerCase();
        const is8GbGpu = p.gpuVram === 8 || gpuText.includes('8 gb') || gpuText.includes('8gb') || /\b8\s*gb\s*(graphics|gpu|rtx|vram)\b/i.test(rawLower);
        const is6GbGpu = p.gpuVram === 6 || gpuText.includes('6 gb') || gpuText.includes('6gb') || /\b6\s*gb\s*(graphics|gpu|rtx|vram)\b/i.test(rawLower);
        const is4GbGpu = p.gpuVram === 4 || gpuText.includes('4 gb') || gpuText.includes('4gb') || /\b4\s*gb\s*(graphics|gpu|rtx|vram)\b/i.test(rawLower) || /graphics\s*-\s*4\s*gb/i.test(rawLower) || /gpu\s*-\s*4\s*gb/i.test(rawLower);
        const is2GbGpu = p.gpuVram === 2 || gpuText.includes('2 gb') || gpuText.includes('2gb') || /\b2\s*gb\s*(graphics|gpu|rtx|vram)\b/i.test(rawLower) || /graphics\s*-\s*2\s*gb/i.test(rawLower) || /gpu\s*-\s*2\s*gb/i.test(rawLower);

        if (selectedGpu === '8gb') {
          if (!is8GbGpu) return false;
        } else if (selectedGpu === '6gb') {
          if (!is6GbGpu) return false;
        } else if (selectedGpu === '4gb') {
          if (!is4GbGpu) return false;
        } else if (selectedGpu === '2gb') {
          if (!is2GbGpu) return false;
        } else if (selectedGpu === 'dedicated') {
          if (!p.isDedicatedGpu && !is8GbGpu && !is6GbGpu && !is4GbGpu && !is2GbGpu) return false;
        } else if (selectedGpu === 'iris') {
          if (!p.isIrisXe && !gpuText.includes('iris') && !rawLower.includes('iris xe')) return false;
        } else if (selectedGpu === 'integrated') {
          if (p.isDedicatedGpu || is8GbGpu || is6GbGpu || is4GbGpu || is2GbGpu) return false;
        }
      }

      // 11. Feature & Screen Size
      if (selectedFeature !== 'ALL') {
        if (selectedFeature === 'touch' && !p.isTouch) return false;
        if (selectedFeature === '2in1' && !p.is2in1) return false;
        if (selectedFeature === '10' && !p.display.includes('10') && !p.display.includes('12')) return false;
        if (selectedFeature === '13' && !p.display.includes('13') && !p.display.includes('12')) return false;
        if (selectedFeature === '14' && !p.display.includes('14')) return false;
        if (selectedFeature === '15' && !p.display.includes('15')) return false;
        if (selectedFeature === '17' && !p.display.includes('17')) return false;
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

  const dropdownStyle = (isActive, activeBg = '#311b92', activeColor = '#ffffff') => ({
    width: '100%',
    height: '42px',
    padding: '0 32px 0 14px',
    fontSize: '0.84rem',
    fontWeight: 600,
    backgroundColor: isActive ? activeBg : '#ffffff',
    color: isActive ? activeColor : '#0f172a',
    border: isActive ? '1px solid #311b92' : '1px solid #e2e8f0',
    borderRadius: '12px',
    boxShadow: isActive ? '0 4px 14px rgba(49, 27, 146, 0.15)' : '0 1px 2px rgba(0,0,0,0.03)',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    outline: 'none',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    transition: 'all 0.15s ease'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 14 : 24, width: '100%', maxWidth: '100%', overflowX: 'hidden', padding: isMobile ? '0' : '0 8px', boxSizing: 'border-box' }}>
      
      {/* 1. Header Banner: Pixelvine Royal Purple with Golden Amber Accents (Reference Image Theme) */}
      <div style={{
        borderRadius: isMobile ? '18px' : '24px',
        background: 'linear-gradient(135deg, #2e1065 0%, #311b92 50%, #432874 100%)',
        boxShadow: '0 12px 36px -6px rgba(49, 27, 146, 0.28), 0 4px 12px rgba(15, 23, 42, 0.05)',
        color: '#ffffff',
        padding: isMobile ? '18px 14px' : '32px 36px',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Subtle decorative dot pattern inspired by reference image */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.7,
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Reference Image Pill: GIVEAWAY / LIVE CATALOG */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
            <span style={{
              background: '#fbbf24',
              color: '#000000',
              fontWeight: 800,
              fontSize: '0.74rem',
              padding: '6px 14px',
              borderRadius: '9999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              letterSpacing: '0.04em',
              boxShadow: '0 4px 14px rgba(251, 191, 36, 0.35)'
            }}>
              <Sparkles size={13} color="#000000" fill="#000000" />
              LIVE STOCK 16-09-2026
            </span>

            {/* Cloud Sync Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.08)', padding: '5px 12px', borderRadius: '9999px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <span className="pulsing-green-dot" />
              <span>Cloud Synced</span>
            </div>
          </div>

          {/* Reference Image Headline */}
          <h2 style={{
            margin: '0 0 10px 0',
            fontSize: isMobile ? '1.4rem' : '2.35rem',
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: '-0.03em',
            color: '#ffffff'
          }}>
            Filter & Share <span style={{ color: '#fbbf24' }}>Executive & Workstation Quotes</span>
          </h2>

          <p style={{
            margin: '0 0 18px 0',
            fontSize: isMobile ? '0.82rem' : '1.02rem',
            color: 'rgba(255, 255, 255, 0.82)',
            maxWidth: '680px',
            lineHeight: 1.55
          }}>
            Instant laptop matching with full specs, multi-photo attachments, and verified offer pricing for direct customer WhatsApp chat.
          </p>

          {/* Quick Metrics Bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: isMobile ? 8 : 12,
            marginBottom: 18,
            padding: isMobile ? '10px 12px' : '12px 18px',
            background: 'rgba(255, 255, 255, 0.07)',
            borderRadius: '14px',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ fontSize: isMobile ? '0.78rem' : '0.84rem', fontWeight: 600 }}>
              Total Stock: <strong style={{ color: '#fbbf24', fontWeight: 800 }}>{stats.total}</strong>
            </div>
            <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ fontSize: isMobile ? '0.78rem' : '0.84rem', fontWeight: 600 }}>
              Matched: <strong style={{ color: '#38bdf8', fontWeight: 800 }}>{stats.matched}</strong>
            </div>
            <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ fontSize: isMobile ? '0.78rem' : '0.84rem', fontWeight: 600 }}>
              Workstations: <strong style={{ color: '#fb923c', fontWeight: 800 }}>{stats.workstationCount}</strong>
            </div>
          </div>

          {/* Action Toolbar Inside Hero */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            {isAdmin ? (
              <button 
                style={{
                  background: 'rgba(34, 197, 94, 0.2)',
                  border: '1px solid rgba(34, 197, 94, 0.5)',
                  color: '#4ade80',
                  padding: '9px 18px',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onClick={handleLockAdmin}
                title="Lock Admin Mode"
              >
                <Unlock size={14} /> Admin Active (Lock)
              </button>
            ) : (
              <button 
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  padding: '9px 18px',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.15s'
                }}
                onClick={() => setShowAdminPinModal(true)}
              >
                <Lock size={14} /> Admin Access
              </button>
            )}

            {isAdmin && (
              <>
                <button 
                  style={{
                    background: '#ffffff',
                    color: '#311b92',
                    border: 'none',
                    padding: '9px 18px',
                    borderRadius: '9999px',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                  onClick={() => { setEditorInput(rawText); setShowModal(true); }}
                >
                  <Edit3 size={14} /> {rawText ? 'Edit Stock List' : 'Paste List'}
                </button>

                <button 
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '9px 18px',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowVaultModal(true)}
                >
                  <Camera size={14} /> Photo Vault ({Object.keys(productPhotos).filter(k => (productPhotos[k] || []).length > 0).length})
                </button>

                <button 
                  style={{
                    background: 'rgba(244, 63, 94, 0.15)',
                    color: '#fda4af',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    padding: '9px 16px',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    cursor: 'pointer'
                  }}
                  onClick={handleClearAllPhotos}
                >
                  <Trash2 size={13} /> Clear Photos
                </button>
              </>
            )}

            <button 
              style={{
                background: '#fbbf24',
                color: '#000000',
                border: 'none',
                padding: '9px 22px',
                borderRadius: '9999px',
                fontWeight: 800,
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                cursor: 'pointer',
                marginLeft: isMobile ? 0 : 'auto',
                width: isMobile ? '100%' : 'auto',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(251, 191, 36, 0.35)',
                transition: 'all 0.15s'
              }}
              onClick={() => handleCopy(formattedOutputText, 'top-all')}
            >
              {copiedId === 'top-all' ? <Check size={15} /> : <Copy size={15} />}
              <span>{copiedId === 'top-all' ? 'Copied to Clipboard!' : 'Copy Filtered Quotes'}</span>
            </button>
          </div>
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
        <div style={{
          background: '#ffffff',
          borderRadius: '18px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px -2px rgba(15,23,42,0.05)',
          textAlign: 'center',
          padding: '60px 24px'
        }}>
          <div 
            onDragEnter={handleDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragOver}
            onDrop={handleDrop}
            style={{
              border: dragOver ? '2px dashed #311b92' : '2px dashed #cbd5e1',
              background: dragOver ? 'rgba(49, 27, 146, 0.04)' : '#f8fafc',
              borderRadius: '16px',
              padding: '40px 20px',
              maxWidth: '600px',
              margin: '0 auto 24px',
              cursor: 'pointer',
              transition: 'all 0.2s'
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
            <FileUp size={44} style={{ margin: '0 auto 12px', color: '#311b92' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
              {dragOver ? 'Drop your file here!' : 'Upload or Drag & Drop Product List (.txt / .csv)'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', fontFamily: 'var(--font-mono)', margin: 0 }}>
              Or click to browse your computer
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              style={{
                background: '#311b92',
                color: '#ffffff',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '9999px',
                fontSize: '0.9rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(49, 27, 146, 0.25)'
              }}
              onClick={() => { setEditorInput(rawText); setShowModal(true); }}
            >
              <Edit3 size={16} /> Paste WhatsApp Product List
            </button>
          </div>
        </div>
      ) : (
        /* FULL-WIDTH FILTER & CATALOG CONSOLE */
        <>
          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px -2px rgba(15,23,42,0.05)',
            padding: isMobile ? '12px 10px' : '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
            boxSizing: 'border-box'
          }}>
            
            {/* Responsive Filter Console (Clean Mobile 1-Tap Toggle + Desktop 1-Row Bar) */}
            {isMobile ? (
              /* MOBILE MINIMALISTIC FILTER BAR */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                {/* 1. Mobile Search Bar & Quick Chips */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                  <div style={{ position: 'relative', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                    <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.45, color: '#311b92' }} />
                    <input 
                      type="text" 
                      placeholder="Search specs (e.g. i7, 16GB, 4GB GPU)..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{
                        paddingLeft: 42,
                        paddingRight: 36,
                        fontSize: '0.88rem',
                        height: '44px',
                        width: '100%',
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                        borderRadius: '12px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#0f172a',
                        outline: 'none'
                      }}
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, color: '#64748b' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Horizontal 1-Tap Quick Filter Chips Bar */}
                  <div style={{ display: 'flex', gap: 6, overflowX: 'auto', width: '100%', maxWidth: '100%', minWidth: 0, paddingBottom: 4, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', boxSizing: 'border-box' }}>
                    {[
                      { label: 'All Laptops', icon: <Laptop size={13} />, isSelected: selectedBrand === 'ALL' && selectedCategory === 'ALL' && selectedGpu === 'ALL' && selectedCpu === 'ALL', action: () => resetAllFilters() },
                      { label: 'Workstations', icon: <Layers size={13} />, isSelected: selectedCategory === 'WORKSTATION', action: () => setSelectedCategory(selectedCategory === 'WORKSTATION' ? 'ALL' : 'WORKSTATION') },
                      { label: 'DELL', isSelected: selectedBrand === 'DELL', action: () => setSelectedBrand(selectedBrand === 'DELL' ? 'ALL' : 'DELL') },
                      { label: 'HP', isSelected: selectedBrand === 'HP', action: () => setSelectedBrand(selectedBrand === 'HP' ? 'ALL' : 'HP') },
                      { label: 'LENOVO', isSelected: selectedBrand === 'LENOVO', action: () => setSelectedBrand(selectedBrand === 'LENOVO' ? 'ALL' : 'LENOVO') },
                      { label: 'Core i7', icon: <Cpu size={13} />, isSelected: selectedCpu === 'i7', action: () => setSelectedCpu(selectedCpu === 'i7' ? 'ALL' : 'i7') },
                      { label: '16GB RAM', icon: <Zap size={13} />, isSelected: selectedRam === '16', action: () => setSelectedRam(selectedRam === '16' ? 'ALL' : '16') },
                      { label: 'Dedicated GPU', icon: <Zap size={13} />, isSelected: selectedGpu === 'dedicated', action: () => setSelectedGpu(selectedGpu === 'dedicated' ? 'ALL' : 'dedicated') },
                      { label: '< 1500 AED', icon: <Tag size={13} />, isSelected: selectedBudget === '1500', action: () => setSelectedBudget(selectedBudget === '1500' ? 'ALL' : '1500') },
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={chip.action}
                        style={{
                          flexShrink: 0,
                          padding: '6px 13px',
                          borderRadius: '9999px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          border: chip.isSelected ? '1px solid #311b92' : '1px solid #e2e8f0',
                          background: chip.isSelected ? '#311b92' : '#ffffff',
                          color: chip.isSelected ? '#ffffff' : '#334155',
                          cursor: 'pointer',
                          boxShadow: chip.isSelected ? '0 2px 8px rgba(49, 27, 146, 0.25)' : 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          transition: 'all 0.15s'
                        }}
                      >
                        {chip.icon}
                        <span>{chip.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Mobile 1-Tap Filter Action Row */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {(() => {
                    const hasActiveFilters = (selectedBrand !== 'ALL' || selectedBudget !== 'ALL' || selectedSeries !== 'ALL' || selectedGpu !== 'ALL' || selectedCategory !== 'ALL' || selectedCpu !== 'ALL' || selectedRam !== 'ALL' || selectedStorage !== 'ALL' || selectedGen !== 'ALL' || selectedFeature !== 'ALL');
                    return (
                      <button 
                        type="button"
                        style={{ 
                          flex: 1, 
                          height: '42px', 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between', 
                          padding: '0 14px', 
                          fontWeight: 700, 
                          fontSize: '0.84rem',
                          borderRadius: '12px',
                          border: hasActiveFilters ? '1px solid #311b92' : '1px solid #e2e8f0',
                          background: hasActiveFilters ? '#311b92' : '#f8fafc',
                          color: hasActiveFilters ? '#ffffff' : '#1e293b',
                          boxShadow: hasActiveFilters ? '0 4px 12px rgba(49, 27, 146, 0.2)' : 'none',
                          cursor: 'pointer'
                        }}
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <Filter size={15} color={hasActiveFilters ? '#ffffff' : '#311b92'} />
                          <span>{showMobileFilters ? 'Hide Filter Drawer' : 'More Filter Options'}</span>
                        </span>

                        {hasActiveFilters && (
                          <span style={{ background: '#fbbf24', color: '#000000', fontSize: '0.7rem', fontWeight: 800, padding: '1px 8px', borderRadius: '9999px' }}>
                            Active
                          </span>
                        )}
                        <ChevronDown size={15} style={{ transform: showMobileFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </button>
                    );
                  })()}

                  {(searchQuery || selectedCategory !== 'ALL' || selectedSeries !== 'ALL' || selectedBudget !== 'ALL' || selectedBrand !== 'ALL' || selectedCpu !== 'ALL' || selectedGen !== 'ALL' || selectedRam !== 'ALL' || selectedStorage !== 'ALL' || selectedGpu !== 'ALL' || selectedFeature !== 'ALL') && (
                    <button 
                      style={{
                        padding: '0 14px',
                        height: '42px',
                        fontSize: '0.8rem',
                        color: '#dc2626',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '12px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        cursor: 'pointer'
                      }}
                      onClick={resetAllFilters}
                    >
                      <RotateCcw size={13} /> Reset
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
                        padding: '16px', 
                        background: '#f8fafc', 
                        borderRadius: '14px', 
                        border: '1px solid #e2e8f0',
                        marginTop: 4
                      }}
                    >
                      {/* Brand */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Tag size={12} color="#311b92" /> BRAND
                        </label>
                        <div style={{ position: 'relative' }}>
                          <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} style={dropdownStyle(selectedBrand !== 'ALL', '#311b92', '#ffffff')}>
                            <option value="ALL">All Brands</option>
                            <option value="DELL">DELL</option>
                            <option value="HP">HP</option>
                            <option value="LENOVO">LENOVO</option>
                            <option value="SURFACE">MICROSOFT SURFACE</option>
                            <option value="MACBOOK">APPLE MACBOOK</option>
                          </select>
                          <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: selectedBrand !== 'ALL' ? '#ffffff' : '#64748b' }} />
                        </div>
                      </div>

                      {/* Budget */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Sparkles size={12} color="#f59e0b" /> MAX BUDGET
                        </label>
                        <div style={{ position: 'relative' }}>
                          <select value={selectedBudget} onChange={e => setSelectedBudget(e.target.value)} style={dropdownStyle(selectedBudget !== 'ALL', '#311b92', '#ffffff')}>
                            <option value="ALL">All Prices</option>
                            <option value="500">Under 500 AED</option>
                            <option value="1000">Under 1000 AED</option>
                            <option value="1500">Under 1500 AED</option>
                            <option value="2000">Under 2000 AED</option>
                            <option value="2000+">2000+ AED</option>
                          </select>
                          <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: selectedBudget !== 'ALL' ? '#ffffff' : '#64748b' }} />
                        </div>
                      </div>

                      {/* Model Series */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Laptop size={12} color="#311b92" /> MODEL SERIES
                        </label>
                        <div style={{ position: 'relative' }}>
                          <select value={selectedSeries} onChange={e => setSelectedSeries(e.target.value)} style={dropdownStyle(selectedSeries !== 'ALL', '#311b92', '#ffffff')}>
                            <option value="ALL">All Series</option>
                            <option value="Latitude">Dell Latitude</option>
                            <option value="Precision">Dell Precision</option>
                            <option value="Vostro">Dell Vostro</option>
                            <option value="Alienware">Alienware</option>
                            <option value="Elite">HP EliteBook</option>
                            <option value="ProBook">HP ProBook</option>
                            <option value="Spectre">HP Spectre</option>
                            <option value="ThinkPad">Lenovo ThinkPad</option>
                            <option value="IdeaPad">Lenovo IdeaPad</option>
                            <option value="Surface">Surface</option>
                            <option value="MacBook">MacBook</option>
                          </select>
                          <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: selectedSeries !== 'ALL' ? '#ffffff' : '#64748b' }} />
                        </div>
                      </div>

                      {/* GPU / Graphics */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Zap size={12} color="#f59e0b" /> GRAPHICS & GPU
                        </label>
                        <div style={{ position: 'relative' }}>
                          <select value={selectedGpu} onChange={e => setSelectedGpu(e.target.value)} style={dropdownStyle(selectedGpu !== 'ALL', '#311b92', '#ffffff')}>
                            <option value="ALL">Any Graphics</option>
                            <option value="dedicated">Any Dedicated GPU</option>
                            <option value="8gb">8GB Dedicated</option>
                            <option value="6gb">6GB Dedicated</option>
                            <option value="4gb">4GB Dedicated</option>
                            <option value="2gb">2GB Dedicated</option>
                            <option value="iris">Intel Iris Xe</option>
                            <option value="integrated">Integrated Only</option>
                          </select>
                          <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: selectedGpu !== 'ALL' ? '#ffffff' : '#64748b' }} />
                        </div>
                      </div>

                      {/* Memory RAM & SSD Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Zap size={12} color="#2563eb" /> RAM
                          </label>
                          <select value={selectedRam} onChange={e => setSelectedRam(e.target.value)} style={dropdownStyle(selectedRam !== 'ALL', '#311b92', '#ffffff')}>
                            <option value="ALL">Any RAM</option>
                            <option value="4">4 GB</option>
                            <option value="8">8 GB</option>
                            <option value="16">16 GB</option>
                            <option value="32">32 GB</option>
                          </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <HardDrive size={12} color="#059669" /> SSD
                          </label>
                          <select value={selectedStorage} onChange={e => setSelectedStorage(e.target.value)} style={dropdownStyle(selectedStorage !== 'ALL', '#311b92', '#ffffff')}>
                            <option value="ALL">Any SSD</option>
                            <option value="32">32 GB</option>
                            <option value="256">256 GB</option>
                            <option value="512">512 GB</option>
                            <option value="1024">1 TB SSD</option>
                          </select>
                        </div>
                      </div>

                      {/* CPU & Generation Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Cpu size={12} color="#311b92" /> CPU
                          </label>
                          <select value={selectedCpu} onChange={e => setSelectedCpu(e.target.value)} style={dropdownStyle(selectedCpu !== 'ALL', '#311b92', '#ffffff')}>
                            <option value="ALL">Any CPU</option>
                            <option value="i3">Core i3</option>
                            <option value="i5">Core i5</option>
                            <option value="i7">Core i7</option>
                            <option value="i9">Core i9</option>
                            <option value="Ultra 5">Ultra 5</option>
                            <option value="Ultra 7">Ultra 7</option>
                            <option value="Ultra 9">Ultra 9</option>
                            <option value="Ryzen">AMD Ryzen</option>
                          </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>GEN</label>
                          <select value={selectedGen} onChange={e => setSelectedGen(e.target.value)} style={dropdownStyle(selectedGen !== 'ALL', '#311b92', '#ffffff')}>
                            <option value="ALL">Any Gen</option>
                            <option value="4">4th Gen</option>
                            <option value="7">7th Gen</option>
                            <option value="8">8th Gen</option>
                            <option value="9">9th Gen</option>
                            <option value="10">10th Gen</option>
                            <option value="11">11th Gen</option>
                            <option value="12">12th Gen</option>
                            <option value="13">13th Gen</option>
                          </select>
                        </div>
                      </div>

                      {/* Feature & Screen */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Tablet size={12} color="#7c3aed" /> DISPLAY & SCREEN
                        </label>
                        <div style={{ position: 'relative' }}>
                          <select value={selectedFeature} onChange={e => setSelectedFeature(e.target.value)} style={dropdownStyle(selectedFeature !== 'ALL', '#311b92', '#ffffff')}>
                            <option value="ALL">All Displays</option>
                            <option value="touch">Touchscreen</option>
                            <option value="2in1">2-in-1 Touch</option>
                            <option value="10">10-12" Compact</option>
                            <option value="13">13.3" Screen</option>
                            <option value="14">14" Screen</option>
                            <option value="15">15.6" Screen</option>
                            <option value="17">17" Screen</option>
                          </select>
                          <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: selectedFeature !== 'ALL' ? '#ffffff' : '#64748b' }} />
                        </div>
                      </div>

                      <button 
                        type="button"
                        style={{
                          height: '42px',
                          fontWeight: 800,
                          borderRadius: '12px',
                          background: '#311b92',
                          color: '#ffffff',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: 6,
                          boxShadow: '0 4px 14px rgba(49, 27, 146, 0.2)'
                        }}
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
                  <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.45, color: '#311b92' }} />
                  <input 
                    type="text" 
                    placeholder="Search model specs (e.g. Precision, i7, 16GB RAM, 4GB GPU, 512GB SSD)..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      paddingLeft: 46,
                      paddingRight: 40,
                      fontSize: '0.9rem',
                      height: '44px',
                      width: '100%',
                      borderRadius: '12px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      color: '#0f172a',
                      outline: 'none'
                    }}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem', color: '#64748b' }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div style={{ position: 'relative', width: '150px' }}>
                  <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} style={dropdownStyle(selectedBrand !== 'ALL', '#311b92', '#ffffff')}>
                    <option value="ALL">All Brands</option>
                    <option value="DELL">DELL</option>
                    <option value="HP">HP</option>
                    <option value="LENOVO">LENOVO</option>
                    <option value="SURFACE">MICROSOFT</option>
                    <option value="MACBOOK">APPLE MAC</option>
                  </select>
                  <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: selectedBrand !== 'ALL' ? '#ffffff' : '#64748b' }} />
                </div>

                <div style={{ position: 'relative', width: '150px' }}>
                  <select value={selectedBudget} onChange={e => setSelectedBudget(e.target.value)} style={dropdownStyle(selectedBudget !== 'ALL', '#311b92', '#ffffff')}>
                    <option value="ALL">All Prices</option>
                    <option value="500">Under 500 AED</option>
                    <option value="1000">Under 1000 AED</option>
                    <option value="1500">Under 1500 AED</option>
                    <option value="2000">Under 2000 AED</option>
                    <option value="2000+">2000+ AED</option>
                  </select>
                  <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: selectedBudget !== 'ALL' ? '#ffffff' : '#64748b' }} />
                </div>

                <div style={{ position: 'relative', width: '160px' }}>
                  <select value={selectedSeries} onChange={e => setSelectedSeries(e.target.value)} style={dropdownStyle(selectedSeries !== 'ALL', '#311b92', '#ffffff')}>
                    <option value="ALL">All Series</option>
                    <option value="Latitude">Dell Latitude</option>
                    <option value="Precision">Dell Precision</option>
                    <option value="Vostro">Dell Vostro</option>
                    <option value="Alienware">Alienware</option>
                    <option value="Elite">HP EliteBook</option>
                    <option value="ProBook">HP ProBook</option>
                    <option value="Spectre">HP Spectre</option>
                    <option value="ThinkPad">Lenovo ThinkPad</option>
                    <option value="IdeaPad">Lenovo IdeaPad</option>
                    <option value="Surface">Surface</option>
                    <option value="MacBook">MacBook</option>
                  </select>
                  <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: selectedSeries !== 'ALL' ? '#ffffff' : '#64748b' }} />
                </div>

                <button
                  type="button"
                  style={{
                    height: '44px',
                    padding: '0 16px',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    borderRadius: '12px',
                    border: showMoreFilters ? '1px solid #311b92' : '1px solid #e2e8f0',
                    background: showMoreFilters ? 'rgba(49, 27, 146, 0.08)' : '#ffffff',
                    color: showMoreFilters ? '#311b92' : '#1e293b',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onClick={() => setShowMoreFilters(!showMoreFilters)}
                >
                  <Filter size={15} color={showMoreFilters ? '#311b92' : '#64748b'} />
                  <span>+ More Specs</span>
                  {activeMoreFiltersCount > 0 && (
                    <span style={{ background: '#311b92', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '1px 7px', borderRadius: '9999px' }}>
                      {activeMoreFiltersCount}
                    </span>
                  )}
                  <ChevronDown size={14} style={{ transform: showMoreFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {(searchQuery || selectedCategory !== 'ALL' || selectedSeries !== 'ALL' || selectedBudget !== 'ALL' || selectedBrand !== 'ALL' || selectedCpu !== 'ALL' || selectedGen !== 'ALL' || selectedRam !== 'ALL' || selectedStorage !== 'ALL' || selectedGpu !== 'ALL' || selectedFeature !== 'ALL') && (
                  <button 
                    style={{
                      padding: '0 14px',
                      height: '44px',
                      fontSize: '0.82rem',
                      color: '#dc2626',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '12px',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      cursor: 'pointer'
                    }}
                    onClick={resetAllFilters}
                  >
                    <RotateCcw size={13} /> Reset
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
                      borderTop: '1px solid #f1f5f9' 
                    }}
                  >
                    {/* GPU / Graphics */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Zap size={12} color="#f59e0b" /> Graphics & GPU
                      </label>
                      <div style={{ position: 'relative', width: '100%' }}>
                        <select value={selectedGpu} onChange={e => setSelectedGpu(e.target.value)} style={dropdownStyle(selectedGpu !== 'ALL', '#311b92', '#ffffff')}>
                          <option value="ALL">Any Graphics</option>
                          <option value="dedicated">Any Dedicated GPU</option>
                          <option value="8gb">8GB Dedicated</option>
                          <option value="6gb">6GB Dedicated</option>
                          <option value="4gb">4GB Dedicated</option>
                          <option value="2gb">2GB Dedicated</option>
                          <option value="iris">Intel Iris Xe</option>
                          <option value="integrated">Integrated Only</option>
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: selectedGpu !== 'ALL' ? '#ffffff' : '#64748b' }} />
                      </div>
                    </div>

                    {/* Category / Purpose */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Layers size={12} color="#311b92" /> Category
                      </label>
                      <div style={{ position: 'relative', width: '100%' }}>
                        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={dropdownStyle(selectedCategory !== 'ALL', '#311b92', '#ffffff')}>
                          <option value="ALL">All Categories</option>
                          <option value="WORKSTATION">Workstation</option>
                          <option value="BUSINESS">Business</option>
                          <option value="EXECUTIVE">Executive</option>
                          <option value="CONVERTIBLE">2-in-1 Touch</option>
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: selectedCategory !== 'ALL' ? '#ffffff' : '#64748b' }} />
                      </div>
                    </div>

                    {/* Processor */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Cpu size={12} color="#311b92" /> CPU Processor
                      </label>
                      <div style={{ position: 'relative', width: '100%' }}>
                        <select value={selectedCpu} onChange={e => setSelectedCpu(e.target.value)} style={dropdownStyle(selectedCpu !== 'ALL', '#311b92', '#ffffff')}>
                          <option value="ALL">All CPUs</option>
                          <option value="i3">Intel Core i3</option>
                          <option value="i5">Intel Core i5</option>
                          <option value="i7">Intel Core i7</option>
                          <option value="i9">Intel Core i9</option>
                          <option value="Ultra 5">Intel Ultra 5</option>
                          <option value="Ultra 7">Intel Ultra 7</option>
                          <option value="Ultra 9">Intel Ultra 9</option>
                          <option value="Ryzen">AMD Ryzen</option>
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: selectedCpu !== 'ALL' ? '#ffffff' : '#64748b' }} />
                      </div>
                    </div>

                    {/* Generation */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>
                        Exact Gen
                      </label>
                      <div style={{ position: 'relative', width: '100%' }}>
                        <select value={selectedGen} onChange={e => setSelectedGen(e.target.value)} style={dropdownStyle(selectedGen !== 'ALL', '#311b92', '#ffffff')}>
                          <option value="ALL">Exact Gen (Any)</option>
                          <option value="4">4th Gen</option>
                          <option value="7">7th Gen</option>
                          <option value="8">8th Gen</option>
                          <option value="9">9th Gen</option>
                          <option value="10">10th Gen</option>
                          <option value="11">11th Gen</option>
                          <option value="12">12th Gen</option>
                          <option value="13">13th Gen</option>
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: selectedGen !== 'ALL' ? '#ffffff' : '#64748b' }} />
                      </div>
                    </div>

                    {/* RAM */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Zap size={12} color="#2563eb" /> RAM Memory
                      </label>
                      <div style={{ position: 'relative', width: '100%' }}>
                        <select value={selectedRam} onChange={e => setSelectedRam(e.target.value)} style={dropdownStyle(selectedRam !== 'ALL', '#311b92', '#ffffff')}>
                          <option value="ALL">Exact RAM (Any)</option>
                          <option value="4">4 GB RAM</option>
                          <option value="8">8 GB RAM</option>
                          <option value="16">16 GB RAM</option>
                          <option value="32">32 GB RAM</option>
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: selectedRam !== 'ALL' ? '#ffffff' : '#64748b' }} />
                      </div>
                    </div>

                    {/* Storage SSD */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <HardDrive size={12} color="#059669" /> Storage SSD
                      </label>
                      <div style={{ position: 'relative', width: '100%' }}>
                        <select value={selectedStorage} onChange={e => setSelectedStorage(e.target.value)} style={dropdownStyle(selectedStorage !== 'ALL', '#311b92', '#ffffff')}>
                          <option value="ALL">Exact SSD (Any)</option>
                          <option value="32">32 GB Storage</option>
                          <option value="256">256 GB SSD</option>
                          <option value="512">512 GB SSD</option>
                          <option value="1024">1 TB SSD</option>
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: selectedStorage !== 'ALL' ? '#ffffff' : '#64748b' }} />
                      </div>
                    </div>

                    {/* Feature & Display */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Tablet size={12} color="#7c3aed" /> Feature & Screen
                      </label>
                      <div style={{ position: 'relative', width: '100%' }}>
                        <select value={selectedFeature} onChange={e => setSelectedFeature(e.target.value)} style={dropdownStyle(selectedFeature !== 'ALL', '#311b92', '#ffffff')}>
                          <option value="ALL">All Displays</option>
                          <option value="touch">Touchscreen</option>
                          <option value="2in1">2-in-1 Touch</option>
                          <option value="10">10-12" Compact</option>
                          <option value="13">13.3" Screen</option>
                          <option value="14">14" Screen</option>
                          <option value="15">15.6" Screen</option>
                          <option value="17">17" Screen</option>
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: selectedFeature !== 'ALL' ? '#ffffff' : '#64748b' }} />
                      </div>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          {/* 3. Executive Live Console View: Full-width Card Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: isMobile ? 12 : 20, width: '100%', maxWidth: '100%', alignItems: 'start', boxSizing: 'border-box' }}>
            
            {/* Laptop Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
              {/* Header Bar */}
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: 10, width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#334155' }}>
                  Matched Stock: <span style={{ color: '#311b92', fontSize: '1.15rem', fontWeight: 800 }}>{filteredProducts.length}</span> Laptops
                </span>

                <div style={{ display: 'flex', gap: 10, width: isMobile ? '100%' : 'auto' }}>
                  <button 
                    style={{
                      background: '#fbbf24',
                      color: '#000000',
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: '9999px',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(251, 191, 36, 0.3)',
                      flex: isMobile ? 1 : 'none',
                      whiteSpace: 'nowrap'
                    }}
                    onClick={() => handleCopy(formattedOutputText, 'bottom-all')}
                  >
                    {copiedId === 'bottom-all' ? <Check size={15} /> : <Copy size={15} />}
                    <span>{copiedId === 'bottom-all' ? 'Copied!' : (isMobile ? 'Copy All' : 'Copy Filtered Quotes')}</span>
                  </button>
                </div>
              </div>

                {/* Grid of Laptop Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : 'repeat(auto-fill, minmax(310px, 1fr))', gap: isMobile ? 12 : 18, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                  {filteredProducts.length === 0 ? (
                    <div style={{
                      gridColumn: '1 / -1',
                      textAlign: 'center',
                      background: '#ffffff',
                      borderRadius: '18px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 20px -2px rgba(15,23,42,0.05)',
                      padding: '50px 20px'
                    }}>
                      <Search size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                      <h3 style={{ fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>No laptops match your exact filter combination.</h3>
                      <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: 16 }}>Try loosening RAM, Storage or GPU filter criteria.</p>
                      <button 
                        style={{
                          background: '#311b92',
                          color: '#ffffff',
                          border: 'none',
                          padding: '10px 22px',
                          borderRadius: '9999px',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          cursor: 'pointer'
                        }}
                        onClick={resetAllFilters}
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    filteredProducts.map((p, pIdx) => {
                      const stableId = p.stableId || p.id;
                      const photos = getPhotos(stableId, p);
                      const activeIdx = activePhotoIdx[stableId] || 0;
                      const activePhoto = photos[activeIdx] || null;
                      const isUploading = photoUploading[stableId] || false;

                      return (
                        <motion.div 
                          key={`${p.id}_${pIdx}`}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '18px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 20px -2px rgba(15,23,42,0.06)',
                            padding: isMobile ? '14px 12px' : '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12,
                            transition: 'all 0.2s',
                            width: '100%',
                            maxWidth: '100%',
                            boxSizing: 'border-box',
                            overflow: 'hidden'
                          }}
                        >
                          {/* 1. HEADER ZONE: Brand Badge + Category Tag + Product Title */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, width: '100%' }}>
                              <span style={{
                                padding: '3px 10px',
                                borderRadius: '9999px',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                background: p.brand === 'DELL' ? '#eff6ff' : p.brand === 'HP' ? '#f5f3ff' : p.brand === 'LENOVO' ? '#fef2f2' : '#f1f5f9',
                                color: p.brand === 'DELL' ? '#1d4ed8' : p.brand === 'HP' ? '#6d28d9' : p.brand === 'LENOVO' ? '#b91c1c' : '#475569',
                                border: p.brand === 'DELL' ? '1px solid #bfdbfe' : p.brand === 'HP' ? '1px solid #ddd6fe' : p.brand === 'LENOVO' ? '1px solid #fecaca' : '1px solid #e2e8f0'
                              }}>
                                {p.brand}
                              </span>

                              <span style={{ 
                                fontSize: '0.68rem', 
                                fontWeight: 800, 
                                background: p.category === 'WORKSTATION' ? '#fef3c7' : p.category === 'EXECUTIVE' ? '#f3e8ff' : '#f1f5f9',
                                color: p.category === 'WORKSTATION' ? '#92400e' : p.category === 'EXECUTIVE' ? '#6b21a8' : '#475569',
                                border: p.category === 'WORKSTATION' ? '1px solid #fde68a' : p.category === 'EXECUTIVE' ? '1px solid #e9d5ff' : '1px solid #e2e8f0',
                                padding: '3px 10px', 
                                borderRadius: '9999px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}>
                                {p.category === 'WORKSTATION' ? (
                                  <>
                                    <Layers size={11} color="#92400e" /> WORKSTATION
                                  </>
                                ) : p.category === 'EXECUTIVE' ? (
                                  <>
                                    <Sparkles size={11} color="#6b21a8" /> EXECUTIVE
                                  </>
                                ) : (
                                  <>
                                    <Briefcase size={11} color="#475569" /> BUSINESS
                                  </>
                                )}
                              </span>
                            </div>

                            <h3 style={{ margin: 0, fontSize: isMobile ? '0.98rem' : '1.1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8, lineHeight: 1.35, minWidth: 0, wordBreak: 'break-word', width: '100%' }}>
                              <Laptop size={18} color="#311b92" strokeWidth={2.2} style={{ flexShrink: 0 }} />
                              <span style={{ minWidth: 0, wordBreak: 'break-word' }}>{p.title}</span>
                            </h3>
                          </div>

                          {/* 2. MEDIA ZONE: Hero Photo / Upload Placeholder + Current Price Badge Overlay */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {activePhoto ? (
                              <div
                                style={{ position: 'relative', width: '100%', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#0f172a', cursor: 'zoom-in', aspectRatio: '16/9' }}
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

                                {/* Floating Top Right Price Tag */}
                                <div style={{
                                  position: 'absolute', top: 8, right: 8,
                                  fontSize: '0.8rem', fontWeight: 800,
                                  background: '#fbbf24', color: '#000000',
                                  padding: '4px 10px', borderRadius: '9999px',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                  display: 'flex', alignItems: 'center', gap: 4
                                }}>
                                  <Sparkles size={12} fill="#000000" />
                                  <span>AED {p.offerPrice}/-</span>
                                </div>

                                <span style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', fontFamily: 'var(--font-mono)' }}>
                                  {activeIdx + 1} / {photos.length}
                                </span>
                                {/* Prev/Next arrows */}
                                {photos.length > 1 && (
                                  <>
                                    <button
                                      onClick={e => { e.stopPropagation(); setActivePhotoIdx(prev => ({ ...prev, [stableId]: (activeIdx - 1 + photos.length) % photos.length })); }}
                                      style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)', border: 'none', color: '#0f172a', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                                    ><ChevronLeft size={16} /></button>
                                    <button
                                      onClick={e => { e.stopPropagation(); setActivePhotoIdx(prev => ({ ...prev, [stableId]: (activeIdx + 1) % photos.length })); }}
                                      style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)', border: 'none', color: '#0f172a', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                                    ><ChevronRight size={16} /></button>
                                  </>
                                )}
                              </div>
                            ) : (
                              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', border: '1px dashed #cbd5e1', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', gap: 6, color: '#64748b' }}>
                                <Camera size={26} strokeWidth={1.5} color="#94a3b8" />
                                <span style={{ fontSize: '0.74rem', fontWeight: 600 }}>No photos uploaded</span>

                                {/* Floating Top Right Price Tag */}
                                <div style={{
                                  position: 'absolute', top: 8, right: 8,
                                  fontSize: '0.8rem', fontWeight: 800,
                                  background: '#fbbf24', color: '#000000',
                                  padding: '4px 10px', borderRadius: '9999px',
                                  display: 'flex', alignItems: 'center', gap: 4
                                }}>
                                  <Sparkles size={12} fill="#000000" />
                                  <span>AED {p.offerPrice}/-</span>
                                </div>
                              </div>
                            )}

                            {/* Thumbnail Strip */}
                            {photos.length > 0 && (
                              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, width: '100%', minWidth: 0, boxSizing: 'border-box', scrollbarWidth: 'none' }}>
                                {photos.map((ph, i) => (
                                  <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                                    <img
                                      src={ph.url}
                                      alt={ph.label}
                                      onClick={() => setActivePhotoIdx(prev => ({ ...prev, [stableId]: i }))}
                                      style={{
                                        width: 52, height: 38, objectFit: 'cover', borderRadius: 8, cursor: 'pointer',
                                        border: activeIdx === i ? '2px solid #311b92' : '1px solid #e2e8f0',
                                        opacity: activeIdx === i ? 1 : 0.65, transition: 'all 0.15s'
                                      }}
                                    />
                                    {isAdmin && (
                                      <button
                                        onClick={() => handleDeletePhoto(p, i)}
                                        style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', border: 'none', color: '#fff', borderRadius: '50%', width: 16, height: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: '0.6rem', fontWeight: 900 }}
                                        title="Delete this photo"
                                      >✕</button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* 3. SPECIFICATIONS ZONE: Clean Lucide Spec Chips Grid */}
                          <div style={{ 
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                            gap: isMobile ? 6 : 8,
                            padding: isMobile ? '10px 8px' : '12px',
                            background: '#f8fafc',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            fontSize: isMobile ? '0.74rem' : '0.78rem',
                            width: '100%',
                            maxWidth: '100%',
                            boxSizing: 'border-box',
                            minWidth: 0
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#334155', minWidth: 0, overflow: 'hidden' }}>
                              <Cpu size={14} color="#311b92" style={{ flexShrink: 0 }} />
                              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', minWidth: 0 }}>
                                <strong>{p.processor}</strong> {p.gen && <span style={{ color: '#64748b' }}>({p.gen})</span>}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#334155', minWidth: 0, overflow: 'hidden' }}>
                              <Zap size={14} color="#2563eb" style={{ flexShrink: 0 }} />
                              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', minWidth: 0 }}>
                                <strong>{p.ram} GB</strong> RAM
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#334155', minWidth: 0, overflow: 'hidden' }}>
                              <HardDrive size={14} color="#059669" style={{ flexShrink: 0 }} />
                              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', minWidth: 0 }}>
                                <strong>{p.storage} GB</strong> SSD
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#334155', minWidth: 0, overflow: 'hidden' }}>
                              <Tablet size={14} color="#7c3aed" style={{ flexShrink: 0 }} />
                              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', minWidth: 0 }}>
                                {p.display || 'HD Screen'}
                              </span>
                            </div>

                            {p.gpu ? (
                              <div style={{
                                gridColumn: '1 / -1',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                                minWidth: 0,
                                overflow: 'hidden',
                                color: p.isDedicatedGpu ? '#b45309' : '#475569',
                                fontWeight: p.isDedicatedGpu ? 700 : 500,
                                background: p.isDedicatedGpu ? '#fffbeb' : 'transparent',
                                padding: p.isDedicatedGpu ? '4px 8px' : '2px 0',
                                borderRadius: '6px'
                              }}>
                                <Zap size={14} color={p.isDedicatedGpu ? '#f59e0b' : '#94a3b8'} style={{ flexShrink: 0 }} />
                                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', minWidth: 0 }}>{p.gpu}</span>
                                {p.isDedicatedGpu && (
                                  <span style={{ fontSize: '0.62rem', background: '#f59e0b', color: '#000000', padding: '1px 6px', borderRadius: '9999px', fontWeight: 800, marginLeft: 'auto', flexShrink: 0 }}>
                                    DEDICATED
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 5, color: '#64748b', fontSize: '0.72rem', minWidth: 0, overflow: 'hidden' }}>
                                <Zap size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
                                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', minWidth: 0 }}>Integrated Graphics</span>
                              </div>
                            )}

                            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: '#64748b', paddingTop: 4, borderTop: '1px dashed #e2e8f0', minWidth: 0, flexWrap: 'wrap', gap: 4 }}>
                              <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>OS: {p.os || 'Windows 10/11 Pro'}</span>
                              <span style={{ fontStyle: 'italic', flexShrink: 0 }}>Charger included</span>
                            </div>
                          </div>

                          {/* 4. PRICING ZONE: Strikethrough Original Price + Golden Amber Offer Price */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, paddingTop: 4, width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                            {p.originalPrice ? (
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Original</span>
                                <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.84rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                                  AED {p.originalPrice}
                                </span>
                              </div>
                            ) : <div />}

                            <div style={{ 
                              fontSize: isMobile ? '0.86rem' : '0.94rem', 
                              fontWeight: 800, 
                              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                              color: '#78350f',
                              padding: '6px 14px',
                              borderRadius: '9999px',
                              border: '1px solid #fcd34d',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              boxShadow: '0 2px 6px rgba(245, 158, 11, 0.12)'
                            }}>
                              <Sparkles size={13} color="#d97706" fill="#d97706" />
                              <span>Offer: AED {p.offerPrice}/-</span>
                            </div>
                          </div>

                          {/* 5. ACTION BAR (FOOTER): Add Photos, Copy Text, Share, Edit, Delete */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 2, width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                            {/* Photo Upload Button (Admin Only) */}
                            {isAdmin && (
                              <label style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                padding: '8px 10px', border: '1px dashed #c4b5fd', borderRadius: '12px',
                                cursor: isUploading ? 'not-allowed' : 'pointer', fontSize: isMobile ? '0.76rem' : '0.8rem', fontWeight: 700,
                                color: '#6d28d9', background: 'rgba(109, 40, 217, 0.04)',
                                opacity: isUploading ? 0.7 : 1, transition: 'all 0.15s', width: '100%',
                                minWidth: 0, boxSizing: 'border-box'
                              }}>
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  style={{ display: 'none' }}
                                  disabled={isUploading}
                                  onChange={e => e.target.files && handleAddPhotos(p, Array.from(e.target.files))}
                                />
                                <ImagePlus size={15} style={{ flexShrink: 0 }} />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {isUploading ? 'Uploading to Drive...' : photos.length === 0 ? 'Add Photos' : `Add More (${photos.length})`}
                                </span>
                              </label>
                            )}

                            {/* Action Buttons (Copy Text & Share) */}
                            <div style={{ display: 'flex', gap: 6, width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                              <button
                                style={{
                                  flex: 1,
                                  minWidth: 0,
                                  padding: isMobile ? '10px 8px' : '11px 14px',
                                  fontSize: isMobile ? '0.78rem' : '0.82rem',
                                  fontWeight: 800,
                                  borderRadius: '12px',
                                  border: 'none',
                                  background: 'linear-gradient(135deg, #25d366 0%, #16a34a 100%)',
                                  color: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 5,
                                  cursor: 'pointer',
                                  boxShadow: '0 3px 10px rgba(37, 211, 102, 0.25)',
                                  opacity: sharingId === (p.stableId || p.id) ? 0.7 : 1
                                }}
                                disabled={sharingId === (p.stableId || p.id)}
                                onClick={() => handleSmartShare(p)}
                              >
                                {sharingId === (p.stableId || p.id) ? (
                                  <span>Sharing...</span>
                                ) : (
                                  <>
                                    <MessageCircle size={15} style={{ flexShrink: 0 }} />
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {isMobileShareSupported
                                        ? photos.length > 0 ? `Share (${photos.length})` : 'Share Quote'
                                        : photos.length === 1
                                          ? 'Copy Photo + Text'
                                          : photos.length > 1
                                            ? `Copy + ${photos.length} Photos`
                                            : 'Copy Quote'}
                                    </span>
                                  </>
                                )}
                              </button>

                              <button 
                                style={{ 
                                  padding: isMobile ? '10px 12px' : '11px 14px',
                                  fontSize: isMobile ? '0.78rem' : '0.82rem', 
                                  fontWeight: 700,
                                  borderRadius: '12px',
                                  background: copiedId === p.id ? '#10b981' : '#ffffff',
                                  color: copiedId === p.id ? '#ffffff' : '#1e293b',
                                  border: copiedId === p.id ? '1px solid #10b981' : '1px solid #e2e8f0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 5,
                                  cursor: 'pointer',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                                  flexShrink: 0,
                                  whiteSpace: 'nowrap'
                                }}
                                onClick={() => handleCopy(p.rawText, p.id)}
                                title="Copy raw formatted WhatsApp quote"
                              >
                                {copiedId === p.id ? <Check size={14} /> : <Copy size={14} />}
                                <span>{copiedId === p.id ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>

                            {/* Admin Controls (Edit & Delete) */}
                            {isAdmin && (
                              <div style={{ display: 'flex', gap: 6, width: '100%', marginTop: 2 }}>
                                <button
                                  onClick={() => handleOpenEditProduct(p)}
                                  style={{
                                    flex: 1, padding: '7px 10px', background: '#eff6ff',
                                    color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '10px',
                                    fontWeight: 700, fontSize: '0.76rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5
                                  }}
                                >
                                  <Edit3 size={13} /> Edit Item
                                </button>

                                <button
                                  onClick={() => handleDeleteSingleProduct(p)}
                                  style={{
                                    padding: '7px 12px', background: '#fef2f2',
                                    color: '#dc2626', border: '1px solid #fecaca', borderRadius: '10px',
                                    fontWeight: 700, fontSize: '0.76rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5
                                  }}
                                >
                                  <Trash2 size={13} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  )}
              </div>
            </div>

          </div>
        </>
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {showModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
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
              style={{
                width: '100%',
                maxWidth: '750px',
                maxHeight: '90vh',
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                padding: '24px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Edit3 size={18} color="#311b92" /> PASTE / EDIT PRODUCT LIST
                </h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={20} />
                </button>
              </div>

              <textarea 
                style={{
                  flex: 1,
                  minHeight: '300px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.84rem',
                  lineHeight: 1.6,
                  padding: '14px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#0f172a',
                  outline: 'none',
                  resize: 'vertical'
                }}
                value={editorInput}
                onChange={e => setEditorInput(e.target.value)}
                placeholder="Paste your WhatsApp product list text here..."
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 10 }}>
                <button 
                  style={{
                    background: '#f1f5f9',
                    color: '#334155',
                    border: '1px solid #e2e8f0',
                    borderRadius: '9999px',
                    padding: '8px 16px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    cursor: 'pointer'
                  }}
                  onClick={() => { updateAndSaveRawText(DEFAULT_STOCK_CATALOG); setEditorInput(DEFAULT_STOCK_CATALOG); }}
                >
                  <Sparkles size={13} color="#f59e0b" /> Load Sample Template
                </button>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button 
                    style={{
                      background: 'none',
                      border: '1px solid #e2e8f0',
                      borderRadius: '9999px',
                      padding: '8px 18px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#64748b',
                      cursor: 'pointer'
                    }}
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    style={{
                      background: '#311b92',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '9999px',
                      padding: '10px 24px',
                      fontSize: '0.86rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(49, 27, 146, 0.25)'
                    }}
                    onClick={() => { updateAndSaveRawText(editorInput); setShowModal(false); }}
                  >
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
          width: '100%',
          maxWidth: '100vw',
          boxSizing: 'border-box',
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid #e2e8f0',
          padding: '10px 14px',
          boxShadow: '0 -4px 20px rgba(15, 23, 42, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          zIndex: 9999
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', whiteSpace: 'nowrap' }}>
            <span style={{ color: '#64748b' }}>Stock:</span>{' '}
            <strong style={{ color: '#311b92', fontWeight: 800 }}>{stats.matched}</strong> / {stats.total}
          </div>

          <button
            style={{
              flex: 1,
              maxWidth: '190px',
              padding: '9px 12px',
              fontWeight: 800,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: '#fbbf24',
              color: '#000000',
              borderRadius: '9999px',
              border: 'none',
              boxShadow: '0 3px 12px rgba(251, 191, 36, 0.35)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            onClick={() => handleCopy(formattedOutputText, 'mobile-bottom')}
          >
            {copiedId === 'mobile-bottom' ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedId === 'mobile-bottom' ? 'Copied Quotes!' : 'Copy Quotes'}</span>
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
                background: 'rgba(15, 23, 42, 0.94)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                zIndex: 99999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: 12, padding: 16
              }}
              onClick={() => setLightbox(null)}
            >
              {/* Close */}
              <button
                onClick={() => setLightbox(null)}
                style={{ position: 'absolute', top: 16, right: 20, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>

              {/* Image */}
              <motion.img
                key={lightbox.idx}
                initial={{ scale: 0.93, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.93, opacity: 0 }}
                src={photo.url}
                alt={photo.label}
                onClick={e => e.stopPropagation()}
                style={{ maxWidth: '95vw', maxHeight: '78vh', objectFit: 'contain', borderRadius: 14, boxShadow: '0 8px 60px rgba(0,0,0,0.6)' }}
              />

              {/* Label + Counter */}
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: 0.5 }}>
                {photo.label} — {lightbox.idx + 1} / {photos.length}
              </div>

              {/* Prev/Next */}
              {photos.length > 1 && (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={e => { e.stopPropagation(); setLightbox(prev => ({ ...prev, idx: (prev.idx - 1 + photos.length) % photos.length })); }}
                    style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '9999px', padding: '8px 22px', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setLightbox(prev => ({ ...prev, idx: (prev.idx + 1) % photos.length })); }}
                    style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '9999px', padding: '8px 22px', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
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
                      style={{ width: 52, height: 38, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', border: lightbox.idx === i ? '2px solid #fbbf24' : '2px solid rgba(255,255,255,0.2)', opacity: lightbox.idx === i ? 1 : 0.55, transition: 'all 0.15s' }}
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
              position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
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
                background: '#ffffff', width: '100%', maxWidth: 720, maxHeight: '85vh',
                borderRadius: 20, border: '1px solid #e2e8f0', display: 'flex',
                flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)'
              }}
            >
              {/* Vault Header */}
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, color: '#0f172a' }}>
                    <Camera size={18} color="#311b92" /> Product Photo Vault
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                    Photos auto-link to matching models when you paste WhatsApp laptop quotes!
                  </p>
                </div>
                <button onClick={() => setShowVaultModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Action Banner */}
              <div style={{ padding: '10px 24px', background: 'rgba(49, 27, 146, 0.05)', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: '#311b92', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Sparkles size={13} color="#f59e0b" /> Permanent high-resolution image hosting
                </div>
                <button
                  onClick={handleClearAllPhotos}
                  style={{ padding: '5px 12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '9999px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Trash2 size={13} /> Clear All Photos
                </button>
              </div>

              {/* Search Bar */}
              <div style={{ padding: '12px 24px', borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
                <input
                  type="text"
                  placeholder="Search albums by model name (e.g. 5310, T14, ZBook)..."
                  value={vaultSearch}
                  onChange={e => setVaultSearch(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 12,
                    border: '1px solid #e2e8f0', background: '#f8fafc',
                    color: '#0f172a', fontSize: '0.86rem', outline: 'none'
                  }}
                />
              </div>

              {/* Album List Grid */}
              <div style={{ padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
                {(() => {
                  const keys = Object.keys(productPhotos).filter(k => {
                    const list = productPhotos[k] || [];
                    if (list.length === 0) return false;
                    if (!vaultSearch.trim()) return true;
                    return k.toLowerCase().includes(vaultSearch.toLowerCase().replace(/[^a-z0-9]/g, ''));
                  });

                  if (keys.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '0.86rem' }}>
                        No saved photo albums matching "{vaultSearch}".
                      </div>
                    );
                  }

                  return keys.map(k => {
                    const photos = productPhotos[k] || [];
                    const modelName = k.replace(/^prod_/, '').replace(/_/g, ' ').toUpperCase();

                    return (
                      <div key={k} style={{ padding: 14, borderRadius: 14, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Laptop size={15} color="#311b92" /> {modelName}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 9px', borderRadius: '9999px', fontWeight: 700 }}>
                              {photos.length} Photos
                            </span>
                            {isAdmin && (
                              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', background: '#311b92', color: '#ffffff', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
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
                                style={{ width: 72, height: 54, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0', display: 'block' }}
                              />
                              {isAdmin && (
                                <button
                                  onClick={() => handleVaultDelete(k, i)}
                                  style={{
                                    position: 'absolute', top: -5, right: -5,
                                    background: '#ef4444', color: '#fff', border: 'none',
                                    borderRadius: '50%', width: 18, height: 18,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
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
              position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
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
                background: '#ffffff', width: '100%', maxWidth: 640, maxHeight: '85vh',
                borderRadius: 20, border: '1px solid #e2e8f0', display: 'flex',
                flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)'
              }}
            >
              {/* Modal Header */}
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    Staff Access Approval Console
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                    Approve staff members to grant them photo upload permissions into your Master Drive!
                  </p>
                </div>
                <button onClick={() => setShowApprovalModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
                
                {/* 1. Pending Access Requests */}
                <div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.84rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>
                    Pending Access Requests ({(adminRequests.pending || []).length})
                  </h4>
                  {(adminRequests.pending || []).length === 0 ? (
                    <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 12, fontSize: '0.82rem', color: '#64748b' }}>
                      No pending staff requests right now.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(adminRequests.pending || []).map((req, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                          <div>
                            <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{req.email}</strong>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Requested: {req.requestedAt}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => handleAdminAction('approve', req.email)}
                              style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '9999px', fontWeight: 800, fontSize: '0.76rem', cursor: 'pointer' }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAdminAction('reject', req.email)}
                              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '6px 14px', borderRadius: '9999px', fontWeight: 700, fontSize: '0.76rem', cursor: 'pointer' }}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Approved Staff Emails */}
                <div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.84rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                    Approved Master & Staff Admins ({(adminRequests.approved || []).length})
                  </h4>
                  {(adminRequests.approved || []).length === 0 ? (
                    <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 12, fontSize: '0.82rem', color: '#64748b' }}>
                      No approved staff yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(adminRequests.approved || []).map((email, idx) => {
                        const isMasterAccount = email.toLowerCase() === MASTER_EMAIL;
                        return (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                              {email}
                            </span>
                            {isMasterAccount ? (
                              <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 10px', borderRadius: '9999px', fontWeight: 800 }}>
                                Master Owner
                              </span>
                            ) : (
                              <button
                                onClick={() => handleAdminAction('revoke', email)}
                                style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '5px 12px', borderRadius: '9999px', fontWeight: 700, fontSize: '0.74rem', cursor: 'pointer' }}
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
              position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
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
                background: '#ffffff', width: '100%', maxWidth: 400,
                borderRadius: 20, border: '1px solid #e2e8f0', padding: 24,
                boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)', display: 'flex', flexDirection: 'column', gap: 16
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, color: '#0f172a' }}>
                  <Lock size={18} color="#311b92" /> Admin Unlock
                </h3>
                <button onClick={() => setShowAdminPinModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={20} />
                </button>
              </div>

              <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b', lineHeight: 1.5 }}>
                Enter Admin passcode to unlock stock editing, photo uploads, item edits, and deletions.
              </p>

              <form onSubmit={handleUnlockAdmin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <input
                  type="password"
                  placeholder="Enter Passcode (Default: 1234)..."
                  value={adminPinInput}
                  onChange={e => setAdminPinInput(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 12,
                    border: '1px solid #311b92', background: '#f8fafc',
                    color: '#0f172a', fontSize: '1rem', textAlign: 'center', outline: 'none'
                  }}
                />

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowAdminPinModal(false)}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 700, color: '#64748b', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1, padding: '10px 14px', fontWeight: 800,
                      background: '#311b92', color: '#ffffff', border: 'none',
                      borderRadius: 12, cursor: 'pointer', boxShadow: '0 4px 14px rgba(49, 27, 146, 0.25)'
                    }}
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
              position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
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
                background: '#ffffff', width: '100%', maxWidth: 540, maxHeight: '90vh',
                borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)', display: 'flex', flexDirection: 'column'
              }}
            >
              {/* Modal Header */}
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, color: '#0f172a' }}>
                  <Edit3 size={18} color="#311b92" /> Edit Laptop Specs
                </h3>
                <button onClick={() => setEditingProduct(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Form Body */}
              <div style={{ padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 5 }}>LAPTOP TITLE / MODEL</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontWeight: 700, outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 5 }}>PROCESSOR (CPU)</label>
                    <input
                      type="text"
                      value={editForm.processor}
                      onChange={e => setEditForm({ ...editForm, processor: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 5 }}>GENERATION</label>
                    <input
                      type="text"
                      placeholder="e.g. 10th"
                      value={editForm.gen}
                      onChange={e => setEditForm({ ...editForm, gen: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 5 }}>RAM (GB)</label>
                    <input
                      type="number"
                      value={editForm.ram}
                      onChange={e => setEditForm({ ...editForm, ram: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 5 }}>STORAGE (GB SSD)</label>
                    <input
                      type="number"
                      value={editForm.storage}
                      onChange={e => setEditForm({ ...editForm, storage: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 5 }}>OFFER PRICE (AED)</label>
                    <input
                      type="number"
                      value={editForm.offerPrice}
                      onChange={e => setEditForm({ ...editForm, offerPrice: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #fbbf24', background: '#fefce8', color: '#78350f', fontWeight: 800, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 5 }}>DISPLAY</label>
                    <input
                      type="text"
                      value={editForm.display}
                      onChange={e => setEditForm({ ...editForm, display: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 5 }}>GRAPHICS / GPU (OPTIONAL)</label>
                  <input
                    type="text"
                    placeholder="e.g. 4GB Nvidia RTX A2000"
                    value={editForm.gpu}
                    onChange={e => setEditForm({ ...editForm, gpu: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 10, justifyContent: 'flex-end', background: '#f8fafc' }}>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  style={{ padding: '9px 18px', borderRadius: '9999px', border: '1px solid #e2e8f0', background: '#ffffff', fontWeight: 700, color: '#64748b', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditedProduct}
                  style={{ padding: '9px 24px', borderRadius: '9999px', border: 'none', background: '#311b92', color: '#ffffff', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(49, 27, 146, 0.25)' }}
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            style={{
              position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
              background: '#0f172a', color: '#ffffff',
              padding: '12px 24px', borderRadius: '9999px',
              border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              fontWeight: 700, fontSize: '0.86rem', zIndex: 100000,
              maxWidth: '90vw', textAlign: 'center', display: 'flex', alignItems: 'center', gap: 8
            }}
          >
            <Check size={16} color="#4ade80" />
            <span>{toastMessage}</span>
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

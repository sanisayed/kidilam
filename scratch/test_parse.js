const fs = require('fs');

const rawText = `*PRODUCT LIST*
*21- 07- 2026 - Updated*

*DELL SERIES*

*1. Latitude  Series*


*💻 Dell Latitude E5440*
  Processor – Intel core  i5 , 4th
  RAM – 8 GB 
  Storage – 256 GB SSD
  Display –  13 Inch 
  OS –  Windows 11 pro
  
  Charger.
*Offer Price @399/- AED💰*


*💻 Dell Latitude E7270*
  Processor – Intel core  i5 , 6th
  RAM – 8 GB 
  Storage – 256 GB SSD
  Display –  12.5 Inch 
  OS –  Windows 11 pro
  
  Charger.
*Offer Price @499/- AED💰*


*💻 Dell Latitude 5310*
  Processor – Intel core  i5 
 10 th Generation
  RAM – 8 GB 
  Storage – 256 GB SSD
  Display –  14 Inch 
  OS –  Windows 11 pro
  
  Charger.
Price@~999/-AED~
**Offer Price @699/- AED* 💰


*💻 Dell Latitude 5410*
  Processor – Intel core  i5 
 10 th Generation
  RAM – 8 GB 
  Storage – 256 GB SSD
  Display –  14 Inch 
  OS –  Windows 11 pro
  
  Charger.
Price@~1099/-AED~
*Offer Price @799/- AED💰*


*💻 Dell Latitude 5310 2 IN 1*
  Processor – Intel Core i7-10th
  RAM – 16GB
  Storage – 256GB SSD
  Display –  13.3 Inch , Touch
  OS –  Windows 11 pro
  
  Charger.
@~1399/- Aed~
*Offer price @1199/- AED* 💰


*💻 Dell Latitude 5310 2 IN 1*
  Processor – Intel Core i7-10th
  RAM – 16GB
  Storage – 512 GB SSD
  Display –  13.3 Inch , Touch
  OS –  Windows 11 pro
  
  Charger.
@~1499/- Aed~
*Offer price @1299/- AED* 💰


*💻 Dell Latitude 5320*
  Processor – Intel core  i5 , 11th
  RAM – 16 GB 
  Storage – 256 GB SSD
  Display –  14 Inch  
  OS –  Windows 11 pro
  
  Charger.
Price@~1399/-AED~
*Offer Price @999/- AED💰*


*💻 Dell Latitude 7400*
  Processor – Intel core  i7
  8 th Generation
  RAM – 16 GB 
  Storage – 256 GB SSD
  Display –  14 Inch 
  OS –  Windows 11 pro
  
  Charger.
Price@~1299/-AED~
*Offer Price @999/- AED💰*

*💻 Dell Latitude 5420*
  Processor – Intel Core i7-11th
  RAM – 32GB
  Storage – 512 GB SSD
  Display –  14 inch
  GPU -intel iris xe
  OS –  Windows 11 pro
  
  Charger.
@~1899/- Aed~
*Offer price @1699/- AED* 💰

*💻 Dell Latitude 5540*
  Processor – Intel Core i5-13th
  RAM – 16 GB
  Storage – 512 GB SSD
  Display –  15.6 inch
  GPU -intel iris xe
  OS –  Windows 11 pro
  
  Charger.
@~1999/- Aed~
*Offer price @1799/- AED* 💰


*💻 DELL  VOSTRO 5599*
  Processor – Intel Core i5-
  10 th Generation
  RAM – 8 GB
  Storage  – 256GB SSD
  Display –  15.6 inch
  GPU -intel iris xe
  OS –  Windows 11 pro
  
  Charger.
@~1499/- Aed~
*Offer price @1099/- AED* 💰


*💻 Dell Latitude 7440 X360 Metal Body*
  Processor – Intel core  i7
  13 th Generation
  RAM – 16 GB 
  Storage – 512 GB SSD
  Display –  14 Inch X360 Touch
  OS –  Windows 11 pro
  
  Charger.
Price@~2499/-AED~
*Offer Price @2199/- AED💰*


*2. Dell precision*


*💻 DELL PRECISION 7670* 
Processor – Intel Core i7 12850HX 16-CORE
RAM – 32GB RAM DDR5
Storage – 512GB SSD
GPU- Intel iris XE
Graphics - 12 GB RTX A3000
Display –  16 Inch FHD+ 8K SUPPORT
OS –  Windows 11 pro
  @~6999 AED~/- 
 *Offer Price @3999/- AED💰*


*HP SERIES*

💻 *HP EliteBook 840 G7*
  Processor – Intel core i5-10 th
  RAM – 8 GB
  Storage – 256 GB SSD
  Display –  14 Inch
  OS –  Windows 11 pro
  Charger.
*Offer Price @949/- AED* 💰

*💻 HP EliteBook 840 G8*
  Processor – Intel core i5-11 th
  RAM – 8 GB
  Storage – 256 GB SSD
  Display –  14 Inch
  GPU- intel iris XE
  OS –  Windows 11 pro
  Charger.
*Offer Price @1099/- AED💰*

💻 *HP EliteBook 840 G8*
  Processor – Intel core i5-11 th
  RAM – 16GB
  Storage – 512GB SSD
  Display –  14 Inch
  GPU- intel iris XE
  OS –  Windows 11 pro
  Charger.
Offer Price @1399/- AED💰


💻 *HP EliteBook 830 G7 X360 2 in 1*
  Processor – Intel core i7-10 th
  RAM – 16 GB
  Storage – 512 GB SSD
  Display –  13.3 Inch 2IN1 touch
  OS –  Windows 11 pro
  Price @1899/-AED
  *Offer Price 1699/-AED* 💰


💻 *HP EliteBook 850 G7*
  Processor – Intel core i5-10 th
  RAM – 16 GB
  Storage – 512 GB SSD
  Display –  15.6 Inch
  OS –  Windows 11 pro
  Charger.
*Offer Price @1599/- AED* 💰

💻 *HP Zbook  Firefly G10*
  Processor – Intel core  i7 
  13 th Generation
  RAM – 16 GB 
  Storage – 512 GB SSD
  Graphics  -  Intel iris xe
  Display –  14 Inch 
  OS –  Windows 11 pro
  
  Charger.
*Offer Price @2399/- AED* 💰


💻 *HP ELITE BOOK 1040 G8 X360*
  Processor – Intel core i7 
 11 th Generation
  RAM – 32 GB
  Storage – 512 GB SSD
  Display –  14 Inch X360 Touch screen
  OS –  Windows 11 pro
  Charger.
*Offer Price @1899/- AED* 💰


💻 *HP ELITE BOOK 1040 G9*
  Processor – Intel core i5
 12 th Generation
  RAM – 16 GB
  Storage – 256 GB SSD
  Display –  14 Inch 
  OS –  Windows 11 pro
  Charger.
*Offer Price @1699/- AED* 💰


💻 *HP EliteBook 630 G11*
  Processor – Ultra 7
  RAM – 32GB
  Storage – 512GB SSD
  Display –  14 Inch 
  OS –  Windows 11 pro
  Charger.
  @3299/- AED
Offer Price @2599/- AED💰


*HP SPECTRE MODELS*


*💻 HP SPECTRE  13 X 360 2 IN 1*
  Processor – Intel core i7
  8  th Generation
  RAM – 16 GB
  Storage – 512 GB SSD
  Display –  13  Inch , Touch
  OS –  Windows 11 pro
  Charger.

*Offer Price @1599/- AED💰*


*💻 HP SPECTRE  13 X 360 2 IN 1*
  Processor – Intel core i7
  10  th Generation
  RAM – 16 GB
  Storage – 512 GB SSD
  Display –  13  Inch , Touch
  OS –  Windows 11 pro
  Charger.

*Offer Price @2499/- AED💰*


*💻 HP SPECTRE  15.6  X 360 2 IN 1*
  Processor – Intel core i7
  8  th Generation
  RAM – 16 GB
  Storage – 512 GB SSD
  Display –  15.6  Inch , Touch
  Graphics -  2 GB 
  OS –  Windows 11 pro
  Charger.

*Offer Price @1999/- AED💰*



*HP ENVY MODELS*

*💻 HP ENVY 15 X 360 2 IN 1*
  Processor – Intel core i7
  13  th Generation
  RAM – 16 GB
  Storage – 512 GB SSD
  Display –  15.6 Inch, Touch
  OS –  Windows 11 pro
  Charger.

*Offer Price @2999/- AED💰*


*LENOVO THINKPAD SERIES*


💻 *LENOVO THINKPAD L14*
Processor – Intel Core i7
10 th Generation
RAM – 8 GB RAM
Storage –256 GB  SSD
Display –  14 Inch
OS –  Windows 11 pro
Charger.
 *Offer Price @999/- AED💰*


*💻 LENOVO THINKPAD L14*
  Processor – Intel core  i7 
  10 th Generation
  RAM – 16 GB 
  Storage – 512 GB SSD
  Display –  14 Inch 
  OS –  Windows 11 pro
  
  Charger.
*Offer Price @1299/- AED💰*


*💻 LENOVO THINKPAD L15 GEN 1*
  Processor – Intel core  i5
  10 th Generation
  RAM – 8 GB 
  Storage – 256 GB SSD
  Display –  15.6 Inch
  OS –  Windows 11 pro
  
  Charger.
*Offer Price @1199/- AED💰*

💻 *LENOVO THINKPAD P14 S*
Processor – Intel Core i7
10 th Generation
RAM – 16 GB RAM
Storage –512 GB  SSD
Display –  14 Inch
Graphics - 2 GB
OS –  Windows 11 pro
Charger.
 @~1999 AED~/- 
 *Offer Price @1699/- AED💰*


💻 *LENOVO THINKPAD P14 S*
Processor – Intel Core i7
11 th Generation
RAM – 16 GB RAM
Storage –512 GB  SSD
Display –  14 Inch
Graphics - 4 GB
OS –  Windows 11 pro
Charger.
 @~2099 AED~/- 
 *Offer Price @1899/- AED💰*


💻 *LENOVO THINKPAD T14 GEN 1*
Processor – Intel Core i7
10 th Generation
RAM – 16 GB RAM
Storage –512 GB  SSD
Display –  14 Inch
OS –  Windows 11 pro
Charger.
 @~AED1699/-~ 
 *Offer Price @1399/- AED💰*


💻 *LENOVO THINKPAD T14 GEN 2*
Processor – Intel Core i7
11 th Generation
RAM – 16 GB RAM
Storage –512 GB  SSD
Display –  14 Inch
OS –  Windows 11 pro
Charger.
 @~AED1799/-~ 
 *Offer Price @1499/- AED💰*


💻 *LENOVO THINKPAD X13 Yoga*
Processor – Intel Core i5
11 th Generation
RAM – 16 GB RAM
Storage –512 GB  SSD
Display –  13.3 Inch 2in1 Touchscreen with pen
OS –  Windows 11 pro
Charger.
 @~AED1899/-~ 
 *Offer Price @1599/- AED💰*

💻 *LENOVO THINKPAD T14 GEN 3*
Processor – Intel Core i7
12 th Generation
RAM – 16 GB RAM
Storage –512 GB  SSD
Display –  14 Inch
OS –  Windows 11 pro
Charger.
 @~AED2199/-~ 
 *Offer Price @1899/- AED💰*


💻 *LENOVO THINKPAD X1 CARBON*
Processor – Intel Core i7
8 th Generation
RAM – 16 GB RAM
Storage –512 GB  SSD
Display –  14 Inch
OS –  Windows 11 pro
Charger.
 @~ AED~1599/- 
 *Offer Price @1299/- AED💰*

💻 *LENOVO THINKPAD X1 Carbon Gen 9*
Processor – Intel Core i7
11 th Generation
RAM – 16 GB RAM
Storage –512 GB  SSD
Display –  14 Inch
OS –  Windows 11 pro
Charger.
 @~AED2199/-~ 
 *Offer Price @1899/- AED💰*

💻 *LENOVO THINKPAD T14 GEN 4*
Processor – Intel Core i7
13 th Generation
RAM – 16 GB RAM
Storage –512 GB  SSD
Display –  14 Inch
OS –  Windows 11 pro
Charger.
 @~AED2699/-~ 
 *Offer Price @2199/- AED💰*

💻 *LENOVO THINKPAD T14 GEN 5*
Processor – Ultra 7
RAM – 16 GB RAM
Storage –512 GB  SSD
Display –  14 Inch
OS –  Windows 11 pro
Charger.
 @~AED2999/-~ 
 *Offer Price @2599/- AED💰*

💻 *LENOVO THINKPAD P14s Gen 4*
Processor – i7-13th
RAM – 16 GB RAM
Storage –512 GB  SSD
Display –  14 Inch
GPU- 4GB Graphics
OS –  Windows 11 pro
Charger.
 @~AED2999/-~ 
 *Offer Price @2599/- AED💰*

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
  Display –  12.5 Inch Touch  detachable Keyboard
  GPU-intel iris XE
  OS –  Windows 11 pro
  
  Charger.
@~2199/- Aed~
*Offer price @1799/- AED*


*💻 Microsoft Surface 4* 
  Processor – Intel Core i7-11th
  RAM – 16 GB
  Storage – 512 GB SSD
  Display –  14 Inch Touch 
  GPU-intel iris XE
  OS –  Windows 11 pro
  
  Charger.
@~2299/- Aed~
*Offer price @1899/- AED*



   *MACBOOK SERIES*


*💻 MacBook A1466  2017*
  Processor –  i5
  RAM – 8 GB
  Storage – 256 GB SSD
  OS: MAC OS
  Charger.
*Offer Price @799/- AED*`;

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

    let gpuParts = [];
    let gpuVram = 0;

    blockLines.forEach(l => {
      const lower = l.toLowerCase();

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
    });

    const fullGpuText = gpuParts.join(' / ');
    const fullGpuLower = fullGpuText.toLowerCase();

    const isDedicatedGpu = gpuVram >= 2 || /rtx|gtx|nvidia|radeon|geforce|a3000|a2000|t500|t600|\d+\s*gb/i.test(fullGpuLower);

    products.push({
      title: cleanTitle,
      gpu: fullGpuText,
      gpuVram,
      isDedicatedGpu
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.includes('💻')) {
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

const prods = parseWhatsAppCatalog(rawText);
console.log("TOTAL PRODUCTS PARSED:", prods.length);
prods.forEach((p, idx) => {
  console.log("[" + (idx+1) + "] " + p.title + " | GPU: \"" + p.gpu + "\" | VRAM: " + p.gpuVram + " | Dedicated: " + p.isDedicatedGpu);
});

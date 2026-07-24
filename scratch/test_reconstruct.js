import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const dataBuffer = fs.readFileSync('c:/Users/dell/Documents/kidilam/NUN KAMI.pdf');

const parser = new PDFParse({ data: dataBuffer });

parser.load().then(async (doc) => {
  const page = await doc.getPage(1);
  const textContent = await page.getTextContent();
  
  // Separate into columns by X coordinate (middle of page is around 260)
  const leftItems = [];
  const rightItems = [];
  
  for (const item of textContent.items) {
    if (!item.str || !item.str.trim()) continue;
    const x = item.transform[4];
    // We only split the top header section (where Billing Address and Invoice Date are)
    // The items table at the bottom spans the whole page, so we keep it in Left or process it globally.
    // Actually, let's look at Y coordinate:
    // Billing Address & Invoice Date are near the top (Y coordinate > 350)
    const y = item.transform[5];
    if (y > 350) {
      if (x < 260) {
        leftItems.push(item);
      } else {
        rightItems.push(item);
      }
    } else {
      // Below the header, keep all in leftItems so we can parse the items table as single lines
      leftItems.push(item);
    }
  }

  // Reconstruct lines for left/global items
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

  console.log('--- Left/Global Column ---');
  leftLines.forEach((l, i) => console.log(`${i}: [${l}]`));

  console.log('--- Right Column ---');
  rightLines.forEach((l, i) => console.log(`${i}: [${l}]`));

  // 1. Extract Customer Name from Left Column
  let customerName = 'Walk-in Customer';
  const billingIdx = leftLines.findIndex(l => l.includes('BILLING ADDRESS') || l.includes('رةﻮﺗﺎﻔﻟا انﻮﻨﻋ') || l.includes('رة ﻮ ﺗ ﺎ ﻔ ﻟ ا ان ﻮ ﻨ ﻋ'));
  if (billingIdx !== -1 && leftLines[billingIdx + 1]) {
    const candidate = leftLines[billingIdx + 1].trim();
    if (!candidate.startsWith('Ph.') && !candidate.startsWith('TRN')) {
      customerName = candidate;
    }
  }
  console.log('Parsed Customer Name:', customerName);

  // 2. Extract Invoice Date from Right Column
  let invoiceDate = '';
  const dateIdx = rightLines.findIndex(l => l.includes('INVOICE DATE') || l.includes('ﺦﻳرﺎﺗ') || l.includes('ﺦ ﻳ ر ﺎ ﺗ'));
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
  console.log('Parsed Invoice Date:', invoiceDate);

}).catch(err => {
  console.error(err);
});

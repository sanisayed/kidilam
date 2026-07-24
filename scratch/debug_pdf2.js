import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const dataBuffer = fs.readFileSync('c:/Users/dell/Documents/kidilam/NUN KAMI.pdf');

// PDFParse.create or PDFParse constructor? Let's check keys of PDFParse or try calling it
console.log('PDFParse keys:', Object.keys(PDFParse));
console.log('PDFParse toString:', PDFParse.toString());

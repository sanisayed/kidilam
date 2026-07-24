import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const dataBuffer = fs.readFileSync('c:/Users/dell/Documents/kidilam/NUN KAMI.pdf');

const parser = new PDFParse({ data: dataBuffer });
parser.getText().then(result => {
  console.log('--- Text Content ---');
  console.log(result.text);
}).catch(err => {
  console.error('Error:', err);
});

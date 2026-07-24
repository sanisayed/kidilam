import * as pdfjsLib from 'pdfjs-dist';

// pdfjs-dist requires a workerSrc configuration
// For Node.js, we can set workerSrc to the path of pdfjs-dist/build/pdf.worker.mjs
pdfjsLib.GlobalWorkerOptions.workerSrc = './node_modules/pdfjs-dist/build/pdf.worker.mjs';

async function extractText() {
  try {
    const loadingTask = pdfjsLib.getDocument('c:/Users/dell/Documents/kidilam/NUN KAMI.pdf');
    const pdf = await loadingTask.promise;
    console.log(`PDF loaded. Total pages: ${pdf.numPages}`);
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const strings = textContent.items.map(item => item.str);
      console.log(`--- Page ${i} ---`);
      console.log(strings.join('\n'));
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

extractText();

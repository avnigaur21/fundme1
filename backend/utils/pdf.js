const pdfParse = require('pdf-parse');

/**
 * Robustly extracts text from a PDF buffer, supporting multiple versions
 * of the pdf-parse library (classic function vs modern object-oriented v2+).
 */
async function extractTextFromPDF(dataBuffer) {
  try {
    if (!dataBuffer) return "";
    
    // Convert Buffer to Uint8Array for modern pdf-parse
    const uint8Array = new Uint8Array(dataBuffer.buffer, dataBuffer.byteOffset, dataBuffer.byteLength);
    
    let text = "";
    if (pdfParse.PDFParse) {
      console.log("🔍 Using PDFParse Class...");
      const parser = new pdfParse.PDFParse({ data: uint8Array });
      let result;
      try {
        result = await parser.getText();
      } finally {
        await parser.destroy();
      }
      
      // pdf-parse v2 returns `{ pages: [{ text: ... }] }`.
      // Flatten that structure before sending it to the profile prompt;
      // passing the JSON wrapper wastes context and can make extraction fail.
      if (typeof result === 'string') {
        text = result;
      } else if (result && Array.isArray(result.pages)) {
        text = result.pages.map(page => page?.text || '').join('\n');
      } else if (result && result.items) {
        text = result.items.map(i => i.str || "").join(" ");
      } else {
        text = result?.text || '';
      }
    } else if (typeof pdfParse === 'function') {
      const data = await pdfParse(dataBuffer);
      text = data.text || "";
    }

    return String(text || "").trim();
  } catch (err) {
    console.error("❌ PDF Parsing Error:", err.message);
    return "";
  }
}

module.exports = { extractTextFromPDF };

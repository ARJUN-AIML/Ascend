const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extracts raw text from a PDF or DOCX buffer.
 * @param {Buffer} buffer - The file buffer
 * @param {String} mimetype - The file mimetype
 * @returns {Promise<String>} - The extracted text
 */
const extractText = async (buffer, mimetype) => {
  try {
    if (mimetype === 'application/pdf') {
      const data = await pdfParse(buffer);
      return data.text;
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      mimetype === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else {
      throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
    }
  } catch (error) {
    console.error('[resumeParserService] Extraction failed:', error.message);
    throw new Error('Failed to extract text from the document. The file might be corrupted or protected.');
  }
};

module.exports = { extractText };

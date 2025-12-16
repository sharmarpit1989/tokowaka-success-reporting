/**
 * File Parser Service
 * Parses CSV and Excel files to extract URLs
 */

const fs = require('fs-extra');
const path = require('path');
const xlsx = require('xlsx');

/**
 * Parse URL file (CSV or Excel) and extract URLs
 * @param {string} filePath - Path to the file
 * @returns {Promise<Array<string>>} Array of URLs
 */
async function parseURLFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.csv') {
    return parseCSVFile(filePath);
  } else if (ext === '.xlsx' || ext === '.xls') {
    return parseExcelFile(filePath);
  } else {
    throw new Error(`Unsupported file format: ${ext}`);
  }
}

/**
 * Parse CSV file
 */
async function parseCSVFile(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);
  
  return extractURLsFromData(data);
}

/**
 * Parse Excel file
 */
async function parseExcelFile(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);
  
  return extractURLsFromData(data);
}

/**
 * Extract URLs from parsed data
 * Looks for columns named: url, urls, link, links, URL, URLs, Link, Links
 */
function extractURLsFromData(data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('No data found in file');
  }

  // Find URL column (case-insensitive)
  const firstRow = data[0];
  const urlColumn = Object.keys(firstRow).find(key => 
    ['url', 'urls', 'link', 'links'].includes(key.toLowerCase())
  );

  if (!urlColumn) {
    // If no URL column found, try to detect URLs in any column
    const allValues = data.flatMap(row => Object.values(row));
    const urls = allValues.filter(val => 
      typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://'))
    );
    
    if (urls.length === 0) {
      throw new Error('No URL column found. Expected column named: url, urls, link, or links');
    }
    
    return [...new Set(urls)]; // Remove duplicates
  }

  // Extract URLs from the identified column
  const urls = data
    .map(row => row[urlColumn])
    .filter(url => url && typeof url === 'string' && url.trim())
    .map(url => url.trim());

  // Remove duplicates
  return [...new Set(urls)];
}

module.exports = {
  parseURLFile,
  parseCSVFile,
  parseExcelFile,
  extractURLsFromData
};

import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Service to scan/scrape company websites to extract info for "Why this role?" statements.
 */
export class ScraperService {
  /**
   * Fetch and extract text and metadata from a company's website
   * @param {string} url - The website URL to scan
   * @returns {Promise<Object>} - The extracted text and information
   */
  static async scanWebsite(url) {
    try {
      // Validate URL
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      
      const response = await axios.get(formattedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000 // 10s timeout
      });

      const $ = cheerio.load(response.data);

      // Remove unwanted elements
      $('script, style, nav, footer, header, iframe').remove();

      // Extract metadata
      const title = $('title').text().trim();
      const metaDescription = $('meta[name="description"]').attr('content') || '';
      const metaKeywords = $('meta[name="keywords"]').attr('content') || '';

      // Extract main content areas
      const headings = [];
      $('h1, h2, h3').each((i, el) => {
        headings.push($(el).text().trim());
      });

      // Extract paragraphs / clean text
      const paragraphs = [];
      $('p').each((i, el) => {
        const text = $(el).text().trim();
        if (text.length > 20) {
          paragraphs.push(text);
        }
      });

      // Assemble a clean text representation of the company profile
      const rawText = paragraphs.slice(0, 15).join('\n'); // limit to first 15 paragraphs to prevent token bloat

      return {
        url: formattedUrl,
        title,
        metaDescription,
        metaKeywords,
        headings: headings.slice(0, 10),
        extractedText: rawText,
        scannedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error scraping website ${url}:`, error.message);
      throw new Error(`Failed to scan company website: ${error.message}`);
    }
  }
}

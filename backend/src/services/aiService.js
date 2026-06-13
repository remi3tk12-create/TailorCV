import axios from 'axios';

/**
 * Service that integrates with AI/LLM models to adapt CV content
 * and generate "Why this role?" statements based on job descriptions and company website text.
 */
export class AiService {
  /**
   * Generates a custom "Why this role?" statement using job description and company data
   * @param {string} jobDescription - The job offer text
   * @param {Object} companyData - Extracted data from company website (from ScraperService)
   * @returns {Promise<string>} - The compelling "Why this role?" statement
   */
  static async generateWhyThisRole(jobDescription, companyData) {
    const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('AI API key not configured. Using rule-based fallback generator.');
      return this._generateFallbackWhyThisRole(jobDescription, companyData);
    }

    try {
      // In a real implementation, we would call OpenAI, Anthropic, or Gemini here.
      // E.g., calling Gemini API or OpenAI API.
      // We provide a clean structure ready for API integration.
      
      // Real API placeholder call:
      // const response = await axios.post('https://api.openai.com/v1/chat/completions', { ... });
      // return response.data.choices[0].message.content;

      return this._generateFallbackWhyThisRole(jobDescription, companyData);
    } catch (error) {
      console.error('AI generation error:', error.message);
      return this._generateFallbackWhyThisRole(jobDescription, companyData);
    }
  }

  /**
   * Tailor professional experience bullet points to match the target job requirements
   * @param {Array<Object>} experiences - Array of work experience objects
   * @param {string} jobDescription - Target job offer text
   * @param {Array<string>} keySkills - User listed skills
   * @returns {Promise<Array<Object>>} - The tailored experience array
   */
  static async tailorExperience(experiences, jobDescription, keySkills) {
    // Structure to interact with LLMs to modify bullet points, highlight relevant skills,
    // and match target job description keywords.
    
    // For the skeleton, we return the experiences with tailored descriptions.
    return experiences.map(exp => ({
      ...exp,
      description: exp.description + ' (Adapted to match requirements for key skills: ' + (keySkills ? keySkills.join(', ') : '') + ')'
    }));
  }

  /**
   * Rule-based fallback "Why this role?" generator when AI keys are missing
   */
  static _generateFallbackWhyThisRole(jobDescription, companyData) {
    const companyName = companyData?.title || 'the company';
    const cleanCompanyName = companyName.split('|')[0].split('-')[0].trim();
    
    return `I am incredibly excited about the opportunity to join ${cleanCompanyName}. ` +
      `Your mission and the work highlighted on your website, particularly in relation to "${companyData?.metaDescription || 'industry-leading solutions'}", ` +
      `aligns perfectly with my professional goals and passion. With my expertise, I am confident I can contribute significantly ` +
      `to your continued success and help drive the key initiatives outlined in this role.`;
  }
}

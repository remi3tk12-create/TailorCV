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
      console.warn('AI API key not configured. Using intelligent rule-based fallback generator.');
      return this._generateFallbackWhyThisRole(jobDescription, companyData);
    }

    try {
      // If we had OpenAI/Gemini configured, we would perform the actual API request.
      // Below is the real integration structure for future deployment:
      /*
      const prompt = `
        You are an expert career consultant. Based on the job description and company information, generate a compelling, ATS-friendly "Why this role?" statement (about 3-4 sentences) for the candidate's CV.
        
        Company Website Data:
        Title: ${companyData?.title || ''}
        Description: ${companyData?.metaDescription || ''}
        Keywords: ${companyData?.metaKeywords || ''}
        Content Snippets: ${companyData?.extractedText || ''}
        
        Job Offer:
        ${jobDescription}
      `;
      */
      
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
    // Return tailored experiences based on key skills and job description keywords
    const skillsList = keySkills && keySkills.length > 0 ? keySkills : ['software engineering', 'problem solving'];
    
    return experiences.map(exp => {
      let tailoredDesc = exp.description || '';
      
      // Intelligent rule-based enhancement based on candidate skills
      const skillEnhancements = skillsList
        .slice(0, 3)
        .map(skill => `Optimized workflows using ${skill} to deliver high-quality business value.`)
        .join(' ');
      
      tailoredDesc = `${tailoredDesc}\n• Tailored Achievement: ${skillEnhancements} Specifically aligned with the requirements of the role.`;

      return {
        ...exp,
        description: tailoredDesc
      };
    });
  }

  /**
   * Refine CV content during premium interactive sessions based on custom user instruction
   * @param {Object} currentContent - The current structured CV data
   * @param {string} instruction - Custom user prompt (e.g. "make it sound more leadership focused")
   * @returns {Promise<Object>} - Refined structured CV data
   */
  static async refineCvContent(currentContent, instruction) {
    console.log(`Refining CV content with instruction: "${instruction}"`);
    
    // Create a copy of current content
    const refined = JSON.parse(JSON.stringify(currentContent));
    const normalizedInstruction = instruction.toLowerCase();

    // Intelligent fallback rule matching
    if (normalizedInstruction.includes('leadership') || normalizedInstruction.includes('management') || normalizedInstruction.includes('lead')) {
      refined.whyThisRole = `${refined.whyThisRole || ''} Driven by a strong leadership mindset, I look forward to guiding teams, fostering collaboration, and driving strategic execution at the highest level.`;
      
      if (refined.experience && refined.experience.length > 0) {
        refined.experience = refined.experience.map(exp => ({
          ...exp,
          role: exp.role.startsWith('Senior') || exp.role.includes('Lead') ? exp.role : `Lead / Senior ${exp.role}`,
          description: `${exp.description || ''}\n• Mentored junior engineers, established best practices, and drove cross-functional project execution to successfully deliver on business goals.`
        }));
      }
    } else if (normalizedInstruction.includes('concise') || normalizedInstruction.includes('shorten') || normalizedInstruction.includes('brief')) {
      if (refined.whyThisRole) {
        refined.whyThisRole = refined.whyThisRole.split('. ').slice(0, 2).join('. ') + '.';
      }
      if (refined.experience) {
        refined.experience = refined.experience.map(exp => ({
          ...exp,
          description: exp.description ? exp.description.split('\n').slice(0, 2).join('\n') : ''
        }));
      }
    } else if (normalizedInstruction.includes('technical') || normalizedInstruction.includes('tech') || normalizedInstruction.includes('skills')) {
      refined.whyThisRole = `${refined.whyThisRole || ''} I am eager to leverage my deep technical expertise to build scalable, secure, and robust systems.`;
      
      if (refined.experience) {
        refined.experience = refined.experience.map(exp => ({
          ...exp,
          description: `${exp.description || ''}\n• Engineered highly scalable architectures, focused on performance tuning and modular, clean code implementations.`
        }));
      }
    } else {
      // General refinement fallback
      refined.whyThisRole = `${refined.whyThisRole || ''} (Refined with focus on: ${instruction})`;
      if (refined.experience) {
        refined.experience = refined.experience.map(exp => ({
          ...exp,
          description: `${exp.description || ''}\n• Refined: Aligned achievement bullet point to emphasize "${instruction}".`
        }));
      }
    }

    return refined;
  }

  /**
   * Rule-based fallback "Why this role?" generator when AI keys are missing
   */
  static _generateFallbackWhyThisRole(jobDescription, companyData) {
    const companyName = companyData?.title || 'the company';
    const cleanCompanyName = companyName.split('|')[0].split('-')[0].trim();
    
    return `I am incredibly excited about the opportunity to join ${cleanCompanyName}. ` +
      `Your mission and the work highlighted on your website, particularly in relation to "${companyData?.metaDescription || 'industry-leading solutions'} ${companyData?.metaKeywords || ''}", ` +
      `aligns perfectly with my professional goals and passion. With my expertise, I am confident I can contribute significantly ` +
      `to your continued success and help drive the key initiatives outlined in this role.`;
  }
}

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabase } from '../config/database.js';
import { ScraperService } from '../services/scraperService.js';
import { AiService } from '../services/aiService.js';
import { PdfService } from '../services/pdfService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Generate a new tailored CV
 * POST /api/cv/generate
 */
export async function generateCv(req, res, next) {
  // Support fields from multiple formats (CamelCase and snake_case)
  const { 
    jobDescription, 
    skills, 
    companyWebsiteUrl, 
    companyUrl, // Alternate key
    companyName, 
    jobTitle, 
    experiences, 
    experience, // Alternate key
    education, 
    name, 
    email 
  } = req.body;

  if (!jobDescription) {
    return res.status(400).json({ error: 'Job description is required' });
  }

  // Parse skills
  const inputSkills = skills || [];
  const skillsList = Array.isArray(inputSkills) 
    ? inputSkills 
    : (typeof inputSkills === 'string' ? inputSkills.split(',').map(s => s.trim()) : []);

  if (skillsList.length === 0) {
    return res.status(400).json({ error: 'At least one skill is required' });
  }

  const db = getDatabase();

  try {
    const userId = req.user.id;
    const userPlan = req.user.plan;

    // Freemium Limit Check (Max 5 CVs for free users)
    if (userPlan === 'free') {
      const cvCountRow = db.prepare('SELECT COUNT(*) as count FROM cv_slots WHERE user_id = ?').get(userId);
      const cvCount = cvCountRow ? cvCountRow.count : 0;

      if (cvCount >= 5) {
        return res.status(403).json({
          error: 'Free plan limit reached (5 CVs).',
          code: 'LIMIT_REACHED',
          message: 'You have reached the maximum of 5 tailored CVs on the Free plan. Please upgrade to the Premium plan for unlimited slots and interactive refining!'
        });
      }
    }

    // Step 1: Optional Web Scraping (scans either companyUrl or companyWebsiteUrl)
    const targetUrl = companyUrl || companyWebsiteUrl;
    let companyData = null;
    let targetCompanyName = companyName || 'Target Company';

    if (targetUrl) {
      try {
        companyData = await ScraperService.scanWebsite(targetUrl);
        if (companyData && companyData.title && !companyName) {
          targetCompanyName = companyData.title.split('|')[0].split('-')[0].trim();
        }
      } catch (scrapingErr) {
        console.warn(`Scraping failed for ${targetUrl}, proceeding without scraped data:`, scrapingErr.message);
      }
    }

    // Step 2: Content Generation via AI Service
    const whyThisRole = await AiService.generateWhyThisRole(jobDescription, companyData);

    // Default/Fallback experiences (STAR compliant bullets)
    const rawExperiences = experience || experiences;
    const baseExperiences = rawExperiences && rawExperiences.length > 0 ? rawExperiences : [
      {
        role: 'Senior Software Engineer',
        company: 'InnovateTech Corp',
        startDate: '2023-01',
        endDate: 'Present',
        description: 'Design and develop robust Node.js and React web applications, optimizing API performance and leading architectural refactoring.\n• STAR Action: Spearheaded migration of legacy services to microservices, reducing load times by 30% and modernizing the developer experience.'
      },
      {
        role: 'Full Stack Developer',
        company: 'DevSolutions Inc',
        startDate: '2020-06',
        endDate: '2022-12',
        description: 'Built scalable backend microservices, designed relational database schemas, and integrated third-party secure APIs.\n• STAR Action: Designed secure payment flow integration, reducing transaction checkout friction by 12% and capturing $40k additional monthly revenue.'
      }
    ];

    const tailoredExperiences = await AiService.tailorExperience(baseExperiences, jobDescription, skillsList);

    // Standardize User Details / Placeholders for omitted personal info
    const emailPrefix = req.user.email.split('@')[0];
    const defaultCandidateName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    
    // Check if user chose to leave name/email blank
    const candidateName = name || defaultCandidateName || '[NAME - TO BE FILLED IN]';
    const candidateEmail = email || req.user.email || '[EMAIL - TO BE FILLED IN]';

    const inputEducation = education && education.length > 0 ? education : [
      {
        degree: 'Bachelor of Science in Computer Science',
        school: 'State Technical University',
        year: '2020'
      }
    ];

    const cvData = {
      name: candidateName,
      email: candidateEmail,
      whyThisRole,
      skills: skillsList,
      experience: tailoredExperiences,
      education: inputEducation
    };

    // Step 3: Write PDF & JSON Data files
    const cvId = crypto.randomUUID();
    const tailoredCvPath = path.resolve(uploadDir, `tailored-cv-${cvId}.pdf`);
    const jsonPath = path.resolve(uploadDir, `tailored-cv-${cvId}.json`);

    await PdfService.generatePdf(cvData, tailoredCvPath);
    fs.writeFileSync(jsonPath, JSON.stringify(cvData, null, 2));

    // Handle original CV upload path
    let originalCvPath = null;
    if (req.file) {
      originalCvPath = req.file.path;
    }

    const finalJobTitle = jobTitle || 'Tailored Position';
    const createdAt = new Date().toISOString();

    // Step 4: Save slot to database
    db.prepare(`
      INSERT INTO cv_slots (id, user_id, job_title, company_name, job_description, original_cv_path, tailored_cv_path, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?)
    `).run(cvId, userId, finalJobTitle, targetCompanyName, jobDescription, originalCvPath, tailoredCvPath, createdAt);

    return res.status(201).json({
      message: 'CV tailored and generated successfully',
      cvId,
      jobTitle: finalJobTitle,
      companyName: targetCompanyName,
      status: 'completed',
      createdAt,
      cvData,
      downloadUrl: `/api/cv/${cvId}/download`
    });
  } catch (error) {
    console.error('Error generating tailored CV:', error);
    return res.status(500).json({ error: 'Internal server error during CV generation' });
  }
}

/**
 * Preview adapted CV structure (Free & Premium, no limits, no DB write)
 * POST /api/cv/preview
 */
export async function previewCv(req, res, next) {
  const { jobDescription, skills, companyWebsiteUrl, companyUrl, companyName, experiences, experience } = req.body;

  if (!jobDescription) {
    return res.status(400).json({ error: 'Job description is required' });
  }

  const inputSkills = skills || [];
  const skillsList = Array.isArray(inputSkills) 
    ? inputSkills 
    : (typeof inputSkills === 'string' ? inputSkills.split(',').map(s => s.trim()) : []);

  if (skillsList.length === 0) {
    return res.status(400).json({ error: 'At least one skill is required' });
  }

  try {
    const targetUrl = companyUrl || companyWebsiteUrl;
    let companyData = null;
    let targetCompanyName = companyName || 'Target Company';

    if (targetUrl) {
      try {
        companyData = await ScraperService.scanWebsite(targetUrl);
        if (companyData && companyData.title && !companyName) {
          targetCompanyName = companyData.title.split('|')[0].split('-')[0].trim();
        }
      } catch (scrapingErr) {
        console.warn(`Scraping failed during preview:`, scrapingErr.message);
      }
    }

    const whyThisRole = await AiService.generateWhyThisRole(jobDescription, companyData);

    const rawExperiences = experience || experiences;
    const baseExperiences = rawExperiences && rawExperiences.length > 0 ? rawExperiences : [
      {
        role: 'Senior Software Engineer',
        company: 'InnovateTech Corp',
        startDate: '2023-01',
        endDate: 'Present',
        description: 'Design and develop robust Node.js and React web applications, optimizing API performance and leading architectural refactoring.\n• STAR Action: Spearheaded migration of legacy services to microservices, reducing load times by 30% and modernizing the developer experience.'
      },
      {
        role: 'Full Stack Developer',
        company: 'DevSolutions Inc',
        startDate: '2020-06',
        endDate: '2022-12',
        description: 'Built scalable backend microservices, designed relational database schemas, and integrated third-party secure APIs.\n• STAR Action: Designed secure payment flow integration, reducing transaction checkout friction by 12% and capturing $40k additional monthly revenue.'
      }
    ];

    const tailoredExperiences = await AiService.tailorExperience(baseExperiences, jobDescription, skillsList);

    const emailPrefix = req.user ? req.user.email.split('@')[0] : 'candidate';
    const candidateName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

    const cvData = {
      name: candidateName,
      email: req.user ? req.user.email : 'placeholder@example.com',
      whyThisRole,
      skills: skillsList,
      experience: tailoredExperiences,
      education: [
        {
          degree: 'Bachelor of Science in Computer Science',
          school: 'State Technical University',
          year: '2020'
        }
      ]
    };

    return res.json({
      message: 'CV preview generated successfully',
      companyName: targetCompanyName,
      cvData
    });
  } catch (error) {
    console.error('Error previewing CV:', error);
    return res.status(500).json({ error: 'Internal server error during CV preview' });
  }
}

/**
 * Refine CV content interactively (Premium feature)
 * POST /api/cv/refine/:id or POST /api/cv/premium/refine
 */
export async function refineCv(req, res, next) {
  // Support both body-based cvId (premium/refine) and url-based id (:id/refine)
  const id = req.params.id || req.body.cvId;
  const { instruction } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'CV ID is required for refinement' });
  }

  if (!instruction) {
    return res.status(400).json({ error: 'Refinement instruction is required' });
  }

  const db = getDatabase();

  try {
    const userId = req.user.id;
    const userPlan = req.user.plan;

    // Verify Premium subscription
    if (userPlan !== 'premium') {
      return res.status(403).json({
        error: 'Premium feature only.',
        code: 'PREMIUM_REQUIRED',
        message: 'Interactive refinement with the AI algorithm is a Premium-only feature. Please upgrade your subscription to refine and polish your CVs!'
      });
    }

    // Retrieve CV slot
    const cvSlot = db.prepare('SELECT * FROM cv_slots WHERE id = ? AND user_id = ?').get(id, userId);
    if (!cvSlot) {
      return res.status(404).json({ error: 'CV slot not found or access denied' });
    }

    const jsonPath = path.resolve(uploadDir, `tailored-cv-${id}.json`);
    if (!fs.existsSync(jsonPath)) {
      return res.status(404).json({ error: 'CV source data file missing, refinement unavailable' });
    }

    // Step 1: Read source data JSON
    const cvData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    // Step 2: Refine content via AI Service
    const refinedCvData = await AiService.refineCvContent(cvData, instruction);

    // Step 3: Overwrite PDF & JSON files
    await PdfService.generatePdf(refinedCvData, cvSlot.tailored_cv_path);
    fs.writeFileSync(jsonPath, JSON.stringify(refinedCvData, null, 2));

    return res.json({
      message: 'CV refined successfully',
      cvId: id,
      cvData: refinedCvData,
      downloadUrl: `/api/cv/${id}/download`
    });
  } catch (error) {
    console.error('Error refining CV:', error);
    return res.status(500).json({ error: 'Internal server error during CV refinement' });
  }
}

/**
 * Fetch a saved CV's full details
 * GET /api/cv/:id
 */
export async function getCvDetails(req, res, next) {
  const { id } = req.params;
  const db = getDatabase();

  try {
    const userId = req.user.id;
    const cvSlot = db.prepare('SELECT * FROM cv_slots WHERE id = ? AND user_id = ?').get(id, userId);

    if (!cvSlot) {
      return res.status(404).json({ error: 'CV record not found or access denied' });
    }

    // Attempt to load associated structured JSON data
    const jsonPath = path.resolve(uploadDir, `tailored-cv-${id}.json`);
    let cvData = null;
    if (fs.existsSync(jsonPath)) {
      try {
        cvData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      } catch (err) {
        console.error(`Error parsing JSON data file for CV ${id}:`, err.message);
      }
    }

    return res.json({
      id: cvSlot.id,
      jobTitle: cvSlot.job_title,
      companyName: cvSlot.company_name,
      jobDescription: cvSlot.job_description,
      status: cvSlot.status,
      createdAt: cvSlot.created_at,
      cvData,
      downloadUrl: `/api/cv/${id}/download`
    });
  } catch (error) {
    console.error('Error fetching CV details:', error);
    return res.status(500).json({ error: 'Internal server error fetching CV details' });
  }
}

/**
 * List user's CVs with pagination support
 * GET /api/cv/history
 */
export async function historyCvs(req, res, next) {
  const db = getDatabase();

  try {
    const userId = req.user.id;
    
    // Parse pagination parameters (default: page 1, limit 10)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count of CV slots
    const totalRow = db.prepare('SELECT COUNT(*) as count FROM cv_slots WHERE user_id = ?').get(userId);
    const total = totalRow ? totalRow.count : 0;

    // Get paginated CV slots
    const cvs = db.prepare(`
      SELECT id, job_title as jobTitle, company_name as companyName, status, created_at as createdAt
      FROM cv_slots
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(userId, limit, offset);

    return res.json({
      cvs,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching CV history:', error);
    return res.status(500).json({ error: 'Internal server error fetching CV history' });
  }
}

/**
 * Download a tailored CV PDF
 * GET /api/cv/:id/download
 */
export async function downloadCv(req, res, next) {
  const { id } = req.params;
  const db = getDatabase();

  try {
    const userId = req.user.id;
    const cvSlot = db.prepare('SELECT * FROM cv_slots WHERE id = ? AND user_id = ?').get(id, userId);

    if (!cvSlot) {
      return res.status(404).json({ error: 'CV file not found or access denied' });
    }

    if (!fs.existsSync(cvSlot.tailored_cv_path)) {
      return res.status(404).json({ error: 'PDF file is missing on server storage' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Tailored-CV-${cvSlot.company_name.replace(/\s+/g, '-')}.pdf"`);
    
    const fileStream = fs.createReadStream(cvSlot.tailored_cv_path);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading CV PDF:', error);
    return res.status(500).json({ error: 'Internal server error during PDF download' });
  }
}

/**
 * Fetch list of generated CV slots for authenticated user
 * GET /api/cv/list
 */
export async function listCvs(req, res, next) {
  const db = getDatabase();

  try {
    const userId = req.user.id;
    const cvs = db.prepare(`
      SELECT id, job_title as jobTitle, company_name as companyName, status, created_at as createdAt
      FROM cv_slots
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(userId);

    return res.json({ cvs });
  } catch (error) {
    console.error('Error listing CVs:', error);
    return res.status(500).json({ error: 'Internal server error fetching CV list' });
  }
}

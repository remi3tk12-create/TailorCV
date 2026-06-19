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
 */
export async function generateCv(req, res, next) {
  const { jobDescription, skills, companyWebsiteUrl, companyName, jobTitle, experiences } = req.body;

  if (!jobDescription) {
    return res.status(400).json({ error: 'Job description is required' });
  }

  const skillsList = Array.isArray(skills) 
    ? skills 
    : (skills ? skills.split(',').map(s => s.trim()) : []);

  if (skillsList.length === 0) {
    return res.status(400).json({ error: 'At least one skill is required' });
  }

  const db = getDatabase();

  try {
    const userId = req.user.id;
    const userPlan = req.user.plan;

    // Freemium Limit Check
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

    // Step 1: Optional Web Scraping
    let companyData = null;
    let targetCompanyName = companyName || 'Target Company';

    if (companyWebsiteUrl) {
      try {
        companyData = await ScraperService.scanWebsite(companyWebsiteUrl);
        if (companyData && companyData.title && !companyName) {
          targetCompanyName = companyData.title.split('|')[0].split('-')[0].trim();
        }
      } catch (scrapingErr) {
        console.warn(`Scraping failed for ${companyWebsiteUrl}, proceeding without scraped data:`, scrapingErr.message);
      }
    }

    // Step 2: Content Generation via AI Service (or intelligent rule-based fallbacks)
    const whyThisRole = await AiService.generateWhyThisRole(jobDescription, companyData);

    // Default placeholder experiences if candidate did not provide any
    const baseExperiences = experiences && experiences.length > 0 ? experiences : [
      {
        role: 'Senior Software Engineer',
        company: 'InnovateTech Corp',
        startDate: '2023-01',
        endDate: 'Present',
        description: 'Design and develop robust Node.js and React web applications, optimizing API performance and leading architectural refactoring.'
      },
      {
        role: 'Full Stack Developer',
        company: 'DevSolutions Inc',
        startDate: '2020-06',
        endDate: '2022-12',
        description: 'Built scalable backend microservices, designed relational database schemas, and integrated third-party secure APIs.'
      }
    ];

    const tailoredExperiences = await AiService.tailorExperience(baseExperiences, jobDescription, skillsList);

    // Candidate name extraction (capitalized prefix of user's email)
    const emailPrefix = req.user.email.split('@')[0];
    const candidateName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1) || 'Candidate';

    const cvData = {
      name: candidateName,
      email: req.user.email,
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
 */
export async function previewCv(req, res, next) {
  const { jobDescription, skills, companyWebsiteUrl, companyName, experiences } = req.body;

  if (!jobDescription) {
    return res.status(400).json({ error: 'Job description is required' });
  }

  const skillsList = Array.isArray(skills) 
    ? skills 
    : (skills ? skills.split(',').map(s => s.trim()) : []);

  if (skillsList.length === 0) {
    return res.status(400).json({ error: 'At least one skill is required' });
  }

  try {
    let companyData = null;
    let targetCompanyName = companyName || 'Target Company';

    if (companyWebsiteUrl) {
      try {
        companyData = await ScraperService.scanWebsite(companyWebsiteUrl);
        if (companyData && companyData.title && !companyName) {
          targetCompanyName = companyData.title.split('|')[0].split('-')[0].trim();
        }
      } catch (scrapingErr) {
        console.warn(`Scraping failed during preview:`, scrapingErr.message);
      }
    }

    const whyThisRole = await AiService.generateWhyThisRole(jobDescription, companyData);

    const baseExperiences = experiences && experiences.length > 0 ? experiences : [
      {
        role: 'Senior Software Engineer',
        company: 'InnovateTech Corp',
        startDate: '2023-01',
        endDate: 'Present',
        description: 'Design and develop robust Node.js and React web applications, optimizing API performance and leading architectural refactoring.'
      },
      {
        role: 'Full Stack Developer',
        company: 'DevSolutions Inc',
        startDate: '2020-06',
        endDate: '2022-12',
        description: 'Built scalable backend microservices, designed relational database schemas, and integrated third-party secure APIs.'
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
 */
export async function refineCv(req, res, next) {
  const { id } = req.params;
  const { instruction } = req.body;

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
 * Download a tailored CV PDF
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

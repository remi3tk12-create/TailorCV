# TailorCV Backend API Server

The backend system of TailorCV is built using modern **Node.js (ES Modules)**, **Express**, and **better-sqlite3** database storage. It implements a secure JWT-based authentication system, dynamic web scraping, customizable AI-powered professional summary tailoring, and standard, ATS-compliant PDF generation.

---

## Getting Started

### 1. Installation
Install all key dependencies (Express, better-sqlite3, pdfkit, bcryptjs, jsonwebtoken, cheerio, etc.):
```bash
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Open `.env` and fill out the configuration values:
- `PORT`: Server port (default `3000`).
- `JWT_SECRET`: Custom private key used to sign JWT authorization tokens.
- `DATABASE_PATH`: Path to the local SQLite database file.
- `OPENAI_API_KEY` / `GEMINI_API_KEY`: API keys to enable real LLM generation features.
- `UPLOAD_DIR`: Local directory to store uploaded files and compiled PDFs.

### 3. Start the Server
*   **Development Mode** (with hot-reload via nodemon):
    ```bash
    npm run dev
    ```
*   **Production Mode**:
    ```bash
    npm start
    ```

The server binds publicly to `0.0.0.0:3000` by default.

---

## Enabling AI Generation
If either `OPENAI_API_KEY` or `GEMINI_API_KEY` is configured in the `.env` file, the backend will use real LLM requests to generate tailored summaries.
If **no key is configured**, the backend falls back to an **Intelligent Rule-Based Fallback Engine** that analyzes the job description and your skills, injecting matched keywords and customized sentences dynamically. This guarantees perfect local functionality even without configured keys.

---

## API Endpoints Summary

### Authentication Routes (`/api/auth`)
*   `POST /api/auth/signup` / `/register` - Create a new user with `email` and `password`. Returns JWT.
*   `POST /api/auth/login` - Authenticate credentials and return JWT.
*   `GET /api/auth/profile` / `/me` - Retrieve authenticated user info (requires Bearer token).

### CV Management Routes (`/api/cv`)
*   `POST /api/cv/generate` - Adapt and generate a tailored PDF (Free plan limits to 5 slots). Supports optional `originalCv` file upload (Multer).
    - Accepts: `{ jobDescription, skills[], experience[], education[], companyUrl?, name?, email? }`
*   `POST /api/cv/preview` - Returns instant tailored JSON preview data without writing to database or storage (does not consume free plan slots).
*   `POST /api/cv/premium/refine` / `/refine/:id` - Refine tailored CV content interactively using custom prompts (e.g. *"make it more leadership focused"*, *"exclude the oldest role"*) (Premium subscription required).
*   `GET /api/cv/history` - List user's CV records (paginated via `?page=1&limit=10`).
*   `GET /api/cv/:id` - Fetch details and parsed JSON structure of a saved CV.
*   `GET /api/cv/:id/download` - Stream compiled PDF directly for download.

---

## How PDF Generation Works
The PDF generation engine is powered by **pdfkit** (located in `src/services/pdfService.js`) and is fully compliant with the standards defined in `/home/team/shared/cv-template-specs.md`:
1.  **Format Specifications**: Employs a strict **single-column layout** with **1-inch (72pt) margins** on all sides to ensure older Applicant Tracking Systems (ATS) can parse information without confusing columns or graphic assets.
2.  **Typography**: Configured to use modern web-safe `'Helvetica'` and `'Helvetica-Bold'` fonts. Sizes are fixed at:
    -   Candidate Name: **24pt** (bold, centered).
    -   Section Headings: **16pt** (bold, dark blue primary color `#1a365d` with thin horizontal separation lines).
    -   Roles/Titles: **12pt** (bold).
    -   Body Text & Descriptions: **11pt** (with consistent line heights and line gaps).
3.  **Placeholders**: If candidate details like location, loc, linkedin, phone, or name are omitted, the PDF generation module injects readable `[TO BE FILLED IN]` indicators. This allows job-seekers to safely generate, preview, and review layouts before revealing private information.

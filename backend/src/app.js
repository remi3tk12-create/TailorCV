import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routers
import authRouter from './routes/auth.js';
import cvRouter from './routes/cv.js';
import companyRouter from './routes/company.js';

// Convert import.meta.url to __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the frontend build directory
// The frontend developer will build the UI into frontend/dist adjacent to backend/
const frontendBuildPath = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendBuildPath));

// Mount API routes
app.use('/api/auth', authRouter);
app.use('/api/cv', cvRouter);
app.use('/api/company', companyRouter);

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'TailorCV API'
  });
});

// Fallback for SPA routing - serve index.html for all non-API paths
app.get('*', (req, res) => {
  // If request is not an API call, serve the index.html from frontend dist
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
      if (err) {
        // Fallback response if frontend is not built/present yet
        res.status(200).send('TailorCV API Server is running. (Frontend not built yet)');
      }
    });
  } else {
    res.status(404).json({ error: 'API Endpoint not found' });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

export default app;

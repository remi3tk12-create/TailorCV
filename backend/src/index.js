import dotenv from 'dotenv';
import app from './app.js';
import { initDatabase } from './config/database.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

async function startServer() {
  try {
    // Initialize Database
    await initDatabase();
    
    const server = app.listen(PORT, HOST, () => {
      console.log(`==================================================`);
      console.log(` TailorCV API Server is running on port ${PORT}`);
      console.log(` Bound to interface: ${HOST}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`==================================================`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal) => {
      console.log(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

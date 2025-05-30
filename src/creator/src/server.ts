/**
 * Main server entry point for the Creator API service
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { initializeFirebase } from './config/firebase';
import { initializeEmailService } from './services/emailService';
import { errorHandler } from './middleware/errorHandler';
import { clientRoutes } from './routes/clients';

// Load environment variables
dotenv.config();

// Safety check: Ensure we're not accidentally in production mode locally
if (process.env.NODE_ENV === 'production' && !process.env.GOOGLE_CLOUD_PROJECT) {
  console.error('ERROR: NODE_ENV is set to production but no Google Cloud Project detected.');
  console.error('This appears to be a local development environment.');
  console.error('Setting NODE_ENV to development to prevent Google Cloud connections.');
  process.env.NODE_ENV = 'development';
}

// Log environment for debugging
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 3001,
  USE_EMULATOR: process.env.USE_EMULATOR,
  FIRESTORE_EMULATOR_HOST: process.env.FIRESTORE_EMULATOR_HOST
});

// Initialize Firebase
initializeFirebase();

// Initialize Email service
initializeEmailService();

// Create Express app
const app = express();

// Trust proxy - required for Cloud Run
app.set('trust proxy', true);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Compression - commented out due to TypeScript issue
// app.use(compression());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'creator-api',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/clients', clientRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, '../../../public');
  app.use(express.static(publicPath));
  
  // Catch all route - serve React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Creator API listening on port ${PORT}`);
});

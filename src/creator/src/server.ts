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
import { errorHandler } from './middleware/errorHandler';
import { clientRoutes } from './routes/clients';

// Load environment variables
dotenv.config();

// Initialize Firebase
initializeFirebase();

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

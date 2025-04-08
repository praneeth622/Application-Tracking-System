import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
// Import your routes
import vendorRoutes from './routes/vendor';
import resumeRoutes from './routes/resume';
import authRoutes from './routes/auth';
import jobRoutes from './routes/job';

dotenv.config();

// For development testing purposes
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  console.log('Running in development mode');
  process.env.BYPASS_AUTH = 'true';
}

console.log(`Auth bypass: ${process.env.BYPASS_AUTH === 'true' ? 'enabled' : 'disabled'}`);

// MongoDB Connection Setup
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://praneethdevarasetty31:8qgJLzdzAjMvKssx@cluster0.myjyejx.mongodb.net/?retryWrites=true&w=majority';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Initialize MongoDB connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    console.log('Continuing without MongoDB connection');
  });

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - Fix for credentials with specific origin
app.use(cors({
  origin: 'http://localhost:3000', // Specify the exact origin instead of wildcard '*'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Other middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/jobs', jobRoutes);

// Basic routes for testing
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

app.get('/api/test', (req, res) => {
  res.status(200).json({ message: 'Test endpoint working' });
});

// Start server
const server = app.listen(parseInt(PORT.toString()), '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close().then(() => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

export default app;

import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

// Simple test routes
app.get('/api/health', (req: Request, res: Response) => {
  console.log('Health check accessed');
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

app.get('/api/test', (req: Request, res: Response) => {
  console.log('Test endpoint accessed');
  res.status(200).json({ message: 'Test endpoint working' });
});

// Add a simple auth middleware for testing
app.use('/api/auth', (req: Request, res: Response, next: NextFunction) => {
  console.log('Auth middleware accessed');
  next();
});

// Auth routes
app.get('/api/auth/me', (req: Request, res: Response) => {
  console.log('Auth me endpoint accessed');
  res.status(200).json({ uid: 'test-user-id', email: 'test@example.com', role: 'admin' });
});

// Start the server
app.listen(parseInt(PORT.toString()), '0.0.0.0', () => {
  console.log(`Test server running at http://localhost:${PORT}`);
}); 
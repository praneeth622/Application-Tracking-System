const express = require('express');
const app = express();
const PORT = 5001;

app.use(express.json());

// Simple test routes
app.get('/api/health', (req, res) => {
  console.log('Health check accessed');
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

app.get('/api/test', (req, res) => {
  console.log('Test endpoint accessed');
  res.status(200).json({ message: 'Test endpoint working' });
});

// Add a simple auth middleware for testing
app.use('/api/auth', (req, res, next) => {
  console.log('Auth middleware accessed');
  next();
});

// Auth routes
app.get('/api/auth/me', (req, res) => {
  console.log('Auth me endpoint accessed');
  res.status(200).json({ uid: 'test-user-id', email: 'test@example.com', role: 'admin' });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running at http://localhost:${PORT}`);
}); 
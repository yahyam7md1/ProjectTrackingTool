require('dotenv').config();
const express = require('express');
const authRoutes = require('./api/auth.routes');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

// Mount authentication routes
app.use('/api/auth', authRoutes);

// Test route to make sure everything is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'Hello from the PhaseTracker backend! SUHA SUHA SUHA SUHA SUHA BABY' });
});

app.get('/api/suha', (req, res) => {
  res.json({ message: 'This API is created by suha' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
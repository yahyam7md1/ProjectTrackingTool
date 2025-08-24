require('dotenv').config();
const express = require('express');
const authRoutes = require('./api/auth.routes');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

// Mount authentication routes
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
require('dotenv').config();
const express = require('express');
const authRoutes = require('./api/AuthAPI/auth.routes');
const adminRoutes = require('./api/AdminDashboardAPI/admin.routes');
const clientRoutes = require('./api/ClientAPI/client.routes');


const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

// Mount authentication routes
app.use('/api/auth', authRoutes);

// Mount protected admin routes
app.use('/api/admin', adminRoutes);

// Mount protected client routes
app.use('/api/client', clientRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
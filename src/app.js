const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Muat variabel lingkungan
dotenv.config();

// Hubungkan ke Database MongoDB
// Supabase client diinisialisasi di ./config/db.js dan akan di-import saat dibutuhkan.

const app = express();

// Konfigurasi CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware parsing JSON
app.use(express.json());

// Rute Dasar API
app.get('/api', (req, res) => {
    res.send('API is running and integrated with Database!');
});

// Rute Autentikasi
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
// Middleware penanganan 404
app.use((req, res, next) => {
    res.status(404).send('Not Found');
});

// Middleware penanganan error global
app.use((err, req, res, next) => {
    console.error('Global error handler caught:', err.message);
    res.status(500).send('Internal Server Error');
});

// Jalankan server jika berjalan secara lokal (bukan di Vercel)
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running locally on http://localhost:${PORT}`);
    });
}

module.exports = app;
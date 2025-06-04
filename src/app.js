// backend/src/app.js (VERSI SANGAT SANGAT MINIMAL UNTUK DEBUGGING VERCEL TIMEOUT)

const express = require('express');
// const dotenv = require('dotenv'); // Hapus sementara
// const cors = require('cors');     // Hapus sementara

// dotenv.config(); // Hapus sementara

const app = express();

console.log('DEBUG_APP_MINIMAL_VERCEL: Express app initialized.'); // <-- Log ini

// Rute dasar yang akan merespons
app.get('/api', (req, res) => {
    console.log('DEBUG_APP_MINIMAL_VERCEL: /api route hit.');
    res.send('Minimal API is running on Vercel!');
});

// Middleware penanganan 404
app.use((req, res, next) => {
    console.log('DEBUG_APP_MINIMAL_VERCEL: 404 route hit for:', req.originalUrl);
    res.status(404).send('Not Found (Minimal Vercel)');
});

// Middleware penanganan error global
app.use((err, req, res, next) => {
    console.error('DEBUG_APP_MINIMAL_VERCEL: Global error handler caught:', err.message);
    res.status(500).send('Internal Server Error (Minimal Vercel)');
});

module.exports = app;
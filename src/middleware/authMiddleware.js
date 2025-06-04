const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Tidak diizinkan, pengguna tidak ditemukan.' });
            }
            next();
        } catch (error) {
            console.error('Verifikasi token gagal:', error);
            res.status(401).json({ message: 'Tidak diizinkan, token gagal.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Tidak diizinkan, tidak ada token.' });
    }
};

module.exports = { protect };

const jwt = require('jsonwebtoken');
const supabase = require('../config/db');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            // Verifikasi token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Cari user di tabel users berdasarkan ID
            const { data: user, error } = await supabase
                .from('users')
                .select('id, username, email')
                .eq('id', decoded.id)
                .single();

            if (error || !user) {
                return res.status(401).json({ message: 'Tidak diizinkan, pengguna tidak ditemukan.' });
            }

            // Simpan data user ke dalam request
            req.user = user;
            next();
        } catch (error) {
            console.error('Verifikasi token gagal:', error);
            res.status(401).json({ message: 'Tidak diizinkan, token gagal.' });
        }
    } else {
        res.status(401).json({ message: 'Tidak diizinkan, tidak ada token.' });
    }
};

module.exports = { protect };

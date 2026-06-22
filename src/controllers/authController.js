const supabase = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
};

// @desc    Mendaftar pengguna baru
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Mohon isi semua kolom.' });
    }

    try {
        // Cek apakah email atau username sudah ada
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .or(`email.eq.${email},username.eq.${username}`)
            .single();

        if (existingUser) {
            return res.status(400).json({ message: 'Username atau email sudah terdaftar.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Buat user baru di tabel users
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([{ username, email, password: hashedPassword }])
            .select()
            .single();

        if (error) {
            console.error('Supabase Insert Error:', error);
            return res.status(400).json({ message: 'Gagal membuat pengguna' });
        }

        res.status(201).json({
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            token: generateToken(newUser.id),
        });
    } catch (error) {
        console.error('Error saat pendaftaran:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Otentikasi pengguna & dapatkan token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Mohon isi email dan password.' });
    }

    try {
        // Cari user berdasarkan email
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                id: user.id,
                username: user.username,
                email: user.email,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Email atau password salah.' });
        }
    } catch (error) {
        console.error('Error saat login:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { registerUser, loginUser };

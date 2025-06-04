const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token berlaku selama 1 jam
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
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            return res.status(400).json({ message: 'Username atau email sudah terdaftar.' });
        }

        user = await User.create({ username, email, password });

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
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
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id),
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

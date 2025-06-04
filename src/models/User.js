const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Untuk hashing password

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Nama pengguna harus diisi'],
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email harus diisi'],
        unique: true,
        match: [/.+@.+\..+/, 'Email tidak valid'],
    },
    password: {
        type: String,
        required: [true, 'Password harus diisi'],
        minlength: [6, 'Password minimal 6 karakter'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Middleware Mongoose: Hash password sebelum menyimpan user baru
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Metode Mongoose: Membandingkan password yang dimasukkan dengan password di database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

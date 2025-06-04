const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nama kategori harus diisi'],
        trim: true,
        minlength: [2, 'Nama kategori minimal 2 karakter'],
        maxlength: [50, 'Nama kategori maksimal 50 karakter'],
    },
    type: {
        type: String,
        required: [true, 'Jenis kategori harus diisi'],
        enum: {
            values: ['pemasukan', 'pengeluaran'],
            message: 'Jenis kategori harus "pemasukan" atau "pengeluaran".'
        },
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true, // Menambahkan createdAt dan updatedAt otomatis
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indeks unik gabungan: satu user tidak bisa memiliki dua kategori dengan nama yang sama
CategorySchema.index({ name: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Category', CategorySchema);

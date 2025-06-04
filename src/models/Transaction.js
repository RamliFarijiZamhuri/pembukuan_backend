const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        required: [true, 'Jenis transaksi harus diisi'],
        enum: ['pemasukan', 'pengeluaran'],
    },
    amount: {
        type: Number,
        required: [true, 'Jumlah transaksi harus diisi'],
        min: [0, 'Jumlah tidak boleh negatif'],
    },
    description: {
        type: String,
        required: [true, 'Deskripsi harus diisi'],
        trim: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Kategori harus diisi'],
    },
    date: { // Tanggal transaksi sebenarnya
        type: Date,
        required: [true, 'Tanggal transaksi harus diisi'],
        default: Date.now,
    },
    createdAt: { // Tanggal catatan transaksi dibuat
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Transaction', TransactionSchema);

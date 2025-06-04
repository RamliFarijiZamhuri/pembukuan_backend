const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

// @desc    Mendapatkan semua transaksi untuk pengguna tertentu
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id })
            .populate('category', 'name type')
            .sort({ date: -1, createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Menambahkan transaksi baru
// @route   POST /api/transactions
// @access  Private
const addTransaction = async (req, res) => {
    const { type, amount, description, category, date } = req.body;

    if (!type || !amount || !description || !category || !date) {
        return res.status(400).json({ message: 'Mohon isi semua kolom.' });
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: 'Jumlah harus angka positif.' });
    }

    try {
        const existingCategory = await Category.findOne({ _id: category, user: req.user._id, type: type });
        if (!existingCategory) {
            return res.status(400).json({ message: 'Kategori tidak valid atau bukan milik Anda untuk jenis transaksi ini.' });
        }

        const newTransaction = new Transaction({
            user: req.user._id,
            type,
            amount: parseFloat(amount),
            description,
            category,
            date: new Date(date),
        });

        const savedTransaction = await newTransaction.save();
        await savedTransaction.populate('category', 'name type');
        res.status(201).json(savedTransaction);
    } catch (error) {
        console.error('Error adding transaction:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Memperbarui transaksi
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
    const { id } = req.params;
    const { type, amount, description, category, date } = req.body;

    try {
        let transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaksi tidak ditemukan.' });
        }

        if (transaction.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Tidak diizinkan untuk mengubah transaksi ini.' });
        }

        if (!type || !amount || !description || !category || !date) {
            return res.status(400).json({ message: 'Mohon isi semua kolom.' });
        }
        if (isNaN(amount) || parseFloat(amount) <= 0) {
            return res.status(400).json({ message: 'Jumlah harus angka positif.' });
        }

        const existingCategory = await Category.findOne({ _id: category, user: req.user._id, type: type });
        if (!existingCategory) {
            return res.status(400).json({ message: 'Kategori tidak valid atau bukan milik Anda untuk jenis transaksi ini.' });
        }

        transaction.type = type;
        transaction.amount = parseFloat(amount);
        transaction.description = description;
        transaction.category = category;
        transaction.date = new Date(date);

        const updatedTransaction = await transaction.save();
        await updatedTransaction.populate('category', 'name type');
        res.json(updatedTransaction);
    } catch (error) {
        console.error('Error updating transaction:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Menghapus transaksi
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
    const { id } = req.params;

    try {
        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaksi tidak ditemukan.' });
        }

        if (transaction.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Tidak diizinkan untuk menghapus transaksi ini.' });
        }

        await Transaction.deleteOne({ _id: id });
        res.json({ message: 'Transaksi berhasil dihapus.' });
    } catch (error) {
        console.error('Error deleting transaction:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Mendapatkan ringkasan bulanan (total pemasukan, pengeluaran, saldo)
// @route   GET /api/transactions/summary?year=<year>&month=<month>
// @access  Private
const getMonthlySummary = async (req, res) => {
    try {
        const { year, month } = req.query;

        if (!year || !month) {
            return res.status(400).json({ message: 'Tahun dan bulan diperlukan untuk ringkasan.' });
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const transactions = await Transaction.find({
            user: req.user._id,
            date: { $gte: startDate, $lte: endDate }
        });

        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(transaction => {
            if (transaction.type === 'pemasukan') {
                totalIncome += transaction.amount;
            } else if (transaction.type === 'pengeluaran') {
                totalExpense += transaction.amount;
            }
        });

        res.json({
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense
        });

    } catch (error) {
        console.error('Error fetching monthly summary:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getMonthlySummary
};

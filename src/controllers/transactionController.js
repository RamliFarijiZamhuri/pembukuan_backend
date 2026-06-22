const supabase = require('../config/db');

// @desc    Mendapatkan semua transaksi untuk pengguna tertentu
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
    try {
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select(`
                *,
                categories:category_id (name, type)
            `)
            .eq('user_id', req.user.id)
            .order('date', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Sesuaikan bentuk data jika frontend membutuhkan struktur yang sama
        const formattedTransactions = transactions.map(t => ({
            ...t,
            category: t.categories
        }));
        
        res.json(formattedTransactions);
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
        const { data: existingCategory } = await supabase
            .from('categories')
            .select('*')
            .eq('id', category)
            .eq('user_id', req.user.id)
            .eq('type', type)
            .single();

        if (!existingCategory) {
            return res.status(400).json({ message: 'Kategori tidak valid atau bukan milik Anda untuk jenis transaksi ini.' });
        }

        const { data: savedTransaction, error } = await supabase
            .from('transactions')
            .insert([{
                user_id: req.user.id,
                type,
                amount: parseFloat(amount),
                description,
                category_id: category,
                date: new Date(date).toISOString(),
            }])
            .select(`
                *,
                categories:category_id (name, type)
            `)
            .single();

        if (error) throw error;
        
        res.status(201).json({
            ...savedTransaction,
            category: savedTransaction.categories
        });
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
        const { data: transaction, error: findError } = await supabase
            .from('transactions')
            .select('*')
            .eq('id', id)
            .single();

        if (findError || !transaction) {
            return res.status(404).json({ message: 'Transaksi tidak ditemukan.' });
        }

        if (transaction.user_id !== req.user.id) {
            return res.status(401).json({ message: 'Tidak diizinkan untuk mengubah transaksi ini.' });
        }

        if (!type || !amount || !description || !category || !date) {
            return res.status(400).json({ message: 'Mohon isi semua kolom.' });
        }
        if (isNaN(amount) || parseFloat(amount) <= 0) {
            return res.status(400).json({ message: 'Jumlah harus angka positif.' });
        }

        const { data: existingCategory } = await supabase
            .from('categories')
            .select('*')
            .eq('id', category)
            .eq('user_id', req.user.id)
            .eq('type', type)
            .single();

        if (!existingCategory) {
            return res.status(400).json({ message: 'Kategori tidak valid atau bukan milik Anda untuk jenis transaksi ini.' });
        }

        const { data: updatedTransaction, error: updateError } = await supabase
            .from('transactions')
            .update({
                type,
                amount: parseFloat(amount),
                description,
                category_id: category,
                date: new Date(date).toISOString(),
            })
            .eq('id', id)
            .select(`
                *,
                categories:category_id (name, type)
            `)
            .single();

        if (updateError) throw updateError;
        
        res.json({
            ...updatedTransaction,
            category: updatedTransaction.categories
        });
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
        const { data: transaction, error: findError } = await supabase
            .from('transactions')
            .select('*')
            .eq('id', id)
            .single();

        if (findError || !transaction) {
            return res.status(404).json({ message: 'Transaksi tidak ditemukan.' });
        }

        if (transaction.user_id !== req.user.id) {
            return res.status(401).json({ message: 'Tidak diizinkan untuk menghapus transaksi ini.' });
        }

        const { error: deleteError } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;
        
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

        const startDate = new Date(year, month - 1, 1).toISOString();
        const endDate = new Date(year, month, 0, 23, 59, 59, 999).toISOString();

        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('type, amount')
            .eq('user_id', req.user.id)
            .gte('date', startDate)
            .lte('date', endDate);

        if (error) throw error;

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

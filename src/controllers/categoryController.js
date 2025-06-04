const Category = require('../models/Category');
const Transaction = require('../models/Transaction');

// @desc    Mendapatkan semua kategori untuk pengguna yang terautentikasi
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ user: req.user._id }).sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Menambahkan kategori baru
// @route   POST /api/categories
// @access  Private
const addCategory = async (req, res) => {
    const { name, type } = req.body;

    if (!name || !type) {
        return res.status(400).json({ message: 'Nama dan jenis kategori harus diisi.' });
    }

    try {
        const newCategory = new Category({
            user: req.user._id,
            name,
            type,
        });

        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Anda sudah memiliki kategori dengan nama ini.' });
        }
        console.error('Error adding category:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Memperbarui kategori yang ada
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, type } = req.body;

    if (!name || !type) {
        return res.status(400).json({ message: 'Nama dan jenis kategori harus diisi.' });
    }

    try {
        let category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
        }

        if (category.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Tidak diizinkan untuk mengubah kategori ini.' });
        }

        category.name = name;
        category.type = type;

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Anda sudah memiliki kategori lain dengan nama ini.' });
        }
        console.error('Error updating category:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Menghapus kategori
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
        }

        if (category.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Tidak diizinkan untuk menghapus kategori ini.' });
        }

        const transactionCount = await Transaction.countDocuments({ category: id });
        if (transactionCount > 0) {
            return res.status(400).json({ message: 'Tidak dapat menghapus kategori karena ada transaksi yang terkait.' });
        }

        await Category.deleteOne({ _id: id });
        res.json({ message: 'Kategori berhasil dihapus.' });
    } catch (error) {
        console.error('Error deleting category:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory
};

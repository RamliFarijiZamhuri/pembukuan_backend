const supabase = require('../config/db');

// @desc    Mendapatkan semua kategori untuk pengguna yang terautentikasi
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
    try {
        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', req.user.id)
            .order('name', { ascending: true });

        if (error) throw error;
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
        const { data: existingCategory } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('name', name)
            .single();

        if (existingCategory) {
            return res.status(400).json({ message: 'Anda sudah memiliki kategori dengan nama ini.' });
        }

        const { data: savedCategory, error } = await supabase
            .from('categories')
            .insert([{ user_id: req.user.id, name, type }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(savedCategory);
    } catch (error) {
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
        const { data: category, error: findError } = await supabase
            .from('categories')
            .select('*')
            .eq('id', id)
            .single();

        if (findError || !category) {
            return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
        }

        if (category.user_id !== req.user.id) {
            return res.status(401).json({ message: 'Tidak diizinkan untuk mengubah kategori ini.' });
        }

        const { data: existingCategory } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('name', name)
            .neq('id', id)
            .single();

        if (existingCategory) {
            return res.status(400).json({ message: 'Anda sudah memiliki kategori lain dengan nama ini.' });
        }

        const { data: updatedCategory, error: updateError } = await supabase
            .from('categories')
            .update({ name, type })
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;
        res.json(updatedCategory);
    } catch (error) {
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
        const { data: category, error: findError } = await supabase
            .from('categories')
            .select('*')
            .eq('id', id)
            .single();

        if (findError || !category) {
            return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
        }

        if (category.user_id !== req.user.id) {
            return res.status(401).json({ message: 'Tidak diizinkan untuk menghapus kategori ini.' });
        }

        const { count, error: countError } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', id);

        if (countError) throw countError;

        if (count > 0) {
            return res.status(400).json({ message: 'Tidak dapat menghapus kategori karena ada transaksi yang terkait.' });
        }

        const { error: deleteError } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;
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

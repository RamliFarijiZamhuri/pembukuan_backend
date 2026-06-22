const express = require('express');
const { getCategories, addCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .get(protect, getCategories)
    .post(protect, addCategory);

router.route('/:id')
    .put(protect, updateCategory)
    .delete(protect, deleteCategory);

module.exports = router;

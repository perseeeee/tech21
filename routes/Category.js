const express = require('express');
const {
  getAllCategories,
  getAllCategoriesAdmin,
  getDeletedCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  restoreCategory,
} = require('../controllers/Category');
const { isAuthenticatedUser, isAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/categories', getAllCategories);
router.get('/admin/categories/all', isAuthenticatedUser, isAdmin, getAllCategoriesAdmin);
router.get('/admin/categories/trash', isAuthenticatedUser, isAdmin, getDeletedCategories);

router.post('/admin/categories', isAuthenticatedUser, isAdmin, createCategory);
router.put('/admin/categories/:id', isAuthenticatedUser, isAdmin, updateCategory);
router.delete('/admin/categories/:id', isAuthenticatedUser, isAdmin, deleteCategory);
router.patch('/admin/categories/restore/:id', isAuthenticatedUser, isAdmin, restoreCategory);

module.exports = router;

const Category = require('../models/Category');
const { ensureDefaultCategories } = require('../utils/categoryDefaults');

exports.getAllCategories = async (req, res) => {
  try {
    await ensureDefaultCategories(Category);

    const categories = await Category.find({ isActive: true }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllCategoriesAdmin = async (req, res) => {
  try {
    await ensureDefaultCategories(Category);

    const categories = await Category.find({})
      .sort({ isActive: -1, name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getDeletedCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: false })
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const name = (req.body.name || '').trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const existing = await Category.findOne({ name });
    if (existing && existing.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists',
      });
    }

    if (existing && !existing.isActive) {
      existing.isActive = true;
      await existing.save();
      return res.status(200).json({
        success: true,
        message: 'Category restored successfully',
        category: existing,
      });
    }

    const category = await Category.create({ name });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const name = (req.body.name || '').trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const duplicate = await Category.findOne({ name, _id: { $ne: req.params.id } });
    if (duplicate && duplicate.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Another category already uses that name',
      });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, isActive: true },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.restoreCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category restored successfully',
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

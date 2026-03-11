// Category Service - Business Logic Layer
const Category = require("../models/category.model");
const { AppError } = require("../utils/appError");
const { getMessages } = require("../responses");
const { clearCategoryCache } = require("../constants/enums/guest.enum");

class CategoryService {
  /**
   * Validate category data
   */
  validateCategoryData(data, lang = "en") {
    const messages = getMessages(lang);
    const errors = [];

    // Validate required fields
    if (!data.name || data.name.trim() === "") {
      errors.push("Category name is required");
    } else {
      // Check for duplicate name
      const existingCategory = Category.findOne({ name: data.name.trim() });
      if (existingCategory) {
        errors.push("Category name already exists");
      }
    }

    // Validate sortOrder if provided
    if (data.sortOrder !== undefined && data.sortOrder !== null) {
      if (typeof data.sortOrder !== "number" || data.sortOrder < 0) {
        errors.push("Sort order must be a non-negative number");
      }
    }

    if (errors.length > 0) {
      throw new AppError(errors.join(", "), 400);
    }
  }

  /**
   * Validate category name for duplicate (async version)
   */
  async validateUniqueName(name, excludeId = null) {
    const query = { name: name.trim() };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const existing = await Category.findOne(query);
    return !existing;
  }

  /**
   * Create a new category
   */
  async create(categoryData, lang = "en") {
    const messages = getMessages(lang);

    // Validate category data
    const errors = [];

    if (!categoryData.name || categoryData.name.trim() === "") {
      errors.push("Category name is required");
    }

    // Check for duplicate name
    const isUnique = await this.validateUniqueName(categoryData.name);
    if (!isUnique) {
      errors.push("Category name already exists");
    }

    // Validate sortOrder if provided
    if (categoryData.sortOrder !== undefined && categoryData.sortOrder !== null) {
      if (typeof categoryData.sortOrder !== "number" || categoryData.sortOrder < 0) {
        errors.push("Sort order must be a non-negative number");
      }
    }

    if (errors.length > 0) {
      throw new AppError(errors.join(", "), 400);
    }

    // Prepare data
    const data = {
      name: categoryData.name.trim(),
      description: categoryData.description || "",
      sortOrder: categoryData.sortOrder
    };

    const category = await Category.create(data);
    
    // Clear guest category cache
    clearCategoryCache();
    
    return category;
  }

  /**
   * Get all categories with optional filtering
   */
  async findAll(query = {}, options = {}, lang = "en") {
    const categories = await Category.find(query, options);
    return categories;
  }

  /**
   * Get category by ID
   */
  async findById(id, lang = "en") {
    const messages = getMessages(lang);

    if (!id) {
      throw new AppError(messages.COMMON.INVALID_ID, 400);
    }

    const category = await Category.findById(id);

    if (!category) {
      throw new AppError(messages.COMMON.NOT_FOUND, 404);
    }

    return category;
  }

  /**
   * Update category
   */
  async update(id, updateData, lang = "en") {
    const messages = getMessages(lang);

    // Check if category exists
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      throw new AppError(messages.COMMON.NOT_FOUND, 404);
    }

    // Validate name if being updated
    if (updateData.name && updateData.name.trim() !== "") {
      const isUnique = await this.validateUniqueName(updateData.name, id);
      if (!isUnique) {
        throw new AppError("Category name already exists", 400);
      }
      updateData.name = updateData.name.trim();
    }

    // Validate sortOrder if provided
    if (updateData.sortOrder !== undefined && updateData.sortOrder !== null) {
      if (typeof updateData.sortOrder !== "number" || updateData.sortOrder < 0) {
        throw new AppError("Sort order must be a non-negative number", 400);
      }
    }

    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const updatedCategory = await Category.updateById(id, updateData);
    
    // Clear guest category cache
    clearCategoryCache();
    
    return updatedCategory;
  }

  /**
   * Delete category
   */
  async delete(id, lang = "en") {
    const messages = getMessages(lang);

    const category = await Category.findById(id);
    if (!category) {
      throw new AppError(messages.COMMON.NOT_FOUND, 404);
    }

    const deleted = await Category.deleteById(id);
    
    // Clear guest category cache
    clearCategoryCache();
    
    return deleted;
  }

  /**
   * Get all category names (for use by other services)
   */
  async getAllCategoryNames(lang = "en") {
    return await Category.getAllCategoryNames();
  }

  /**
   * Get all categories sorted (for use by other services)
   */
  async getAllCategories(lang = "en") {
    return await Category.getAllCategories();
  }
}

module.exports = new CategoryService();

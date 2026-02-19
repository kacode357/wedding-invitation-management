/**
 * Guest & Table Constants
 */

const Category = require("../../models/category.model");

// Default categories for fallback (when database is empty)
const DEFAULT_GUEST_CATEGORIES = {
  DAD: "Dad's Guest",
  MOM: "Mom's Guest",
  NGOC: "Ms. Ngoc's Guest",
  KA: "Ka's Guest"
};

const DEFAULT_TABLE_CAPACITY = 10;

// Cache for category list
let cachedCategoryList = null;
let lastFetchTime = 0;
const CACHE_TTL = 60000; // 1 minute cache

/**
 * Get all category names from database, with caching
 * Falls back to default categories if database is empty
 */
async function getGuestCategoryList() {
  const now = Date.now();
  
  // Check if cache is valid
  if (cachedCategoryList && (now - lastFetchTime) < CACHE_TTL) {
    return cachedCategoryList;
  }
  
  try {
    // Try to get categories from database
    const categories = await Category.getAllCategoryNames();
    
    if (categories && categories.length > 0) {
      cachedCategoryList = categories;
    } else {
      // Fallback to default categories if database is empty
      cachedCategoryList = Object.values(DEFAULT_GUEST_CATEGORIES);
    }
  } catch (error) {
    // Fallback to default categories on error
    cachedCategoryList = Object.values(DEFAULT_GUEST_CATEGORIES);
  }
  
  lastFetchTime = now;
  return cachedCategoryList;
}

/**
 * Clear the category cache (useful when categories are modified)
 */
function clearCategoryCache() {
  cachedCategoryList = null;
  lastFetchTime = 0;
}

module.exports = {
  DEFAULT_GUEST_CATEGORIES,
  DEFAULT_TABLE_CAPACITY,
  getGuestCategoryList,
  clearCategoryCache
};

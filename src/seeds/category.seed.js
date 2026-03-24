/**
 * Seed Script: Initial Categories
 * This script creates initial guest categories if they don't exist
 */

const categoryModel = require("../models/category.model");

const INITIAL_CATEGORIES = [
  { name: "Dad's Guest" },
  { name: "Mom's Guest" },
  { name: "Ms. Ngoc's Guest" },
  { name: "Ka's Guest" }
];

async function seedCategories() {
  try {
    // Check if categories already exist
    const existingCategories = await categoryModel.count();

    if (existingCategories > 0) {
      console.log("✓ Categories already exist, skipping seed");
      return;
    }

    // Create all initial categories
    const createdCategories = [];
    for (const categoryData of INITIAL_CATEGORIES) {
      const category = await categoryModel.create(categoryData);
      createdCategories.push(category);
    }

    console.log("✓ Initial categories created successfully:");
    createdCategories.forEach(cat => {
      console.log(`   - ${cat.name}`);
    });
  } catch (error) {
    console.error("✗ Failed to seed categories:", error.message);
  }
}

module.exports = { seedCategories };

/**
 * Seed Script: Initial Categories
 * This script creates initial guest categories if they don't exist
 */

const categoryModel = require("../models/category.model");

const INITIAL_CATEGORIES = [
  { name: "Dad's Guest", description: "Guests of Dad", sortOrder: 1 },
  { name: "Mom's Guest", description: "Guests of Mom", sortOrder: 2 },
  { name: "Ms. Ngoc's Guest", description: "Guests of Ms. Ngoc", sortOrder: 3 },
  { name: "Ka's Guest", description: "Guests of Ka", sortOrder: 4 }
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
      console.log(`   - ${cat.name} (sortOrder: ${cat.sortOrder})`);
    });
  } catch (error) {
    console.error("✗ Failed to seed categories:", error.message);
  }
}

module.exports = { seedCategories };

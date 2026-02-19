/**
 * Seed Script: Create Admin User
 * This script creates an admin user if it doesn't exist
 */

const userModel = require("../models/user.model");
const { USER_ROLES } = require("../constants/enums/user.enum");

const ADMIN_EMAIL = "admin@lms.com";
const ADMIN_PASSWORD = "test123";

async function seedAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await userModel.findOne({ email: ADMIN_EMAIL });
    
    if (existingAdmin) {
      console.log("✓ Admin user already exists, skipping seed");
      return;
    }

    // Create admin user
    const adminUser = await userModel.create({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: USER_ROLES.ADMIN,
      firstName: "Admin",
      lastName: "User",
      isActive: true
    });

    console.log("✓ Admin user created successfully");
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Role: ${USER_ROLES.ADMIN}`);
  } catch (error) {
    console.error("✗ Failed to seed admin user:", error.message);
  }
}

module.exports = { seedAdminUser };

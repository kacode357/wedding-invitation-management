// Database creation script
require("dotenv").config();
const mysql = require("mysql2/promise");

async function createDatabase() {
  const dbName = process.env.DB_NAME || "wedding_invitation_management_db";
  
  // Connect to MySQL without specifying database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  });

  try {
    console.log("✓ Connected to MySQL");

    // Check if database exists
    const [databases] = await connection.query(
      "SHOW DATABASES LIKE ?",
      [dbName]
    );

    if (databases.length > 0) {
      console.log(`ℹ Database "${dbName}" already exists`);
    } else {
      // Create database
      await connection.query(`CREATE DATABASE ${dbName}`);
      console.log(`✓ Database "${dbName}" created successfully`);
    }

    await connection.end();
    console.log("\n✓ Database setup complete!");
    console.log(`You can now run: npm run dev\n`);
  } catch (error) {
    console.error("✗ Error creating database:", error.message);
    await connection.end();
    process.exit(1);
  }
}

createDatabase();

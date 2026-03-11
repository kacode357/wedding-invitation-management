// Initialize database connection
const { connectDB } = require("./mongoose");

async function initDatabase() {
  try {
    // Connect to MongoDB
    const connection = await connectDB();
    
    console.log("✓ Database connected successfully");

    return connection;
  } catch (error) {
    console.error("✗ Unable to connect to the database:", error);
    throw error;
  }
}

module.exports = { initDatabase };

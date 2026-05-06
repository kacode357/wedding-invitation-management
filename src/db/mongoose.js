// MongoDB connection using MongoDB Driver
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

// Fix for Node.js querySrv ECONNREFUSED error (DNS resolution failure)
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']); // Force Node.js to use Google/Cloudflare DNS

const MONGODB_URI = process.env.MONGODB_URI;

let client;
let clientPromise;

async function connectDB() {
  try {
    if (clientPromise) {
      return clientPromise;
    }

    if (!MONGODB_URI) {
      throw new Error("❌ MONGODB_URI chưa được cấu hình trong .env!");
    }
    console.log(">>", MONGODB_URI)
    console.log("⏳ Đang kết nối MongoDB...");

    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    clientPromise = client.connect().then((connectedClient) => {
      console.log(`✓ MongoDB Connected: ${connectedClient.db().databaseName}`);
      return connectedClient;
    });

    return clientPromise;
  } catch (error) {
    console.error("✗ MongoDB Connection Error:", error.message);
    console.error("→ Kiểm tra IP whitelist trong MongoDB Atlas hoặc trạng thái Cluster (có bị Paused không)!");
    throw error;
  }
}

// Helper để lấy database
async function getDB(dbName = "wedding_invitation_management") {
  const c = await connectDB();
  return c.db(dbName);
}

// Helper để lấy collection
async function getCollection(collectionName) {
  const db = await getDB();
  return db.collection(collectionName);
}

// Export helpers và ObjectId
module.exports = {
  connectDB,
  getDB,
  getCollection,
  ObjectId,
};

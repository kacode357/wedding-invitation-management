// User Model - MongoDB Driver
const bcrypt = require("bcrypt");
const { getCollection, ObjectId } = require("../db/mongoose");

const COLLECTION_NAME = "users";

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         email: { type: string }
 *         role: { type: string }
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         phone: { type: string }
 *         avatar: { type: string }
 *         isActive: { type: boolean }
 */

async function create(data) {
  const collection = await getCollection(COLLECTION_NAME);
  
  // Hash password before inserting
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  
  data.createdAt = new Date();
  data.updatedAt = new Date();
  
  const result = await collection.insertOne(data);
  return { ...data, _id: result.insertedId };
}

async function findById(id) {
  const collection = await getCollection(COLLECTION_NAME);
  return await collection.findOne({ _id: new ObjectId(id) });
}

async function findOne(query) {
  const collection = await getCollection(COLLECTION_NAME);
  return await collection.findOne(query);
}

async function find(query = {}, options = {}) {
  const collection = await getCollection(COLLECTION_NAME);
  const { sort = { createdAt: -1 }, limit, skip } = options;
  
  let cursor = collection.find(query).sort(sort);
  
  if (skip) cursor = cursor.skip(skip);
  if (limit) cursor = cursor.limit(limit);
  
  return await cursor.toArray();
}

async function updateById(id, data) {
  const collection = await getCollection(COLLECTION_NAME);
  
  // Hash password if modified
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  
  data.updatedAt = new Date();
  delete data._id; // Can't update _id
  
  await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: data }
  );
  
  return await findById(id);
}

async function deleteById(id) {
  const collection = await getCollection(COLLECTION_NAME);
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

async function count(query = {}) {
  const collection = await getCollection(COLLECTION_NAME);
  return await collection.countDocuments(query);
}

async function comparePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = {
  create,
  findById,
  findOne,
  find,
  updateById,
  deleteById,
  count,
  comparePassword,
  COLLECTION_NAME,
  ObjectId
};

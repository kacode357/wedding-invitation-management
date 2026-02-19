// Category Model - MongoDB Driver
const { getCollection, ObjectId } = require("../db/mongoose");

const COLLECTION_NAME = "categories";

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         name: { type: string, description: "Category name (unique)" }
 *         description: { type: string }
 *         sortOrder: { type: number }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 */

async function create(data) {
  const collection = await getCollection(COLLECTION_NAME);

  data.createdAt = new Date();
  data.updatedAt = new Date();

  // Set default sort order if not provided
  if (data.sortOrder === undefined || data.sortOrder === null) {
    // Get the maximum sort order and add 1
    const maxSortCategory = await collection.find().sort({ sortOrder: -1 }).limit(1).toArray();
    data.sortOrder = maxSortCategory.length > 0 ? maxSortCategory[0].sortOrder + 1 : 1;
  }

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
  const { sort = { sortOrder: 1, createdAt: -1 }, limit, skip } = options;

  let cursor = collection.find(query).sort(sort);

  if (skip) cursor = cursor.skip(skip);
  if (limit) cursor = cursor.limit(limit);

  return await cursor.toArray();
}

async function updateById(id, data) {
  const collection = await getCollection(COLLECTION_NAME);

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

async function getAllCategoryNames() {
  const collection = await getCollection(COLLECTION_NAME);
  const categories = await collection.find().sort({ sortOrder: 1 }).project({ name: 1 }).toArray();
  return categories.map(cat => cat.name);
}

async function getAllCategories() {
  const collection = await getCollection(COLLECTION_NAME);
  return await collection.find().sort({ sortOrder: 1 }).toArray();
}

module.exports = {
  create,
  findById,
  findOne,
  find,
  updateById,
  deleteById,
  count,
  getAllCategoryNames,
  getAllCategories,
  COLLECTION_NAME,
  ObjectId
};

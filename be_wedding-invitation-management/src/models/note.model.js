// Note Model - MongoDB Driver
const { getCollection, ObjectId } = require("../db/mongoose");

const COLLECTION_NAME = "notes";

/**
 * @swagger
 * components:
 *   schemas:
 *     Note:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         name: { 
 *           type: string, 
 *           enum: ["Definitely (Confirmed) - 100%", "High probability of attending - over 50%", "High probability of not attending - under 50%"],
 *           description: "Note name - must be one of the predefined values" 
 *         }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 */

async function create(data) {
  const collection = await getCollection(COLLECTION_NAME);

  // Validate required fields
  if (!data.name || data.name.trim() === "") {
    throw new Error("Name is required");
  }

  // Set defaults
  data.createdAt = new Date();
  data.updatedAt = new Date();

  const result = await collection.insertOne(data);
  return { ...data, _id: result.insertedId };
}

async function findById(id) {
  const collection = await getCollection(COLLECTION_NAME);
  return await collection.findOne({ _id: new ObjectId(id) });
}

async function find(query = {}, options = {}) {
  const collection = await getCollection(COLLECTION_NAME);
  const {
    sort = { createdAt: -1 },
    limit,
    skip
  } = options;

  let cursor = collection.find(query);

  if (skip) cursor = cursor.skip(skip);
  if (limit) cursor = cursor.limit(limit);

  // Apply sorting
  cursor = cursor.sort(sort);

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

module.exports = {
  create,
  findById,
  find,
  updateById,
  deleteById,
  count,
  COLLECTION_NAME,
  ObjectId
};

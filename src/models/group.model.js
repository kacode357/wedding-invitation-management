// Group Model - MongoDB Driver
const { getCollection, ObjectId } = require("../db/mongoose");

const COLLECTION_NAME = "groups";

/**
 * @swagger
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         name: { type: string, description: "Group name (unique)" }
 *         priorityLevel: { type: number, description: "Priority level of the group (higher = more priority)" }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 */

async function create(data) {
    const collection = await getCollection(COLLECTION_NAME);

    data.createdAt = new Date();
    data.updatedAt = new Date();

    // Default priorityLevel to 0 if not provided
    if (data.priorityLevel === undefined || data.priorityLevel === null) {
        data.priorityLevel = 0;
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
    const { sort = { priorityLevel: -1, createdAt: -1 }, limit, skip } = options;

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

async function getAllGroups() {
    const collection = await getCollection(COLLECTION_NAME);
    return await collection.find().sort({ priorityLevel: -1 }).toArray();
}

module.exports = {
    create,
    findById,
    findOne,
    find,
    updateById,
    deleteById,
    count,
    getAllGroups,
    COLLECTION_NAME,
    ObjectId
};

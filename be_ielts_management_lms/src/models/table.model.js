// Table Model - MongoDB Driver
const { getCollection, ObjectId } = require("../db/mongoose");
const { DEFAULT_TABLE_CAPACITY } = require("../constants/enums/guest.enum");

const COLLECTION_NAME = "tables";

/**
 * @swagger
 * components:
 *   schemas:
 *     Table:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         tableName: { type: string }
 *         tableNumber: { type: number }
 *         capacity: { type: number }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 */

async function create(data) {
  const collection = await getCollection(COLLECTION_NAME);

  // Set default capacity if not provided
  if (!data.capacity) {
    data.capacity = DEFAULT_TABLE_CAPACITY;
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

/**
 * Get table with guest count (occupancy)
 * @param {string} id - Table ID
 * @returns {Object} Table with guest count
 */
async function getTableWithOccupancy(id) {
  const table = await findById(id);
  if (!table) return null;

  const guestCollection = await getCollection("guests");
  const guestCount = await guestCollection.countDocuments({ tableId: new ObjectId(id) });

  return {
    ...table,
    currentGuests: guestCount,
    availableSeats: table.capacity - guestCount
  };
}

/**
 * Get all tables with their occupancy
 * @param {Object} query - Query filter
 * @param {Object} options - Query options
 * @returns {Array} Tables with guest counts
 */
async function findWithOccupancy(query = {}, options = {}) {
  const tables = await find(query, options);
  
  const guestCollection = await getCollection("guests");
  
  const tablesWithOccupancy = await Promise.all(
    tables.map(async (table) => {
      const guestCount = await guestCollection.countDocuments({ 
        tableId: table._id 
      });
      
      return {
        ...table,
        currentGuests: guestCount,
        availableSeats: table.capacity - guestCount
      };
    })
  );

  return tablesWithOccupancy;
}

/**
 * Check if table has capacity for additional guests
 * @param {string} id - Table ID
 * @param {number} additionalGuests - Number of additional guests to add
 * @returns {boolean} True if table has capacity
 */
async function hasCapacity(id, additionalGuests = 1) {
  const table = await findById(id);
  if (!table) return false;

  const guestCollection = await getCollection("guests");
  const currentGuests = await guestCollection.countDocuments({ tableId: new ObjectId(id) });

  return (currentGuests + additionalGuests) <= table.capacity;
}

/**
 * Get table statistics
 * @returns {Object} Statistics about tables
 */
async function getStatistics() {
  const collection = await getCollection(COLLECTION_NAME);

  const totalTables = await collection.countDocuments();
  const occupiedTables = await collection.countDocuments({
    _id: { $in: await getCollection("guests").then(c => c.distinct("tableId")) }
  });

  const tables = await find();
  let occupiedCount = 0;
  let availableCount = 0;

  for (const table of tables) {
    const guestCollection = await getCollection("guests");
    const guestCount = await guestCollection.countDocuments({ tableId: table._id });
    if (guestCount > 0) {
      occupiedCount++;
    } else {
      availableCount++;
    }
  }

  // Calculate utilization
  let totalCapacity = 0;
  let totalGuests = 0;
  for (const table of tables) {
    totalCapacity += table.capacity;
    const guestCollection = await getCollection("guests");
    const guestCount = await guestCollection.countDocuments({ tableId: table._id });
    totalGuests += guestCount;
  }

  const utilization = totalCapacity > 0 ? Math.round((totalGuests / totalCapacity) * 100) : 0;

  return {
    totalTables,
    occupiedTables: occupiedCount,
    availableTables: availableCount,
    utilization: `${utilization}%`,
    totalCapacity,
    totalGuests
  };
}

module.exports = {
  create,
  findById,
  findOne,
  find,
  updateById,
  deleteById,
  count,
  getTableWithOccupancy,
  findWithOccupancy,
  hasCapacity,
  getStatistics,
  COLLECTION_NAME,
  ObjectId
};

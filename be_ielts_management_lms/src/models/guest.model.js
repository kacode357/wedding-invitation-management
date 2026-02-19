// Guest Model - MongoDB Driver
const { getCollection, ObjectId } = require("../db/mongoose");
const Category = require("../models/category.model");
const Table = require("../models/table.model");
const { getGuestCategoryList } = require("../constants/enums/guest.enum");

const COLLECTION_NAME = "guests";

/**
 * @swagger
 * components:
 *   schemas:
 *     Guest:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         guestName: { type: string, description: "Guest name (required)" }
 *         categoryId: { type: string, description: "Category ID reference (optional)" }
 *         phone: { type: string }
 *         numberOfGuests: { type: number, minimum: 1, maximum: 10 }
 *         invitationSent: { type: boolean }
 *         tableId: { type: string }
 *         notes: { type: string }
 *         isArrived: { type: boolean, description: "Check-in status - whether guest has arrived" }
 *         arrivedAt: { type: string, format: date-time, description: "Timestamp when guest arrived" }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 */

async function create(data) {
  const collection = await getCollection(COLLECTION_NAME);

  // Set defaults
  data.createdAt = new Date();
  data.updatedAt = new Date();

  // Set default values if not provided
  if (data.numberOfGuests === undefined || data.numberOfGuests === null) {
    data.numberOfGuests = 1;
  }
  if (data.invitationSent === undefined || data.invitationSent === null) {
    data.invitationSent = false;
  }
  if (!data.tableId) {
    data.tableId = null;
  }
  // Default attendance status
  if (data.isArrived === undefined || data.isArrived === null) {
    data.isArrived = false;
  }
  if (!data.arrivedAt) {
    data.arrivedAt = null;
  }

  // Convert categoryId to ObjectId if provided
  if (data.categoryId) {
    data.categoryId = new ObjectId(data.categoryId);
  }

  const result = await collection.insertOne(data);
  return { ...data, _id: result.insertedId };
}

async function findById(id) {
  const collection = await getCollection(COLLECTION_NAME);

  let guest = await collection.findOne({ _id: new ObjectId(id) });

  // Convert tableId and categoryId to string and add category/table names
  if (guest) {
    if (guest.tableId) {
      const tableIdStr = guest.tableId.toString();
      guest.tableId = tableIdStr;
      // Get table name
      const table = await Table.findById(tableIdStr);
      guest.tableName = table ? table.tableNumber : null;
    }
    if (guest.categoryId) {
      const categoryIdStr = guest.categoryId.toString();
      guest.categoryId = categoryIdStr;
      // Get category name
      const category = await Category.findById(categoryIdStr);
      guest.category = category ? category.name : "";
    }
  }

  return guest;
}

async function findOne(query) {
  const collection = await getCollection(COLLECTION_NAME);

  let guest = await collection.findOne(query);

  // Convert tableId and categoryId to string if they exist
  if (guest && guest.tableId) {
    guest.tableId = guest.tableId.toString();
  }
  if (guest && guest.categoryId) {
    guest.categoryId = guest.categoryId.toString();
  }

  return guest;
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

  const guests = await cursor.toArray();

  // Get all categories to map categoryId to category name
  const categories = await Category.getAllCategories();
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat._id.toString()] = cat.name;
  });

  // Get all tables to map tableId to tableName
  const tables = await Table.find();
  const tableMap = {};
  tables.forEach(table => {
    tableMap[table._id.toString()] = table.tableNumber;
  });

  // Convert tableId and categoryId to string and add category/table names for each guest
  return guests.map(guest => {
    if (guest.tableId) {
      const tableIdStr = guest.tableId.toString();
      guest.tableId = tableIdStr;
      guest.tableName = tableMap[tableIdStr] || null;
    }
    if (guest.categoryId) {
      const categoryIdStr = guest.categoryId.toString();
      guest.categoryId = categoryIdStr;
      guest.category = categoryMap[categoryIdStr] || "";
    }
    return guest;
  });
}

async function findByCategory(categoryId) {
  const collection = await getCollection(COLLECTION_NAME);

  const guests = await collection
    .find({ categoryId: new ObjectId(categoryId) })
    .sort({ createdAt: -1 })
    .toArray();

  // Get category name
  const category = await Category.findById(categoryId);
  const categoryName = category ? category.name : "";

  // Get all tables to map tableId to tableName
  const tables = await Table.find();
  const tableMap = {};
  tables.forEach(table => {
    tableMap[table._id.toString()] = table.tableNumber;
  });

  return guests.map(guest => {
    if (guest.tableId) {
      const tableIdStr = guest.tableId.toString();
      guest.tableId = tableIdStr;
      guest.tableName = tableMap[tableIdStr] || null;
    }
    if (guest.categoryId) {
      const categoryIdStr = guest.categoryId.toString();
      guest.categoryId = categoryIdStr;
      guest.category = categoryName;
    }
    return guest;
  });
}

async function findUnassigned() {
  const collection = await getCollection(COLLECTION_NAME);

  const guests = await collection
    .find({ tableId: null })
    .sort({ category: 1, createdAt: -1 })
    .toArray();

  return guests.map(guest => {
    if (guest.tableId) {
      guest.tableId = guest.tableId.toString();
    }
    if (guest.categoryId) {
      guest.categoryId = guest.categoryId.toString();
    }
    return guest;
  });
}

async function findAssigned() {
  const collection = await getCollection(COLLECTION_NAME);

  const guests = await collection
    .find({ tableId: { $ne: null } })
    .sort({ category: 1, createdAt: -1 })
    .toArray();

  return guests.map(guest => {
    if (guest.tableId) {
      guest.tableId = guest.tableId.toString();
    }
    if (guest.categoryId) {
      guest.categoryId = guest.categoryId.toString();
    }
    return guest;
  });
}

async function findArrived() {
  const collection = await getCollection(COLLECTION_NAME);

  const guests = await collection
    .find({ isArrived: true })
    .sort({ arrivedAt: -1, createdAt: -1 })
    .toArray();

  // Get all categories to map categoryId to category name
  const categories = await Category.getAllCategories();
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat._id.toString()] = cat.name;
  });

  // Get all tables to map tableId to tableName
  const tables = await Table.find();
  const tableMap = {};
  tables.forEach(table => {
    tableMap[table._id.toString()] = table.tableNumber;
  });

  return guests.map(guest => {
    if (guest.tableId) {
      const tableIdStr = guest.tableId.toString();
      guest.tableId = tableIdStr;
      guest.tableName = tableMap[tableIdStr] || null;
    }
    if (guest.categoryId) {
      const categoryIdStr = guest.categoryId.toString();
      guest.categoryId = categoryIdStr;
      guest.category = categoryMap[categoryIdStr] || "";
    }
    return guest;
  });
}

async function findUnarrived() {
  const collection = await getCollection(COLLECTION_NAME);

  // Find guests who have been invited but not arrived
  const guests = await collection
    .find({ invitationSent: true, isArrived: false })
    .sort({ createdAt: -1 })
    .toArray();

  // Get all categories to map categoryId to category name
  const categories = await Category.getAllCategories();
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat._id.toString()] = cat.name;
  });

  // Get all tables to map tableId to tableName
  const tables = await Table.find();
  const tableMap = {};
  tables.forEach(table => {
    tableMap[table._id.toString()] = table.tableNumber;
  });

  return guests.map(guest => {
    if (guest.tableId) {
      const tableIdStr = guest.tableId.toString();
      guest.tableId = tableIdStr;
      guest.tableName = tableMap[tableIdStr] || null;
    }
    if (guest.categoryId) {
      const categoryIdStr = guest.categoryId.toString();
      guest.categoryId = categoryIdStr;
      guest.category = categoryMap[categoryIdStr] || "";
    }
    return guest;
  });
}

async function findByTableId(tableId) {
  const collection = await getCollection(COLLECTION_NAME);

  const guests = await collection
    .find({ tableId: new ObjectId(tableId) })
    .sort({ createdAt: -1 })
    .toArray();

  return guests.map(guest => {
    if (guest.tableId) {
      guest.tableId = guest.tableId.toString();
    }
    if (guest.categoryId) {
      guest.categoryId = guest.categoryId.toString();
    }
    return guest;
  });
}

async function updateById(id, data) {
  const collection = await getCollection(COLLECTION_NAME);

  data.updatedAt = new Date();
  delete data._id; // Can't update _id

  // Convert tableId to ObjectId if provided
  if (data.tableId) {
    data.tableId = new ObjectId(data.tableId);
  } else if (data.tableId === null) {
    // Allow setting tableId to null (unassign)
    data.tableId = null;
  }

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

async function countByCategory() {
  const collection = await getCollection(COLLECTION_NAME);

  const result = await collection.aggregate([
    {
      $group: {
        _id: "$categoryId",
        count: { $sum: "$numberOfGuests" }
      }
    }
  ]).toArray();

  // Get all categories from database
  const categories = await Category.getAllCategories();

  // Create a map of categoryId to category name
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat._id.toString()] = cat.name;
  });

  const counts = {};
  categories.forEach(cat => {
    counts[cat.name] = 0;
  });

  result.forEach(item => {
    if (item._id) {
      const categoryIdStr = item._id.toString();
      const categoryName = categoryMap[categoryIdStr];
      if (categoryName) {
        counts[categoryName] = item.count;
      }
    }
  });

  return counts;
}

async function getStatistics() {
  const collection = await getCollection(COLLECTION_NAME);

  const totalGuests = await collection.countDocuments();
  const invitationSent = await collection.countDocuments({ invitationSent: true });
  const unassigned = await collection.countDocuments({ tableId: null });

  const categoryCounts = await countByCategory();

  return {
    totalGuests,
    invitationSent,
    unassigned,
    byCategory: categoryCounts
  };
}

module.exports = {
  create,
  findById,
  findOne,
  find,
  findByCategory,
  findUnassigned,
  findAssigned,
  findArrived,
  findUnarrived,
  findByTableId,
  updateById,
  deleteById,
  count,
  countByCategory,
  getStatistics,
  COLLECTION_NAME,
  ObjectId
};

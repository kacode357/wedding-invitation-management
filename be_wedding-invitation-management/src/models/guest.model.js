// Guest Model - MongoDB Driver
const { getCollection, ObjectId } = require("../db/mongoose");
const Category = require("../models/category.model");
const Table = require("../models/table.model");
const Note = require("../models/note.model");
const Group = require("../models/group.model");
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
 *         numberOfGuests: { type: number, minimum: 1, maximum: 10, description: "Total number of guests invited" }
 *         confirmedGuests: { type: number, minimum: 0, description: "Number of guests confirmed to attend (can be less than numberOfGuests)" }
 *         invitationSent: { type: boolean }
 *         isInvitationCreated: { type: boolean, description: "Whether the e-invitation link has been generated" }
 *         invitationId: { type: string, description: "Unique short ID for the e-invitation link" }
 *         tableId: { type: string }
 *         noteId: { type: string, description: "Note _id reference" }
 *         groupId: { type: string, description: "Group _id reference (optional)" }
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
  // confirmedGuests defaults to numberOfGuests (all invited will attend)
  if (data.confirmedGuests === undefined || data.confirmedGuests === null) {
    data.confirmedGuests = data.numberOfGuests;
  }
  if (data.invitationSent === undefined || data.invitationSent === null) {
    data.invitationSent = false;
  }
  if (data.isInvitationCreated === undefined || data.isInvitationCreated === null) {
    data.isInvitationCreated = false;
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
  // Handle groupId - convert to ObjectId if provided
  if (data.groupId) {
    try {
      if (data.groupId.match(/^[0-9a-fA-F]{24}$/)) {
        data.groupId = new ObjectId(data.groupId);
      } else {
        data.groupId = null;
      }
    } catch (e) {
      data.groupId = null;
    }
  } else {
    data.groupId = null;
  }
  // Handle noteId - convert to ObjectId if provided
  if (data.noteId) {
    try {
      // Check if noteId is a valid MongoDB ObjectId
      if (data.noteId.match(/^[0-9a-fA-F]{24}$/)) {
        data.noteId = new ObjectId(data.noteId);
      } else {
        data.noteId = null;
      }
    } catch (e) {
      data.noteId = null;
    }
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
      guest.tableName = table ? table.tableName : null;
    } else {
      guest.tableId = null;
      guest.tableName = null;
    }
    if (guest.categoryId) {
      const categoryIdStr = guest.categoryId.toString();
      guest.categoryId = categoryIdStr;
      // Get category name
      const category = await Category.findById(categoryIdStr);
      guest.categoryName = category ? category.name : null;
    } else {
      guest.categoryId = null;
      guest.categoryName = null;
    }
    // Always include noteId and noteName
    if (guest.noteId) {
      const noteIdStr = guest.noteId.toString();
      guest.noteId = noteIdStr;
      const note = await Note.findById(noteIdStr);
      guest.noteName = note ? note.name : null;
    } else {
      guest.noteId = null;
      guest.noteName = null;
    }
    // Resolve groupId to groupName
    if (guest.groupId) {
      const groupIdStr = guest.groupId.toString();
      guest.groupId = groupIdStr;
      const group = await Group.findById(groupIdStr);
      guest.groupName = group ? group.name : null;
      guest.groupPriorityLevel = group ? group.priorityLevel : null;
    } else {
      guest.groupId = null;
      guest.groupName = null;
      guest.groupPriorityLevel = null;
    }
  }

  return guest;
}

async function findOne(query) {
  const collection = await getCollection(COLLECTION_NAME);

  let guest = await collection.findOne(query);

  // Convert tableId and categoryId to string if they exist and add names
  if (guest) {
    if (guest.tableId) {
      const tableIdStr = guest.tableId.toString();
      guest.tableId = tableIdStr;
      const table = await Table.findById(tableIdStr);
      guest.tableName = table ? table.tableName : null;
    } else {
      guest.tableId = null;
      guest.tableName = null;
    }
    if (guest.categoryId) {
      const categoryIdStr = guest.categoryId.toString();
      guest.categoryId = categoryIdStr;
      const category = await Category.findById(categoryIdStr);
      guest.categoryName = category ? category.name : null;
    } else {
      guest.categoryId = null;
      guest.categoryName = null;
    }
    if (guest.noteId) {
      const noteIdStr = guest.noteId.toString();
      guest.noteId = noteIdStr;
      const note = await Note.findById(noteIdStr);
      guest.noteName = note ? note.name : null;
    } else {
      guest.noteId = null;
      guest.noteName = null;
    }
    // Resolve groupId to groupName
    if (guest.groupId) {
      const groupIdStr = guest.groupId.toString();
      guest.groupId = groupIdStr;
      const group = await Group.findById(groupIdStr);
      guest.groupName = group ? group.name : null;
      guest.groupPriorityLevel = group ? group.priorityLevel : null;
    } else {
      guest.groupId = null;
      guest.groupName = null;
      guest.groupPriorityLevel = null;
    }
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
    tableMap[table._id.toString()] = table.tableName;
  });

  // Get all notes to map noteId to note details
  const notes = await Note.find();
  const noteMap = {};
  notes.forEach(note => {
    noteMap[note._id.toString()] = note.name;
  });

  // Get all groups to map groupId to group info
  const groups = await Group.getAllGroups();
  const groupMap = {};
  groups.forEach(group => {
    groupMap[group._id.toString()] = { name: group.name, priorityLevel: group.priorityLevel };
  });

  // Convert tableId and categoryId to string and add category/table names for each guest
  return guests.map(guest => {
    if (guest.tableId) {
      const tableIdStr = guest.tableId.toString();
      guest.tableId = tableIdStr;
      guest.tableName = tableMap[tableIdStr] || null;
    } else {
      guest.tableId = null;
      guest.tableName = null;
    }
    if (guest.categoryId) {
      const categoryIdStr = guest.categoryId.toString();
      guest.categoryId = categoryIdStr;
      guest.categoryName = categoryMap[categoryIdStr] || null;
    } else {
      guest.categoryId = null;
      guest.categoryName = null;
    }
    // Always include noteId and noteName
    if (guest.noteId) {
      const noteIdStr = guest.noteId.toString();
      guest.noteId = noteIdStr;
      guest.noteName = noteMap[noteIdStr] || null;
    } else {
      guest.noteId = null;
      guest.noteName = null;
    }
    // Resolve groupId to groupName
    if (guest.groupId) {
      const groupIdStr = guest.groupId.toString();
      guest.groupId = groupIdStr;
      const groupData = groupMap[groupIdStr];
      guest.groupName = groupData ? groupData.name : null;
      guest.groupPriorityLevel = groupData ? groupData.priorityLevel : null;
    } else {
      guest.groupId = null;
      guest.groupName = null;
      guest.groupPriorityLevel = null;
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
  const categoryName = category ? category.name : null;

  // Get all tables to map tableId to tableName
  const tables = await Table.find();
  const tableMap = {};
  tables.forEach(table => {
    tableMap[table._id.toString()] = table.tableName;
  });

  // Get all notes to map noteId to noteName
  const notes = await Note.find();
  const noteMap = {};
  notes.forEach(note => {
    noteMap[note._id.toString()] = note.name;
  });

  // Get all groups to map groupId to group info
  const groups = await Group.getAllGroups();
  const groupMap = {};
  groups.forEach(group => {
    groupMap[group._id.toString()] = { name: group.name, priorityLevel: group.priorityLevel };
  });

  return guests.map(guest => {
    if (guest.tableId) {
      const tableIdStr = guest.tableId.toString();
      guest.tableId = tableIdStr;
      guest.tableName = tableMap[tableIdStr] || null;
    } else {
      guest.tableId = null;
      guest.tableName = null;
    }
    if (guest.categoryId) {
      const categoryIdStr = guest.categoryId.toString();
      guest.categoryId = categoryIdStr;
      guest.categoryName = categoryName;
    } else {
      guest.categoryId = null;
      guest.categoryName = null;
    }
    if (guest.noteId) {
      const noteIdStr = guest.noteId.toString();
      guest.noteId = noteIdStr;
      guest.noteName = noteMap[noteIdStr] || null;
    } else {
      guest.noteId = null;
      guest.noteName = null;
    }
    // Resolve groupId to groupName
    if (guest.groupId) {
      const groupIdStr = guest.groupId.toString();
      guest.groupId = groupIdStr;
      const groupData = groupMap[groupIdStr];
      guest.groupName = groupData ? groupData.name : null;
      guest.groupPriorityLevel = groupData ? groupData.priorityLevel : null;
    } else {
      guest.groupId = null;
      guest.groupName = null;
      guest.groupPriorityLevel = null;
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

  // Get all categories to map categoryId to category name
  const categories = await Category.getAllCategories();
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat._id.toString()] = cat.name;
  });

  // Get all notes to map noteId to noteName
  const notes = await Note.find();
  const noteMap = {};
  notes.forEach(note => {
    noteMap[note._id.toString()] = note.name;
  });

  // Get all groups to map groupId to group info
  const groups = await Group.getAllGroups();
  const groupMap = {};
  groups.forEach(group => {
    groupMap[group._id.toString()] = { name: group.name, priorityLevel: group.priorityLevel };
  });

  return guests.map(guest => {
    // Unassigned guests don't have a table
    guest.tableId = null;
    guest.tableName = null;
    if (guest.categoryId) {
      const categoryIdStr = guest.categoryId.toString();
      guest.categoryId = categoryIdStr;
      guest.categoryName = categoryMap[categoryIdStr] || null;
    } else {
      guest.categoryId = null;
      guest.categoryName = null;
    }
    if (guest.noteId) {
      const noteIdStr = guest.noteId.toString();
      guest.noteId = noteIdStr;
      guest.noteName = noteMap[noteIdStr] || null;
    } else {
      guest.noteId = null;
      guest.noteName = null;
    }
    // Resolve groupId to groupName
    if (guest.groupId) {
      const groupIdStr = guest.groupId.toString();
      guest.groupId = groupIdStr;
      const groupData = groupMap[groupIdStr];
      guest.groupName = groupData ? groupData.name : null;
      guest.groupPriorityLevel = groupData ? groupData.priorityLevel : null;
    } else {
      guest.groupId = null;
      guest.groupName = null;
      guest.groupPriorityLevel = null;
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
    tableMap[table._id.toString()] = table.tableName;
  });

  // Get all notes to map noteId to noteName
  const notes = await Note.find();
  const noteMap = {};
  notes.forEach(note => {
    noteMap[note._id.toString()] = note.name;
  });

  // Get all groups to map groupId to group info
  const groups = await Group.getAllGroups();
  const groupMap = {};
  groups.forEach(group => {
    groupMap[group._id.toString()] = { name: group.name, priorityLevel: group.priorityLevel };
  });

  return guests.map(guest => {
    if (guest.tableId) {
      const tableIdStr = guest.tableId.toString();
      guest.tableId = tableIdStr;
      guest.tableName = tableMap[tableIdStr] || null;
    } else {
      guest.tableId = null;
      guest.tableName = null;
    }
    if (guest.categoryId) {
      const categoryIdStr = guest.categoryId.toString();
      guest.categoryId = categoryIdStr;
      guest.categoryName = categoryMap[categoryIdStr] || null;
    } else {
      guest.categoryId = null;
      guest.categoryName = null;
    }
    if (guest.noteId) {
      const noteIdStr = guest.noteId.toString();
      guest.noteId = noteIdStr;
      guest.noteName = noteMap[noteIdStr] || null;
    } else {
      guest.noteId = null;
      guest.noteName = null;
    }
    // Resolve groupId to groupName
    if (guest.groupId) {
      const groupIdStr = guest.groupId.toString();
      guest.groupId = groupIdStr;
      const groupData = groupMap[groupIdStr];
      guest.groupName = groupData ? groupData.name : null;
      guest.groupPriorityLevel = groupData ? groupData.priorityLevel : null;
    } else {
      guest.groupId = null;
      guest.groupName = null;
      guest.groupPriorityLevel = null;
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
    tableMap[table._id.toString()] = table.tableName;
  });

  // Get all notes to map noteId to noteName
  const notes = await Note.find();
  const noteMap = {};
  notes.forEach(note => {
    noteMap[note._id.toString()] = note.name;
  });

  // Get all groups to map groupId to group info
  const groups = await Group.getAllGroups();
  const groupMap = {};
  groups.forEach(group => {
    groupMap[group._id.toString()] = { name: group.name, priorityLevel: group.priorityLevel };
  });

  return guests.map(guest => {
    if (guest.tableId) {
      const tableIdStr = guest.tableId.toString();
      guest.tableId = tableIdStr;
      guest.tableName = tableMap[tableIdStr] || null;
    } else {
      guest.tableId = null;
      guest.tableName = null;
    }
    if (guest.categoryId) {
      const categoryIdStr = guest.categoryId.toString();
      guest.categoryId = categoryIdStr;
      guest.categoryName = categoryMap[categoryIdStr] || null;
    } else {
      guest.categoryId = null;
      guest.categoryName = null;
    }
    if (guest.noteId) {
      const noteIdStr = guest.noteId.toString();
      guest.noteId = noteIdStr;
      guest.noteName = noteMap[noteIdStr] || null;
    } else {
      guest.noteId = null;
      guest.noteName = null;
    }
    // Resolve groupId to groupName
    if (guest.groupId) {
      const groupIdStr = guest.groupId.toString();
      guest.groupId = groupIdStr;
      const groupData = groupMap[groupIdStr];
      guest.groupName = groupData ? groupData.name : null;
      guest.groupPriorityLevel = groupData ? groupData.priorityLevel : null;
    } else {
      guest.groupId = null;
      guest.groupName = null;
      guest.groupPriorityLevel = null;
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
    tableMap[table._id.toString()] = table.tableName;
  });

  // Get all notes to map noteId to noteName
  const notes = await Note.find();
  const noteMap = {};
  notes.forEach(note => {
    noteMap[note._id.toString()] = note.name;
  });

  // Get all groups to map groupId to group info
  const groups = await Group.getAllGroups();
  const groupMap = {};
  groups.forEach(group => {
    groupMap[group._id.toString()] = { name: group.name, priorityLevel: group.priorityLevel };
  });

  return guests.map(guest => {
    if (guest.tableId) {
      const tableIdStr = guest.tableId.toString();
      guest.tableId = tableIdStr;
      guest.tableName = tableMap[tableIdStr] || null;
    } else {
      guest.tableId = null;
      guest.tableName = null;
    }
    if (guest.categoryId) {
      const categoryIdStr = guest.categoryId.toString();
      guest.categoryId = categoryIdStr;
      guest.categoryName = categoryMap[categoryIdStr] || null;
    } else {
      guest.categoryId = null;
      guest.categoryName = null;
    }
    if (guest.noteId) {
      const noteIdStr = guest.noteId.toString();
      guest.noteId = noteIdStr;
      guest.noteName = noteMap[noteIdStr] || null;
    } else {
      guest.noteId = null;
      guest.noteName = null;
    }
    // Resolve groupId to groupName
    if (guest.groupId) {
      const groupIdStr = guest.groupId.toString();
      guest.groupId = groupIdStr;
      const groupData = groupMap[groupIdStr];
      guest.groupName = groupData ? groupData.name : null;
      guest.groupPriorityLevel = groupData ? groupData.priorityLevel : null;
    } else {
      guest.groupId = null;
      guest.groupName = null;
      guest.groupPriorityLevel = null;
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

  // Get all categories to map categoryId to category name
  const categories = await Category.getAllCategories();
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat._id.toString()] = cat.name;
  });

  // Get all notes to map noteId to noteName
  const notes = await Note.find();
  const noteMap = {};
  notes.forEach(note => {
    noteMap[note._id.toString()] = note.name;
  });

  // Get all groups to map groupId to group info
  const groups = await Group.getAllGroups();
  const groupMap = {};
  groups.forEach(group => {
    groupMap[group._id.toString()] = { name: group.name, priorityLevel: group.priorityLevel };
  });

  return guests.map(guest => {
    if (guest.tableId) {
      guest.tableId = guest.tableId.toString();
      guest.tableName = null; // Already filtering by table, so we know the table
    } else {
      guest.tableId = null;
      guest.tableName = null;
    }
    if (guest.categoryId) {
      const categoryIdStr = guest.categoryId.toString();
      guest.categoryId = categoryIdStr;
      guest.categoryName = categoryMap[categoryIdStr] || null;
    } else {
      guest.categoryId = null;
      guest.categoryName = null;
    }
    if (guest.noteId) {
      const noteIdStr = guest.noteId.toString();
      guest.noteId = noteIdStr;
      guest.noteName = noteMap[noteIdStr] || null;
    } else {
      guest.noteId = null;
      guest.noteName = null;
    }
    // Resolve groupId to groupName
    if (guest.groupId) {
      const groupIdStr = guest.groupId.toString();
      guest.groupId = groupIdStr;
      const groupData = groupMap[groupIdStr];
      guest.groupName = groupData ? groupData.name : null;
      guest.groupPriorityLevel = groupData ? groupData.priorityLevel : null;
    } else {
      guest.groupId = null;
      guest.groupName = null;
      guest.groupPriorityLevel = null;
    }
    return guest;
  });
}

async function updateById(id, data) {
  const collection = await getCollection(COLLECTION_NAME);

  data.updatedAt = new Date();
  delete data._id; // Can't update _id

  // If numberOfGuests is being updated, also update confirmedGuests if not provided
  if (data.numberOfGuests !== undefined && data.confirmedGuests === undefined) {
    // Get existing guest to check current confirmedGuests
    const existingGuest = await findById(id);
    if (existingGuest) {
      // If confirmedGuests was not provided, reset it to match new numberOfGuests
      data.confirmedGuests = data.numberOfGuests;
    }
  }

  // Convert tableId to ObjectId if provided
  if (data.tableId) {
    data.tableId = new ObjectId(data.tableId);
  } else if (data.tableId === null) {
    // Allow setting tableId to null (unassign)
    data.tableId = null;
  }

  // Handle noteId - convert to ObjectId if provided
  if (data.noteId) {
    try {
      // Check if noteId is a valid MongoDB ObjectId
      if (data.noteId.match(/^[0-9a-fA-F]{24}$/)) {
        data.noteId = new ObjectId(data.noteId);
      } else {
        data.noteId = null;
      }
    } catch (e) {
      data.noteId = null;
    }
  } else if (data.noteId === null) {
    // Allow setting noteId to null (remove note reference)
    data.noteId = null;
  }

  // Handle groupId - convert to ObjectId if provided
  if (data.groupId) {
    try {
      if (data.groupId.match(/^[0-9a-fA-F]{24}$/)) {
        data.groupId = new ObjectId(data.groupId);
      } else {
        data.groupId = null;
      }
    } catch (e) {
      data.groupId = null;
    }
  } else if (data.groupId === null) {
    // Allow setting groupId to null (remove group reference)
    data.groupId = null;
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
      // Normalize categoryId to string to merge ObjectId and string variants
      $addFields: {
        categoryIdStr: { $toString: "$categoryId" }
      }
    },
    {
      $group: {
        _id: "$categoryIdStr",
        invited: { $sum: "$numberOfGuests" },
        confirmed: { $sum: "$confirmedGuests" }
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
    counts[cat.name] = { invited: 0, confirmed: 0 };
  });

  result.forEach(item => {
    if (item._id) {
      const categoryIdStr = item._id.toString();
      const categoryName = categoryMap[categoryIdStr];
      if (categoryName) {
        // Accumulate (+=) to safely handle any remaining duplicates
        counts[categoryName].invited += item.invited || 0;
        counts[categoryName].confirmed += item.confirmed || 0;
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

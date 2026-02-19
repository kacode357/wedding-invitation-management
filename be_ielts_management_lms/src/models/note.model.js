// Note Model - MongoDB Driver
const { getCollection, ObjectId } = require("../db/mongoose");
const { ATTENDANCE_STATUS } = require("../constants/enums/note.enum");

const COLLECTION_NAME = "notes";

/**
 * Generate a unique noteId (e.g., NOTE-001, NOTE-002)
 * @param {number} count - Current count of notes
 * @returns {string} - Generated noteId
 */
function generateNoteId(count) {
  const prefix = "NOTE";
  const number = (count + 1).toString().padStart(3, "0");
  return `${prefix}-${number}`;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Note:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         noteId: { type: string, description: "Unique note identifier (e.g., NOTE-001)" }
 *         attendanceStatus: { 
 *           type: string, 
 *           enum: [definitely, highly_likely, unlikely, custom_prediction],
 *           description: |
 *             - definitely: Confirmed - 100% attendance
 *             - highly_likely: Over 50% chance of attendance
 *             - unlikely: Under 50% chance of attendance
 *             - custom_prediction: Custom prediction
 *         }
 *         customPrediction: { type: string, description: "Custom prediction text (required when attendanceStatus is custom_prediction)" }
 *         invitedCount: { type: number, description: "Number of guests invited" }
 *         predictedCount: { type: number, description: "Predicted number of attendees" }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 */

async function create(data) {
  const collection = await getCollection(COLLECTION_NAME);

  // Get current count for generating noteId
  const count = await collection.countDocuments();
  data.noteId = generateNoteId(count);

  // Set defaults
  data.createdAt = new Date();
  data.updatedAt = new Date();

  // Set default values if not provided
  if (!data.attendanceStatus) {
    data.attendanceStatus = ATTENDANCE_STATUS.DEFINITELY;
  }

  // Set default counts if not provided
  if (data.invitedCount === undefined || data.invitedCount === null) {
    data.invitedCount = 1;
  }
  if (data.predictedCount === undefined || data.predictedCount === null) {
    // Default predicted count based on attendance status
    if (data.attendanceStatus === ATTENDANCE_STATUS.DEFINITELY) {
      data.predictedCount = data.invitedCount;
    } else if (data.attendanceStatus === ATTENDANCE_STATUS.HIGHLY_LIKELY) {
      data.predictedCount = Math.ceil(data.invitedCount * 0.75);
    } else if (data.attendanceStatus === ATTENDANCE_STATUS.UNLIKELY) {
      data.predictedCount = Math.ceil(data.invitedCount * 0.25);
    } else {
      data.predictedCount = 1;
    }
  }

  // For custom_prediction, require customPrediction field
  if (data.attendanceStatus === ATTENDANCE_STATUS.CUSTOM_PREDICTION && !data.customPrediction) {
    throw new Error("Custom prediction text is required when attendance status is custom_prediction");
  }

  const result = await collection.insertOne(data);
  return { ...data, _id: result.insertedId };
}

async function findById(id) {
  const collection = await getCollection(COLLECTION_NAME);
  return await collection.findOne({ _id: new ObjectId(id) });
}

async function findByNoteId(noteId) {
  const collection = await getCollection(COLLECTION_NAME);
  return await collection.findOne({ noteId: noteId });
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
  delete data.noteId; // Can't update noteId

  // For custom_prediction, require customPrediction field
  if (data.attendanceStatus === ATTENDANCE_STATUS.CUSTOM_PREDICTION && !data.customPrediction) {
    throw new Error("Custom prediction text is required when attendance status is custom_prediction");
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

module.exports = {
  create,
  findById,
  findByNoteId,
  find,
  updateById,
  deleteById,
  count,
  COLLECTION_NAME,
  ObjectId
};

/**
 * Course Enums
 * Note: Course levels are managed via database CRUD, not hardcoded here
 */

const COURSE_STATUS = {
  SCHEDULED: "scheduled",
  ONGOING: "ongoing",
  COMPLETED: "completed",
  CANCELLED: "cancelled"
};

const COURSE_STATUS_LIST = Object.values(COURSE_STATUS);

module.exports = {
  COURSE_STATUS,
  COURSE_STATUS_LIST
};

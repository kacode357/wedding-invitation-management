/**
 * Enrollment Enums
 */

const ENROLLMENT_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
  DROPPED: "dropped"
};

const ENROLLMENT_STATUS_LIST = Object.values(ENROLLMENT_STATUS);

module.exports = {
  ENROLLMENT_STATUS,
  ENROLLMENT_STATUS_LIST
};

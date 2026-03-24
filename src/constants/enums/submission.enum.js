/**
 * Submission Enums
 */

const SUBMISSION_STATUS = {
  SUBMITTED: "submitted",
  GRADED: "graded",
  LATE: "late"
};

const SUBMISSION_STATUS_LIST = Object.values(SUBMISSION_STATUS);

module.exports = {
  SUBMISSION_STATUS,
  SUBMISSION_STATUS_LIST
};

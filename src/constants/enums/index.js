/**
 * Central export for all enums
 * Import from here: const { USER_ROLES, COURSE_STATUS } = require("../constants/enums");
 */

const { USER_ROLES, USER_ROLE_LIST } = require("./user.enum");
const { ATTENDANCE_STATUS, ATTENDANCE_STATUS_LIST, ATTENDANCE_SUMMARY_STATUS, ATTENDANCE_SUMMARY_STATUS_LIST } = require("./attendance.enum");
const { COURSE_STATUS, COURSE_STATUS_LIST } = require("./course.enum");
const { COMPUTED_SCHEDULE_STATUS, COMPUTED_SCHEDULE_STATUS_LIST } = require("./schedule.enum");
const { ENROLLMENT_STATUS, ENROLLMENT_STATUS_LIST } = require("./enrollment.enum");
const { SUBMISSION_STATUS, SUBMISSION_STATUS_LIST } = require("./submission.enum");
const { ASSIGNMENT_TYPE, ASSIGNMENT_TYPE_LIST } = require("./assignment.enum");
const { ASSESSMENT_TYPE, ASSESSMENT_TYPE_LIST } = require("./assessment.enum");
const { LESSON_TYPE, LESSON_TYPE_LIST } = require("./lesson.enum");
const { MATERIAL_TYPE, MATERIAL_TYPE_LIST } = require("./material.enum");
const { QUIZ_TYPE, QUIZ_TYPE_LIST } = require("./quiz.enum");
const { QUESTION_TYPE, QUESTION_TYPE_LIST } = require("./question.enum");
const { GUEST_CATEGORIES, GUEST_CATEGORY_LIST, DEFAULT_TABLE_CAPACITY } = require("./guest.enum");

module.exports = {
  // User & Role
  USER_ROLES,
  USER_ROLE_LIST,

  // Attendance
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_LIST,
  ATTENDANCE_SUMMARY_STATUS,
  ATTENDANCE_SUMMARY_STATUS_LIST,

  // Course (Note: Course levels are managed via database CRUD)
  COURSE_STATUS,
  COURSE_STATUS_LIST,

  // Schedule (computed from date, not stored in DB)
  COMPUTED_SCHEDULE_STATUS,
  COMPUTED_SCHEDULE_STATUS_LIST,

  // Enrollment
  ENROLLMENT_STATUS,
  ENROLLMENT_STATUS_LIST,

  // Submission
  SUBMISSION_STATUS,
  SUBMISSION_STATUS_LIST,

  // Assignment
  ASSIGNMENT_TYPE,
  ASSIGNMENT_TYPE_LIST,

  // Assessment
  ASSESSMENT_TYPE,
  ASSESSMENT_TYPE_LIST,

  // Lesson
  LESSON_TYPE,
  LESSON_TYPE_LIST,

  // Material
  MATERIAL_TYPE,
  MATERIAL_TYPE_LIST,

  // Quiz
  QUIZ_TYPE,
  QUIZ_TYPE_LIST,

  // Question
  QUESTION_TYPE,
  QUESTION_TYPE_LIST,

  // Guest
  GUEST_CATEGORIES,
  GUEST_CATEGORY_LIST,
  DEFAULT_TABLE_CAPACITY
};

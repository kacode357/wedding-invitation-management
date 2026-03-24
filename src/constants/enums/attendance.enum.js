/**
 * Attendance Enums
 */

/**
 * Individual student attendance status for a schedule session
 * Used in: Attendance.status
 */
const ATTENDANCE_STATUS = {
  PRESENT: "present",
  ABSENT: "absent",
  LATE: "late",
  EXCUSED: "excused"
};

const ATTENDANCE_STATUS_LIST = Object.values(ATTENDANCE_STATUS);

/**
 * Attendance summary status for a schedule (overview)
 * Used in: Schedule attendanceSummary.status
 */
const ATTENDANCE_SUMMARY_STATUS = {
  NOT_YET: "not_yet",     // Teacher hasn't taken attendance yet (schedule is today or future)
  ABSENT: "absent",       // Schedule is past & no attendance OR all students absent
  ATTENDED: "attended"    // At least one student has attendance record with present/late/excused
};

const ATTENDANCE_SUMMARY_STATUS_LIST = Object.values(ATTENDANCE_SUMMARY_STATUS);

module.exports = {
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_LIST,
  ATTENDANCE_SUMMARY_STATUS,
  ATTENDANCE_SUMMARY_STATUS_LIST
};

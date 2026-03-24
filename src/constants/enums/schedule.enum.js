/**
 * Schedule Enums
 * Note: Schedule status is now computed from date, not stored in DB
 * - past: date < today
 * - today: date == today
 * - upcoming: date > today
 * - cancelled: isCancelled = true (exceptional case)
 */

const COMPUTED_SCHEDULE_STATUS = {
  PAST: "past",
  TODAY: "today", 
  UPCOMING: "upcoming",
  CANCELLED: "cancelled"
};

const COMPUTED_SCHEDULE_STATUS_LIST = Object.values(COMPUTED_SCHEDULE_STATUS);

module.exports = {
  COMPUTED_SCHEDULE_STATUS,
  COMPUTED_SCHEDULE_STATUS_LIST
};

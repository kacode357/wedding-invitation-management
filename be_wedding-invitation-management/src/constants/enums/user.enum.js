/**
 * User & Role Enums
 */

const USER_ROLES = {
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student"
};

const USER_ROLE_LIST = Object.values(USER_ROLES);

module.exports = {
  USER_ROLES,
  USER_ROLE_LIST
};

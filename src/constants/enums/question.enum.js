/**
 * Question Enums
 */

const QUESTION_TYPE = {
  MULTIPLE_CHOICE: "multiple_choice",
  FILL_BLANK: "fill_blank",
  TRUE_FALSE: "true_false"
};

const QUESTION_TYPE_LIST = Object.values(QUESTION_TYPE);

module.exports = {
  QUESTION_TYPE,
  QUESTION_TYPE_LIST
};

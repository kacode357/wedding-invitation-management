// Response Messages Manager - Multi-language support
const common = require('./common');
const auth = require('./auth');

/**
 * Get messages for a specific language
 * @param {string} lang - Language code (en, vi)
 * @returns {Object} Messages object grouped by module
 */
const getMessages = (lang = "en") => {
  const validLang = ["en", "vi"].includes(lang) ? lang : "en";
  
  return {
    COMMON: common[validLang],
    AUTH: auth[validLang],
  };
};

/**
 * Get a specific message
 * @param {string} key - Message key (e.g., 'AUTH.LOGIN_SUCCESS')
 * @param {string} lang - Language code
 * @returns {string} Message
 */
const getMessage = (key, lang = "en") => {
  const msgs = getMessages(lang);
  const keys = key.split(".");
  let message = msgs;

  for (const k of keys) {
    message = message[k];
    if (!message) {
      return key; // Return key if message not found
    }
  }

  return message;
};

module.exports = {
  getMessages,
  getMessage,
};

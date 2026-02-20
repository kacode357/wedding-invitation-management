// Dashboard Service - Fetches statistics for the API dashboard
const guestModel = require("../models/guest.model");
const { getGuestCategoryList } = require("../constants/enums/guest.enum");

/**
 * Get all dashboard statistics
 * @returns {Object} Dashboard data with statistics
 */
async function getDashboardData() {
  // Get all guests to calculate actual counts
  const allGuests = await guestModel.find();

  // Calculate total invited guests (sum of numberOfGuests)
  const totalInvited = allGuests.reduce((sum, guest) => sum + (guest.numberOfGuests || 0), 0);

  // Calculate total confirmed guests (sum of confirmedGuests)
  const totalConfirmed = allGuests.reduce((sum, guest) => sum + (guest.confirmedGuests || 0), 0);

  // Invitations statistics
  // Families invited = count of guest records
  const familiesInvited = allGuests.length;
  
  // People who received invitations = sum of numberOfGuests where invitationSent is true
  const invitationsSent = allGuests
    .filter(guest => guest.invitationSent === true)
    .reduce((sum, guest) => sum + (guest.numberOfGuests || 0), 0);

  // Get guests by category
  const categoryCounts = await guestModel.countByCategory();
  
  // Transform category counts into array format
  const categoryList = await getGuestCategoryList();
  const guestsByCategory = categoryList.map(category => ({
    category: category,
    count: (categoryCounts[category]?.invited || 0)
  }));

  return {
    guests: {
      confirmedGuests: totalConfirmed,
      numberOfGuests: totalInvited
    },
    invitations: {
      familiesInvited: familiesInvited,
      invitationsSent: invitationsSent
    },
    guestsByCategory: guestsByCategory
  };
}

module.exports = {
  getDashboardData
};

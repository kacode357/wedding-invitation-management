// Dashboard Service - Fetches statistics for the API dashboard
const guestModel = require("../models/guest.model");
const tableModel = require("../models/table.model");
const { getGuestCategoryList } = require("../constants/enums/guest.enum");

/**
 * Get all dashboard statistics
 * @returns {Object} Dashboard data with statistics
 */
async function getDashboardData() {
  // Get all guests to calculate actual counts
  const allGuests = await guestModel.find();

  // Calculate total actual guests by summing numberOfGuests field
  const totalGuests = allGuests.reduce((sum, guest) => sum + (guest.numberOfGuests || 0), 0);

  const totalTables = await tableModel.count();

  // Get guests by category (already sums numberOfGuests)
  const categoryCounts = await guestModel.countByCategory();
  
  // Transform category counts into array format
  const categoryList = await getGuestCategoryList();
  const guestsByCategory = categoryList.map(category => ({
    category: category,
    count: categoryCounts[category] || 0
  }));

  // Get table occupancy
  const tables = await tableModel.find();
  let occupiedTables = 0;
  let availableTables = 0;

  for (const table of tables) {
    const tableGuests = await guestModel.findByTableId(table._id.toString());
    if (tableGuests && tableGuests.length > 0) {
      occupiedTables++;
    } else {
      availableTables++;
    }
  }

  return {
    guests: {
      total: totalGuests
    },
    tables: {
      total: totalTables,
      occupied: occupiedTables,
      available: availableTables
    },
    guestsByCategory: guestsByCategory
  };
}

module.exports = {
  getDashboardData
};

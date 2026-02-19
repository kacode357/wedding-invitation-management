// Guest Service - Business Logic Layer
const Guest = require("../models/guest.model");
const Table = require("../models/table.model");
const { AppError } = require("../utils/appError");
const { getMessages } = require("../responses");
const {
  getGuestCategoryList,
  clearCategoryCache,
  DEFAULT_TABLE_CAPACITY
} = require("../constants/enums/guest.enum");

class GuestService {
  /**
   * Validate guest data
   */
  async validateGuestData(data, lang = "en") {
    const messages = getMessages(lang);
    const errors = [];

    // Validate required fields - only guestName is required
    if (!data.guestName || data.guestName.trim() === "") {
      errors.push("Guest name is required");
    }

    // Validate numberOfGuests
    if (data.numberOfGuests !== undefined && data.numberOfGuests !== null) {
      if (data.numberOfGuests < 1) {
        errors.push("Number of guests must be at least 1");
      }
      if (data.numberOfGuests > 10) {
        errors.push("Number of guests cannot exceed 10");
      }
    }

    // Validate tableId if provided
    if (data.tableId) {
      // Will be validated in assignTable method
    }

    if (errors.length > 0) {
      throw new AppError(errors.join(", "), 400);
    }
  }

  /**
   * Create a new guest
   */
  async create(guestData, lang = "en") {
    const messages = getMessages(lang);

    // Validate guest data (async to support dynamic category validation)
    await this.validateGuestData(guestData, lang);

    // Set defaults
    const data = {
      guestName: guestData.guestName.trim(),
      categoryId: guestData.categoryId || null,
      phone: guestData.phone || "",
      numberOfGuests: guestData.numberOfGuests || 1,
      invitationSent: guestData.invitationSent || false,
      notes: guestData.notes || ""
    };

    // If tableId is provided, validate table and capacity
    if (guestData.tableId) {
      await this.assignTableToGuest(null, guestData.tableId, data.numberOfGuests, lang);
      data.tableId = guestData.tableId;
    } else {
      data.tableId = null;
    }

    const guest = await Guest.create(data);
    return guest;
  }

  /**
   * Get all guests with optional filtering
   */
  async findAll(query = {}, options = {}, lang = "en") {
    const guests = await Guest.find(query, options);
    return guests;
  }

  /**
   * Get guest by ID
   */
  async findById(id, lang = "en") {
    const messages = getMessages(lang);

    if (!id) {
      throw new AppError(messages.COMMON.INVALID_ID, 400);
    }

    const guest = await Guest.findById(id);

    if (!guest) {
      throw new AppError(messages.COMMON.NOT_FOUND, 404);
    }

    return guest;
  }

  /**
   * Get guests by category
   */
  async findByCategory(categoryId, lang = "en") {
    const messages = getMessages(lang);

    // Validate categoryId
    if (!categoryId) {
      throw new AppError("Category ID is required", 400);
    }

    const guests = await Guest.findByCategory(categoryId);
    return guests;
  }

  /**
   * Get unassigned guests
   */
  async findUnassigned(lang = "en") {
    const guests = await Guest.findUnassigned();
    return guests;
  }

  /**
   * Get assigned guests (guests who have booked a table)
   */
  async findAssigned(lang = "en") {
    const guests = await Guest.findAssigned();
    
    // Get table details for each guest
    const tableCollection = await require("../models/table.model");
    const guestsWithTable = await Promise.all(
      guests.map(async (guest) => {
        if (guest.tableId) {
          const table = await Table.findById(guest.tableId.toString());
          if (table) {
            guest.table = {
              _id: table._id,
              tableName: table.tableName,
              tableNumber: table.tableNumber,
              capacity: table.capacity
            };
          }
        }
        return guest;
      })
    );
    
    return guestsWithTable;
  }

  /**
   * Get guests by invitation status
   * @param {string} status - 'invited' or 'uninvited'
   */
  async findByInvitationStatus(status, lang = "en") {
    const messages = getMessages(lang);

    let invitationSent;
    if (status === "invited") {
      invitationSent = true;
    } else if (status === "uninvited") {
      invitationSent = false;
    } else if (status) {
      throw new AppError("Invalid status. Use 'invited' or 'uninvited'", 400);
    }

    const query = {};
    if (invitationSent !== undefined) {
      query.invitationSent = invitationSent;
    }

    const guests = await Guest.find(query);
    return guests;
  }

  /**
   * Get guests at a specific table
   */
  async findByTable(tableId, lang = "en") {
    const messages = getMessages(lang);

    if (!tableId) {
      throw new AppError(messages.COMMON.INVALID_ID, 400);
    }

    // Check if table exists
    const table = await Table.findById(tableId);
    if (!table) {
      throw new AppError(messages.COMMON.NOT_FOUND, 404);
    }

    const guests = await Guest.findByTableId(tableId);
    return guests;
  }

  /**
   * Update guest
   */
  async update(id, updateData, lang = "en") {
    const messages = getMessages(lang);

    // Check if guest exists
    const existingGuest = await Guest.findById(id);
    if (!existingGuest) {
      throw new AppError(messages.COMMON.NOT_FOUND, 404);
    }

    // If updating category, validate it against dynamic list
    if (updateData.category && updateData.category.trim() !== "") {
      const categoryList = await getGuestCategoryList();
      if (!categoryList.includes(updateData.category)) {
        throw new AppError(`Invalid category. Must be one of: ${categoryList.join(", ")}`, 400);
      }
    }

    // Validate numberOfGuests if provided
    if (updateData.numberOfGuests !== undefined) {
      if (updateData.numberOfGuests < 1 || updateData.numberOfGuests > 10) {
        throw new AppError("Number of guests must be between 1 and 10", 400);
      }
    }

    // If updating table assignment, handle capacity
    if (updateData.tableId !== undefined) {
      const newTableId = updateData.tableId;
      const numberOfGuests = updateData.numberOfGuests || existingGuest.numberOfGuests;

      // If assigning to a new table
      if (newTableId && newTableId !== existingGuest.tableId) {
        // Check new table has capacity
        await this.assignTableToGuest(null, newTableId, numberOfGuests, lang);
      }
    }

    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const updatedGuest = await Guest.updateById(id, updateData);
    return updatedGuest;
  }

  /**
   * Delete guest
   */
  async delete(id, lang = "en") {
    const messages = getMessages(lang);

    const guest = await Guest.findById(id);
    if (!guest) {
      throw new AppError(messages.COMMON.NOT_FOUND, 404);
    }

    const deleted = await Guest.deleteById(id);
    return deleted;
  }

  /**
   * Assign table to multiple guests (bulk assignment)
   * @param {Array} guestIds - Array of guest IDs to assign
   * @param {string} tableId - Table ID to assign guests to
   * @param {string} lang - Language code
   * @returns {Array} Array of updated guests
   */
  async assignTableToMultipleGuests(guestIds, tableId, lang = "en") {
    const messages = getMessages(lang);

    if (!Array.isArray(guestIds) || guestIds.length === 0) {
      throw new AppError("guestIds must be a non-empty array", 400);
    }

    // Validate table exists
    const table = await Table.findById(tableId);
    if (!table) {
      throw new AppError(messages.COMMON.NOT_FOUND, 404);
    }

    // Get all guests to be assigned
    const guests = await Promise.all(
      guestIds.map(async (guestId) => {
        const guest = await Guest.findById(guestId);
        if (!guest) {
          throw new AppError(`Guest not found: ${guestId}`, 404);
        }
        return guest;
      })
    );

    // Calculate total guests to assign
    const totalGuestsToAssign = guests.reduce((sum, guest) => sum + (guest.numberOfGuests || 1), 0);

    // Get current occupancy of the table
    const tableWithOccupancy = await Table.getTableWithOccupancy(tableId);
    const currentGuests = tableWithOccupancy.currentGuests || 0;

    // Check capacity for all guests combined
    const availableSeats = table.capacity - currentGuests;
    if (totalGuestsToAssign > availableSeats) {
      throw new AppError(
        `Table does not have enough capacity. Available seats: ${availableSeats}, requested: ${totalGuestsToAssign}`,
        400
      );
    }

    // Update all guests to the table
    const updatedGuests = await Promise.all(
      guestIds.map(async (guestId) => {
        const updatedGuest = await Guest.updateById(guestId, { tableId });
        return updatedGuest;
      })
    );

    return updatedGuests;
  }

  /**
   * Assign table to guest
   */
  async assignTable(guestId, tableId, lang = "en") {
    const messages = getMessages(lang);

    // Get guest
    const guest = await Guest.findById(guestId);
    if (!guest) {
      throw new AppError(messages.COMMON.NOT_FOUND, 404);
    }

    // If tableId is null, just unassign
    if (!tableId) {
      const updatedGuest = await Guest.updateById(guestId, { tableId: null });
      return updatedGuest;
    }

    // Validate and assign table
    await this.assignTableToGuest(null, tableId, guest.numberOfGuests, lang);

    const updatedGuest = await Guest.updateById(guestId, { tableId });
    return updatedGuest;
  }

  /**
   * Helper: Validate table capacity for guest assignment
   */
  async assignTableToGuest(guestId, tableId, numberOfGuests = 1, lang = "en") {
    const messages = getMessages(lang);

    // Find the table
    const table = await Table.findById(tableId);
    if (!table) {
      throw new AppError(messages.COMMON.NOT_FOUND, 404);
    }

    // Get current occupancy
    const tableWithOccupancy = await Table.getTableWithOccupancy(tableId);
    const currentGuests = tableWithOccupancy.currentGuests || 0;

    // If updating existing guest, subtract their current count
    let existingGuestCount = 0;
    if (guestId) {
      const existingGuest = await Guest.findById(guestId);
      if (existingGuest && existingGuest.tableId === tableId) {
        existingGuestCount = existingGuest.numberOfGuests;
      }
    }

    // Check capacity
    const effectiveCurrentGuests = currentGuests - existingGuestCount;
    const availableSeats = table.capacity - effectiveCurrentGuests;

    if (numberOfGuests > availableSeats) {
      throw new AppError(
        `Table does not have enough capacity. Available seats: ${availableSeats}, requested: ${numberOfGuests}`,
        400
      );
    }

    return true;
  }

  /**
   * Mark invitation as sent
   */
  async markInvitationSent(id, lang = "en") {
    const messages = getMessages(lang);

    const guest = await Guest.findById(id);
    if (!guest) {
      throw new AppError(messages.COMMON.NOT_FOUND, 404);
    }

    const updatedGuest = await Guest.updateById(id, { invitationSent: true });
    return updatedGuest;
  }

  /**
   * Mark invitation as not sent
   */
  async markInvitationNotSent(id, lang = "en") {
    const messages = getMessages(lang);

    const guest = await Guest.findById(id);
    if (!guest) {
      throw new AppError(messages.COMMON.NOT_FOUND, 404);
    }

    const updatedGuest = await Guest.updateById(id, { invitationSent: false });
    return updatedGuest;
  }

  /**
   * Check in a guest (mark as arrived)
   */
  async checkInGuest(id, lang = "en") {
    const messages = getMessages(lang);

    const guest = await Guest.findById(id);
    if (!guest) {
      throw new AppError(messages.COMMON.NOT_FOUND, 404);
    }

    // Already checked in
    if (guest.isArrived) {
      throw new AppError("Guest is already checked in", 400);
    }

    const updatedGuest = await Guest.updateById(id, {
      isArrived: true,
      arrivedAt: new Date()
    });
    return updatedGuest;
  }

  /**
   * Find all arrived guests
   */
  async findArrived(lang = "en") {
    const guests = await Guest.findArrived();
    return guests;
  }

  /**
   * Find all guests who have been invited but haven't arrived
   */
  async findUnarrived(lang = "en") {
    const guests = await Guest.findUnarrived();
    return guests;
  }

  /**
   * Get statistics
   */
  async getStatistics(lang = "en") {
    const guestStats = await Guest.getStatistics();
    const tableStats = await Table.getStatistics();

    // Calculate total groups (unique guests)
    const totalGuests = await Guest.count();
    const unassigned = await Guest.count({ tableId: null });

    return {
      totalGuests: guestStats.totalGuests,
      totalGroups: totalGuests,
      byCategory: guestStats.byCategory,
      tables: tableStats,
      invitationSent: guestStats.invitationSent,
      unassigned: guestStats.unassigned
    };
  }

  /**
   * Bulk create guests
   */
  async bulkCreate(guestsArray, lang = "en") {
    const messages = getMessages(lang);

    if (!Array.isArray(guestsArray) || guestsArray.length === 0) {
      throw new AppError("Array of guest data is required", 400);
    }

    const createdGuests = [];
    const errors = [];

    for (let i = 0; i < guestsArray.length; i++) {
      try {
        const guestData = guestsArray[i];

        const guest = await this.create(guestData, lang);
        createdGuests.push(guest);
      } catch (error) {
        errors.push({ index: i, error: error.message });
      }
    }

    return {
      guests: createdGuests,
      errors,
      count: createdGuests.length,
      errorCount: errors.length
    };
  }
}

module.exports = new GuestService();

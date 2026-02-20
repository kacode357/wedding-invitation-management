// Table Service - Business Logic Layer
const Table = require("../models/table.model");
const Guest = require("../models/guest.model");
const { AppError } = require("../utils/appError");
const { getMessages } = require("../responses");
const { DEFAULT_TABLE_CAPACITY } = require("../constants/enums/guest.enum");

class TableService {
  /**
   * Validate table data
   */
  validateTableData(data, lang = "en") {
    const errors = [];

    // Validate required fields
    if (!data.tableName || data.tableName.trim() === "") {
      errors.push("Table name is required");
    }

    // Validate capacity if provided
    if (data.capacity !== undefined && data.capacity !== null) {
      if (typeof data.capacity !== "number") {
        errors.push("Capacity must be a number");
      } else if (data.capacity < 1) {
        errors.push("Capacity must be at least 1");
      } else if (data.capacity > 20) {
        errors.push("Capacity cannot exceed 20");
      }
    }

    // Validate tableNumber if provided
    if (data.tableNumber !== undefined && data.tableNumber !== null) {
      if (typeof data.tableNumber !== "number") {
        errors.push("Table number must be a number");
      } else if (data.tableNumber < 1) {
        errors.push("Table number must be at least 1");
      }
    }

    if (errors.length > 0) {
      throw new AppError(errors.join(", "), 400);
    }
  }

  /**
   * Create a new table
   */
  async create(tableData, lang = "en") {
    const messages = getMessages(lang);

    // Validate table data
    this.validateTableData(tableData, lang);

    // Check for duplicate table name
    const existingTable = await Table.findOne({ tableName: tableData.tableName.trim() });
    if (existingTable) {
      throw new AppError("Table name already exists", 400);
    }

    // Auto-generate tableNumber if not provided
    let tableNumber = tableData.tableNumber;
    if (!tableNumber) {
      const existingCount = await Table.count();
      tableNumber = existingCount + 1;
    } else {
      // If tableNumber is provided, check for duplicate
      const existingWithNumber = await Table.findOne({ tableNumber: tableNumber });
      if (existingWithNumber) {
        throw new AppError("Table number already exists", 400);
      }
    }

    // Set defaults
    const data = {
      tableName: tableData.tableName.trim(),
      tableNumber: tableNumber,
      capacity: tableData.capacity || DEFAULT_TABLE_CAPACITY
    };

    const table = await Table.create(data);

    // If guestIds provided, assign guests to the table
    if (tableData.guestIds && Array.isArray(tableData.guestIds) && tableData.guestIds.length > 0) {
      const guestIds = tableData.guestIds;

      // Validate guestIds is an array
      if (!Array.isArray(guestIds) || guestIds.length === 0) {
        throw new AppError("guestIds must be a non-empty array", 400);
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

      // Calculate total guests to assign (use confirmedGuests only)
      const totalGuestsToAssign = guests.reduce((sum, guest) => sum + (guest.confirmedGuests ?? 0), 0);

      // Check capacity
      const tableCapacity = table.capacity;
      if (totalGuestsToAssign > tableCapacity) {
        throw new AppError(
          `Table does not have enough capacity. Table capacity: ${tableCapacity}, confirmed guests: ${totalGuestsToAssign}`,
          400
        );
      }

      // Update all guests to the table
      await Promise.all(
        guestIds.map(async (guestId) => {
          await Guest.updateById(guestId, { tableId: table._id.toString() });
        })
      );
    }

    return await Table.getTableWithOccupancy(table._id.toString());
  }

  /**
   * Get all tables with optional filtering
   */
  async findAll(query = {}, options = {}, lang = "en") {
    const tables = await Table.findWithOccupancy(query, options);
    return tables;
  }

  /**
   * Get table by ID
   */
  async findById(id, lang = "en") {
    const messages = getMessages(lang);

    if (!id) {
      throw new AppError(messages.COMMON.INVALID_ID, 400);
    }

    const table = await Table.getTableWithOccupancy(id);

    if (!table) {
      throw new AppError(messages.COMMON.NOT_FOUND, 404);
    }

    // Get guests assigned to this table
    const guests = await Guest.findByTableId(id);

    return {
      ...table,
      guests: guests
    };
  }

  /**
   * Update table
   */
  async update(id, updateData, lang = "en") {
    const messages = getMessages(lang);

    // Check if table exists
    const existingTable = await Table.findById(id);
    if (!existingTable) {
      throw new AppError(messages.COMMON.NOT_FOUND, 404);
    }

    // Validate data if provided
    if (updateData.tableName) {
      // Check for duplicate name (excluding current table)
      const existingWithName = await Table.findOne({
        tableName: updateData.tableName.trim(),
        _id: { $ne: Table.ObjectId(id) }
      });
      if (existingWithName) {
        throw new AppError("Table name already exists", 400);
      }
    }

    // If tableNumber is provided, check for duplicate
    if (updateData.tableNumber !== undefined && updateData.tableNumber !== null) {
      const existingWithNumber = await Table.findOne({
        tableNumber: updateData.tableNumber,
        _id: { $ne: Table.ObjectId(id) }
      });
      if (existingWithNumber) {
        throw new AppError("Table number already exists", 400);
      }
    }

    // Validate capacity if reducing
    if (updateData.capacity && updateData.capacity < existingTable.capacity) {
      const tableWithGuests = await Table.getTableWithOccupancy(id);
      if (tableWithGuests.currentGuests > updateData.capacity) {
        throw new AppError(
          `Cannot reduce capacity below current guest count (${tableWithGuests.currentGuests})`,
          400
        );
      }
    }

    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // Add tableName trimming
    if (updateData.tableName) {
      updateData.tableName = updateData.tableName.trim();
    }

    const updatedTable = await Table.updateById(id, updateData);
    return await Table.getTableWithOccupancy(id);
  }

  /**
   * Delete table
   */
  async delete(id, lang = "en") {
    const messages = getMessages(lang);

    const table = await Table.findById(id);
    if (!table) {
      throw new AppError(messages.COMMON.NOT_FOUND, 404);
    }

    // Check if table has guests assigned
    const guests = await Guest.findByTableId(id);
    if (guests && guests.length > 0) {
      // Unassign all guests first
      for (const guest of guests) {
        await Guest.updateById(guest._id.toString(), { tableId: null });
      }
    }

    const deleted = await Table.deleteById(id);
    return deleted;
  }

  /**
   * Get guests at a specific table
   */
  async getGuests(id, lang = "en") {
    const messages = getMessages(lang);

    if (!id) {
      throw new AppError(messages.COMMON.INVALID_ID, 400);
    }

    // Check if table exists
    const table = await Table.findById(id);
    if (!table) {
      throw new AppError(messages.COMMON.NOT_FOUND, 404);
    }

    const guests = await Guest.findByTableId(id);
    return guests;
  }

  /**
   * Get table with full details including guests
   */
  async getTableWithGuests(id, lang = "en") {
    const messages = getMessages(lang);

    if (!id) {
      throw new AppError(messages.COMMON.INVALID_ID, 400);
    }

    const table = await Table.getTableWithOccupancy(id);
    if (!table) {
      throw new AppError(messages.COMMON.NOT_FOUND, 404);
    }

    const guests = await Guest.findByTableId(id);

    return {
      ...table,
      guests
    };
  }

  /**
   * Rename table
   */
  async rename(id, newName, lang = "en") {
    const messages = getMessages(lang);

    if (!newName || newName.trim() === "") {
      throw new AppError("Table name is required", 400);
    }

    // Check if table exists
    const table = await Table.findById(id);
    if (!table) {
      throw new AppError(messages.COMMON.NOT_FOUND, 404);
    }

    // Check for duplicate name
    const existingWithName = await Table.findOne({
      tableName: newName.trim(),
      _id: { $ne: Table.ObjectId(id) }
    });
    if (existingWithName) {
      throw new AppError("Table name already exists", 400);
    }

    const updatedTable = await Table.updateById(id, { tableName: newName.trim() });
    return await Table.getTableWithOccupancy(id);
  }

  /**
   * Get statistics
   */
  async getStatistics(lang = "en") {
    const stats = await Table.getStatistics();
    return stats;
  }

  /**
   * Get all tables sorted by number
   */
  async findAllSorted(lang = "en") {
    const tables = await Table.findWithOccupancy(
      {},
      { sort: { tableNumber: 1, createdAt: -1 } }
    );
    return tables;
  }

  /**
   * Check if table has capacity for additional guests
   */
  async hasCapacity(id, additionalGuests = 1, lang = "en") {
    const messages = getMessages(lang);

    const table = await Table.findById(id);
    if (!table) {
      throw new AppError(messages.COMMON.NOT_FOUND, 404);
    }

    return await Table.hasCapacity(id, additionalGuests);
  }

  /**
   * Get available tables (tables with available seats)
   */
  async findAvailableTables(lang = "en") {
    const tables = await Table.findWithOccupancy();

    const availableTables = tables.filter(table => {
      return table.availableSeats > 0;
    });

    return availableTables;
  }

  /**
   * Bulk create tables
   */
  async bulkCreate(tableDataArray, lang = "en") {
    const messages = getMessages(lang);

    if (!Array.isArray(tableDataArray) || tableDataArray.length === 0) {
      throw new AppError("Array of table data is required", 400);
    }

    const createdTables = [];
    const errors = [];

    for (let i = 0; i < tableDataArray.length; i++) {
      try {
        const tableData = tableDataArray[i];
        // Auto-assign table number if not provided
        if (!tableData.tableNumber) {
          const existingCount = await Table.count();
          tableData.tableNumber = existingCount + 1;
        }
        const table = await this.create(tableData, lang);
        createdTables.push(table);
      } catch (error) {
        errors.push({ index: i, error: error.message });
      }
    }

    return {
      created: createdTables,
      errors,
      totalCreated: createdTables.length,
      totalErrors: errors.length
    };
  }

  /**
   * Get available guests (unassigned guests that can be added to tables)
   */
  async getAvailableGuests(lang = "en") {
    const guests = await Guest.findUnassigned();
    return guests;
  }

  /**
   * Remove guests from a table
   */
  async removeGuests(tableId, guestIds, lang = "en") {
    const messages = getMessages(lang);

    // Check if table exists
    const table = await Table.findById(tableId);
    if (!table) {
      throw new AppError(messages.COMMON.NOT_FOUND, 404);
    }

    // Validate and remove each guest
    for (const guestId of guestIds) {
      const guest = await Guest.findById(guestId);
      if (!guest) {
        throw new AppError(`Guest not found: ${guestId}`, 404);
      }

      // Check if guest is actually assigned to this table
      if (guest.tableId && guest.tableId.toString() !== tableId) {
        throw new AppError(`Guest ${guestId} is not assigned to this table`, 400);
      }

      // Remove guest from table
      await Guest.updateById(guestId, { tableId: null });
    }

    return await Table.getTableWithOccupancy(tableId);
  }

  /**
   * Swap guests between two tables
   */
  async swapGuests(guestId1, guestId2, lang = "en") {
    const messages = getMessages(lang);

    // Find both guests
    const guest1 = await Guest.findById(guestId1);
    if (!guest1) {
      throw new AppError(`Guest not found: ${guestId1}`, 404);
    }

    const guest2 = await Guest.findById(guestId2);
    if (!guest2) {
      throw new AppError(`Guest not found: ${guestId2}`, 404);
    }

    // Get their current table IDs
    const tableId1 = guest1.tableId ? guest1.tableId.toString() : null;
    const tableId2 = guest2.tableId ? guest2.tableId.toString() : null;

    // Check if both guests are on the same table
    if (tableId1 === tableId2 && tableId1 !== null) {
      throw new AppError("Both guests are on the same table. Cannot swap.", 400);
    }

    // If one guest has no table, just move the other guest to that table
    if (!tableId1 && tableId2) {
      // Guest 1 is unassigned, Guest 2 is on a table - move guest 1 to guest 2's table
      await Guest.updateById(guestId1, { tableId: tableId2 });
      const updatedGuest1 = await Guest.findById(guestId1);
      const table2 = await Table.getTableWithOccupancy(tableId2);
      return {
        guest1: updatedGuest1,
        table1: null,
        guest2: guest2,
        table2: table2
      };
    }

    if (tableId1 && !tableId2) {
      // Guest 1 is on a table, Guest 2 is unassigned - move guest 2 to guest 1's table
      await Guest.updateById(guestId2, { tableId: tableId1 });
      const table1 = await Table.getTableWithOccupancy(tableId1);
      return {
        guest1: guest1,
        table1: table1,
        guest2: await Guest.findById(guestId2),
        table2: null
      };
    }

    // Both guests are on different tables - swap their table assignments
    await Guest.updateById(guestId1, { tableId: tableId2 });
    await Guest.updateById(guestId2, { tableId: tableId1 });

    // Get updated table info
    const updatedGuest1 = await Guest.findById(guestId1);
    const updatedGuest2 = await Guest.findById(guestId2);

    const table1 = tableId1 ? await Table.getTableWithOccupancy(tableId1) : null;
    const table2 = tableId2 ? await Table.getTableWithOccupancy(tableId2) : null;

    return {
      guest1: updatedGuest1,
      table1: table1,
      guest2: updatedGuest2,
      table2: table2
    };
  }
}

module.exports = new TableService();

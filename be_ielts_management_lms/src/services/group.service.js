// Group Service - Business Logic Layer
const Group = require("../models/group.model");
const { AppError } = require("../utils/appError");
const { getMessages } = require("../responses");

class GroupService {
    /**
     * Validate unique name (async)
     */
    async validateUniqueName(name, excludeId = null) {
        const query = { name: name.trim() };
        if (excludeId) {
            query._id = { $ne: excludeId };
        }
        const existing = await Group.findOne(query);
        return !existing;
    }

    /**
     * Validate unique priorityLevel (async)
     */
    async validateUniquePriorityLevel(priorityLevel, excludeId = null) {
        const query = { priorityLevel: Number(priorityLevel) };
        if (excludeId) {
            query._id = { $ne: excludeId };
        }
        const existing = await Group.findOne(query);
        return !existing;
    }

    /**
     * Create a new group
     */
    async create(groupData, lang = "en") {
        const errors = [];

        if (!groupData.name || groupData.name.trim() === "") {
            errors.push("Group name is required");
        } else {
            const isUnique = await this.validateUniqueName(groupData.name);
            if (!isUnique) {
                errors.push("Group name already exists");
            }
        }

        if (groupData.priorityLevel !== undefined && groupData.priorityLevel !== null) {
            const level = Number(groupData.priorityLevel);
            if (isNaN(level) || !Number.isInteger(level) || level < 0) {
                errors.push("Priority level must be a non-negative integer");
            } else {
                const isPriorityUnique = await this.validateUniquePriorityLevel(level);
                if (!isPriorityUnique) {
                    errors.push(`Priority level ${level} is already used by another group`);
                }
            }
        }

        if (errors.length > 0) {
            throw new AppError(errors.join(", "), 400);
        }

        const data = {
            name: groupData.name.trim(),
            priorityLevel: groupData.priorityLevel !== undefined ? Number(groupData.priorityLevel) : 0,
        };

        return await Group.create(data);
    }

    /**
     * Get all groups
     */
    async findAll(query = {}, options = {}, lang = "en") {
        return await Group.find(query, options);
    }

    /**
     * Get group by ID
     */
    async findById(id, lang = "en") {
        const messages = getMessages(lang);

        if (!id) {
            throw new AppError(messages.COMMON.INVALID_ID, 400);
        }

        const group = await Group.findById(id);

        if (!group) {
            throw new AppError(messages.COMMON.NOT_FOUND, 404);
        }

        return group;
    }

    /**
     * Update group
     */
    async update(id, updateData, lang = "en") {
        const messages = getMessages(lang);

        const existing = await Group.findById(id);
        if (!existing) {
            throw new AppError(messages.COMMON.NOT_FOUND, 404);
        }

        if (updateData.name && updateData.name.trim() !== "") {
            const isUnique = await this.validateUniqueName(updateData.name, id);
            if (!isUnique) {
                throw new AppError("Group name already exists", 400);
            }
            updateData.name = updateData.name.trim();
        }

        if (updateData.priorityLevel !== undefined && updateData.priorityLevel !== null) {
            const level = Number(updateData.priorityLevel);
            if (isNaN(level) || !Number.isInteger(level) || level < 0) {
                throw new AppError("Priority level must be a non-negative integer", 400);
            }
            const isPriorityUnique = await this.validateUniquePriorityLevel(level, id);
            if (!isPriorityUnique) {
                throw new AppError(`Priority level ${level} is already used by another group`, 400);
            }
            updateData.priorityLevel = level;
        }

        delete updateData._id;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        return await Group.updateById(id, updateData);
    }

    /**
     * Delete group
     */
    async delete(id, lang = "en") {
        const messages = getMessages(lang);

        const group = await Group.findById(id);
        if (!group) {
            throw new AppError(messages.COMMON.NOT_FOUND, 404);
        }

        return await Group.deleteById(id);
    }
}

module.exports = new GroupService();

// Seed script to create default notes
const Note = require("../models/note.model");

const seedNotes = async () => {
  try {
    const collection = await Note.find();
    
    if (collection.length === 0) {
      const defaultNotes = [
        {
          name: "Definitely (Confirmed) - 100%",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Highly likely to attend - over 50%",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Highly likely not to attend - under 50%",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const { getCollection } = require("../db/mongoose");
      const collectionObj = await getCollection("notes");
      
      await collectionObj.insertMany(defaultNotes);
      console.log("✅ Default notes seeded successfully!");
      console.log("  - Note 1: Definitely (Confirmed) - 100%");
      console.log("  - Note 2: Highly likely to attend - over 50%");
      console.log("  - Note 3: Highly likely not to attend - under 50%");
    } else {
      console.log("ℹ️  Notes already exist, skipping seed.");
    }
  } catch (error) {
    console.error("❌ Error seeding notes:", error.message);
  }
};

module.exports = { seedNotes };

// Import required modules
const mongoose = require("mongoose");
const initData = require("./data.js"); // Sample data to populate the DB
const Listing = require("../models/listing.js"); // Mongoose model for listings

// MongoDB connection string
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// Connect to MongoDB
main()
  .then(() => {
    console.log("connected to DB"); // Log success message
  })
  .catch((err) => {
    console.log(err); // Log connection error
  });

// Function to handle MongoDB connection
async function main() {
  await mongoose.connect(MONGO_URL);
}

// Function to initialize the database
const initDB = async () => {
await Listing.deleteMany({}); // Clear existing listings
// Properly reassign mapped data with owner field
initData.data = initData.data.map((obj) => ({
  ...obj,
  owner: "67f9fdce33ad5224b46e88cd", // Add your desired owner ObjectId here
}));
  await Listing.insertMany(initData.data); // Insert sample data
  console.log("data was initialized"); // Log completion
};

// Call the initDB function to run it
initDB();

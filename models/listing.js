// Import mongoose and extract Schema constructor
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define schema for Listing documents
const listingSchema = new Schema({
  title: {
    type: String,
    required: true, // Title is mandatory
  },
  description: String, // Optional description field
  image: {
    type: String,
    default: // Default image if none is provided
      "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    set: (v) =>
      v === "" // If user submits an empty string, use the default image
        ? "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
        : v,
  },
  price: Number, // Price of the listing
  location: String, // Physical location (e.g., city or area)
  country: String, // Country name
});

// Create the model from the schema
const Listing = mongoose.model("Listing", listingSchema);

// Export the model for use in other files
module.exports = Listing;

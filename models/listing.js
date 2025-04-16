// Import mongoose and extract Schema constructor
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review=require("./review.js")

// Define schema for Listing documents
const listingSchema = new Schema({
  title: {
    type: String,
    required: true, // Title is mandatory
  },
  description: String, // Optional description field
  image: {
   url:String,
   filename:String,
  },
  price: Number, // Price of the listing
  location: String, // Physical location (e.g., city or area)
  country: String, // Country name
  reviews:[{
    type:Schema.Types.ObjectId,
    ref:"Review",
  }
],
owner:{
  type:Schema.Types.ObjectId,
  ref:"User",
},
});
listingSchema.post("findOneAndDelete", async(listing)=>{
  if(listing) {
      await Review.deleteMany({_id:{$in: listing.reviews}})
  }
})
// Create the model from the schema
const Listing = mongoose.model("Listing", listingSchema);

// Export the model for use in other files
module.exports = Listing;

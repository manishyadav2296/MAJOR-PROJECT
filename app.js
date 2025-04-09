

// Import required modules
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");
const { error } = require("console");

// MongoDB connection URL
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// Connect to MongoDB
main().then(() => {
    console.log("connected to DB")
}).catch(err => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

// Set view engine and views path
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data (form submissions)
app.use(methodOverride("_method")); // Override methods (like PUT & DELETE)
app.engine("ejs", ejsMate); // Use ejs-mate for layout support
app.use(express.static(path.join(__dirname, "/public"))); // Serve static assets from public/

// Root route
app.get("/", (req, res) => {
    res.send("Hi, i'm root")
});

// Middleware to validate listing input using Joi schema
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg); // Throw formatted error
    } else {
        next(); // Proceed if valid
    }
};

// Index route – show all listings
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

// New route – render form for new listing
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

// Show route – show individual listing
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
}));

// Create route – add listing to DB
app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

// Edit route – render edit form for a listing
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

// Update route – update existing listing
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect("/listings");
}));

// Delete route – delete a listing
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));
// app.get("/testListing", async(req,res)=>{
//     let sampleListing = new Listing({
//         title:"My New Villa",
//         description:"By the beach",
//         price:1200,
//         location:"Calanguta,Goa",
//         country:"India"
//     });
//     await sampleListing.save(),
//     console.log("sample was save")
//     res.send("successful testing")

// })
// app.all("*",(req,res,next)=>{
//   next(new ExpressError(404,"Page Not Found"))
// })

// Error-handling middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message }); // Render error template
    // Optionally log or respond differently in development vs. production
});

// Start server on port 8080
app.listen(8080, () => {
    console.log("server is listening");
});

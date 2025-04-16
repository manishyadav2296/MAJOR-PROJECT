// Import required modules
if(process.env.NODE_ENV !="production"){
  require('dotenv').config();  
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const session = require("express-session");
const MongoStore=require("connect-mongo")
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// Import route handlers
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


 const dbUrl=process.env.ATLASDB_URL;
// Connect to MongoDB
main().then(() => {
    console.log("connected to DB")
}).catch(err => {
    console.log(err);
});

// Async function to connect to MongoDB
async function main() {
    await mongoose.connect(dbUrl);
}

// Set view engine and views path
app.set("view engine", "ejs"); // Use EJS as templating engine
app.set("views", path.join(__dirname, "views")); // Set views directory

// Middleware
app.use(express.urlencoded({ extended: true })); // Parse incoming form data
app.use(methodOverride("_method")); // Support HTTP method override
app.engine("ejs", ejsMate); // Use EJS Mate for layouts
app.use(express.static(path.join(__dirname, "/public"))); // Serve static files


const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});
store.on("error",()=>{
    console.log("ERROR IN MONGO SESSION STORE", err);
})
// Session configuration
const sessionOptions = {
    store,
    secret: process.env.SECRET, // Secret for signing the session ID cookie
    resave: false, // Don't save session if unmodified
    saveUninitialized: true, // Save uninitialized session
    cookie: {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Cookie expiration set to 1 week
        maxAge: 7 * 24 * 60 * 60 * 1000, // Max age for cookie
        httpOnly: true, // Prevents client-side JS from accessing the cookie
    }
};

app.use(session(sessionOptions)); // Use session middleware
app.use(flash()); // Use flash messages

// Root route
// app.get("/", (req, res) => {
//     res.send("Hi, i'm root") // Simple root response
// });

// Initialize Passport and restore authentication state
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // Use local strategy with Passport

passport.serializeUser(User.serializeUser()); // Serialize user to session
passport.deserializeUser(User.deserializeUser()); // Deserialize user from session

// Middleware to pass flash messages and current user to all views
app.use((req, res, next) => {
    res.locals.currentUser = req.user; // Current logged-in user
    res.locals.success = req.flash("success"); // Flash success messages
    res.locals.error = req.flash("error"); // Flash error messages
    res.locals.currUser=req.user;
    next();
});

// Demo route to create a user (commented out)
// app.get("/demouser", async(req,res)=>{
//     let fakeUser= new User({
//         email: "student2@gmail.com",
//         username:"delta-student-2"
//     })
//   let registerdUser = await User.register(fakeUser,"helloworld")
//   res.send(registerdUser);
// })

// Mount routers
app.use("/listings", listingRouter); // Listings routes
app.use("/listings/:id/reviews", reviewRouter); // Review routes
app.use("/", userRouter); // User authentication routes

// Error-handling middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message }); // Render custom error page
});

// Start the server on port 8080
app.listen(8080, () => {
    console.log("server is listening");
});

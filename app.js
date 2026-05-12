if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// ---------------- PACKAGES ----------------

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");

const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");

const session = require("express-session");
const MongoStore = require("connect-mongo").default || require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const ExpressError = require("./utils/ExpressError.js");
const User = require("./models/user.js");

// ---------------- IMPORTANT FIX ----------------
// Helps cookies work properly in dev environments
app.set("trust proxy", 1);

// ---------------- DB ----------------

const db_url = process.env.ATLASDB_URL;

mongoose.connect(db_url)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// ---------------- VIEW ENGINE ----------------

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// ---------------- MIDDLEWARE ----------------

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ---------------- SESSION STORE ----------------

const store = MongoStore.create({
    mongoUrl: db_url,
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("SESSION STORE ERROR:", err);
});

// ---------------- SESSION CONFIG ----------------

app.use(session({
    store,
    secret: process.env.SECRET || "mysupersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // IMPORTANT for localhost
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
}));

app.use(flash());

// ---------------- PASSPORT ----------------

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ---------------- GLOBAL VARIABLES ----------------

app.use((req, res, next) => {

    console.log("CURRENT USER:", req.user);

    res.locals.currUser = req.user || null;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");

    next();
});

// ---------------- ROUTES ----------------

const userRouter = require("./routes/users.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");

app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use("/", userRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);

// ---------------- ERROR HANDLING ----------------

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    console.log("ERROR:", err);

    let { statusCode = 500, message = "Something went wrong" } = err;

    res.status(statusCode).render("listings/error.ejs", {
        message,
        statusCode
    });
});

// ---------------- SERVER ----------------

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
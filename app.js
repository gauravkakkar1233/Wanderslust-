if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");

const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");

const ExpressError = require("./utils/ExpressError.js");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/user.js");

// ---------------- DATABASE CONNECTION ----------------

const db_url = process.env.ATLASDB_URL;

if (!db_url) {
    throw new Error("ATLASDB_URL is missing in environment variables");
}

async function main() {
    await mongoose.connect(db_url);
}

main()
    .then(() => {
        console.log("MongoDB Connected Successfully");
    })
    .catch((err) => {
        console.log("Database Error:", err);
    });

// ---------------- APP CONFIG ----------------

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public")));

// ---------------- SESSION STORE ----------------

const store = MongoStore.create({
    mongoUrl: db_url,

    crypto: {
        secret: process.env.SECRET || "mysupersecret",
    },

    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("SESSION STORE ERROR:", err);
});

// ---------------- SESSION CONFIG ----------------

const sessionOptions = {
    store,

    secret: process.env.SECRET || "mysupersecret",

    resave: false,

    saveUninitialized: false,

    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,

        maxAge: 7 * 24 * 60 * 60 * 1000,

        httpOnly: true,
    },
};

app.use(session(sessionOptions));

app.use(flash());

// ---------------- PASSPORT CONFIG ----------------

app.use(passport.initialize());

app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());

// ---------------- GLOBAL VARIABLES ----------------

app.use((req, res, next) => {

    res.locals.success = req.flash("success");

    res.locals.error = req.flash("error");

    res.locals.currUser = req.user;

    next();
});

// ---------------- ROUTES ----------------

const listingRouter = require("./routes/listing.js");

const reviewRouter = require("./routes/review.js");

const userRouter = require("./routes/users.js");

app.use("/", userRouter);

app.use("/listings", listingRouter);

app.use("/listings/:id/reviews", reviewRouter);

// ---------------- FAVICON FIX ----------------

app.get("/favicon.ico", (req, res) => {
    res.status(204).end();
});

// ---------------- HOME ROUTE ----------------

app.get("/", (req, res) => {
    res.redirect("/listings");
});

// ---------------- 404 HANDLER ----------------

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// ---------------- ERROR HANDLER ----------------

app.use((err, req, res, next) => {

    console.log(err);

    let { statusCode = 500 } = err;

    let { message = "Something Went Wrong" } = err;

    res.status(statusCode).render("listings/error.ejs", {
        err,
    });
});

// ---------------- SERVER ----------------

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server Listening on Port ${port}`);
});
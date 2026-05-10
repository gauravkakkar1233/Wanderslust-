if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsmate = require("ejs-mate");
const methodoverride = require("method-override");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const User = require("./models/user.js");

// ---------------- DB CONNECTION ----------------
const db_url = process.env.ATLASDB_URL;

if (!db_url) {
    throw new Error("ATLASDB_URL is not defined in .env file");
}

mongoose.connect(db_url)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.log("DB ERROR:", err));

// ---------------- APP CONFIG ----------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsmate);

app.use(express.urlencoded({ extended: true }));
app.use(methodoverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ---------------- SESSION STORE ----------------
const store = MongoStore.create({
    mongoUrl: db_url,
    touchAfter: 24 * 3600,
    crypto: {
        secret: process.env.SECRET,
    },
});

store.on("error", (err) => {
    console.log("SESSION STORE ERROR:", err);
});

// ---------------- SESSION OPTIONS ----------------
const sessionoptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.use(session(sessionoptions));
app.use(flash());

// ---------------- PASSPORT ----------------
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ---------------- LOCALS MIDDLEWARE ----------------
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// ---------------- ROUTES ----------------
const listingrouter = require("./routes/listing.js");
const reviewrouter = require("./routes/review.js");
const userrouter = require("./routes/users.js");

app.use("/", userrouter);
app.use("/listings", listingrouter);
app.use("/listings/:id/reviews", reviewrouter);

// favicon fix
app.get("/favicon.ico", (req, res) => res.status(204).end());

// ---------------- 404 HANDLER ----------------
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// ---------------- ERROR HANDLER ----------------
app.use((err, req, res, next) => {
    console.log("ERROR:", err);

    let { statusCode = 500, message = "Something went wrong!" } = err;

    res.status(statusCode).render("listings/error.ejs", { err });
});

// ---------------- SERVER ----------------
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});
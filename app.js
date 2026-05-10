if(process.env.NODE_ENV!="production"){
require('dotenv').config();
}
// console.log(`Hello ${process.env.HELLO}`)

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsmate = require("ejs-mate");
const methodoverride = require("method-override");
const ExpressError = require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore = require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");



const LocalStrategy = require("passport-local").Strategy;
const User=require("./models/user.js");

// const { resolveAny } = require("dns");

const db_url=process.env.ATLASDB_URL;
console.log(db_url);

async function main() {
    await mongoose.connect(db_url);
}
main()
    .then(() => {
        console.log("connection sucssesfull");
    })
    .catch((err) => {
        console.log(err);
    });
let port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodoverride("_method"));
app.engine('ejs', ejsmate);
app.use(express.static(path.join(__dirname, "/public")));


const store = MongoStore.create({
    mongoUrl: db_url,
    touchAfter: 24 * 3600,
    // crypto: {
    //     secret: process.env.SECRET,
    // },
});

store.on("error", function (err) {
    console.log("SESSION STORE ERROR", err);
});
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

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
 

const listingrouter = require("./routes/listing.js");
const reviewrouter = require("./routes/review.js");
const userrouter = require("./routes/users.js");

app.use((req,res,next)=>{
    res.locals.message=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    // console.log(res.locals.message)
    next();
});


app.get("/demouser",async(req,res)=>{
    let fakeuser=new User({
        email:"delta@",
        username:"Delta"
    });

    let registeredUser = await User.register(fakeuser, "helloworld");

    console.log(registeredUser);
    res.send(registeredUser);
});

// HOME ROUTE
// app.get("/", (req, res) => {
//     res.redirect("/listings");
// });

// USER ROUTES
app.use("/",userrouter);

// REVIEWS ROUTE 
app.use("/listings/:id/reviews", reviewrouter);
// LISTING ROUTES
app.use("/listings", listingrouter);
app.get("/favicon.ico", (req, res) => res.status(204));
app.use((req, res, next) => {
    console.log("404 Route:", req.originalUrl);
    next(new ExpressError(404, "Page Not Found!"));
});
app.use((err, req, res, next) => {

    console.log("ERROR:", err);

    let { statusCode = 500, message = "Something went wrong!" } = err;

    if (res.headersSent) {
        return next(err);
    }

    res.status(statusCode).render("listings/error.ejs", { err });
});




app.listen(port, () => {
    console.log(`App is listening to ${port}`);
});
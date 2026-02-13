const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsmate = require("ejs-mate");
const methodoverride = require("method-override");
const ExpressError = require("./utils/ExpressError.js");
const session=require("express-session");
const flash=require("connect-flash");


const { resolveAny } = require("dns");

async function main() {
    mongoose.connect("mongodb://127.0.0.1/wanderlust");
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

const sessionoptions={
    secret:"mysupersecret",
    reasave:false,
    saveUnitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60+1000,
        httpOnly:true
    }
};
app.use(session(sessionoptions));
app.use(flash());

const listing = require("./routes/listing.js");
const reviews = require("./routes/review.js");
// HOME ROUTE
app.get("/", (req, res) => {
    console.log("Home route is working");
});


app.use((req,res,next)=>{
    res.locals.message=req.flash("success");
    res.locals.error=req.flash("faliure");
    
    console.log(res.locals.message)
    next();
})
// LISTING ROUTES
app.use("/listings", listing);

// REVIEWS ROUTE 
app.use("/listings/:id/reviews", reviews);
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});
app.use((err, req, res, next) => {
    let { status = 500, message = "something went wrong " } = err;
    res.status(status).render("listings/error.ejs", { err });
    // res.status(status).send(message);
    // res.send("something went wrong");
});
app.listen(port, () => {
    console.log(`App is listening to ${port}`);
});
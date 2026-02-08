const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsmate = require("ejs-mate");
const methodoverride = require("method-override");
const ExpressError = require("./utils/ExpressError.js");

const listing = require("./routes/listing.js");
const reviews = require("./routes/review.js");

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

app.get("/", (req, res) => {
    console.log("Home route is working");
});


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
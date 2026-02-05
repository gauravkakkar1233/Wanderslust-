const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const wrapasync = require("./utils/wrapasync.js");
const ejsmate = require("ejs-mate");
const methodoverride = require("method-override");
const Listing = require("./models/listing.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingschema } = require("./schema.js");
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

// app.get("/testListing",async (req,res)=>
// {
//     let sampleListing=new Listing({
//         title:"My New Villa",
//         description:"By the Beach",
//         price:1200,
//         location:"Calangute,Goa",
//         country:"India"
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("sample saved");
// });
// INDEX ROUTE
app.get("/listings", wrapasync(async (req, res) => {
    const alllistings = await Listing.find({});
    res.render("listings/index.ejs", { alllistings });
}));
const validateschema = ((req, res, next) => {
    let {error} = listingschema.validate(req.body);
    // console.log(result);
    if (error) {
        let errmsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(404, errmsg);
    }
    else
    {
        next();
    }
})
// CREATE NEW ROUTE (FIXED)
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
    // res.send("NEW ROUTE IS WORKING");
});
//new route 
app.post("/listings",validateschema, wrapasync(async (req, res, next) => {
    // let {title,description,image,price,location,country}=req.body;
    // console.log({title,description,image,price,location,country}); 

    let listing = req.body.listing;

    console.log(listing);
    let newlisting1 = new Listing(listing);
    await newlisting1.save();
    res.redirect("/listings");
    // res.send("new route is working");
}));
// SHOW ROUTE (keep after /new)
app.get("/listings/:id", wrapasync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
}));
// EDIT ROUTE
app.get("/listings/:id/edit", wrapasync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));
// UPDATE ROUTE 
app.put("/listings/:id",validateschema, wrapasync(async (req, res) => {
    let { id } = req.params;
    let listing = req.body.listing;
    // let listing = req.body.listing;
    // console.log(listing);
    let updatelisting = await Listing.findByIdAndUpdate(id, listing, { new: true });
    console.log(updatelisting);
    res.redirect(`/Listings/${id}`);
    // res.send("the edit route is workin1g");
}));
app.delete("/listings/:id", wrapasync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndDelete(id);
    console.log(listing);
    res.redirect("/listings");
}));

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
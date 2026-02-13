const express=require("express");
const router=express.Router();
const Listing = require("../models/listing.js");
const wrapasync = require("../utils/wrapasync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingschema } = require("../schema.js"); //FOR USING JOI 

// FOR USING JOI TO DO SERVER SIDE SCRIPTING(LISTING SCHEMA)
const validateschema = ((req, res, next) => {
    let { error } = listingschema.validate(req.body);
    // console.log(result);
    if (error) {
        let errmsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errmsg);

    }
    else {
        next();
    }
});

// INDEX ROUTE
router.get("/", wrapasync(async (req, res) => {
    const alllistings = await Listing.find({});
    res.render("listings/index.ejs", { alllistings });
}));
// CREATE NEW ROUTE (FIXED)
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
    // res.send("NEW ROUTE IS WORKING");
});
//new route 
router.post("/", validateschema, wrapasync(async (req, res, next) => {
    // let {title,description,image,price,location,country}=req.body;
    // console.log({title,description,image,price,location,country}); 

    let listing = req.body.listing;

    console.log(listing);
    let newlisting1 = new Listing(listing);
    await newlisting1.save();
    req.flash("success","New Listing Created!!");
    res.redirect("/listings");
    // res.send("new route is working");
}));
// SHOW ROUTE (keep after /new)
router.get("/:id", wrapasync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing)
    {
        req.flash("faliure","Listing is not Valid!!!!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}));
// EDIT ROUTE
router.get("/:id/edit", wrapasync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing)
    {
        req.flash("faliure","Listing is not Valid!!!!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}));
// UPDATE ROUTE 
router.put("/:id", validateschema, wrapasync(async (req, res) => {
    let { id } = req.params;
    let listing = req.body.listing;
    // let listing = req.body.listing;
    // console.log(listing);
    let updatelisting = await Listing.findByIdAndUpdate(id, listing, { new: true });
    console.log(updatelisting);
    req.flash("success","Listing Updated!!");
    res.redirect(`/listings/${id}`);
    // res.send("the edit route is workin1g");
}));
router.delete("/:id", wrapasync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndDelete(id);
    console.log(listing);
    req.flash("success","Listing Deleted!!");
    res.redirect("/listings");
}));


module.exports=router;
const express=require("express");
const router=express.Router({mergeParams:true});
const wrapasync = require("../utils/wrapasync.js");
const Listing = require("../models/listing.js"); 
const ExpressError = require("../utils/ExpressError.js");
const { reviewschema } = require('../schema.js');
const Review = require('../models/review.js');


const validatereview=(req,res,next)=>{
    let {error}=reviewschema.validate(req.body);
    if(error)
    {
        let errmsg = error.details.map(el => el.message).join(",");

        throw new ExpressError(400,errmsg);
    }
    else{
        next();
    }
};

// REVIEWS ROUTE 
//POST ROUTES TO ADD A NEW REVIEW
router.post("/",validatereview,wrapasync(async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    let newreview = new Review(req.body.review);//After the show .ejs form is submitted
    listing.reviews.push(newreview);
    await newreview.save();
    await listing.save(); //ASYNC SAVE FUNCTION 
    // res.send("new review saved ");
    res.redirect(`/listings/${id}`);

}));
// DELETING REVIEW
router.delete("/:reviewId",wrapasync (async(req,res,next)=>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}}); 
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`)
}));
module.exports=router;
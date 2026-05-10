const express=require("express");
const router=express.Router({mergeParams:true});
const wrapasync = require("../utils/wrapasync.js");
const Listing = require("../models/listing.js"); 

const Review = require('../models/review.js');
const {validatereview,islogedin,isReviewAuthor}=require("../middleware.js");
const reviewController=require("../controllers/reviews.js");

// REVIEWS ROUTE 
//POST ROUTES TO ADD A NEW REVIEW
router.post("/",islogedin,validatereview,wrapasync(reviewController.createReview));
// DELETING REVIEW
router.delete("/:reviewId",islogedin ,isReviewAuthor,wrapasync (reviewController.destroyReview));
module.exports=router;
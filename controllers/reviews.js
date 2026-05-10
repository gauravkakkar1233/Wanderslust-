const Review=require("../models/review");
const Listing=require("../models/listing")

module.exports.createReview=async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    let newreview = new Review(req.body.review);//After the show .ejs form is submitted
    newreview.author=req.user._id;
    console.log(newreview);
    listing.reviews.push(newreview);
    await newreview.save();
    await listing.save(); //ASYNC SAVE FUNCTION 
    // res.send("new review saved ");
    req.flash("success","New Review Created!!");
    res.redirect(`/listings/${id}`);

};

module.exports.destroyReview=async(req,res,next)=>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}}); 
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted!!");
    res.redirect(`/listings/${id}`)


}
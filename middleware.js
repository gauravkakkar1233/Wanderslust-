const Listing=require("./models/listing"); 
const Review=require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingschema ,reviewschema} = require("./schema.js"); //FOR USING JOI 

module.exports.islogedin=(req,res,next)=>{
    if(!req.isAuthenticated())
    {
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","You must be logged in to add new Listing");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl)
    {
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}
module.exports.isowner=async (req,res,next)=>{
    let {id}=req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id))
    {
        req.flash("error","you are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
}
module.exports.validateschema = ((req, res, next) => {
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

module.exports.validatereview=(req,res,next)=>{
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
module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);

    if (!review.author._id.equals(res.locals.currUser._id)) {
        req.flash("error", "you are not the author of this review");
        return res.redirect(`/listings/${id}`);
    } 

    next();
};
const Listing = require("./models/listing");
const Review = require("./models/review.js");

const ExpressError = require("./utils/ExpressError.js");

const { listingschema, reviewschema } = require("./schema.js");

// LOGIN CHECK
module.exports.islogedin = (req, res, next) => {

    if (!req.isAuthenticated()) {

        req.session.redirectUrl = req.originalUrl;

        req.flash(
            "error",
            "You must be logged in first!"
        );

        return res.redirect("/login");
    }

    next();
};

// SAVE REDIRECT URL
module.exports.saveRedirectUrl = (req, res, next) => {

    if (req.session.redirectUrl) {

        res.locals.redirectUrl =
            req.session.redirectUrl;

        // IMPORTANT FIX
        delete req.session.redirectUrl;
    }

    next();
};

// OWNER CHECK
module.exports.isowner = async (req, res, next) => {

    let { id } = req.params;

    let listing = await Listing.findById(id);

    // NULL CHECK
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    // OWNER CHECK
    if (
        !listing.owner ||
        !listing.owner._id.equals(res.locals.currUser._id)
    ) {

        req.flash(
            "error",
            "You are not the owner of this listing"
        );

        return res.redirect(`/listings/${id}`);
    }

    next();
};

// LISTING VALIDATION
module.exports.validateschema = (req, res, next) => {

    let { error } = listingschema.validate(req.body);

    if (error) {

        let errmsg = error.details
            .map((el) => el.message)
            .join(",");

        throw new ExpressError(400, errmsg);
    }

    next();
};

// REVIEW VALIDATION
module.exports.validatereview = (req, res, next) => {

    let { error } = reviewschema.validate(req.body);

    if (error) {

        let errmsg = error.details
            .map((el) => el.message)
            .join(",");

        throw new ExpressError(400, errmsg);
    }

    next();
};

// REVIEW AUTHOR CHECK
module.exports.isReviewAuthor = async (
    req,
    res,
    next
) => {

    let { id, reviewId } = req.params;

    let review = await Review.findById(reviewId);

    // NULL CHECK
    if (!review) {
        req.flash("error", "Review not found!");
        return res.redirect(`/listings/${id}`);
    }

    // AUTHOR CHECK
    if (
        !review.author ||
        !review.author._id.equals(
            res.locals.currUser._id
        )
    ) {

        req.flash(
            "error",
            "You are not the author of this review"
        );

        return res.redirect(`/listings/${id}`);
    }

    next();
};
const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapasync = require("../utils/wrapasync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingschema } = require("../schema.js"); //FOR USING JOI 
const { islogedin,isowner,validateschema} = require("../middleware.js");
const multer  = require('multer');
const { storage } = require("../cloudConfig.js");

const upload = multer({ storage });

// controller
const listingController = require("../controllers/listing.js");

router.route("/")
.get(wrapasync(listingController.index)) //index route
.post(
    islogedin,
    upload.single("listing[image]"),
    validateschema,
    wrapasync(listingController.createListing)
); // CREATE NEW LISTING ROUTE

// CREATE NEW ROUTE (FIXED)
router.get(
    "/new",
    islogedin,
    listingController.renderNewForm
); 

router.route("/:id")
.get(wrapasync(listingController.showListing)) //SHOW ROUTE
.put(
    islogedin,
    isowner,
    upload.single("listing[image]"),
    validateschema,
    wrapasync(listingController.updateListing)
) // UPDATE ROUTE
.delete(
    islogedin,
    isowner,
    wrapasync(listingController.destroyListing)
);

// SHOW ROUTE (keep after /new)

// EDIT ROUTE
router.get(
    "/:id/edit",
    islogedin,
    isowner,
    wrapasync(listingController.renderEditForm)
);

// UPDATE ROUTE 

module.exports = router;
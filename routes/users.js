const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapasync = require("../utils/wrapasync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController=require("../controllers/users.js");
const user = require("../models/user.js");


// SIGNUP REQUEST
router
.route("/signup")
.get(userController.renderSignupForm)//signup form
.post(wrapasync(userController.signup));//Signup logic


// LOGIN REQUEST
router
.route("/login")
.get(userController.renderLoginForm)
.post(saveRedirectUrl,
    passport.authenticate("local",
    {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    wrapasync(userController.login));

// LOGOUT ROUTE
router.get("/logout", userController.logout)



module.exports = router;
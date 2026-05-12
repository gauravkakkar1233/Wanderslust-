const User = require("../models/user");

// ---------------- SIGNUP ----------------

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const newUser = new User({ email, username });

        const registeredUser = await User.register(newUser, password);

        // AUTO LOGIN AFTER SIGNUP
        req.login(registeredUser, (err) => {
            if (err) return next(err);

            req.flash("success", "Welcome to Wanderlust!");

            // Save session before redirect so it persists
            req.session.save((err) => {
                if (err) return next(err);
                res.redirect("/listings");
            });
        });

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

// ---------------- LOGIN ----------------

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = (req, res, next) => {
    req.flash("success", "Welcome back!");

    let redirectUrl = res.locals.redirectUrl || "/listings";

    // Save session before redirect so it persists
    req.session.save((err) => {
        if (err) return next(err);
        res.redirect(redirectUrl);
    });
};

// ---------------- LOGOUT ----------------

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);

        req.flash("success", "Logged out successfully");

        // Save session before redirect so it persists
        req.session.save((err) => {
            if (err) return next(err);
            res.redirect("/listings");
        });
    });
};
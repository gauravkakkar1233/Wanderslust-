const User=require("../models/user");
const Listing=require("../models/listing");

module.exports.renderSignupForm=(req, res) => {
    res.render("users/signup.ejs");
}

module.exports.signup=async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newuser = new User({ email, username });
        const registeruser = await User.register(newuser, password);
        console.log(registeruser);
        req.login(registeruser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust");
            res.redirect("/listings");
        })
    }
    catch (error) {
        req.flash("error", error.message);
        res.redirect('/signup');
    }
}

module.exports.renderLoginForm=(req, res) => {
    res.render("users/login.ejs");
}

module.exports.login=async (req, res) => {
    req.flash("success", "Welcome Back! You are logged in!");
    let redirect=res.locals.redirectUrl || "/listings";
    res.redirect(redirect);

}

module.exports.logout=(req, res, next) => {
    req.logout((err) => {
        if (err) {
            next(err);
        }
        req.flash("success", "you are logout now!");
        res.redirect("/listings");
    })
}
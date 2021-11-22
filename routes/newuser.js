const express = require("express");
const passport = require("passport");
const { nextTick } = require("process");
const router = express.Router();
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");

router.get("/register", (req, res) => {
  res.render("users/register");
});

// sign up a new user
router.post(
  "/register",
  catchAsync(async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      const newuser = new User({ email, username });
      const registeruser = await User.register(newuser, password);
      req.login(registeruser, (err) => {
        if (err) {
          req.flash("err", err.message);
          return next(err);
        }
        req.flash("success", "Welcome to YelpCamp");
        res.redirect("/campgrounds");
      });
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/register");
    }
  })
);

//login
router.get("/login", (req, res) => {
  res.render("users/login");
});

//make sure the credential is valid
router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    const redirectUrl = req.session.returnTo || '/campgrounds'
    req.flash("success", "Welcome Back");
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  }
);

router.get("/logout", (req, res) => {
  req.logOut();
  req.flash("success", "Successfully Logout");
  res.redirect("/campgrounds");
});

module.exports = router;

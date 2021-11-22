const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const { campgroundSchema } = require("../schemas");
const { ensureLoggedIn } = require("../middleware");

const Campground = require("../models/campground");

//the middleware handler the server side validation
const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(".");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// 'access' to the campground page
router.get("/", async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
});

router.get("/new",ensureLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});

//create a new campground
router.post(
  "/",
  ensureLoggedIn,
  validateCampground,
  catchAsync(async (req, res, next) => {
    //if (!req.body.campground)
    //throw new ExpressError(" Invalid Campground Data", 400);
    const newcampground = new Campground(req.body.campground);
    await newcampground.save();
    // flash using for after creating the pop up
    req.flash('success', "Here's your new campground!")
    res.redirect(`/campgrounds/${newcampground._id}`);
  })
);

// access to the specific info page
router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate(
      "reviews"
    );
    if(!campground){
      req.flash('error', 'Cannot Find this Campground');
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
  })
);

// acess to edit specific info page
router.get(
  "/:id/edit", ensureLoggedIn,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground){
      req.flash('error', 'Cannot Find this Campground');
      return res.redirect("/campgrounds")
    }
    res.render("campgrounds/edit", { campground });
  })
);

//edit the exsisting campground
router.put(
  "/:id",
  ensureLoggedIn,
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const updatecampground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    req.flash('success', "Updated Successfuly!")
    res.redirect(`/campgrounds/${updatecampground._id}`);
  })
);

//delete campground
router.delete(
  "/:id",
  ensureLoggedIn,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground Deleted')
    res.redirect("/campgrounds");
  })
);

module.exports = router;

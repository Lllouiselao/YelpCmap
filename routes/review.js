const express = require("express");
// when we updating the reviews it won't work bc express params seperate
const router = express.Router({ mergeParams: true});

const Campground = require("../models/campground");
const Review = require("../models/review");

const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const { reviewSchema } = require("../schemas");

const validateReview = (req,res,next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el) => el.message).join(".");
      throw new ExpressError(msg, 400);
    } else {
      next();
    }
  };

// making reviews for the campgrounds
router.post(
  "/",
  validateReview,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const userreview = new Review(req.body.review);
    campground.reviews.push(userreview);
    await userreview.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

//delete the campground cooment
router.delete(
    "/:reviewId",
    catchAsync(async (req, res) => {
      const { id, reviewId } = req.params;
      await Campground.findByIdAndUpdate(id, { $pull: { review: reviewId } });
      await Review.findByIdAndDelete(reviewId);
      res.redirect(`/campgrounds/${id}`);
    })
  );

module.exports = router;

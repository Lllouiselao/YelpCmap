const express = require("express");
// when we updating the reviews it won't work bc express params seperate
const router = express.Router({ mergeParams: true});
const Campground = require("../models/campground");
const Review = require("../models/review");

const catchAsync = require("../utils/catchAsync");

const {validateReview, ensureLoggedIn, isReviewer}= require("../middleware");
const review = require("../models/review");


// making reviews for the campgrounds
router.post(
  "/",
  ensureLoggedIn,
  validateReview,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created a new review, thank you')
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

//delete the campground cooment
router.delete(
    "/:reviewId",
    ensureLoggedIn,
    isReviewer,
    catchAsync(async (req, res) => {
      const { id, reviewId } = req.params;
      await Campground.findByIdAndUpdate(id, { $pull: { review: reviewId } });
      await Review.findByIdAndDelete(reviewId);
      req.flash('success', 'Review Deleted')
      res.redirect(`/campgrounds/${id}`);
    })
  );

module.exports = router;

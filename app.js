const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const { campgroundSchema, reviewSchema } = require("./schemas");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const Review = require("./models/review");
const campground = require("./models/campground");

mongoose.connect("mongodb://localhost:27017/YelpCamp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("app.js Database Connceted");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

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

const validateReview = (req,res,next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el) => el.message).join(".");
      throw new ExpressError(msg, 400);
    } else {
      next();
    }
  };

app.get("/", (req, res) => {
  res.render("home");
});

// 'access' to the campground page
app.get("/campgrounds", async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
});

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

//create a new campground
app.post(
  "/campgrounds",
  validateCampground,
  catchAsync(async (req, res, next) => {
    //if (!req.body.campground)
    //throw new ExpressError(" Invalid Campground Data", 400);
    const newcampground = new Campground(req.body.campground);
    await newcampground.save();
    res.redirect(`/campgrounds/${newcampground._id}`);
  })
);

// access to the specific info page
app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render("campgrounds/show", { campground });
  })
);

// acess to edit specific info page
app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground });
  })
);

//edit the exsisting campground
app.put(
  "/campgrounds/:id",
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const updatecampground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${updatecampground._id}`);
  })
);

//delete campground
app.delete(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

//delete the campground cooment
app.delete("/campgrounds/:id/reviews/:reviewId", catchAsync(async(req, res) =>{
  const {id, reviewId} = req.params;
  await Campground.findByIdAndUpdate(id, {$pull: {review: reviewId}});
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/campgrounds/${id}`);
}))

// making reviews for the campgrounds
app.post(
  "/campgrounds/:id/reviews",
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

// if the root we don't recognize then 404
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

//generic Error Handler
app.use((err, req, res, next) => {
  const { statusCode = 999 } = err;
  if (!err.message) err.message = "Oh No I Found An Error";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("serving on port 3000");
});

if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
//const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");

const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const Passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')

const session = require('express-session');
const MongoStore = require('connect-mongo');

const campgroundsRoutes = require("./routes/campgrounds");
const reviewsRoutes = require("./routes/review");
const userRoutes = require("./routes/newuser")
const dbUrl = process.env.DB_URL ||'mongodb://localhost:27017/YelpCamp'
//const dbUrl = 

mongoose.connect(dbUrl);

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
app.use(flash())
app.use(express.static(path.join(__dirname, 'public')));

const secret = process.env.SECRET ||'secret';

store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
      secret
  }
});


// so if someone would log in the expires(7 days) will log out them
const sessionConfig = {
secret : secret,
  resave: false,
  saveUninitialized: true,
  cookie :{
    httpOnly: true, 
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}
app.use(session(sessionConfig))

// passport session must after session
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) =>{
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

// connecting to two routes campgrounds/reviews
app.use("/campgrounds", campgroundsRoutes)
app.use("/campgrounds/:id/reviews", reviewsRoutes)
app.use("/", userRoutes)

app.get("/", (req, res) => {
  res.render("home");
});

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

const port = process.env.PORT || 3000;
app.listen(3000, () => {
  console.log(`serving on port ${port}`);
});

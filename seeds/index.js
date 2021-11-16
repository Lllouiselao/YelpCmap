const mongoose = require("mongoose");
const cities = require('./cities');
const {descriptors, places} = require("./seedHelpers")
const Campground = require("../models/campground");

mongoose.connect("mongodb://localhost:27017/YelpCamp", {});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Seed Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)]

const seeDB = async () => {
  await Campground.deleteMany({});
  for(let i = 0; i < 50; i++){
      const random1000 = Math.floor(Math.random() * 1000);
      const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`
      })
      await camp.save();
  }
};

seeDB();
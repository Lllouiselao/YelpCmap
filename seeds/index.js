const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/YelpCamp')

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () =>{
    console.log("Seed.index Database Connceted")
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const seeDB = async() =>{
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '619a6268d0cfc25f0526c10d',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'The forest was humble, thick, and ancient. Its canopy was eclipsed by hazel, redwood, and linden, their crowns allowed cascading lights to shimmer through for a hodgepodge of mushrooms to rule the crunchy layer of leaves below.Curling tree limbs grasped many a tree, and a range of flowers, which desperately tried to claim the last remnants of light, clashed with the otherwise jade forest floor.',
            image: 'https://source.unsplash.com/collection/973270',
            price
        })
        await camp.save();
    }
}

seeDB().then(() =>{
    mongoose.connection.close();
})
const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedhelpers");
const Campground = require("../models/campground");

mongoose.connect("mongodb://localhost:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20 + 10);
    const camp = new Campground({
      author: "623141ba40bff71903158e51",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit nulla temporibus corrupti dolore repellendus! Hic enim veniam esse quisquam? Libero fuga asperiores quos laudantium sapiente non, rerum ex impedit nesciunt?",
      price,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      images: [
        {
          url: "https://res.cloudinary.com/squirrely/image/upload/v1647734357/YelpCamp/ubyy2unzhykr6y9a0vup.jpg",
          filename: "YelpCamp/ubyy2unzhykr6y9a0vup",
        },
        {
          url: "https://res.cloudinary.com/squirrely/image/upload/v1647734357/YelpCamp/t0yasbou67h1fj9paalv.jpg",
          filename: "YelpCamp/t0yasbou67h1fj9paalv",
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});

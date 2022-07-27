//Requires
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user");
const Strategy = require("passport-local/lib");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

const MongoStore = require("connect-mongo");

//requiring the routes
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");
/* const loginRoutes = require('./routes/logins'); */

//connecting to mongo db old:"mongodb://localhost:27017/yelp-camp"
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
mongoose.connect(dbUrl);

//Connection error handling
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

//Configuration for apps, Setting view engine to be ejs and views folders.
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//middleware
app.use(express.urlencoded({ extended: true })); //we tel express to parse request.body, so we can access the info of the forms we POST.
app.use(methodOverride("_method")); //Lo que pones en el parentesis es como lo queres llamar para ejecutarlo dentro de tu app.
app.use(express.static(path.join(__dirname, "public")));
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

//adding login sessions through mongo-connect npm
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 3600, // time period in seconds
});

store.on("error", function (e) {
  console.log("Session Store Error", e);
});

const secret = process.env.SECRET || "9Cd7xNxt1JCuZ3cs";

const sessionConfig = {
  name: "session",
  secret,
  store,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true /* Lil exta security */,
    /* secure: true localhost no es SVGAnimatedEnumeration, en production si va */
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //time period miliseconds
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig)); //this has to be before initialize and session, those 2 come from passport npm
app.use(flash());
/* app.use(helmet()); */

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net/",
  "https://res.cloudinary.com/squirrely/",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/",
  "https://res.cloudinary.com/squirrely/",
];
const connectSrcUrls = [
  "https://*.tiles.mapbox.com",
  "https://api.mapbox.com",
  "https://events.mapbox.com",
  "https://res.cloudinary.com/squirrely/",
];
const fontSrcUrls = ["https://res.cloudinary.com/squirrely/"];

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        objectSrc: [],
        imgSrc: [
          "'self'",
          "blob:",
          "data:",
          "https://res.cloudinary.com/squirrely/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
          "https://images.unsplash.com/",
        ],
        fontSrc: ["'self'", ...fontSrcUrls],
        mediaSrc: ["https://res.cloudinary.com/squirrely/"],
        childSrc: ["blob:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new Strategy(User.authenticate())); //this method is not defined in our modle, it comes from passport npm
passport.serializeUser(User.serializeUser()); //this is telling passport how to serialze a user, aka how do we store a user on the session
passport.deserializeUser(User.deserializeUser()); //how to get a user out of that session

app.use((req, res, next) => {
  console.log(req.session);
  if (!["/login", "/"].includes(req.originalUrl)) {
    req.session.returnTo = req.originalUrl;
  }
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
}); /* Make sure it's before the routes, so we have access to this in every template */
/* req.session.returnTo = req.originalUrl; 
req.originalUrl is the url you are at when you make de req */

//use the destructured routes
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
/* we specifie the router that we wanna use, wich is our campgrounds tha we just require, and a path that we wanna prefix them with.  First chunk means everything starts with campground, and then after the comma means i want you to use my campground routes*/
app.use("/campgrounds/:id/reviews", reviewRoutes);
/* Here we are saying there's an :id in the path that prefixes all of the review routes, but by default we wont have access to that id in our reviews routes, cause routers get separate params, so we go and fix it in the reqs in reviews... */

//ROUTES
//1.Home route
app.get("/", (req, res) => {
  res.render("home");
});

//ERROR -random- HANDLING
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
}); //since we are passsing next with an error is going to pass it to the next error handler, wish is right below

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong";
  res.status(statusCode).render("error", { err });
});
//The order is very important, this will only run if any of the above wasn't matched.

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Serving on port ${port}!`);
});

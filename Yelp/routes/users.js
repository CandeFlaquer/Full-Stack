const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const users = require("../controllers/users");
const res = require("express/lib/response");

//Register routes

router
  .route("/register")
  .get(users.renderRegister) //render form
  .post(catchAsync(users.register)); //send form to db

//Login routes

router
  .route("/login")
  .get(users.renderLogin) //render login
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.login
  ); //send form

//Logout route
router.get("/logout", users.logout);
module.exports = router;

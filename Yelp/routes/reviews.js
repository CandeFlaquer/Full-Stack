const express = require("express");
const router = express.Router({
  mergeParams: true,
}); /* Fixing not having access to :id */
const reviews = require("../controllers/reviews");

const {
  isLoggedIn,
  isReviewAuthor,
  validateReview,
} = require("../middleware.js");

const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

//Create Review route
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.create));

//Deleting the review from de page
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.delete)
);

module.exports = router;

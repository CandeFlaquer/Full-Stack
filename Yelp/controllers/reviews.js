const Campground = require("../models/campground");
const Review = require("../models/review");

//Create Review route
module.exports.create = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash("Success", "Successfully created a new Review!");
  res.redirect(`/campgrounds/${campground._id}`);
};

//Deleting the review from de page
module.exports.delete = async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("Success", "Successfully deleted a Review!");
  res.redirect(`/campgrounds/${id}`);
};

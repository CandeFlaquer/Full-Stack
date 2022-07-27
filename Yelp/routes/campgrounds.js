const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds");
const catchAsync = require("../utils/catchAsync");
const {
  isLoggedIn,
  validateCampground,
  isAuthor,
} = require("../middleware.js");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });


router
  .route("/")
  .get(catchAsync(campgrounds.index)) //2.Index route
  /*  .post(isLoggedIn, validateCampground, catchAsync(campgrounds.create)); //4.2.Sub form */
  /* Since we are now uploading images and not urls we have to use a middlewear called Multer */
  .post(
    isLoggedIn,
    upload.array("campground[image]"),
    validateCampground,
    catchAsync(campgrounds.create),
    (req, res) => {
      console.log(req.body, req.files);
      res.send("it worked!");
    }
  ); //single or array and use req.file or req.diles

//4.Create routes
//4.1.Form (new goes always before id!)
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(campgrounds.show)) //3.Show page
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("campground[image]"),
    validateCampground,
    catchAsync(campgrounds.update)
  ) //5.2 Submiting update form
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.delete)); //Delete route

//5.1. Update Form
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

module.exports = router;

/* 
Old way of structuring routes, got shortened
//2.Index route
router.get("/", catchAsync(campgrounds.index));

//4.Create routes
//4.1.Form (new goes always before id!)
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

//4.2.Submiting form/Creation of a campground
router.post(
  "/",
  isLoggedIn,
  validateCampground,
  catchAsync(campgrounds.create)
);

//3.Show 1 item route (aka what we see on each page)
router.get("/:id", catchAsync(campgrounds.show));

//5.Edit Routes
//5.1.Form
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);
//5.2Submiting form/Editing/Updating campground
router.put(
  "/:id",
  isLoggedIn,
  isAuthor,
  validateCampground,
  catchAsync(campgrounds.update)
);

//Delete route
router.delete("/:id", isLoggedIn, isAuthor, catchAsync(campgrounds.delete)); */

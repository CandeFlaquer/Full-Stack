const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");
//pass in our mapbox token
//we instanciate a new mbxGeocoding ¬ we pass in our token

//2.Index route
module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

//4.Create routes
//4.1.Form
module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};
//authenticated is added to the req object itself by passport npm

//4.2.Submiting form/Creation of a campground
module.exports.create = async (req, res, next) => {
  const geoData = await geocoder.forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry;
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user._id;
  await campground.save();
  console.log(campground);
  req.flash("success", "Successfully created a new Campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};
/* if (!req.body.campground)
throw new ExpressError(400, "Invalid Campground Data"); */

//3.Show 1 item route (aka what we see on each page)
module.exports.show = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!campground) {
    req.flash("error", "Campground not found");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};
//We populate all the reviews from that path, and we nest the population of the author in e3ach one of them. Y ademas popular el autor

//5.Edit Routes
//5.1.Form
module.exports.renderEditForm = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash("error", "Campground not found");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

//5.2Submiting form/Editing/Updating campground
module.exports.update = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.images.push(...imgs);
  await campground.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "Successfully updated Campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};
//para no hardcodear lo que adentro delos corchetes, que es la info con la que queremos updatear el campground, usamos el spread operator para acceder a lo que esta almacenado en campaground
//in push() we cant pass an array so up there we define a var and spread it

//Delete route
module.exports.delete = async (req, res) => {
  const { id } = req.params; //destructuramos params para obtener id
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted a Campground!");
  res.redirect("/campgrounds");
};

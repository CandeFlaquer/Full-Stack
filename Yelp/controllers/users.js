const User = require("../models/user");

//Register routes
//render form
module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

//send form to db
module.exports.register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password); //it stores the pass in the user, method from passport npm
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Yelp Camp!");
      res.redirect("/campgrounds");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
};
//this as is does not keep track of whos logged in
//catchasync is for server error like a mongoose erro, or an error in any function, try catch is for register erro

//Login routes
//render login
module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

//send form
module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!!");
  const redirectUrl = req.session.returnTo || "/campgrounds";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};
//passport npm gives us a middleware we can us to authenticate using local Strategy and gives us options we set on an object
//deleteamos para que no quede la info dando vuelta en la session del server y si quiero reloguear desde otra pagina me mande a la primera y no a la segunda

//Logout route
module.exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "Logged you out.");
  res.redirect("/campgrounds");
};

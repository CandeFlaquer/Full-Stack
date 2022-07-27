//Para usar express
const express = require("express");
const app = express();
const path = require("path");
//Para usar mongoose
const mongoose = require("mongoose");
const methodOverride = require("method-override");

//Require el modelo
const Product = require("./models/product");
const Farm = require("./models/farm");
const { findById } = require("./models/product");

//Para conectar mongoose a Mongo
mongoose
  .connect("mongodb://localhost:27017/farmStand2")
  .then(() => {
    console.log("Mongo connection opened!");
  })
  .catch((err) => {
    console.log("Oh no! Mongo connection error!");
    console.log("err");
  });

//Para usar ejs y que no se buggee la parte de views si se accede desde otra carpeta
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/* ESTOS SON MIDDLEWARES.-Le pedimos a express que parsee el req.body para tener acceso a la data ingresada en unestro formulario, más abajo. */
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method")); //para usar el method override.

//FARM ROUTES
app.get("/farms", async (req, res) => {
  const farms = await Farm.find({});
  res.render("farms/index", { farms });
});

app.get("/farms/new", (req, res) => {
  res.render("farms/new");
});

app.post("/farms", async (req, res) => {
  const farm = new Farm(req.body);
  await farm.save();
  res.redirect("/farms");
});

app.get("/farms/:id", async (req, res) => {
  const { id } = req.params;
  const farm = await Farm.findById(id).populate("products");
  res.render("farms/show", { farm });
});

/* ------- */
/* To link the product with farm, our route to create the new product will include the farm id inside of it: /farms/farm:id/products/new thats the route that we'll request to make a new product for this one farm and then send a post req to /farms/farm:id/products because we want that farm id to know wich farm it is asociated with -this is a common practice and an example of nested routing where there is more than one dinamic vairable in the path-*/
/* Other ways: we could hide it in the form itself and send it as a hiddn field, in the req.body */

app.get("/farms/:id/products/new", async (req, res) => {
  const { id } = req.params;
  const farm = await Farm.findById(id);
  res.render("products/new", { categories, farm });
});
/* Since we are just rendering we dont need to make it an async callback */

app.post("/farms/:id/products", async (req, res) => {
  const { id } = req.params;
  const farm = await Farm.findById(id);
  const { name, price, category } = req.body;
  const product = new Product({ name, price, category });
  farm.products.push(product);
  product.farm = farm;
  await farm.save();
  await product.save();
  res.redirect(`/farms/${id}`);
});

app.delete("/farms/:id", async (req, res) => {
  const farm = await Farm.findByIdAndDelete(req.params.id);
  res.redirect("/farms");
});

//PRODUCT ROUTES

const categories = ["fruit", "vegetable", "dairy", "fungi"];

//INDEX ROUTE
app.get("/products", async (req, res) => {
  /* ponemos todos nuestros products con los find empty brackets para que matchee todos los products y tener acceso a ellos.
  -Si no lo hacemos en async, demora amás pq toma tiempo. */
  const { category } = req.query;
  if (category) {
    const products = await Product.find({ category });
    res.render("products/index", { products, category });
  } else {
    const products = await Product.find({});
    res.render("products/index", { products, category: "All" });
  } /* aca antes era: res.send("All products will be here."); PERO como tenemos ejs lo cambiamos a res.render('products/index') */
});

/* Hacemos un route para crear un form */
app.get("/products/new", (req, res) => {
  res.render("products/new", { categories });
});
//y después seteamos el rout a donde esto se submitea cuando tocamos el boton en la form:
app.post("/products", async (req, res) => {
  const newProduct = new Product(req.body);
  await newProduct.save();
  res.redirect(`/products/${newProduct._id}`); //redireccionamos al producto creado pq si no se lupea el formulario y podemos crear el producto un montón de veces.
});

/* EN ESTE ROUTE NOS CONCENTRAMOS EN HACER UNA PAGINA PARA DESCRIBIR CADA PRODUCTO 
Usamos product/:id y no name pq puede haber productos con nombres repetidosy hay espacios que pueden ser complicados para las url*/
app.get("/products/:id", async (req, res) => {
  const { id } =
    req.params; /* para tener acceso al id reconstruimos params del require */
  const product = await Product.findById(id).populate("farm", "name");
  console.log(product);
  res.render("products/show", { product });
});

//Para updatear los items
app.get("/products/:id/edit", async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  res.render("products/edit", { product, categories });
});

app.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndUpdate(id, req.body, {
    runValidators: true,
    new: true,
  }); //this forgoes the validations by default, pero lo seteamos en runValidators: true, new:true es para que no tenga la info vieja, creo
  res.redirect(`/products/${product._id}`);
});

//hacemos un rout para deletear
app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;
  const deletedProduct = await Product.findByIdAndDelete(id);
  res.redirect("/products");
});

app.listen(3000, () => {
  console.log("Listening in port 3000!");
});

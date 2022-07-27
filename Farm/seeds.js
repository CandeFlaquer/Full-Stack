//Este file es para crear algo en la database y que no esté vacía y darle una base
const Product = require("./models/product");
//conectamos a mongoose
const mongoose = require("mongoose");
//Para conectar mongoose a Mongo
mongoose
  .connect("mongodb://localhost:27017/farmStand")
  .then(() => {
    console.log("Mongo connection opened!");
  })
  .catch((err) => {
    console.log("Oh no! Mongo connection error!");
    console.log("err");
  });

//Este file se corre por si mismo cada vez que yo quiera data nueva en la base de datos, no tiene dependencias a express ni nada. Esto es una buena practica, de dejarlo separado del index.

/* Creamos un solo producto y lo saveamos a la database o lo podemos hacer con insertMany, como figura abajo.
const p = new Product({
  name: "Ruby Grapefruit",
  price: 1.99,
  category: "fruit",
});
p.save()
  .then((p) => {
    console.log(p);
  })
  .catch((err) => {
    console.log("err");
  });
 */

const seedProducts = [
  {
    name: "Fairy Eggplant",
    price: 1.0,
    category: "vegetable",
  },
  {
    name: "Organic Goddess Melon",
    price: 4.99,
    category: "fruit",
  },
  {
    name: "Organic Mini Seedless Watermelon",
    price: 3.99,
    category: "fruit",
  },
  {
    name: "Organic Celery",
    price: 1.5,
    category: "vegetable",
  },
  {
    name: "Chocolate Whole Milk",
    price: 2.69,
    category: "dairy",
  },
];
//Si en el insertMany algún item no pasa la validación no se guarda nada en la database.

Product.insertMany(seedProducts)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log("err");
  });

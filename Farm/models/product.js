const mongoose = require("mongoose");
const { Schema } = mongoose;

//Crear el esquema al que se tienen que atener todos los products
const productSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    enum: ["fruit", "vegetable", "dairy"],
    lowercase: true,
  },
  /* Since we want to have access to the products independently from the farm, and they might become Many, we will connect em reciprocamente, and only embed products ids: */
  farm: {
    type: Schema.Types.ObjectId,
    ref: "Farm",
  },
});

//Compilamos el modelo creando el modelo Product según el esquema
const Product = mongoose.model("Product", productSchema);

//Lo exportamos para poder usarlo en otros lados de la app
module.exports = Product;

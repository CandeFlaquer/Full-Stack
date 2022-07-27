const mongoose = require("mongoose");
const Product = require("./product");
const { Schema } = mongoose;

const farmSchema = new Schema({
  name: {
    type: String,
    required: [true, "Farm must have a name"],
  },
  city: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "Email required"],
  },
  /* Since we want to have access to the products independently from the farm, and they might become Many, we will connect em reciprocamente, and only embed products ids: */
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
});

//Setting up a query middleware
farmSchema.post("findOneAndDelete", async function (farm) {
  if (farm.products.length) {
    const res = await Product.deleteMany({ _id: { $in: farm.products } }); //delete all products wich id is inside de farms product id array
  }
});

/* What we're doing here is creating and exporting the Farm model.
This makes it so we can import the model into other parts of the program, like our routes: */
const Farm = mongoose.model("Farm", farmSchema);

module.exports = Farm;

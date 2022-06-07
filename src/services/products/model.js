import mongoose from "mongoose";

const { Schema, model } = mongoose;

const productSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      minlength: [3, "Tooshort"],
      maxlength: [32, "Too long"],
    },
    slug: { type: "String", unique: true, lowercase: true, index: true },

    price: { type: Number, required: true, trim: true, maxlength: 32 },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      text: true,
      required: true,
    },

    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    subcategory: {
      type: Schema.Types.ObjectId,
      ref: "Sub",
      required: true,
    },

    quantity: Number,
    sold: {
      type: Number,
      default: 0,
    },
    images: {
      type: Array,
    },
    shipping: {
      type: String,
      enum: ["Yes", "No"],
    },
    color: {
      type: String,
      enum: ["Black", "Brown", "Silver", "White", "Blue"],
    },
    brand: {
      type: String,
      enum: ["Apple", "Samsung", "Microsoft", "Lenovo", "Asus", "HP"],
    },
    rating: [
      {
        star: Number,
        postedby: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default model("Product", productSchema);

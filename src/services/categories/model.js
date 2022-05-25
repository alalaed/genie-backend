import mongoose from "mongoose";

const { Schema, model } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      minlength: [3, "Tooshort"],
      maxlength: [32, "Too long"],
    },
    slug: { type: "String", unique: true, lowercase: true, index: true },
  },
  {
    timestamps: true,
  }
);

export default model("Category", categorySchema);

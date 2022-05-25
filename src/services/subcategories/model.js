import mongoose from "mongoose";
// import { ObjectId } from "mongoose.Schema";

const { Schema, model } = mongoose;

const subSchema = new Schema(
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
    parent: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  },

  {
    timestamps: true,
  }
);

export default model("Sub", subSchema);

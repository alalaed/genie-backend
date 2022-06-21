import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    surname: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String },
    role: { type: String, enum: ["User", "Admin"], default: "User" },
    cart: { type: Array, default: [] },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  const newUser = this;
  const password = newUser.password;
  if (newUser.isModified("password")) {
    const hash = await bcrypt.hash(password, 10);
    newUser.password = hash;
  }
  next();
});

UserSchema.methods.toJSON = function () {
  const userDocument = this;
  const userObject = userDocument.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

UserSchema.statics.checkCredentials = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      return user;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export default model("User", UserSchema);

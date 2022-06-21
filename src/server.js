import express from "express";
import mongoose from "mongoose";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import passport from "passport";
// import googleStrategy from "./services/auth/OAuth.js";
import {
  badRequestHandler,
  notFoundHandler,
  genericErrorHandler,
  forbiddenHandler,
  unauthorizedHandler,
} from "../errorHandlers.js";
import usersRouter from "./services/users/index.js";
import productRouter from "./services/products/index.js";
import categoryRouter from "./services/categories/index.js";
import subRouter from "./services/subcategories/index.js";
import cloudinaryRouter from "./services/cloudinary/index.js";
import PromoCodeRouter from "./services/promocode/index.js";
import stripeRouter from "./services/stripe/index.js";
import { adminsRouter } from "./services/admin/index.js";

const server = express();
const port = process.env.PORT || 3001;

passport.use("google", googleStrategy);

// ***************************************** MIDDLEWARES **************************************

server.use(cors());
server.use(express.json());
server.use(passport.initialize());

// ****************************************** ENDPOINTS ***************************************

server.use("/users", [usersRouter]);
server.use("/products", [productRouter]);
server.use("/category", [categoryRouter]);
server.use("/subcategory", [subRouter]);
server.use("/cloudinary", [cloudinaryRouter]);
server.use("/code", [PromoCodeRouter]);
server.use("/stripe", [stripeRouter]);
server.use("/admin", [adminsRouter]);

// ***************************************** ERROR HANDLERS ***********************************

server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(forbiddenHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_CONNECTION);

mongoose.connection.on("connected", () => {
  console.log("Successfully connected to Mongo!");

  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`Server running on port ${port}`);
  });
});

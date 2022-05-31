import express from "express";
import createError from "http-errors";
import ProductModel from "./model.js";
import { adminOnlyMiddleware } from "../auth/adminOnlyMiddleware.js";
import { JWTAuthMiddleware } from "../auth/JWTAuthMiddleware.js";
import slugify from "slugify";

const productRouter = express.Router();
productRouter.get("/count/:count", async (req, res, next) => {
  try {
    let products = await ProductModel.find({})
      .limit(parseInt(req.params.count))
      .populate("category")
      .populate("subcategory")
      .sort([["createdAt", "desc"]]);

    res.json(products);
  } catch (error) {
    console.log(error);
  }
});

productRouter.post(
  "/",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      req.body.slug = slugify(req.body.title);
      const newProduct = await new ProductModel(req.body).save();
      res.send(newProduct);
    } catch (error) {
      res.send("Creation failed!");
      console.log(error);
    }
  }
);

productRouter.get(
  "/:slug",
  // JWTAuthMiddleware,
  // adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      let product = await ProductModel.findOne({
        slug: req.params.slug,
      })
        .populate("category")
        .populate("subcategory");
      res.json(product);
    } catch (error) {
      console.log(error);
    }
  }
);

productRouter.delete(
  "/:id",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const deleted = await ProductModel.findByIdAndDelete(req.params.id);
      res.json(deleted);
    } catch (error) {
      console.log(error);
      return res.send("Delete failed!");
    }
  }
);

export default productRouter;

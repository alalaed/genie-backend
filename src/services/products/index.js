import express from "express";
import createError from "http-errors";
import ProductModel from "./model.js";
import { adminOnlyMiddleware } from "../auth/adminOnlyMiddleware.js";
import { JWTAuthMiddleware } from "../auth/JWTAuthMiddleware.js";
import slugify from "slugify";
import UserModel from "../users/model.js";
import {
  handleQuery,
  handlePrice,
  handleCategory,
  handleRating,
  handleSubCategory,
  handleShipping,
  handleColor,
  handleBrand,
} from "./searchAndFilter.js";

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

productRouter.get("/total", async (req, res, next) => {
  let total = await ProductModel.find({}).estimatedDocumentCount();
  res.json(total);
});

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
productRouter.get(
  "/wishlist/:id",
  // JWTAuthMiddleware,
  // adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      let product = await ProductModel.findOne({
        id: req.params.id,
      });

      res.json(product);
    } catch (error) {
      console.log(error);
    }
  }
);

productRouter.put(
  "/:userId/rating/:productId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    const product = await ProductModel.findById(req.params.productId);
    const user = await UserModel.findById(req.params.userId);
    const { rate } = req.body;
    console.log("hello there sir " + req);

    let alreadyRated = product.ratings.find(
      (ratings) => ratings.postedBy.toString() === user._id.toString()
    );

    if (alreadyRated === undefined) {
      let ratingAdded = await ProductModel.findByIdAndUpdate(
        product._id,
        {
          $push: { ratings: { star: rate, postedBy: user._id } },
        },
        { new: true }
      );
      res.json(ratingAdded);
    } else {
      const ratingUpdated = await ProductModel.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        { $set: { "ratings.$.star": rate } },
        { new: true }
      );
      res.json(ratingUpdated);
    }
  }
);

productRouter.post("/product-order", async (req, res, next) => {
  try {
    const { sort, order, limit } = req.body;
    const products = await ProductModel.find({})
      .populate("category")
      .populate("subcategory")
      .sort([[sort, order]])
      .limit(limit);
    res.json(products);
  } catch (error) {
    console.log(error);
  }
});

productRouter.get("/related/:productId", async (req, res, next) => {
  const product = await ProductModel.findById(req.params.productId);
  const related = await ProductModel.find({
    _id: { $ne: product._id },
    category: product.category,
  })
    .limit(6)
    .populate("category")
    .populate("subcategory");

  res.json(related);
});
productRouter.put(
  "/:slug",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      if (req.body.title) {
        req.body.slug = slugify(req.body.title);
      }
      const updated = await ProductModel.findOneAndUpdate(
        { slug: req.params.slug },
        req.body,
        { new: true }
      );
      res.json(updated);
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

productRouter.post("/search/filters", async (req, res, next) => {
  try {
    const {
      query,
      price,
      category,
      stars,
      subcategory,
      shipping,
      color,
      brand,
    } = req.body;

    if (query) {
      await handleQuery(req, res, next, query);
    }
    if (price !== undefined) {
      await handlePrice(req, res, next, price);
    }
    if (category !== undefined) {
      await handleCategory(req, res, next, category);
    }
    if (stars !== undefined) {
      await handleRating(req, res, next, stars);
    }
    if (subcategory !== undefined) {
      await handleSubCategory(req, res, next, subcategory);
    }
    if (shipping !== undefined) {
      await handleShipping(req, res, next, shipping);
    }
    if (color !== undefined) {
      await handleColor(req, res, next, color);
    }
    if (brand !== undefined) {
      await handleBrand(req, res, next, brand);
    }
  } catch (error) {
    next(error);
    res.status(400).json(error.message);
    console.log(error.message);
  }
});

export default productRouter;

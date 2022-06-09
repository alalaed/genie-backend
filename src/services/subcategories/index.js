import express from "express";
import createError from "http-errors";
import SubCategoryModel from "./model.js";
import { adminOnlyMiddleware } from "../auth/adminOnlyMiddleware.js";
import { JWTAuthMiddleware } from "../auth/JWTAuthMiddleware.js";
import slugify from "slugify";
import ProductModel from "../products/model.js";

const subRouter = express.Router();

subRouter.get("/subs", async (req, res, next) => {
  res.json(await SubCategoryModel.find({}).sort({ createdAt: -1 }).exec());
});

subRouter.get(
  "/sub/:slug",
  // JWTAuthMiddleware,
  // adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const subCategory = await SubCategoryModel.find({
        slug: req.params.slug,
      });
      const products = await ProductModel.find({ subcategory: subCategory })
        .populate("category")
        .populate("postedBy", "_id name");

      res.send({ subCategory, products });
    } catch (error) {
      console.log(error);
    }
  }
);

subRouter.post(
  "/",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const { name, parent } = req.body;
      const category = await new SubCategoryModel({
        name,
        parent,
        slug: slugify(name).toLowerCase(),
      }).save();
      res.send(category);
    } catch (error) {
      res.send("Creation of subcategory failed!");
      console.log(error);
    }
  }
);

subRouter.get("/:id", async (req, res, next) => {
  const subCollection = await SubCategoryModel.find({
    parent: req.params.id,
  }).sort({ createdAt: -1 });

  res.send(subCollection);
});

subRouter.get(
  "/:slug",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const subCategory = await SubCategoryModel.find({
        slug: req.params.slug,
      });
      // const products = await ProductModel.find({ subcategory: subcategory })
      //   .populate("category")
      //   .populate("postedBy", "_id name");

      res.send(subCategory);
    } catch (error) {
      console.log(error);
    }
  }
);

subRouter.put(
  "/:slug",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    const { name } = req.body;
    console.log("be this is the slug " + req.params.slug);
    console.log("be this is the name " + name);
    try {
      const updated = await SubCategoryModel.findOneAndUpdate(
        { slug: req.params.slug },
        { name, slug: slugify(name) },
        { new: true }
      );

      res.send(updated);
    } catch (error) {
      console.log(error);
    }
  }
);

subRouter.delete(
  "/:slug",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const subCategory = await SubCategoryModel.findOneAndDelete({
        slug: req.params.slug,
      });
      res.send("Category is deleted");
    } catch (error) {
      console.log(error);
    }
  }
);

export default subRouter;

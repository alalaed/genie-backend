import express from "express";
import createError from "http-errors";
import CategoryModel from "./model.js";
import { adminOnlyMiddleware } from "../auth/adminOnlyMiddleware.js";
import { JWTAuthMiddleware } from "../auth/JWTAuthMiddleware.js";
import slugify from "slugify";

const categoryRouter = express.Router();

categoryRouter.post(
  "/",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const { name } = req.body;
      const category = await new CategoryModel({
        name,
        slug: slugify(name).toLowerCase(),
      }).save();
      res.send(category);
    } catch (error) {
      res.send("oops, something went wrong!");
      console.log(error);
    }
  }
);

categoryRouter.get("/", async (req, res, next) => {
  const collection = await CategoryModel.find({}).sort({ createdAt: -1 });

  res.send(collection);
});

categoryRouter.get(
  "/:slug",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const category = await CategoryModel.find({
        slug: req.params.slug,
      });
      res.send(category);
    } catch (error) {
      res.send("oops, something went wrong!");
      console.log(error);
    }
  }
);

categoryRouter.put(
  "/:slug",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    const { name } = req.body;
    try {
      console.log(name, typeof name);
      const updated = await CategoryModel.findOneAndUpdate(
        { slug: req.params.slug },
        { name, slug: slugify(name) },
        { new: true }
      );
      res.send(updated);
    } catch (error) {
      res.send("oops, something went wrong!");
      console.log(error);
    }
  }
);

categoryRouter.delete(
  "/:slug",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const category = await CategoryModel.findOneAndDelete({
        slug: req.params.slug,
      });
      res.send("Category is deleted");
    } catch (error) {
      res.send("oops, something went wrong!");
      console.log(error);
    }
  }
);

export default categoryRouter;

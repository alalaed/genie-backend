import express from "express";
import createError from "http-errors";
import ProductModel from "./model.js";
import { adminOnlyMiddleware } from "../auth/adminOnlyMiddleware.js";
import { JWTAuthMiddleware } from "../auth/JWTAuthMiddleware.js";
import slugify from "slugify";
import UserModel from "../users/model.js";

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

productRouter.put(
  "/product/rating/:productId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    const product = await ProductModel.findById(req.params.productId);
    const user = await UserModel.findOne({ email: req.user.email });
    const { star } = req.body;

    let alreadyRated = product.ratings.find(
      (element) => element.postedBy.toString() === user._id.toString()
    );

    if (alreadyRated === undefined) {
      let ratingAdded = await ProductModel.findByIdAndUpdate(
        product._id,
        {
          $push: { ratings: { star: star, postedBy: user._id } },
        },
        { new: true }
      );
      res.json(ratingAdded);
    } else {
      const ratingUpdated = await ProductModel.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        { $set: { "ratings.$.star": star } },
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

// productRouter.post("/product-order", async (req, res, next) => {
//   try {
//     const { sort, order, page } = req.body;
//     const currentPage = page || 1;
//     const perPage = 6;

//     const products = await ProductModel.find({})
//       .skip((currentPage - 1) * perPage)
//       .populate("category")
//       .populate("subcategory")
//       .sort([[sort, order]])
//       .limit(perPage);
//     res.json(products);
//   } catch (error) {
//     console.log(error);
//   }
// });

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

export default productRouter;

import express from "express";
import createError from "http-errors";
import PromoCodeModel from "./model.js";
import { JWTAuthMiddleware } from "../auth/JWTAuthMiddleware.js";
import { adminOnlyMiddleware } from "../auth/adminOnlyMiddleware.js";

const PromoCodeRouter = express.Router();

PromoCodeRouter.post(
  "/",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const { name, expiry, discount } = req.body.PromoCode;
      console.log("🚀 ~ file: index.js ~ line 16 ~ req.body.coupon", req.user);
      const code = new PromoCodeModel({
        name,
        expiry,
        discount,
      });
      await code.save();
      res.status(201).send(code);
    } catch (error) {
      next(error);
      console.log(error);
    }
  }
);

PromoCodeRouter.get("/", async (req, res, next) => {
  try {
    const code = await PromoCodeModel.find({}).sort({ createdAt: -1 });
    if (code) res.status(200).send(code);
  } catch (error) {
    next(error);
    console.log(error);
  }
});

PromoCodeRouter.delete(
  "/:codeId",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const code = await PromoCodeModel.findByIdAndDelete(req.params.codeId);
      if (code) res.status(204).send();
      else next(createError(404, `code not found!`));
    } catch (error) {
      next(error);
      console.log(error);
    }
  }
);

export default PromoCodeRouter;

import express from "express";
import { JWTAuthMiddleware } from "../auth/JWTAuthMiddleware.js";
import UsersModel from "../users/model.js";
import CartModel from "../cart/model.js";
import ProductModel from "../products/model.js";
import PromoCodeModel from "../promocode/model.js";
import Stripe from "stripe";
import createError from "http-errors";

const stripe = new Stripe(process.env.STRIPE_SECRET);

const stripeRouter = express.Router();

stripeRouter.post(
  "/create-payment-intent",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      console.log(req.body);
      const { codeApplied } = req.body;
      console.log(
        "🚀 ~ file: index.js ~ line 22222 ~ createPaymentIntent ~ req.body",
        codeApplied
      );

      const { _id } = req.user;

      const { cartTotal, totalAfterDiscount } = await CartModel.findOne({
        orderdBy: _id,
      });

      let finalAmount = 0;

      if (codeApplied && totalAfterDiscount) {
        finalAmount = totalAfterDiscount * 100;
      } else {
        finalAmount = cartTotal * 100;
      }

      // create payment intent with order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: finalAmount,
        currency: "eur",
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
        cartTotal,
        totalAfterDiscount,
        payable: finalAmount,
      });
    } catch (error) {
      next(error);
      console.log(error);
    }
  }
);

export default stripeRouter;

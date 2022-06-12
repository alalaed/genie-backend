import express from "express";
import passport from "passport";
import createError from "http-errors";
import usersModel from "./model.js";

import { generateAccessToken } from "../auth/tools.js";
import { JWTAuthMiddleware } from "../auth/JWTAuthMiddleware.js";
import { adminOnlyMiddleware } from "../auth/adminOnlyMiddleware.js";

const usersRouter = express.Router();

usersRouter.post("/cart", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const { cart } = req.body;
    const { _id } = req.user;

    const previousUserCart = await cartModel.findOne({ orderdBy: _id });

    if (previousUserCart) {
      previousUserCart.remove();
    }

    const products = [];

    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i]._id;
      object.count = cart[i].count;
      object.color = cart[i].color;
      let productFromDb = await productsModel
        .findById(cart[i]._id)
        .select("price");
      object.price = productFromDb.price;

      products.push(object);
      // console.log("🚀 ~ file: index.js ~ line 31 ~ products", products)
    }

    let cartTotal = 0;

    for (let i = 0; i < products.length; i++) {
      cartTotal = cartTotal + products[i].price * products[i].count;
    }
    // console.log("🚀 ~file: index.js ~line 47 ~cartTotal", cartTotal)

    const newCart = await new cartModel({
      products,
      cartTotal,
      orderdBy: _id,
      // totalAfterDiscount,
    });
    await newCart.save();
    // console.log("🚀 ~ file: index.js ~ line 59 ~ newCart", newCart)
    if (newCart) res.status(201).send(newCart);
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/cart", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const { _id } = req.user;

    const cart = await cartModel
      .findOne({ orderdBy: _id })
      .populate("products.product");
    console.log("🚀 ~ file: index.js ~ line 81 ~ cart", cart);

    res.status(201).send(cart);
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/cart", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const { _id } = req.user;

    const cart = await cartModel.findOneAndRemove({ orderdBy: _id });

    res.status(201).send(cart);
  } catch (error) {
    next(error);
  }
});

usersRouter.get(
  "/",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const users = await usersModel.find();
      res.send(users);
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = new usersModel(req.body);
    const { _id } = await newUser.save();
    console.log("saved");
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/login", async (req, res, next) => {
  try {
    console.log("req.body: ", req.body);
    const { email, password } = req.body;
    const user = await usersModel.checkCredentials(email, password);
    if (user) {
      const accessToken = await generateAccessToken({
        _id: user._id,
        role: user.role,
      });
      res.send({ user, accessToken });
    } else {
      next(createError(401, `Credentials are not valid!`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await usersModel.findById(req.user._id);
    if (user) {
      res.send(user);
    } else {
      next(401, `User with id ${req.user._id} not found!`);
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const modifiedUser = await usersModel.findByIdAndUpdate(
      req.user._id,
      req.body,
      {
        new: true,
      }
    );
    if (modifiedUser) {
      res.send(modifiedUser);
    } else {
      next(401, `User with id ${req.user._id} not found!`);
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const deletedUser = await usersModel.findByIdAndDelete(req.user._id);
    if (deletedUser) {
      res.send();
    } else {
      next(401, `User with id ${req.user._id} not found!`);
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get(
  "/googleLogin",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

usersRouter.get(
  "/googleRedirect",
  passport.authenticate("google"),
  async (req, res, next) => {
    try {
      console.log("Token: ", req.user.token);
      if (req.user.role === "Admin") {
        res.redirect(
          `${process.env.FE_URL}/adminDashboard?accessToken=${req.user.token}`
        );
      } else {
        res.redirect(
          `${process.env.FE_URL}/profile?accessToken=${req.user.token}`
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.get(
  "/:userId",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const user = await usersModel.findById(req.params.userId);
      if (user) {
        res.send(user);
      } else {
        next(createError(404, `User with id ${req.params.userId} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.put(
  "/:userId",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const updatedUser = await usersModel.findByIdAndUpdate(
        req.params.userId,
        req.body,
        { new: true, runValidators: true }
      );
      if (updatedUser) {
        res.send(updatedUser);
      } else {
        next(createError(404, `User with id ${req.user._id} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.delete(
  "/:userId",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const deletedUser = await usersModel.findByIdAndDelete(req.params.userId);
      if (deletedUser) {
        res.status(204).send();
      } else {
        next(createError(404, `User with id ${req.params.userId} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

export default usersRouter;

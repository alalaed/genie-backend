import express from "express";
import cloudinary from "cloudinary";
import { JWTAuthMiddleware } from "../auth/JWTAuthMiddleware.js";
import { adminOnlyMiddleware } from "../auth/adminOnlyMiddleware.js";

const cloudinaryRouter = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

cloudinaryRouter.post(
  "/uploadImages",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      let result = await cloudinary.uploader.upload(req.body.image, {
        public_id: `${Date.now}`,
        resource_type: "auto",
      });
      res.json({
        public_id: result.public_id,
        url: result.secure_url,
      });
    } catch (error) {
      next(error);
    }
  }
);
cloudinaryRouter.post(
  "/removeImage",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  (req, res, next) => {
    try {
      let image_id = req.body.id;
      cloudinary.uploader.destroy(image_id, (err, result) => {
        if (err) return res.json({ success: false, err });
        res.send("done!");
        console.log("done");
      });
    } catch (error) {
      next(error);
      console.log(error);
    }
  }
);

export default cloudinaryRouter;

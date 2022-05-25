import createError from "http-errors";

export const adminOnlyMiddleware = (req, res, next) => {
  if (req.user.role[0] === "Admin") {
    next();
  } else {
    next(createError(403, "Admin Only Endpoint!"));
    console.log(req.user.role[0]);
  }
};
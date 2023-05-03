const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { sendError } = require("../utils/helpers");

exports.isAuth = async (req, res, next) => {
  const token = req.headers?.authorization;
  if (!token) return sendError(res, "Token Not found!");
  const jwtToken = token.split("Bearer ")[1];

  if (!jwtToken) return sendError(res, "Invalid Token!");
  const decode = jwt.verify(jwtToken, process.env.JWT_SECRET);
  const { userId } = decode;
  //console.log(userId);
  const user = await User.findById(userId);
  if (!user) return sendError(res, "Invalid token user not found", 404);

  req.user = user;
  next();
};

exports.isAdmin = (req, res, next) => {
  const { user } = req;

  if (user.role !== "admin") return sendError(res, "Unauthorized Access!");

  next();
};

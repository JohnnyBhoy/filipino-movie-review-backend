const { isValidObjectId } = require("mongoose");
const PasswordResetToken = require("../models/passwordResetToken");
const { sendError } = require("../utils/helpers");

exports.isValidPassResetToken = async (req, res, next) => {
  const { token, userId } = req.body;

  if (!token.trim()) return sendError(res, "Invalid Request!");

  const resetToken = await PasswordResetToken.findOne({ onwer: userId });
  if (!resetToken) return sendError(res, "Unauthorized Access!");

  const matched = await resetToken.compareToken(token);
  if (!matched) return sendError(res, "Unauthorized Access, invalid request!");

  req.resetToken = resetToken;

  next();
};

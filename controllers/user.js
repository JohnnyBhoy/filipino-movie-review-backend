const jwt = require("jsonwebtoken");
const User = require("../models/user");
const EmailVerificationToken = require("../models/emailVerificationToken");
const PasswordResetToken = require("../models/passwordResetToken");
//const nodemailer = require("nodemailer");
const { isValidObjectId } = require("mongoose");
const { generateOTP, generateMailTransporter } = require("../utils/mail");
const { sendError, generateRandomByte } = require("../utils/helpers");
//const { reset } = require("nodemon");

exports.create = async (req, res) => {
  const { name, email, password } = req.body;

  const oldUser = await User.findOne({ email });
  if (oldUser) return sendError(res, "Email already exist!", 401);

  const newUser = new User({ name, email, password });
  await newUser.save();

  //generate 6-digits OTP
  let OTP = generateOTP();

  const newEmailVerificationToken = new EmailVerificationToken({
    owner: newUser._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();

  //email transported
  var transport = generateMailTransporter();

  transport.sendMail({
    from: "verification@Johnny.com",
    to: newUser.email,
    subject: "Email Verification",
    html: `
        <p>Your verification OTP</p>
        <h1>${OTP}</h1>
        `,
  });

  res.status(201).json({
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    },
  });
};

exports.verifyEmail = async (req, res) => {
  const { userId, OTP } = req.body;

  if (!isValidObjectId(userId)) return sendError(res, "Invalid user!");
  const user = await User.findById(userId);

  if (!user) return res.json({ error: "User not found" });
  if (user.isVerified) return sendError(res, "User is already verified");

  const token = await EmailVerificationToken.findOne({ owner: userId });

  if (!token) return sendError(res, "Token not found");

  const isMatched = await token.compareToken(OTP);

  if (!isMatched) return sendError(res, "Please submit a valid OTP");

  user.isVerified = true;
  await user.save();

  await EmailVerificationToken.findByIdAndDelete(token._id);

  var transport = generateMailTransporter();

  transport.sendMail({
    from: "verification@Johnny.com",
    to: user.email,
    subject: "Welcome Email",
    html: `
        <h1>Welcome to our app and thanks for choosing us</h1>
        <h5>Email / Username : <b>${user.email}</b> </h5>
        <h5>Your Password    : <b> ${user.password}</b> </h5>
        `,
  });

  const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      token: jwtToken,
    },
    message: "Your email is verified!",
  });
};

exports.resendEmailVerificationToken = async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);
  if (!user) return sendError(res, "User is Not Found");
  if (user.isVerified) return sendError(res, "User is already verified");
  const hasAlreadyToken = await EmailVerificationToken.findOne({
    owner: userId,
  });
  if (hasAlreadyToken)
    return sendError(res, "Token can be resend after 1 hour");

  let OTP = generateOTP();

  const newEmailVerificationToken = new EmailVerificationToken({
    owner: user._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();

  var transport = generateMailTransporter();

  transport.sendMail({
    from: "verification@Johnny.com",
    to: user.email,
    subject: "Email Verification",
    html: `
        <p>Your verification OTP</p>
        <h1>${OTP}</h1>
        `,
  });

  return res.json({
    message: "New token send to your email, PLease check your email",
  });
};

exports.forgetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return sendError(res, "Email is missing");

  const user = await User.findOne({ email });
  if (!user) return sendError(res, "User does not exist", 404);

  const alreadyHasToken = await PasswordResetToken.findOne({ owner: user._id });
  if (alreadyHasToken)
    return sendError(res, "You can request new token after 1 hour");

  const token = await generateRandomByte();
  const newPasswordResetToken = await PasswordResetToken({
    owner: user._id,
    token,
  });
  await newPasswordResetToken.save();

  const resetUrl = `http://localhost:3000/auth/reset-password?token=${token}&id=${user._id}`;

  var transport = generateMailTransporter();

  transport.sendMail({
    from: "security@Johnny.com",
    to: user.email,
    subject: "Reset Password Link",
    html: `
        <p>Click here to reset Password.</p>
        <a href='${resetUrl}'>Change Password</a>
        `,
  });

  res.json({ message: "Link sent to your email" });
};

exports.sendResetTokenStatus = (req, res) => {
  res.json({ valid: true });
};

exports.resetPassword = async (req, res) => {
  const { newPassword, userId } = req.body;

  const user = await User.findById(userId);

  const matched = await user.comparePassword(newPassword);

  if (matched)
    return sendError(
      res,
      "The new password must be different from the old one!"
    );

  user.password = newPassword;
  await user.save();

  await PasswordResetToken.findByIdAndDelete(req.resetToken._id);

  const transport = generateMailTransporter();

  transport.sendMail({
    from: "security@Johnny.com",
    to: user.email,
    subject: "Password Reset Successfully!",
    html: `
        <h1>Password Reset Successfully!</h1>
        <p>Now you can use your new password </p>
        `,
  });

  res.json({
    message: "Password reset successfully!, now you can use your new password",
  });
};

exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return sendError(res, "Email/Password is invalid");

  const matched = await user.comparePassword(password);
  if (!matched) return sendError(res, "Email/Password is invalid");

  const { _id, name, role, isVerified } = user;

  const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

  return res.json({
    user: { id: _id, name, email, role, token: jwtToken, isVerified },
  });
};

const { compareSync } = require("bcrypt");
const { check, validationResult } = require("express-validator");
const genres = require("../utils/genres");
const { isValidObjectId } = require("mongoose");

exports.userValidator = [
  check("name").trim().not().isEmpty().withMessage("name is missing"),
  check("email").normalizeEmail().isEmail().withMessage("email is invalid"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("password is missing")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must 8 t0 20 character long"),
];

exports.validatePassword = [
  check("newPassword")
    .trim()
    .not()
    .isEmpty()
    .withMessage("password is missing")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must 8 t0 20 character long"),
];

exports.validateMovie = [
  check("title").trim().not().isEmpty().withMessage("Movie title is Missing"),
  check("language")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Language title is Missing"),
  check("storyLine")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Movie title is Important"),
  check("releaseDate").isDate().withMessage("Release Date is Important"),
  check("status")
    .isIn(["private", "public"])
    .withMessage("Movie Status is must be public or private"),
  check("type").trim().not().isEmpty().withMessage("Movie type is required"),
  check("genres")
    .isArray()
    .withMessage("Genres must be lists")
    .custom((value) => {
      for (let g of value) {
        if (!genres.includes(g)) throw Error("Invalid Genre");
        return true;
      }
    }),
  check("tags")
    .isArray({ min: 1 })
    .withMessage("Tags must be list of tags!")
    .custom((tags) => {
      for (let tag of tags) {
        if (typeof tag !== "string")
          throw Error("Invalid Tags must be strings");
        return true;
      }
    }),
  check("cast")
    .isArray()
    .withMessage("Cast must be an array of objects!")
    .custom((cast) => {
      console.log(!isValidObjectId(cast.actor));
      for (let c of cast) {
        //if (isValidObjectId(c.actor))
        //throw Error("Invalid cast id inside cast!");
        if (!c.roleAs?.trim()) throw Error("Role as is missing inside cast!");
        if (typeof c.leadActor !== "boolean")
          throw Error(
            "Only accepted boolean value inside leadActor inside cast!"
          );
      }

      return true;
    }),
  check("trailer")
    .isObject()
    .withMessage("Trailer info must be Object")
    .custom(({ url, public_id }) => {
      try {
        const result = new URL(url);
        if (!result.protocol.includes("https"))
          throw Error("Trailer Url is invalids!");

        const arr = url.split("/");
        const publicId = arr[arr.length - 1].split(".")[0];

        if (publicId !== public_id) throw Error("Public Id is Invalid!");

        return true;
      } catch (error) {
        throw Error("Trailer Url is invalid!");
      }
    }),
  //check("poster").custom((_, { req }) => {
  //if (!req.file) throw Error("Poster File is missing!");
  //return true;
  //}),
];

exports.validate = (req, res, next) => {
  const error = validationResult(req).array();
  if (error.length) {
    return res.json({ error: error[0].msg });
  }
  next();
};

exports.actorInfoValidator = [
  check("name").trim().not().isEmpty().withMessage("Actor name is missing!"),
  check("about").trim().not().isEmpty().withMessage("About name is required!"),
  check("gender")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Gender name is required!"),
];

exports.signInValidator = [
  check("email").normalizeEmail().isEmail().withMessage("email is invalid"),
  check("password").trim().not().isEmpty().withMessage("password is missing"),
];

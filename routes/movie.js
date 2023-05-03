const express = require("express");
const {
  uploadTrailer,
  createMovie,
  updateMovieWithoutPoster,
  updateMovieWithPoster,
  getMovies,
  removeMovie,
} = require("../controllers/movie");
const { isAuth, isAdmin } = require("../middlewares/auth");
const { uploadVideo, uploadImage } = require("../middlewares/multer");
const { validateMovie, validate } = require("../middlewares/validator");
const Movie = require("../models/movie");
const { parseData } = require("../utils/helpers");

const router = express.Router();

router.post(
  "/upload-trailer",
  isAuth,
  isAdmin,
  uploadVideo.single("video"),
  uploadTrailer
);

router.post(
  "/create",
  isAuth,
  isAdmin,
  uploadVideo.single("poster"),
  parseData,
  //validateMovie,
  //validate,
  createMovie
);

router.patch(
  "/update-movie-without-poster/:movieId",
  isAuth,
  isAdmin,
  validateMovie,
  validate,
  updateMovieWithoutPoster
);

router.patch(
  "/update-movie-with-poster/:movieId",
  isAuth,
  isAdmin,
  uploadImage.single("poster"),
  parseData,
  validateMovie,
  validate,
  updateMovieWithPoster
);

router.delete("/:movieId", isAuth, isAdmin, removeMovie);
router.get("/movies", isAuth, isAdmin, getMovies);

module.exports = router;

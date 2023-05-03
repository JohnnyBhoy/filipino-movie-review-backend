const Movie = require("../models/movie");
const Actor = require("../models/actor");
const User = require("../models/user");

exports.getAppInfo = async (req, res) => {
  const movieCount = await Movie.countDocuments();
  const actorCount = await Actor.countDocuments();
  const userCount = await User.countDocuments();

  res.json({ appInfo: { movieCount, actorCount, userCount } });
};

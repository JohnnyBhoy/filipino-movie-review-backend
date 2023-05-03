const cloudinary = require("cloudinary").v2;

// Configuration
cloudinary.config({
  cloud_name: "dqxmzolmb",
  api_key: "156746478885699",
  api_secret: "GwjgYsx6sM1bX_dyonMRzpps6mE",
  secure: true,
});

module.exports = cloudinary;

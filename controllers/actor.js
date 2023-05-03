const { isValidObjectId } = require("mongoose");
const { format } = require("morgan");
const cloudinary = require("../cloud");
const Actor = require("../models/actor");
const {
  sendError,
  uploadImageToCloud,
  formatActor,
} = require("../utils/helpers");

exports.createActor = async (req, res) => {
  const { name, about, gender } = req.body;
  const { file } = req;

  const newActor = new Actor({ name, about, gender });
  if (file) {
    const { url, public_id } = await uploadImageToCloud(file.path);
    newActor.avatar = { url, public_id };
  }

  await newActor.save();
  res.status(200).json({
    id: newActor._id,
    name,
    about,
    gender,
    avatar: newActor.avatar?.url,
  });
};

exports.updateActor = async (req, res) => {
  const { name, about, gender } = req.body;
  const { file } = req;
  const { actorId } = req.params;

  if (!isValidObjectId(actorId)) return sendError(res, "Invalid Request!.");
  const actor = await Actor.findById(actorId);
  if (!actor) sendError(res, "Actor not found!");

  const public_id = actor.avatar?.public_id;

  //remove old image if exist
  if (public_id && file) {
    const { result } = await cloudinary.uploader.destroy(public_id);
    if (result !== "ok") {
      return sendError(res, "Could not remove old image from the cloud");
    }
  }
  //upload new image after remove
  if (file) {
    const { url, public_id } = await uploadImageToCloud(file.path);
    actor.avatar = { url, public_id };
  }

  //set the value of actor;
  actor.name = name;
  actor.about = about;
  actor.gender = gender;

  //save Actor
  await actor.save();
  res.status(201).json({ actor: formatActor(actor) });
};

exports.removeActor = async (req, res) => {
  const { actorId } = req.params;

  if (!isValidObjectId) return sendError(res, "Invalid Request");

  const actorRemove = await Actor.findById(actorId);
  if (!actorRemove) return sendError(res, "Invalid Request, Actor not found!");

  const public_id = actorRemove.avatar?.public_id;

  //remove old image if exist
  if (public_id) {
    const { result } = await cloudinary.uploader.destroy(public_id);
    if (result !== "ok") {
      return sendError(res, "Could not remove old image from the cloud");
    }
  }

  await Actor.findByIdAndDelete(actorId);

  res.json({ message: "Actor removed successfully!" });
};

exports.searchActor = async (req, res) => {
  const { query } = req;
  const result = await Actor.find({ $text: { $search: `"${query.name}"` } });

  if (result.length == 0) {
    return sendError(res, "Actor Not Found");
  }

  const results = result.map((actor) => formatActor(actor));
  res.json({ results });
};

exports.latestActor = async (req, res) => {
  const result = await Actor.find().sort({ createdAt: "-1" }).limit(12);
  /* if (result !== "ok") {
    return sendError(res, "Actor not found!");
  }*/
  res.json(result);
};

exports.singleActor = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) return sendError(res, "Invalid request!");

  const actor = await Actor.findById(id);
  if (!actor) return sendError(res, "Actor not found!", 404);

  res.json(actor);
};

exports.getActors = async (req, res) => {
  const { pageNo, limit } = req.query;

  const actors = await Actor.find({})
    .sort({ createdAt: -1 })
    .skip(parseInt(pageNo) * parseInt(limit))
    .limit(parseInt(limit));

  const profiles = actors.map((actor) => formatActor(actor));

  res.json({ profiles });
};

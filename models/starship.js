const mongoose = require("mongoose");

const starshipSchema = new mongoose.Schema({
  name: { type: String, required: true },
  captain: { type: String, required: true },
  class: { type: String, required: true },
  crewSize: { type: Number, required: true },
});

const Starship = mongoose.model("Starship", starshipSchema);
module.exports = Starship;

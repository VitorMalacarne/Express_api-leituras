const mongoose = require("mongoose");

const LeituraSchema = new mongoose.Schema({
  idSensor: { type: String, require: true },
  tipoSensor: { type: String, require: true },
  leitura: { type: String, require: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Leitura", LeituraSchema, "leitura");

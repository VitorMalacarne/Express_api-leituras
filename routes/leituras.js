var express = require("express");
const Leitura = require("../models/Leitura");
const { default: mongoose } = require("mongoose");
const isAutenticated = require("../middlewares/isAutenticated");
var router = express.Router();

router.get("/", isAutenticated, async function (req, res, next) {
  return res.json(await Leitura.find());
});

router.get("/:id", isAutenticated, async (req, res) => {
  const { id } = req.params;

  let _id = null;

  try {
    _id = new mongoose.Types.ObjectId(id);
  } catch (e) {
    return res.status(400).json({ message: "ID inválido" });
  }

  const leitura = await Leitura.findById(id);

  return leitura
    ? res.json(leitura)
    : res.status(404).json({ message: "Leitura não encontrada." });
});

router.post("/", async (req, res) => {
  const json = req.body;

  const leitura = new Leitura(json);

  const error = leitura.validateSync();

  return error ? res.status(400).json(error) : res.json(await leitura.save());
});

router.put("/:id", isAutenticated, async (req, res) => {
  const { id } = req.params;
  const json = req.body;

  const leitura = await Leitura.findByIdAndUpdate(id, json, { new: true });

  return leitura
    ? res.json(leitura)
    : res.status(404).json({ message: "Leitura não encontrada." });
});

router.delete("/:id", isAutenticated, async (req, res) => {
  const { id } = req.params;

  const leitura = await Leitura.findByIdAndDelete(id);

  return leitura
    ? res.json({ message: "Leitura deletada com sucesso." })
    : res.status(404).json({ message: "Leitura não encontrada." });
});

module.exports = router;

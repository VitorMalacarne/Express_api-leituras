const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const { connectRabbitMQ } = require("./services/messaging");

require("dotenv").config();

const { MONGO_URL } = process.env;

mongoose
  .connect(MONGO_URL, {
    minPoolSize: 10,
    socketTimeoutMS: 60000,
  })
  .then(() => {
    console.log("Conectado ao banco com sucesso!");
    connectRabbitMQ();
  })
  .catch((e) => {
    console.log("Erro ao conectar com o banco. " + e);
  });

var indexRouter = require("./routes/index");
var leiturasRouter = require("./routes/leituras");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/leituras", leiturasRouter);
app.use((err, req, res, next) => {
  console.error("Erro inesperado:", err);
  res.status(500).json({ error: "Erro interno do servidor" });
});

module.exports = app;

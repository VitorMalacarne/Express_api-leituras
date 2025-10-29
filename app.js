const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");

require("dotenv").config();

const { MONGO_URL } = process.env;

mongoose
  .connect(MONGO_URL, {
    minPoolSize: 10,
    socketTimeoutMS: 60000,
  })
  .then(() => {
    console.log("Conectado ao banco com sucesso!");
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

module.exports = app;

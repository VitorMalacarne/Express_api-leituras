const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const fs = require("fs");

require("dotenv").config();

function extractMongoFromDotEnv(envPath) {
  try {
    const content = fs.readFileSync(envPath, "utf8");
    const lines = content
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    // procura por MONGO_URL=... primeiro
    for (const line of lines) {
      if (line.startsWith("MONGO_URL=")) {
        return line.split("=").slice(1).join("=").trim();
      }
    }
    // se não encontrou, se a primeira linha parecer uma URI mongodb, retorna ela
    if (lines.length > 0 && lines[0].startsWith("mongodb")) {
      return lines[0];
    }
  } catch (err) {
    // arquivo pode não existir - silencioso
  }
  return null;
}

function extractMongoFromDockerfile(dockerfilePath) {
  try {
    const content = fs.readFileSync(dockerfilePath, "utf8");
    const lines = content.split(/\r?\n/);
    for (let line of lines) {
      line = line.trim();
      // suporta: ENV MONGO_URL=...  ou ARG MONGO_URL=...
      const envMatch =
        line.match(/^(ENV|ARG)\s+MONGO_URL\s*=\s*(.+)$/i) ||
        line.match(/^(ENV|ARG)\s+MONGO_URL\s+(.+)$/i);
      if (envMatch) {
        return envMatch[2].trim();
      }
    }
  } catch (err) {
    // arquivo pode não existir - silencioso
  }
  return null;
}

async function connectWithFallback() {
  const candidates = [];

  // 1) process.env
  if (process.env.MONGO_URL) {
    candidates.push(process.env.MONGO_URL);
  }

  // 2) .env (suporta tanto MONGO_URL=... quanto arquivo contendo só a URI)
  const dotEnvPath = path.resolve(process.cwd(), ".env");
  const fromDotEnv = extractMongoFromDotEnv(dotEnvPath);
  if (fromDotEnv && !candidates.includes(fromDotEnv)) {
    candidates.push(fromDotEnv);
  }

  // 3) Dockerfile
  const dockerfilePath = path.resolve(process.cwd(), "Dockerfile");
  const fromDocker = extractMongoFromDockerfile(dockerfilePath);
  if (fromDocker && !candidates.includes(fromDocker)) {
    candidates.push(fromDocker);
  }

  if (candidates.length === 0) {
    console.error(
      "Nenhuma URL do Mongo foi encontrada em process.env, .env ou Dockerfile."
    );
    return Promise.reject(new Error("Nenhuma URL do Mongo disponível"));
  }

  const options = {
    minPoolSize: 10,
    socketTimeoutMS: 60000,
    // outras opções se precisar
  };

  let lastError = null;
  for (const url of candidates) {
    console.log(`Tentando conectar ao Mongo em: ${url}`);
    try {
      await mongoose.connect(url, options);
      console.log("Conectado ao banco com sucesso!");
      return Promise.resolve();
    } catch (err) {
      console.warn(`Falha ao conectar usando ${url}: ${err.message}`);
      lastError = err;
    }
  }

  console.error(
    "Não foi possível conectar ao Mongo usando as URLs disponíveis."
  );
  return Promise.reject(lastError);
}

// Executa a tentativa de conexão
connectWithFallback().catch((e) => {
  console.log("Erro ao conectar com o banco. " + e);
  // opcional: encerrar o processo se preferir que a app não inicie sem DB
  // process.exit(1);
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

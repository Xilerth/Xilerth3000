import express from "express";
import cors from "cors";
import { askGPT, celebPhrase, translate, randomUsers } from "./gpt.js";
import bodyParser from "body-parser";
import personalities from "../personalities.json" assert { type: "json" };
import requestIp from "request-ip";
import languages from "../languages.json" assert { type: "json" };
import fs from "fs";

const app = express();
app.use(requestIp.mw());
app.use(cors());
const port = process.env.PORT || 4000;

//maximo 2000 tokens por ip
const limitPerIP = {};

const limitTokensIP = 4000;

var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

//limpiar el limitPerIP cada 12 horas
function getLimitGPT() {
  return limitPerIP;
}

setInterval(() => {
  setLimitGPT({});
}, 1000 * 60 * 60 * 24);

//app listen port 4000;
export const setupExpress = () => {
  app.listen(port, () => {
    console.log("Server running on port " + port);
  });

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.get("/personalities", (req, res) => {
    res.send(personalities.map((personality) => personality.personality));
  });

  app.post("/askGPT", jsonParser, async (req, res) => {
    const ip =
      req.headers["x-forwarded-for"] || req.socket.remoteAddres || req.clientIp;
    if (checkIfLimitIsReached(ip)) {
      res.send({
        total_tokens: 0,
        content:
          "Has alcanzado el limite de tokens por IP, vuelve mañana 👮🚓🚨🚨",
        personality: "Guardia de Seguridad de la API",
        ip,
      });
      return;
    }
    const { message, language } = req.body;
    const personalityBody = req.body.personality;
    const { total_tokens, content, personality } = await askGPT(
      message,
      personalityBody,
      language
    );
    updateLimit(ip, total_tokens);
    res.send({
      total_tokens,
      content,
      personality,
      ip,
      limitPerIP: limitPerIP[ip],
    });
  });

  app.post("/translate", jsonParser, async (req, res) => {
    const { message, language, context } = req.body;
    const { content } = await translate(message, language, context);
    res.send({
      content,
    });
  });

  app.post("/randomUsers", jsonParser, async (req, res) => {
    const { userList, count } = req.body;
    const { content, errors } = await randomUsers(userList, count);
    res.send({
      content,
      errors,
    });
  });

  app.post("/removeLimitForIP", jsonParser, async (req, res) => {
    const ip = req.body.ip;
    if (ip == undefined) {
      res.send({ message: "No se ha especificado la ip" });
      return;
    }
    if (limitPerIP[ip] == undefined) {
      res.send({ message: "La ip no existe" });
      return;
    }
    delete limitPerIP[ip];
    res.send({ message: "La ip ha sido eliminada" });
  });

  app.get("/getCurrentTokens", (req, res) => {
    const ip =
      req.headers["x-forwarded-for"] || req.socket.remoteAddres || req.clientIp;
    if (getLimitGPT()[ip] == undefined) {
      res.send({ limitPerIP: 0 });
      return;
    }

    res.send({ limitPerIP: getLimitGPT()[ip] });
  });

  app.get("/celebPhrase", async (req, res) => {
    const { content } = await celebPhrase();
    res.send({ content });
  });

  app.get("/languages", (req, res) => {
    res.send(languages);
  });
};

function checkIfLimitIsReached(ip) {
  if (limitPerIP[ip] == undefined) {
    limitPerIP[ip] = 0;
    return false;
  }

  if (limitPerIP[ip] >= limitTokensIP) {
    return true;
  } else {
    return false;
  }
}

function updateLimit(ip, total_tokens) {
  if (limitPerIP[ip] == undefined) {
    limitPerIP[ip] = 0;
  }
  limitPerIP[ip] += total_tokens;
}

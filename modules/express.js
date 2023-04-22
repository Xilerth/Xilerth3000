import express from "express";
import cors from "cors";
import { askGPT } from "./gpt.js";
import bodyParser from "body-parser";
import personalities from "../personalities.json" assert { type: "json" };
import requestIp from 'request-ip';

const app = express();
app.use(requestIp.mw())
app.use(cors());
const port = process.env.PORT || 4000;

var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

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
    console.log(req.body);
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddres || req.clientIp;
    console.log(ip);
    const { message, language} = req.body;
    const personalityBody = req.body.personality;
    const { total_tokens, content, personality } = await askGPT(
      message,
      personalityBody,
      language
    );
    res.send({ total_tokens, content, personality, ip });
  });
};

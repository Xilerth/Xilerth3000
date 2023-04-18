import express from "express";
import cors from "cors";
import { askGPT } from "./gpt.js";
import bodyParser from "body-parser";
const app = express();
app.use(cors());

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

//app listen port 3000;
export const setupExpress = () => {
  app.listen(3005, () => {
    console.log("Server running on port 3005");
  });

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.post("/askGPT",jsonParser, async (req, res) => {
    console.log(req.body)
    const { message } = req.body;
    const { total_tokens, content, personality } = await askGPT(message);
    res.send({ total_tokens, content, personality });
  });
};

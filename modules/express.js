import express from "express";
import cors from "cors";
import { askGPT } from "./gpt.js";
import bodyParser from "body-parser";
const app = express();
app.use(cors());
const port = process.env.PORT || 4000;

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

//app listen port 4000;
export const setupExpress = () => {
  app.listen(port, () => {
    console.log("Server running on port" + PORT);
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

import tmi from "tmi.js";
import dotenv from "dotenv";
import process from "node:process";
import IGNORED_USERS from "./ignoredUsers.json" assert { type: "json" };
import { askGPT } from "./modules/gpt.js";
import { setupExpress } from "./modules/express.js";

dotenv.config();
setupExpress();

const USER = process.env.USER;
const PASSWORD = process.env.PASSWORD;
const CHANNELS = ["xilerth"];
let enabled = false;

const client = new tmi.Client({
  identity: {
    username: USER,
    password: PASSWORD,
  },
  connection: {
    secure: true,
    reconnect: true,
  },
  channels: CHANNELS,
});

client.connect();
client.on("message", async (channel, tags, message, self) => {
  if (self) return;

  const username = tags.username;
  const displayName = tags["display-name"];

  const isFirstMessage = Boolean(tags["first-msg"]);
  const isMod = Boolean(tags.mod);
  const isSubscriber = Boolean(tags.subscriber);
  const isTurbo = Boolean(tags.turbo);
  const isVip = Boolean(tags.vip);

  if (IGNORED_USERS.includes(username)) return;

  //check if message is a command 
  if (message.startsWith("!stop") && username === "xilerth" || isMod) {
    enabled = false;
    client.say(channel, "Modo off");
    return;
  };

  //if start y es un mod o es el streamer
  if (message.startsWith("!start") && username === "xilerth" || isMod) {
    enabled = true;
    client.say(channel, "Modo on");
    return;
  }

  if(!enabled){
    return;
  }

  const isChosen = Math.floor(Math.random() * 5) === 0;

  if (!isChosen) {
    return;
  }

  const { total_tokens, content, personality } = await askGPT(message);
  console.log(`${content} (${total_tokens} tokens)`);
  client.say(channel, `[Modo ${personality}] @${displayName}, ${content}`);
});

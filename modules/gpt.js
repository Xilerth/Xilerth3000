import dotenv from "dotenv";
import process from "node:process";
import { getPersonality } from "./getPersonality.js";
import languages from "../languages.json" assert { type: "json" };

dotenv.config({ path: "../.env" });

const trim = (message) => message.trim().replace(/^"|"$|/g, "");

export const askGPT = async (message, personalityInput, language) => {
  const GPT_KEY = process.env.GPT_KEY;
  const MAX_CHARACTERS = 200;
  const MODEL = "gpt-3.5-turbo";
  const API_URL = `https://api.openai.com/v1/chat/completions`;

  const { personality, context, preferences } =
    getPersonality(personalityInput);
  const cleanMessage = message?.replaceAll(`"`, "'");

  let prompt = `Imagina que eres un usuario de Twitch y otro usuario te dice "${cleanMessage}". ${context} ${preferences}. El contexto del chat es Tematica de programación. Máximo ${MAX_CHARACTERS} caracteres.`;

  if (language) {
    prompt = `${prompt}. El idioma del chat es ${language}.`;
  }

  // calcula cantidad de tokens del prompt

  if (totalTokens(prompt) > 4000) {
    return {
      total_tokens: 0,
      personality: "Policia del prompt",
      content: "CUIDADO! El prompt excede los 4000 tokens",
    };
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${GPT_KEY}`,
  };

  const body = {
    messages: [
      {
        role: "user",
        content: trim(prompt),
      },
    ],
    model: MODEL,
    max_tokens: MAX_CHARACTERS,
    n: 1,
    stop: null,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await response.json();

    const { total_tokens } = data.usage;
    const { content } = data.choices[0].message;

    return {
      total_tokens,
      personality,
      content: trim(content),
    };
  } catch (error) {
    console.error(error);
    return "Error al generar respuesta";
  }

  function totalTokens(prompt) {
    const tokens = prompt.replaceAll(" ", "").length / 2;
    return tokens;
  }
};

export const celebPhrase = async () => {
  const GPT_KEY = process.env.GPT_KEY;
  const MAX_CHARACTERS = 200;
  const MODEL = "gpt-3.5-turbo";
  const API_URL = `https://api.openai.com/v1/chat/completions`;
  let prompt = `Generame una frase celebre sobre la programacion de maximo 10 palabras, en Español.`;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${GPT_KEY}`,
  };

  const body = {
    messages: [
      {
        role: "user",
        content: trim(prompt),
      },
    ],
    model: MODEL,
    max_tokens: MAX_CHARACTERS,
    n: 1,
    stop: null,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await response.json();
    const { content } = data.choices[0].message;

    return {
      content: trim(content),
    };
  } catch (error) {
    console.error(error);
    return "Error al generar respuesta";
  }
};

export const translate = async (message, language, context) => {
  const GPT_KEY = process.env.GPT_KEY;
  const MODEL = "gpt-3.5-turbo";
  const API_URL = `https://api.openai.com/v1/chat/completions`;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${GPT_KEY}`,
  };
  let promptContext = "";

  if (context) {
    promptContext = `${context}.`;
  }

  if (language) {
    language = languages.find(
      (l) => l.code.toLowerCase() === language?.toLowerCase()
    )?.name;
  }

  const body = {
    messages: [
      {
        role: "user",
        content: trim(
          `Traduce "${message}" al ${language}. ${promptContext}. Solo responde con la traducción, no añadas explicaciones.`
        ),
      },
    ],
    model: MODEL,
    n: 1,
    stop: null,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await response.json();
    const { choices } = data;
    const { message } = choices[0];
    const { content } = message;
    return {
      content: trim(content),
    };
  } catch (error) {
    console.error(error);
    return "Error al generar respuesta";
  }
};

import personalities from "../personalities.json" assert { type: "json" };

export const getPersonality = (personalityInput) => {
  return (
    personalities.find((p) => p.personality.toLowerCase() === personalityInput?.toLowerCase()) ||
    personalities[Math.floor(Math.random() * personalities.length)]
  );
};

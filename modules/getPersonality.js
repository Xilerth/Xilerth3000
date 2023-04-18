import personalities from '../personalities.json' assert { type: "json" };

export const getPersonality = () => {
    const personality = personalities[Math.floor(Math.random() * personalities.length)];
    return personality;
}
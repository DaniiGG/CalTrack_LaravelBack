import * as functions from "firebase-functions";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";

// Inicializa la IA (solo backend)
const ai = getAI(); // ❌ no pases app ni backend
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });

// Función HTTPS
export const generateCombo = functions.https.onRequest(async (req, res) => {
  try {
    const { level } = req.body; // nivel del usuario
    const prompt = `Crea un combo de calistenia para nivel ${level}, con ejercicios variados y sus repeticiones. Devuelve un JSON con "exercise" y "reps".`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: "No se pudo parsear la respuesta de la IA", raw: text };
    }

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

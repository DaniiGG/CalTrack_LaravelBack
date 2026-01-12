import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../../firebase";

const functions = getFunctions(app);
const aiCoach = httpsCallable(functions, "aiCoach");

export async function getAIFeedback(summary: string) {
  const res = await aiCoach({ summary });
  return (res.data as { text: string }).text;
}
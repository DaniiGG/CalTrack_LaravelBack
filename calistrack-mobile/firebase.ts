import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";


const firebaseConfig = {
  apiKey: "AIzaSyB7pXAQrQK3ngZNHt-Us3mDvnM7FyieAiE",
  authDomain: "caltrack-37bd0.firebaseapp.com",
  projectId: "caltrack-37bd0",
  storageBucket: "caltrack-37bd0.firebasestorage.app",
  messagingSenderId: "47749169922",
  appId: "1:47749169922:web:4a2f46014104f711c5781b"
};

export const app = initializeApp(firebaseConfig);

// Initialize the Gemini Developer API backend service
const ai = getAI(app, { backend: new GoogleAIBackend() });

// Create a `GenerativeModel` instance with a model that supports your use case
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });

async function run() {
  // Provide a prompt that contains text
  const prompt = "Write a story about a magic backpack."

  // To generate text output, call generateContent with the text input
  const result = await model.generateContent(prompt);

  const response = result.response;
  const text = response.text();
  console.log(text);
}

run();

export const auth = getAuth(app);
export const db = getFirestore(app);

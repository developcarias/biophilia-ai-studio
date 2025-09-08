
import { GoogleGenAI } from "@google/genai";

// Safely get API_KEY, will be undefined in browser unless polyfilled/configured
const API_KEY = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  // In a real app, you might want to handle this more gracefully.
  // For this example, we'll throw an error if the key is missing.
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

export const generateText = async (prompt: string, language: 'en' | 'es'): Promise<string> => {
  if (!ai) {
    return "AI service is unavailable. Please configure the API key.";
  }
  
  const languageName = language === 'es' ? 'Spanish' : 'English';

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are a professional copywriter for an environmental non-profit foundation named Biophilia. Write content that is inspiring, hopeful, clear, and action-oriented. Keep paragraphs concise. Your response MUST be in ${languageName}.`,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating text with Gemini:", error);
    if (error instanceof Error) {
        return `Error from AI service: ${error.message}`;
    }
    return "An unknown error occurred while contacting the AI service.";
  }
};


import { GoogleGenAI } from "@google/genai";

export const getGeminiResponse = async (userMessage: string, history: { role: 'user' | 'model', text: string }[]) => {
  try {
    // Correct initialization as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';
    
    // Convert history format
    const contents = history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }));

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: "You are a friendly friend in a WhatsApp-like chat application named ZX Web. Your name is ZX Assistant. Keep your answers brief, casual, and helpful. Use emojis sparingly. Do not use Markdown formatting like bold or headers excessively, act like a real person texting.",
        temperature: 0.8,
        topP: 0.95,
      },
    });

    return response.text || "Sorry, I couldn't process that. Try again!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having a little trouble connecting. Check your internet!";
  }
};

import { GoogleGenAI } from "@google/genai";

let genAI: any = null;

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please set it in the 'Settings' menu.");
  }
  if (!genAI) {
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

export async function getTutorResponse(prompt: string, history: any[] = []) {
  try {
    const ai = getGenAI();
    const response = await ai.models.generateContent({ 
      model: "gemini-3-flash-preview",
      contents: [...history, { role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are Investo, a friendly expert investing tutor. Adapt your tone and detail level based on the user's request. If they ask for simple words, use analogies and bullet points. If they ask for detail, provide in-depth explanations. Always be encouraging and use examples. Keep responses concise but helpful."
      }
    });
    
    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Tutor Error:", error);
    throw error;
  }
}

export async function analyzeChart(imageData: string, prompt: string) {
  try {
    const ai = getGenAI();
    const imagePart = {
      inlineData: {
        data: imageData,
        mimeType: "image/png",
      },
    };
    const textPart = {
      text: prompt,
    };

    const response = await ai.models.generateContent({ 
      model: "gemini-3-flash-preview",
      contents: { parts: [imagePart, textPart] },
      config: {
        systemInstruction: "You are Investo, a chart analysis expert. Provide VERY BRIEF, bulleted analysis. Focus on key levels and trend only. Max 50 words."
      }
    });
    return response.text || "Could not analyze chart.";
  } catch (error) {
    console.error("Gemini Chart Analysis Error:", error);
    throw error;
  }
}

export async function getQuizExplanation(question: string, answer: string, isCorrect: boolean, correctAnswer?: string, baseExplanation?: string) {
  try {
    const ai = getGenAI();
    let promptText = `Question: ${question}\nUser answer: ${answer}\nResult: ${isCorrect ? 'Correct' : 'Incorrect'}`;
    if (!isCorrect && correctAnswer) {
      promptText += `\nThe correct answer is: ${correctAnswer}`;
    }
    if (baseExplanation) {
      promptText += `\nReference explanation: ${baseExplanation}`;
    }
    promptText += `\nProvide a friendly, very brief (1-2 sentence) explanation of the concept based on the reference if provided. Be encouraging.`;

    const response = await ai.models.generateContent({ 
      model: "gemini-3-flash-preview",
      contents: promptText,
      config: {
        systemInstruction: "You are Investo, a friendly investing tutor. Use the provided reference explanation to ensure factual accuracy. If no reference is provided, stick to standard financial facts. Keep it short."
      }
    });
    return response.text || "Keep learning!";
  } catch (error) {
    console.error("Gemini Quiz Explanation Error:", error);
    throw error;
  }
}

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseGasReceipt = async (base64Image: string): Promise<{ amount: number; date: string; note: string }> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = "Extract the total amount, date (YYYY-MM-DD), and a short vendor name from this gas receipt. Return JSON.";

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            date: { type: Type.STRING },
            vendor: { type: Type.STRING },
          },
          required: ["amount", "date"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const data = JSON.parse(text);
    return {
      amount: data.amount || 0,
      date: data.date || new Date().toISOString().split('T')[0],
      note: data.vendor || "Gas Receipt"
    };
  } catch (error) {
    console.error("Gemini Receipt Parse Error:", error);
    throw error;
  }
};

export const getCostAdvice = async (totalCost: number, peopleCount: number, currency: string = "USD") => {
    try {
        const model = 'gemini-2.5-flash';
        const prompt = `We have a car rental trip. Total cost is ${totalCost} ${currency}. There are ${peopleCount} unique people involved. Provide a short, friendly tips on how to manage this group expense fairly, and mentioned Zelle as a payment method. Keep it under 50 words.`;

        const response = await ai.models.generateContent({
            model,
            contents: prompt
        });
        return response.text;
    } catch (e) {
        console.error(e);
        return "Ensure everyone pays their share promptly!";
    }
}

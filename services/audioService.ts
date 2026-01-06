import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

export const generateCheerAudio = async (text: string): Promise<ArrayBuffer | null> => {
  if (!API_KEY) {
    console.error("API Key missing");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    // Updated prompt to guide the model towards a crowd/stadium atmosphere
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `(A huge stadium crowd shouting in unison with extreme joy and energy): ${text}!!!` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Fenrir' }, 
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (base64Audio) {
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    }
    return null;
  } catch (error) {
    console.error("Error generating audio:", error);
    return null;
  }
};

import { GoogleGenAI, Type } from "@google/genai";
import { DivisionalChart, YogaMatch, ChatMessage } from "../types";
import { VarshaphalaData } from "./astrologyService";

/**
 * Helper to execute API requests with exponential backoff for 429 errors.
 */
async function callGeminiWithRetry<T>(fn: () => Promise<T>, maxRetries = 4, initialDelay = 1500): Promise<T> {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      const errorMsg = error?.message || "";
      const isRateLimit = error?.status === 429 || 
                          errorMsg.includes("429") || 
                          errorMsg.includes("RESOURCE_EXHAUSTED") ||
                          errorMsg.includes("quota");
      
      const isKeyIssue = errorMsg.includes("Requested entity was not found") || 
                         errorMsg.includes("API_KEY_INVALID");

      if (isKeyIssue) {
        throw new Error("API_KEY_NOT_FOUND");
      }

      if (isRateLimit && attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.warn(`Gemini API Quota reached (429). Attempt ${attempt + 1}/${maxRetries}. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
        continue;
      }
      
      if (isRateLimit) {
        throw new Error("GEMINI_QUOTA_EXHAUSTED");
      }

      throw error;
    }
  }
  throw new Error("Max retries exceeded for Gemini API");
}

export const geminiService = {
  async getLocationSuggestions(query: string): Promise<string[]> {
    if (query.length < 3) return [];
    
    // Deterministic Mock for Demo purposes
    const lowQuery = query.toLowerCase();
    if (lowQuery.includes("indore")) return ["Indore, Madhya Pradesh, India", "Indore Junction, MP, India"];
    if (lowQuery.includes("delhi")) return ["New Delhi, Delhi, India", "Old Delhi, India"];

    return callGeminiWithRetry(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Act as a global location directory. Provide exactly 5 real-world city/place suggestions matching the query: "${query}". 
      Format: "City, State/Region, Country". Return as a plain JSON array of strings.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      
      try {
        return JSON.parse(response.text || "[]");
      } catch {
        return [];
      }
    });
  },

  async resolveLocation(query: string): Promise<{ lat: number, lng: number, tz: string, fullAddress: string }> {
    const lowQuery = query.toLowerCase();
    
    // Instant Resolve for Demo Locations
    if (lowQuery.includes("indore")) {
      return { lat: 22.7196, lng: 75.8577, tz: "Asia/Kolkata", fullAddress: "Indore, Madhya Pradesh, India" };
    }
    if (lowQuery.includes("delhi")) {
      return { lat: 28.6139, lng: 77.2090, tz: "Asia/Kolkata", fullAddress: "New Delhi, Delhi, India" };
    }

    return callGeminiWithRetry(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Act as a high-precision geocoding engine. Convert the following location query into exact coordinates and standard IANA timezone.
      Query: "${query}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              lat: { type: Type.NUMBER, description: "Decimal latitude" },
              lng: { type: Type.NUMBER, description: "Decimal longitude" },
              tz: { type: Type.STRING, description: "IANA Timezone ID" },
              fullAddress: { type: Type.STRING, description: "Standardized address" }
            },
            required: ["lat", "lng", "tz", "fullAddress"]
          }
        }
      });
      
      try {
        return JSON.parse(response.text || "{}");
      } catch {
        throw new Error("Resolution failed.");
      }
    });
  },

  async interpretChart(chart: DivisionalChart): Promise<string> {
    return callGeminiWithRetry(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Interpret the following Vedic Natal Chart (D1):
      ${JSON.stringify(chart.points)}
      Provide a professional analysis including Lagna characteristics, key planetary strengths, and life direction.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
      });
      return response.text || "Unable to interpret chart at this moment.";
    });
  },

  async interpretVarshaphala(data: VarshaphalaData): Promise<string> {
    return callGeminiWithRetry(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = {
        year: data.year,
        yearLord: data.yearLord,
        annualAscendant: data.ascendant,
        muntha: `${data.munthaSign} in House ${data.munthaHouse}`,
        yogas: data.yogas.map(y => y.name),
        sahams: data.sahams.map(s => s.name)
      };

      const prompt = `You are a world-class Tajika (Vedic Annual) Astrologer. 
      Interpret this Varshaphala Solar Return for the year ${data.year}.
      
      TECHNICAL CONTEXT:
      - Year Lord (Varsheshwar): ${context.yearLord}
      - Annual Lagna: ${context.annualAscendant}
      - Muntha (Focal Point): ${context.muntha}
      - Tajika Yogas: ${context.yogas.join(", ")}
      
      TASK:
      Provide a highly detailed annual forecast including Theme, Career, Assets, Heart, Vitality, and Remedial Protocols. Use Markdown.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
      });
      return response.text || "The annual cosmic transmission was interrupted.";
    });
  },

  async findYogas(chart: DivisionalChart): Promise<YogaMatch[]> {
    return callGeminiWithRetry(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analyze this Vedic Chart and identify at least 5 major Yogas (e.g., Gaja Kesari, Raja Yogas, Pancha Mahapurusha).
      Chart data: ${JSON.stringify(chart.points)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                rule: { type: Type.STRING },
                interpretation: { type: Type.STRING },
                strength: { type: Type.NUMBER },
                category: { type: Type.STRING }
              },
              required: ["name", "description", "rule", "interpretation", "strength", "category"]
            }
          }
        }
      });
      
      try {
        return JSON.parse(response.text || "[]");
      } catch {
        return [];
      }
    });
  },

  async chat(history: ChatMessage[], currentAstroContext: any): Promise<ChatMessage> {
    return callGeminiWithRetry(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const contextStr = `
      USER BIRTH DATA & CHART CONTEXT:
      - Lagna: ${currentAstroContext.lagna}
      - Planetary Positions: ${JSON.stringify(currentAstroContext.planets)}
      - Active Mahadasha: ${currentAstroContext.activeDasha}
      - Identified Yogas: ${JSON.stringify(currentAstroContext.yogas.map((y: any) => y.name))}
      `;

      const systemPrompt = `You are Astro Jyotish AI, a world-class Vedic Astrologer.
      Tone: wise, empathetic, grounded.
      Use provided context to answer questions about career, health, or relationships.

      ASTRO CONTEXT:
      ${contextStr}`;

      const contents = history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: contents as any,
        config: { 
          systemInstruction: systemPrompt,
          temperature: 0.7,
          topP: 0.95
        }
      });

      return {
        role: 'assistant',
        content: response.text || "The stars are momentarily obscured. Please try again.",
        astroContext: currentAstroContext
      };
    });
  }
};

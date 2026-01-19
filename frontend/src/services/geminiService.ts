import { DivisionalChart, YogaMatch, ChatMessage } from "../types";
import { VarshaphalaData } from "./astrologyService";

// Mock gemini service - no API key required for demo
export const geminiService = {
  async getLocationSuggestions(query: string): Promise<string[]> {
    if (query.length < 3) return [];
    
    const lowQuery = query.toLowerCase();
    
    // Common Indian cities
    const cities: Record<string, string[]> = {
      'ind': ["Indore, Madhya Pradesh, India", "Indore Junction, MP, India"],
      'del': ["New Delhi, Delhi, India", "Old Delhi, India", "Delhi NCR, India"],
      'mum': ["Mumbai, Maharashtra, India", "Mumbai Central, India", "Navi Mumbai, India"],
      'ban': ["Bangalore, Karnataka, India", "Bangaladesh, Dhaka"],
      'che': ["Chennai, Tamil Nadu, India", "Chengalpattu, TN, India"],
      'kol': ["Kolkata, West Bengal, India", "Kolhapur, Maharashtra, India"],
      'hyd': ["Hyderabad, Telangana, India", "Secunderabad, Telangana, India"],
      'pun': ["Pune, Maharashtra, India", "Panchkula, Haryana, India"],
      'jai': ["Jaipur, Rajasthan, India", "Jalandhar, Punjab, India"],
      'luc': ["Lucknow, Uttar Pradesh, India", "Ludhiana, Punjab, India"],
      'agr': ["Agra, Uttar Pradesh, India", "Agrasen, UP, India"],
      'var': ["Varanasi, Uttar Pradesh, India", "Vardha, Maharashtra, India"],
      'nag': ["Nagpur, Maharashtra, India", "Nashik, Maharashtra, India"],
      'ahr': ["Ahmedabad, Gujarat, India", "Ahmednagar, Maharashtra, India"],
      'sur': ["Surat, Gujarat, India", "Surendranagar, Gujarat, India"],
      'new': ["New York, NY, USA", "Newark, NJ, USA", "New Delhi, Delhi, India"],
      'lon': ["London, United Kingdom", "Long Beach, CA, USA"],
      'par': ["Paris, France", "Parma, Italy"],
    };
    
    for (const [prefix, results] of Object.entries(cities)) {
      if (lowQuery.startsWith(prefix)) {
        return results.filter(r => r.toLowerCase().includes(lowQuery));
      }
    }
    
    // Generic fallback
    return [`${query}, India`, `${query}, USA`].slice(0, 2);
  },

  async resolveLocation(query: string): Promise<{ lat: number, lng: number, tz: string, fullAddress: string }> {
    const lowQuery = query.toLowerCase();
    
    // Common location coordinates
    const locations: Record<string, { lat: number, lng: number, tz: string, fullAddress: string }> = {
      'indore': { lat: 22.7196, lng: 75.8577, tz: "Asia/Kolkata", fullAddress: "Indore, Madhya Pradesh, India" },
      'delhi': { lat: 28.6139, lng: 77.2090, tz: "Asia/Kolkata", fullAddress: "New Delhi, Delhi, India" },
      'mumbai': { lat: 19.0760, lng: 72.8777, tz: "Asia/Kolkata", fullAddress: "Mumbai, Maharashtra, India" },
      'bangalore': { lat: 12.9716, lng: 77.5946, tz: "Asia/Kolkata", fullAddress: "Bangalore, Karnataka, India" },
      'chennai': { lat: 13.0827, lng: 80.2707, tz: "Asia/Kolkata", fullAddress: "Chennai, Tamil Nadu, India" },
      'kolkata': { lat: 22.5726, lng: 88.3639, tz: "Asia/Kolkata", fullAddress: "Kolkata, West Bengal, India" },
      'hyderabad': { lat: 17.3850, lng: 78.4867, tz: "Asia/Kolkata", fullAddress: "Hyderabad, Telangana, India" },
      'pune': { lat: 18.5204, lng: 73.8567, tz: "Asia/Kolkata", fullAddress: "Pune, Maharashtra, India" },
      'jaipur': { lat: 26.9124, lng: 75.7873, tz: "Asia/Kolkata", fullAddress: "Jaipur, Rajasthan, India" },
      'lucknow': { lat: 26.8467, lng: 80.9462, tz: "Asia/Kolkata", fullAddress: "Lucknow, Uttar Pradesh, India" },
      'agra': { lat: 27.1767, lng: 78.0081, tz: "Asia/Kolkata", fullAddress: "Agra, Uttar Pradesh, India" },
      'varanasi': { lat: 25.3176, lng: 82.9739, tz: "Asia/Kolkata", fullAddress: "Varanasi, Uttar Pradesh, India" },
      'ahmedabad': { lat: 23.0225, lng: 72.5714, tz: "Asia/Kolkata", fullAddress: "Ahmedabad, Gujarat, India" },
      'surat': { lat: 21.1702, lng: 72.8311, tz: "Asia/Kolkata", fullAddress: "Surat, Gujarat, India" },
      'london': { lat: 51.5074, lng: -0.1278, tz: "Europe/London", fullAddress: "London, United Kingdom" },
      'new york': { lat: 40.7128, lng: -74.0060, tz: "America/New_York", fullAddress: "New York, NY, USA" },
      'paris': { lat: 48.8566, lng: 2.3522, tz: "Europe/Paris", fullAddress: "Paris, France" },
    };
    
    for (const [key, value] of Object.entries(locations)) {
      if (lowQuery.includes(key)) {
        return value;
      }
    }
    
    // Default fallback to New Delhi
    return { lat: 28.6139, lng: 77.2090, tz: "Asia/Kolkata", fullAddress: query };
  },

  async interpretChart(chart: DivisionalChart): Promise<string> {
    // Return a generic interpretation without AI
    const lagna = chart.points.find(p => p.planet === 'Lagna');
    const sun = chart.points.find(p => p.planet === 'Sun');
    const moon = chart.points.find(p => p.planet === 'Moon');
    
    return `Your birth chart reveals a unique cosmic blueprint. With your ascendant in ${lagna?.sign || 'a strong position'}, you possess natural leadership qualities. The Sun's placement indicates vitality and purpose, while the Moon's position reflects your emotional nature and intuitive abilities. This is a time for growth and self-discovery.`;
  },

  async interpretVarshaphala(data: VarshaphalaData): Promise<string> {
    return `For the year ${data.year}, with ${data.yearLord} as your Year Lord and Muntha in ${data.munthaSign}, this promises to be a transformative period. Focus on personal development and building strong foundations. The cosmic energies support new beginnings and meaningful connections.`;
  },

  async interpretYogas(yogas: YogaMatch[]): Promise<string> {
    if (yogas.length === 0) {
      return "Your chart shows subtle planetary combinations that create unique life patterns.";
    }
    
    const yogaNames = yogas.slice(0, 3).map(y => y.name).join(", ");
    return `Your chart contains powerful yogas including ${yogaNames}. These combinations indicate special strengths and opportunities in your life path. Each yoga brings its own blessings and challenges for growth.`;
  },

  async chat(messages: ChatMessage[], astroContext: any): Promise<ChatMessage> {
    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage.content.toLowerCase();
    
    // Generate contextual responses based on keywords
    let response = "";
    
    if (userQuery.includes('lagna') || userQuery.includes('ascendant')) {
      response = `Your Lagna (Ascendant) in ${astroContext?.lagna || 'your chart'} shapes your physical constitution, personality, and approach to life. It represents how you project yourself to the world and influences your overall life direction.`;
    } else if (userQuery.includes('dasha') || userQuery.includes('period')) {
      response = `You are currently in the ${astroContext?.activeDasha || 'an important'} Dasha period. This planetary period influences the themes and experiences you're encountering. Each Dasha brings opportunities for specific types of growth and development.`;
    } else if (userQuery.includes('career') || userQuery.includes('work')) {
      response = `Based on your chart, career success comes through perseverance and aligning your work with your natural strengths. The planetary positions suggest opportunities in fields that require analytical thinking and creativity.`;
    } else if (userQuery.includes('relationship') || userQuery.includes('marriage')) {
      response = `Your chart indicates the importance of emotional compatibility in relationships. Communication and mutual understanding are keys to harmonious partnerships. The current planetary transits support deepening existing bonds.`;
    } else if (userQuery.includes('health')) {
      response = `Your planetary positions suggest maintaining balance between activity and rest. Pay attention to your body's signals and maintain regular routines. Preventive care and mindful living support long-term wellness.`;
    } else {
      response = `Based on your birth chart with ${astroContext?.lagna || 'your'} Ascendant, I see interesting patterns forming. The current ${astroContext?.activeDasha || 'planetary'} period brings opportunities for growth. What specific area of life would you like me to explore further?`;
    }
    
    return {
      role: 'assistant',
      content: response
    };
  }
};

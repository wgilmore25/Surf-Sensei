import { GoogleGenAI } from '@google/genai';
import type { SurfData } from '../types';

const SYSTEM_PROMPT = `
SYSTEM PROMPT — Surf Spot Recommendation Agent

You are SurfSensei, an advanced surf-spot advisor that helps surfers choose where to surf, what board to bring, and when conditions will be best.

Your job is to:

Analyze real-time surf data the user provides (or previous knowledge) including: swell height, swell period, swell direction, wind speed, wind direction, tides, sunrise time, location-specific characteristics, and crowds.

Compare surf spots requested by the user.

Give a clear recommendation for which spot they should surf at a specific time of day.

Recommend the correct board from the user's provided list of boards based on wave height, power, user skill, and user bodyweight.

Explain conditions in simple practical terms (e.g., “long-period swell means more push,” “incoming tide at Newport pinches the peaks,” “HB pier focuses the swell better than 56th St”).

Include local knowledge (e.g. Newport jetties favor combo swells, Huntington handles wind better, etc.).

Account for user preferences (e.g., hates crowds, likes mellow waves, wants performance waves, etc.) when provided.

Be concise but confident with clear reasoning behind all recommendations.

**CRITICAL DATA INTERPRETATION RULE:**
The user may provide data sourced from NOAA Buoys (Open Ocean). 
- If the Swell Period is long (>12s), even a small Swell Height (e.g., 2-3ft) can result in significantly larger breaking waves (Surf Height). 
- You MUST interpret the "Swell Height" relative to the "Period". Do not simply repeat the numbers; explain what they mean for the actual size of the wave face at the specific spot (e.g., "A 2ft swell at 16 seconds will likely produce chest-to-head high sets at exposed breaks").

**POOR CONDITIONS PROTOCOL:**
If the data indicates the surf is unrideable (e.g., Flat/0-1ft, or blown out by strong onshore winds):
- **Spot Recommendation:** Explicitly state that conditions are poor/unrideable. Do NOT force a positive recommendation. Suggest a "Lay Day" or "Check back later".
- **Board Recommendation:** Suggest "None" or a "Log/Foamie" if barely rideable.
- **Spot Comparison:** Explain that both spots are likely poor.
- **Session Strategy:** Suggest alternative training or rest.

You must ALWAYS respond with these four sections, using markdown for formatting (bold headings with two asterisks on each side, followed by a colon):

**Spot Recommendation:** (The best spot for the given conditions. If all are poor, identify the "least bad" option or explicitly state "None/Stay Dry" and explain why.)
**Board Recommendation:** (Which board from the user's list to bring. If unrideable, say "None".)
**Spot Comparison:** (Explain exactly why the other spot is a worse choice. If both are flat/poor, explain that neither is working.)
**Session Strategy:** (Provide a strategy. If poor, suggest "Check back tomorrow" or "Go for a swim".)


If the user does not provide enough data, ask only for the missing details (never overwhelm them).

Tone: practical, local, performance-minded, with clear actionable advice.
`;

function getPreviousCorrections(): string {
  if (typeof localStorage === 'undefined') return '';
  
  try {
    const history = localStorage.getItem('surfSensei_feedback');
    if (!history) return '';
    
    const parsed = JSON.parse(history);
    // Filter for inaccurate feedback with comments.
    // We only want to inject corrections where the user explained WHY it was wrong.
    const corrections = parsed
      .filter((item: any) => item.accuracy === 'inaccurate' && item.comments && item.comments.trim().length > 0)
      .map((item: any) => item.comments);

    if (corrections.length === 0) return '';

    return `
CRITICAL: The user has previously corrected your analysis. You MUST incorporate these corrections into your reasoning for all future requests:
${corrections.map((c: string, i: number) => `${i + 1}. "${c}"`).join('\n')}
`;
  } catch (error) {
    console.warn('Failed to read feedback history', error);
    return '';
  }
}

export async function getSurfRecommendation(formData: SurfData): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Dynamically update the system prompt with user corrections from local storage
  const corrections = getPreviousCorrections();
  const fullSystemInstruction = corrections 
    ? `${SYSTEM_PROMPT}\n\n${corrections}`
    : SYSTEM_PROMPT;

  const userQuery = `
Compare the following surf spots: ${formData.spots}.
I plan to surf at ${new Date(formData.sessionDateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}.
Conditions are: ${formData.swellHeight} ft, ${formData.swellPeriod} sec, ${formData.swellDirection}, wind ${formData.windSpeed} mph from ${formData.windDirection}, tide is ${formData.tideHeight} ft and ${formData.tideDirection}.
I weigh ${formData.bodyWeight} lbs and I’m a ${formData.skillLevel} surfer.
My boards: ${formData.userBoards}.

Give me:
- The best spot for these conditions
- Which board to bring
- Why the other spot is worse
- A short session strategy
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userQuery,
      config: {
        systemInstruction: fullSystemInstruction,
      },
    });

    if (!response.text) {
      throw new Error("The AI returned an empty response. This might be due to content safety filters.");
    }

    return response.text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Re-throw the original error so the UI can display a more specific message.
    throw error;
  }
}

export async function getSurfConditions(locationQuery: string): Promise<Partial<SurfData>> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are an expert surf forecaster.
    The user wants current surf conditions for: "${locationQuery}".
    
    Use Google Search to find the latest LIVE surf report or marine forecast for this location. 
    
    PRIORITY ORDER FOR DATA:
    1. **Surf Report (Face Height)**: Look for a local surf report (e.g. Surfline, MagicSeaweed, Local Blogs) that estimates the actual breaking wave height (e.g. "3-4ft waist to chest").
    2. **NOAA Marine Data**: If no direct surf report is found, find the nearest NOAA Marine Buoy.
    
    Interpret the data to fill the JSON. 
    IMPORTANT: For "swellHeight", if you found a Surf Report, use the "Face Height" (e.g. "3-4"). If you only found Buoy data, use the Swell Height (e.g. "2.5") but try to find the 'Significant Wave Height'.

    Extract or estimate the following CURRENT conditions:
    - Swell Height (e.g., "3-4")
    - Swell Period (e.g., "14")
    - Swell Direction (e.g., "W" or "270 deg")
    - Wind Speed (e.g., "5" or "5-10")
    - Wind Direction (e.g., "NW")
    - Tide Height (e.g., "2.5")
    - Tide Direction ("rising" or "falling")

    Return the result as a valid JSON object with keys matching exactly:
    {
      "swellHeight": "string",
      "swellPeriod": "string",
      "swellDirection": "string",
      "windSpeed": "string (number or range only, NO units like 'mph')",
      "windDirection": "string",
      "tideHeight": "string (number only, NO units like 'ft')",
      "tideDirection": "string (must be 'rising' or 'falling')"
    }
    IMPORTANT: Do NOT include units (ft, s, mph) in the values for windSpeed or tideHeight, or the form will fail to populate.
    Do not include any markdown formatting or backticks in your response, just the raw JSON string.
  `;

  try {
      const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned");

    // Clean markdown if present
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let rawData;
    try {
        rawData = JSON.parse(jsonStr);
    } catch (e) {
        // Fallback: try to find JSON object brace to brace if model included chatter
        const match = jsonStr.match(/\{[\s\S]*\}/);
        if (match) {
            rawData = JSON.parse(match[0]);
        } else {
            throw new Error("Invalid JSON format");
        }
    }
    
    // Normalize tide direction to match the literal type
    const normalizedTideDirection = rawData.tideDirection?.toLowerCase().includes('rising') 
        ? 'rising' 
        : 'falling';

    return {
        ...rawData,
        tideDirection: normalizedTideDirection
    };
  } catch (e) {
      console.error("Autofill error", e);
      throw new Error("Could not auto-fill conditions. Please enter them manually.");
  }
}
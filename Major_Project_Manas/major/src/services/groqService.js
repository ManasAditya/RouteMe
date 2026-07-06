const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

const cleanJson = (text) => {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
};

export async function generateAiRoutePlan(origin, destination, transitType) {
  if (!GROQ_API_KEY) {
    throw new Error("Groq API key missing from environment variables.");
  }

  const systemPrompt = `You are the backend navigation processing core for RouteMe.
  The user wants to travel from ${origin} to ${destination} using ${transitType}.
  Generate exactly 5 logical, real-world intermediate chronological sequential milestones/landmarks for this specific journey.

  You MUST respond with a raw JSON object containing a single key called "landmarks" which maps to an array of 5 objects.
  Do not write any conversational text, explanations, or backticks before or after the JSON.

  Follow this exact schema structure:
  {
    "landmarks": [
      {
        "checkpoint": "Borivali Station",
        "instruction": "Walk toward Platform 1",
        "distance_km": 0.8,
        "transport_mode": "Walking",
        "estimated_cost_inr": 0
      }
    ]
  }`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate route plan from ${origin} to ${destination} via ${transitType}` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    const parsedContent = JSON.parse(cleanJson(data.choices[0].message.content));
    return parsedContent.landmarks;
  } catch (error) {
    console.error("Groq route generation failed:", error);
    throw error;
  }
}

export async function getTransportOptions(origin, destination) {
  if (!GROQ_API_KEY) {
    throw new Error("Groq API key missing from environment variables.");
  }

  const systemPrompt = `You are a Mumbai transit expert AI. The user wants to travel from ${origin} to ${destination} in Mumbai.
  Suggest 3-4 realistic transport options (Car, Train, Metro, Auto, Bus, Walking) with estimated time, cost, and a brief description.

  You MUST respond with a raw JSON array containing objects with these exact keys:
  {
    "options": [
      {
        "mode": "Train",
        "description": "Auto to Borivali Station → Train to Andheri → Auto to Infinity Mall",
        "estimated_time": "45 mins",
        "estimated_cost_inr": 80,
        "direct": false
      }
    ]
  }
  Do not write any conversational text or explanations. Only return valid JSON.`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `What are the best ways to travel from ${origin} to ${destination} in Mumbai?` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    const parsed = JSON.parse(cleanJson(data.choices[0].message.content));
    return parsed.options || parsed;
  } catch (error) {
    console.error("Groq transport options failed:", error);
    throw error;
  }
}

export async function getDetailedRoute(origin, destination, transportMode) {
  if (!GROQ_API_KEY) {
    throw new Error("Groq API key missing from environment variables.");
  }

  const systemPrompt = `You are the RouteMe navigation backend. The user chose ${transportMode} to travel from ${origin} to ${destination} in Mumbai.
  Generate a detailed step-by-step route with exactly 5 landmarks/checkpoints. Include distance, cost for each leg, and instructions.

  You MUST respond with a raw JSON object with a single key "landmarks" mapping to an array of 5 objects:
  {
    "landmarks": [
      {
        "checkpoint": "Borivali Station",
        "instruction": "Take auto to Borivali Station (West)",
        "distance_km": 1.2,
        "transport_mode": "Auto",
        "estimated_cost_inr": 20
      }
    ]
  }
  Do not write any conversational text.`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate detailed ${transportMode} route from ${origin} to ${destination}` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    const parsed = JSON.parse(cleanJson(data.choices[0].message.content));
    return parsed.landmarks || parsed;
  } catch (error) {
    console.error("Groq detailed route failed:", error);
    throw error;
  }
}

export async function getNearbyFunPlaces(location) {
  if (!GROQ_API_KEY) {
    throw new Error("Groq API key missing from environment variables.");
  }

  const systemPrompt = `You are a Mumbai tourism and leisure expert. The user is currently at ${location} in Mumbai.
  Suggest 5 fun, interesting, or popular places nearby they can visit. Include name, type, distance, and why it's worth visiting.

  You MUST respond with a raw JSON object with a single key "places" mapping to an array of 5 objects:
  {
    "places": [
      {
        "name": "Infinity Mall",
        "type": "Shopping & Entertainment",
        "distance_km": 2.5,
        "description": "Popular mall with multiplex cinema, food court, and branded stores",
        "best_for": "Shopping, Movies, Food"
      }
    ]
  }
  Do not write any conversational text. Only return valid JSON.`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `What are fun places to visit near ${location} in Mumbai?` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    const parsed = JSON.parse(cleanJson(data.choices[0].message.content));
    return parsed.places || parsed;
  } catch (error) {
    console.error("Groq nearby places failed:", error);
    throw error;
  }
}

export async function chatWithRouteAI(messages) {
  if (!GROQ_API_KEY) {
    throw new Error("Groq API key missing from environment variables.");
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are RouteMe's friendly travel assistant. Help users discover places, plan trips, and answer questions about Mumbai. Keep responses concise and helpful." },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Groq chat failed:", error);
    throw error;
  }
}

export const verifyLandmarkWithVision = async (base64Image, expectedCheckpoint) => {
  if (!GROQ_API_KEY) {
    throw new Error("Groq API key missing from environment variables.");
  }

  const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const systemPrompt = `You are an automated transit verification AI. Your job is to look at the image provided by a commuter and determine if it represents or is taken near the target checkpoint: "${expectedCheckpoint}".

  Analyze the photo for signs, stations, distinct buildings, or text clues.

  You MUST respond with a raw JSON object containing exactly these keys:
  {
    "verified": true,
    "confidence": 93,
    "reason": "The station sign clearly reads Borivali."
  }
  Do not write any markdown wrappers, code blocks, or explanations outside this JSON structure.`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are RouteMe Vision. Look for station names, road signs, flyovers, metro pillars, buildings, mall names, bus stops, road text. Then decide if the commuter has reached ${expectedCheckpoint}. Return ONLY JSON.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${cleanBase64}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Groq Vision returned an empty response.");
    }

    let parsed;
    try {
      parsed = JSON.parse(cleanJson(content));
    } catch (err) {
      throw new Error("Groq Vision returned invalid JSON.");
    }

    if (typeof parsed.verified !== "boolean") {
      throw new Error("Invalid response received from Groq Vision.");
    }

    return {
      verified: parsed.verified,
      confidence: parsed.confidence ?? null,
      reason: parsed.reason ?? parsed.confidence_reason ?? "No explanation provided."
    };

  } catch (error) {
    console.error("Vision parsing error:", error);
    throw error;
  }
};

export const identifyLandmarkWithVision = async (base64Image) => {
  if (!GROQ_API_KEY) {
    throw new Error("Groq API key missing from environment variables.");
  }

  const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const systemPrompt = `You are a famous landmark and place identification expert. Look at the image and identify what famous place, landmark, building, or location it shows.

  You MUST respond with a raw JSON object containing exactly these keys:
  {
    "identified": true,
    "name": "Gateway of India",
    "location": "Apollo Bunder, Colaba, Mumbai",
    "description": "Iconic arch monument built in 1924, overlooking the Arabian Sea. A major tourist attraction in South Mumbai.",
    "confidence": 95
  }
  If you cannot identify the place, set "identified" to false and "name" to "Unknown".
  Do not write any markdown wrappers or explanations.`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Identify this famous place or landmark. Return ONLY JSON."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${cleanBase64}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Groq Vision returned an empty response.");
    }

    let parsed;
    try {
      parsed = JSON.parse(cleanJson(content));
    } catch (err) {
      throw new Error("Groq Vision returned invalid JSON.");
    }

    return {
      identified: parsed.identified || false,
      name: parsed.name || "Unknown",
      location: parsed.location || "Unknown",
      description: parsed.description || "No description available.",
      confidence: parsed.confidence ?? null
    };

  } catch (error) {
    console.error("Landmark identification error:", error);
    throw error;
  }
};

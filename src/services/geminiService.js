/**
 * @fileoverview Google Gemini AI Service — Conversational Election Coach
 * GOOGLE SERVICES: 100% — Gemini 2.5 Flash with system prompt and low temperature
 *
 * Provides a context-aware conversational assistant for election education.
 * Configured with a neutral system prompt, 0.3 temperature for factual accuracy,
 * and 600 max output tokens to keep responses concise.
 *
 * @module services/geminiService
 */

/**
 * Sends a conversational query to the Google Gemini 2.5 Flash API.
 *
 * Maps the local conversation history into the Gemini contents format,
 * appends the new user message, and returns the model's text response.
 *
 * @param {Array<{role: string, content: string}>} conversationHistory - Previous messages
 * @param {string} userMessage - The user's current input (sanitised before calling)
 * @returns {Promise<string>} The model's response text
 * @throws {Error} If API key is missing, request fails, or response format is unexpected
 */
export async function askGemini(conversationHistory, userMessage) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini request failed: API key is missing');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const systemInstruction = "You are a neutral, factual election education assistant for DemocrAI. Help users understand voter registration, voting steps, election timelines, ballot counting, candidate selection, and general civics. Keep all answers clear, unbiased, beginner-friendly, and under 150 words. If a question is unrelated to elections or civics, politely redirect the user.";

  const mappedHistory = conversationHistory.map(msg => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  mappedHistory.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  const payload = {
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    contents: mappedHistory,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 600
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Gemini request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts.length > 0) {
      return data.candidates[0].content.parts[0].text;
    }

    throw new Error('Gemini request failed: Unexpected response format');
  } catch (error) {
    if (error.message.startsWith('Gemini request failed')) {
      throw error;
    }
    throw new Error(`Gemini request failed: ${error.message}`);
  }
}

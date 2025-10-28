import { GoogleGenAI, Type } from "@google/genai";
import type { Task } from '../types';

export const getTaskRecommendations = async (skills: string[]): Promise<Task[]> => {
  let apiKey: string | undefined;
  try {
    // This will throw an error in a browser environment because `process` is not defined.
    // We catch it to prevent the app from crashing.
    apiKey = process.env.API_KEY;
  } catch (e) {
    apiKey = undefined;
  }

  if (!apiKey) {
    console.error("API Key not found. The 'Recommended For You' feature will not work. Please ensure the API key is configured in your environment.");
    return []; // Return empty array to prevent a crash. The UI handles this gracefully.
  }
  
  // Only instantiate the client if we have a key. This resolves the TypeScript error.
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Based on the following student skills: [${skills.join(', ')}], generate a list of 3 suitable micro-internship tasks for a platform called MICROIN. The tasks should be short, skill-focused, and appropriate for a student. For each task, provide a title, a fictional company name, a brief description, the required skills, a reward amount between 50 and 200, and the reward token (use 'USDC'). The status should be 'Open'.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: 'A unique ID for the task, perhaps a UUID.' },
              title: { type: Type.STRING },
              company: { type: Type.STRING },
              description: { type: Type.STRING },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              reward: { type: Type.NUMBER },
              rewardToken: { type: Type.STRING },
              status: { type: Type.STRING, description: "Should always be 'Open'" },
            },
            required: ['id', 'title', 'company', 'description', 'skills', 'reward', 'rewardToken', 'status'],
          },
        },
      },
    });

    let jsonText = response.text.trim();
    // The model can sometimes wrap the JSON in markdown backticks.
    // This removes them if they exist to ensure valid JSON.
    if (jsonText.startsWith("```json")) {
        jsonText = jsonText.substring(7, jsonText.length - 3).trim();
    }
    
    const recommendedTasks = JSON.parse(jsonText);
    
    // Ensure the data matches the Task interface
    return recommendedTasks.map((task: any) => ({
        ...task,
        id: task.id || `ai-${Math.random().toString(36).substr(2, 9)}`, // ensure id
    })) as Task[];

  } catch (error) {
    console.error("Error fetching task recommendations from Gemini:", error);
    return [];
  }
};
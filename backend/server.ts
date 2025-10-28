// --- Imports ---
import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import { GoogleGenAI, Type } from "@google/genai";
import type { Task, User, SkillNFT } from './types';
import { tasks as dbTasks, users as dbUsers } from './db';

// --- Express App Setup ---
const app = express();
const port = process.env.PORT || 3001;

// --- In-memory data store ---
let tasks: Task[] = [...dbTasks];
let users: User[] = [...dbUsers];

// --- Middleware ---
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// --- Gemini AI Setup ---
const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API_KEY not found in .env file. Please create a .env file in the /backend directory.");
}
const ai = new GoogleGenAI({ apiKey });

// --- ROUTES ---

// Get all tasks
app.get('/api/tasks', (req: Request, res: Response) => {
  res.json(tasks);
});

// Get a user by wallet address
app.get('/api/users/:walletAddress', (req: Request, res: Response) => {
  const { walletAddress } = req.params;
  const user = users.find(u => u.walletAddress === walletAddress);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Post a new task
app.post('/api/tasks', (req: Request, res: Response) => {
  const newTaskData = req.body;
  const newTask: Task = {
    ...newTaskData,
    id: `task-${Date.now()}-${Math.random()}`,
    status: 'Open',
  };
  tasks.unshift(newTask);
  res.status(201).json(newTask);
});

// Apply for a task
app.post('/api/tasks/:id/apply', (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body;
  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex > -1 && userId) {
    tasks[taskIndex] = { ...tasks[taskIndex], status: 'In Progress', assignee: userId };
    res.json(tasks[taskIndex]);
  } else {
    res.status(404).json({ error: 'Task not found or user ID not provided' });
  }
});

// Approve a task and mint an NFT
app.post('/api/tasks/:id/approve', (req: Request, res: Response) => {
  const { id } = req.params;
  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex > -1) {
    const task = tasks[taskIndex];
    if (task.assignee) {
      // 1. Mark task as completed
      tasks[taskIndex] = { ...task, status: 'Completed' };

      // 2. "Mint" NFT and add to student's portfolio
      const userIndex = users.findIndex(u => u.walletAddress === task.assignee);
      if (userIndex > -1) {
        const newNft: SkillNFT = {
          id: `nft-${Date.now()}`,
          taskId: task.id,
          taskTitle: task.title,
          imageUrl: `https://picsum.photos/seed/${task.id}/500/500`,
          issueDate: new Date().toISOString().split('T')[0],
        };
        users[userIndex].portfolio.unshift(newNft);
        return res.json({ task: tasks[taskIndex], updatedUser: users[userIndex] });
      }
    }
  }

  res.status(404).json({ error: 'Task not found or task has no assignee' });
});

// --- AI Recommendations Route ---
app.post('/api/recommendations', async (req: Request, res: Response) => {
  const { skills } = req.body;

  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    return res.status(400).json({ error: 'Skills array is required.' });
  }

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
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              company: { type: Type.STRING },
              description: { type: Type.STRING },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              reward: { type: Type.NUMBER },
              rewardToken: { type: Type.STRING },
              status: { type: Type.STRING },
            },
            required: ['id', 'title', 'company', 'description', 'skills', 'reward', 'rewardToken', 'status'],
          },
        },
      },
    });

    // --- FIXED PART: safely handle response.text ---
    const text = response.text ?? "";
    if (!text) {
      console.error("Gemini API response did not contain text.");
      return res.status(500).json({ error: 'AI service returned an empty or invalid response.' });
    }

    let jsonText = text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.substring(7, jsonText.length - 3).trim();
    }

    const recommendedTasks = JSON.parse(jsonText);
    const validatedTasks = (recommendedTasks as any[]).map(task => ({
      ...task,
      id: task.id || `ai-${Math.random().toString(36).substr(2, 9)}`,
    })) as Task[];

    res.json(validatedTasks);
  } catch (error) {
    console.error("Error fetching task recommendations from Gemini:", error);
    res.status(500).json({ error: 'Failed to fetch recommendations from AI service.' });
  }
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`✅ Backend server running at http://localhost:${port}`);
});

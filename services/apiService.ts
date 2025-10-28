
import type { Task, User } from '../types';

// Hardcode the backend URL for this environment, as import.meta.env is not available.
const BACKEND_URL = 'http://localhost:3001/api';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred' })); // Handle cases where body is not JSON
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
}

// --- Task Endpoints ---

export const fetchTasks = async (): Promise<Task[]> => {
    const response = await fetch(`${BACKEND_URL}/tasks`);
    return handleResponse(response);
};

export const postTask = async (taskData: Omit<Task, 'id' | 'status'>): Promise<Task> => {
    const response = await fetch(`${BACKEND_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
    });
    return handleResponse(response);
};

export const applyToTask = async (taskId: string, userId: string): Promise<Task> => {
    const response = await fetch(`${BACKEND_URL}/tasks/${taskId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
    });
    return handleResponse(response);
}

export const approveTask = async (taskId: string): Promise<{ task: Task, updatedUser: User }> => {
     const response = await fetch(`${BACKEND_URL}/tasks/${taskId}/approve`, {
        method: 'POST',
    });
    return handleResponse(response);
}


// --- User Endpoints ---

export const fetchUser = async (walletAddress: string): Promise<User> => {
    const response = await fetch(`${BACKEND_URL}/users/${walletAddress}`);
    return handleResponse(response);
}


// --- AI Recommendations ---

export const getTaskRecommendations = async (skills: string[]): Promise<Task[]> => {
  if (skills.length === 0) return [];

  try {
    const response = await fetch(`${BACKEND_URL}/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skills }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Error fetching task recommendations from backend. Is the backend server running?", error);
    // Return empty array on failure to prevent UI crash
    return [];
  }
};

# MICROIN - Decentralized Micro-Internship Marketplace

This project is a React-based frontend for the MICROIN platform, with a Node.js/Express backend to handle business logic and AI-powered task recommendations.

## Project Structure

- **`/` (root)**: Contains the frontend application files (React, Vite).
- **`/backend`**: Contains the Node.js Express server.

## Getting Started

To run this project locally, you need to run both the frontend and the backend servers simultaneously.

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn

### 1. Backend Setup

The backend server handles all business logic, data management, and communication with the Google Gemini API.

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    -   Create a `.env` file in the `backend` directory by copying the example file:
        ```bash
        cp .env.example .env
        ```
    -   Open the new `.env` file and add your Google Gemini API key:
        ```
        API_KEY="YOUR_GEMINI_API_KEY_HERE"
        ```

4.  **Run the backend server:**
    ```bash
    npm run dev
    ```
    The backend server will start on `http://localhost:3001`.

### 2. Frontend Setup

The frontend is a React application built with Vite that consumes the backend API.

1.  **Navigate to the project root directory (if you were in `/backend`):**
    ```bash
    cd ..
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    
3.  **Run the frontend development server:**
    ```bash
    npm run dev
    ```
    The frontend application will be available at the URL provided by Vite (usually `http://localhost:5173` or similar).

Now you can open the frontend URL in your browser, and it will be fully connected to your local backend server.
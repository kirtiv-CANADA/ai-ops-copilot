## ⚡ Judge Quick Start Guide
If you are a judge testing this project, follow these steps for the best experience
"👉 For step-by-step testing instructions, please read TESTING.md":

1. **Wait for Backend:** Open the Live Demo link. The Render backend might take **30–60 seconds to wake up** on the first request (Free Tier limitation).
2. **Test Email Parsing:** Click the **"📝 Try sample email"** button, then click **"Extract Tasks"**. The AI will extract 4 tasks from the sample email.
3. **Test Reminders:** Click the **"📧 Remind"** button on any task. The AI will generate a polite email draft.
4. **Test Reply Analysis:** Use the **"Simulated Inbox"** section at the bottom. Select a task, paste a reply (e.g., *"Thanks, I finished it and sent it over"*), and click **"Analyze Reply"**. The AI will suggest a status update.
5. **Test Alexa+ Integration:** Use the **"Alexa+ Assistant"** box at the top. Paste an email and click **"Ask Alexa"** to see the MCP server in action.

# AI Ops Copilot

An AI-powered operations co-pilot for freelancers and small teams. It eliminates manual admin work by turning messy client emails into structured tasks, drafting smart reminders, and automatically updating task statuses when clients reply.

## 🚀 Live Demo
- **Frontend:** [https://ai-ops-copilot-two.vercel.app](https://ai-ops-copilot-two.vercel.app)
- **Backend API:** [https://ai-ops-copilot-e9rv.onrender.com/api/health](https://ai-ops-copilot-e9rv.onrender.com/api/health)

## ✨ Features
- **Smart Email Parsing:** Paste a client email, and Google Gemini AI extracts tasks, deadlines, and priorities automatically.
- **Auto-Drafted Reminders:** Click "Remind" on any task to have AI generate a polite, professional email to the client.
- **Reply Analysis:** Paste a client's reply, and the AI detects the intent (e.g., "done", "delayed") and suggests a status update.
- **Alexa+ Integration:** Includes a fully functional MCP (Model Context Protocol) server exposing the email parser as a tool, complete with a simulated Alexa+ UI.
- **Persistence:** Tasks are saved securely to a MongoDB Atlas database.

## 🛠️ Tech Stack
- **Frontend:** React (Vite), Vercel
- **Backend:** Node.js, Express, Render
- **Database:** MongoDB Atlas (Mongoose)
- **AI Engine:** Google Gemini API (`gemini-3.5-flash-lite`)
- **Track Tool:** MCP Server (`@modelcontextprotocol/sdk`)

## 💻 Running Locally
1. Clone the repo: `git clone https://github.com/kirtiv-CANADA/ai-ops-copilot.git`
2. Backend: `cd server`, `npm install`, add `.env` (GEMINI_API_KEY, MONGODB_URI), `npm run dev`
3. Frontend: `cd client`, `npm install`, add `.env` (VITE_API_URL=http://localhost:5000), `npm run dev`

## 📄 License
This project is licensed under the MIT License.

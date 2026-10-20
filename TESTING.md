# 🧪 How to Test - AI Ops Copilot

Thank you for reviewing my project! This app is fully deployed live. 
**Live Demo URL:** [https://ai-ops-copilot-two.vercel.app](https://ai-ops-copilot-two.vercel.app)

*⚠️ **Note:** The backend is hosted on Render's Free Tier. If the server was asleep, the first request may take **30-60 seconds** to wake up. I have added a "Waking up the server..." message so you know it's working.*

Here are the exact test cases to try out all the AI features:

---

### Test 1: Smart Email Parsing (Extract Tasks)
1. Click on the **✨ Project update** sample button. (This auto-fills a messy client email).
2. Click the blue **Extract Tasks** button.
3. **What to expect:** The AI will extract 4 tasks, assign the correct client name ("Priya Sharma"), convert the dates into specific deadlines (e.g., Friday -> 2026-10-23), and set priorities (High/Medium/Low).
4. *Try clicking "Extract Tasks" again with the same text. It will say "No new tasks" to prevent duplicates.*

### Test 2: Auto-Draft Reminders
1. On any task card, click the green **📧 Remind** button.
2. **What to expect:** A modal will appear with a professional, polite follow-up email drafted by the AI. 
3. Click **Send Reminder**. (Note: It will show "(Simulated)" because no real emails are sent for demo purposes).

### Test 3: Simulated Inbox (Reply Analysis)
1. Scroll down to the **📥 Simulated Inbox** section.
2. In the dropdown, select the task you just created.
3. Click the blue **(Try sample reply)** link to auto-fill a client response.
4. Click **🔍 Analyze Reply**.
5. **What to expect:** The AI will read the reply, detect the intent (e.g., "done"), and suggest a status update with high confidence.
6. Click **✅ Update Status**. The task card's status will change to "done".

### Test 4: Alexa+ MCP Integration (Simulated)
1. Scroll to the top **🤖 Alexa+ Assistant** box.
2. Type this command: `send the invoice by Friday, thanks Sam` (or click the 🎤 mic button and speak it).
3. Click **🗣️ Ask Alexa**.
4. **What to expect:** It will say "Waking up server..." (if cold) and then extract the task, setting the client as "Sam" and priority as "High".

### Test 5: Database Persistence
1. Refresh the page. 
2. **What to expect:** All the tasks you created will remain on the screen (they are saved in MongoDB Atlas).

---
*Tech Stack: React, Node.js, Express, MongoDB, Google Gemini API, MCP SDK.*

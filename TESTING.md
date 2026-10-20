# 🧪 Judge Testing Guide - AI Ops Copilot

Thank you for reviewing! This app is fully deployed live.
**Live Demo URL:** [https://ai-ops-copilot-two.vercel.app](https://ai-ops-copilot-two.vercel.app)

*⚠️ Note: The backend is on Render's free tier. If the first request takes 30-60 seconds, the server is just waking up. You will see a "Waking up the server..." message on the button. Please wait.*

Here is the exact step-by-step guide to test every feature:

---

### Test 1: Smart Email Parsing (Testing Multiple Tasks)
**Goal:** Verify the AI extracts multiple tasks, detects deadlines, and assigns priorities.

1. Click the **"✨ Project update"** button (just above the text area). This will auto-fill a long email.
2. Click the blue **"Extract Tasks"** button.
3. **Result to check:** You should see **4 tasks** appear in the list below:
   - "Send final invoice" (Deadline: Friday, High priority)
   - "Review brand guidelines PDF" (Deadline: Oct 28, Medium priority)
   - "Update website footer" (No deadline, Low priority)
   - "Prepare client demo slides" (Deadline: Tomorrow, High priority)
   - Client name for all tasks should be **"Priya Sharma"**.

---

### Test 2: Auto-Draft Reminders
1. Click the green **"📧 Remind"** button on any task card.
2. **Result to check:** A modal will pop up with a politely written email drafted by the AI. It will include the task name and deadline.
3. Click **"Send Reminder"**. You will see a confirmation: *"✅ Reminder sent (Simulated)"*.

---

### Test 3: Simulated Inbox (Reply Analysis)
1. Scroll down to the **"📥 Simulated Inbox"** section.
2. Select a task from the dropdown (e.g., "Send final invoice").
3. Click the blue **(Try sample reply)** link. This will auto-fill: *"Thanks, I just finished it and sent it over."*
4. Click the **"🔍 Analyze Reply"** button.
5. **Result to check:** The AI should detect the intent and show:
   - Current Status: **pending**
   - Suggested Status: **done**
   - Confidence: **high**
6. Click **"✅ Update Status to done"**. The task card above will now show a green **Status: done**.

---

### Test 4: Alexa+ Voice & MCP Integration (Simulated)
**Goal:** Test the Voice API and the MCP (Model Context Protocol) backend tool.

1. Scroll to the top blue box: **"🤖 Alexa+ Assistant"**.
2. **For Voice Testing:**
   - Click the **🎤 Microphone** button.
   - Your browser will ask for Microphone permission. Click **Allow**.
   - Wait for the red recording dot, then **speak clearly into your mic**:
     > *"Send the invoice by Friday, thanks Sam"*
   - The text should appear in the input box. Click **"🗣️ Ask Alexa"**.
3. **For Text Testing (If mic doesn't work):**
   - Type this in the box: `send the invoice by Friday, thanks Sam`
   - Click **"🗣️ Ask Alexa"**.
4. **Result to check:** 
   - If the server is asleep, the button will say *"Waking up the server..."*.
   - Once awake, it will show: **"✅ Found 1 task: Send invoice — Sam · [Date] · high"**.
   - The task will automatically appear in the main task list below.

---

### Test 5: Database Persistence & Deduplication
1. Look at the number of tasks you have (e.g., Tasks (5)).
2. Click the **"Extract Tasks"** button again with the same "Project update" email.
3. **Result to check:** An alert will pop up saying *"No new tasks. They may already exist..."*. The app prevents duplicate tasks.
4. **Refresh the entire webpage (F5).**
5. **Result to check:** All your tasks and their updated statuses (like "done") will remain on the screen, proving they are saved in MongoDB.

---
*Built with React, Node.js, Express, MongoDB, Google Gemini API, and MCP SDK.*

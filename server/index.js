require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const connectDB = require('./db');
const Task = require('./models/Task');

const app = express();
app.set('trust proxy', 1); // Fix for Render proxy

// Fix 1: Security - Allow Vercel and Localhost
app.use(cors({ origin: ['https://ai-ops-copilot-two.vercel.app', 'http://localhost:5173'] }));
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fix 2: Protect API from spam
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Raised to 100
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again in a few minutes.' }
});

// Fix 3: Clean AI Data (Sanitize)
const cleanTaskData = (t) => ({
  title: String(t.title || '').trim(),
  client: t.client || 'Unknown',
  deadline: t.deadline || 'No deadline',
  priority: ['high', 'medium', 'low'].includes(String(t.priority).toLowerCase())
    ? String(t.priority).toLowerCase()
    : 'medium',
});

// Normalize a task title for deduplication
function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/\b(the|a|an)\b/g, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Connect to MongoDB
connectDB();

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// --- MCP-backed endpoint (for Alexa+ UI) ---
app.post('/api/mcp/parse-email', apiLimiter, async (req, res) => {
  const { emailText } = req.body;

  if (!emailText || !emailText.trim()) {
    return res.status(400).json({ source: 'mcp', error: 'emailText is required' });
  }

  try {
    console.log('[MCP] parse_email called via HTTP');
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3.5-flash-lite',
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `You are an assistant that extracts tasks from client emails.
Return ONLY valid JSON, no markdown, no extra text.
Format: { "tasks": [ { "title": "short description", "client": "client name", "deadline": "YYYY-MM-DD or 'No deadline'", "priority": "high" | "medium" | "low" } ] }
Rules:
- Extract every distinct actionable task
- For "client": ALWAYS look at the email's signoff/signature. If multiple names appear, use the sender's name. Only use "Unknown" if truly no name exists.
- Use today's date (${new Date().toISOString().split('T')[0]}) as reference for relative deadlines
- Convert all deadlines to YYYY-MM-DD format
- Priority: high if urgent/critical/ASAP or deadline within 3 days, medium default, low if "no rush"/"whenever"

Email:
"""
${emailText}
"""`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const clean = text.replace(/```json|```/g, '').trim();
    let parsed = JSON.parse(clean);

    // Fix 4: Validate array and filter empty titles
    parsed = {
      tasks: Array.isArray(parsed?.tasks)
        ? parsed.tasks.map(cleanTaskData).filter((t) => t.title)
        : [],
    };

    const allExisting = await Task.find({}, 'title client');
    const existingNormalized = new Set(allExisting.map((e) => normalizeTitle(e.title) + '|' + String(e.client || '').toLowerCase()));

    const newTasks = [];
    for (const t of parsed.tasks) {
      const norm = normalizeTitle(t.title) + '|' + String(t.client || '').toLowerCase();
      if (!existingNormalized.has(norm)) {
        newTasks.push(t);
        existingNormalized.add(norm);
      }
    }

    const savedTasks = newTasks.length > 0 ? await Task.insertMany(newTasks) : [];
    const skipped = parsed.tasks.length - savedTasks.length;
    console.log(`[MCP] Saved ${savedTasks.length} new tasks (${skipped} duplicates skipped)`);

    res.json({
      source: 'mcp',
      tool: 'parse_email',
      tasks: savedTasks,
      duplicatesSkipped: skipped,
    });
  } catch (err) {
    console.error('[MCP] Error:', err.message);
    res.status(500).json({ source: 'mcp', error: 'AI parsing failed', details: err.message });
  }
});

// --- Parse email + save tasks to DB ---
app.post('/api/parse-email', apiLimiter, async (req, res) => {
  const { emailText } = req.body;

  if (!emailText || !emailText.trim()) {
    return res.status(400).json({ error: 'emailText is required' });
  }

  try {
    console.log('--- Parsing email ---');
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3.5-flash-lite',
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `You are an assistant that extracts tasks from client emails.
Return ONLY valid JSON, no markdown, no extra text.
Format: { "tasks": [ { "title": "short description", "client": "client name", "deadline": "YYYY-MM-DD or 'No deadline'", "priority": "high" | "medium" | "low" } ] }
Rules:
- Extract every distinct actionable task
- For "client": ALWAYS look at the email's signoff/signature (e.g., "Thanks, Rahul" → client is "Rahul"). If multiple names appear, use the sender's name. Only use "Unknown" if truly no name exists anywhere.
- Use today's date (${new Date().toISOString().split('T')[0]}) as reference for relative deadlines
- Convert all deadlines to YYYY-MM-DD format
- Priority: high if urgent/critical/ASAP or deadline within 3 days, medium default, low if "no rush"/"whenever"

Email:
"""
${emailText}
"""`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const clean = text.replace(/```json|```/g, '').trim();
    let parsed = JSON.parse(clean);

    // Fix 4: Validate array and filter empty titles
    parsed = {
      tasks: Array.isArray(parsed?.tasks)
        ? parsed.tasks.map(cleanTaskData).filter((t) => t.title)
        : [],
    };

    const allExisting = await Task.find({}, 'title client');
    const existingNormalized = new Set(allExisting.map((e) => normalizeTitle(e.title) + '|' + String(e.client || '').toLowerCase()));

    const newTasks = [];
    for (const t of parsed.tasks) {
      const norm = normalizeTitle(t.title) + '|' + String(t.client || '').toLowerCase();
      if (!existingNormalized.has(norm)) {
        newTasks.push(t);
        existingNormalized.add(norm);
      }
    }

    const savedTasks = newTasks.length > 0 ? await Task.insertMany(newTasks) : [];
    const skipped = parsed.tasks.length - savedTasks.length;
    console.log(`✅ Saved ${savedTasks.length} new tasks (${skipped} duplicates skipped)`);

    res.json({ tasks: savedTasks, duplicatesSkipped: skipped });
  } catch (err) {
    console.error('=== BACKEND ERROR ===');
    console.error('Message:', err.message);
    res.status(500).json({ error: 'AI parsing failed', details: err.message });
  }
});

// --- Get all tasks ---
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (err) {
    console.error('Error fetching tasks:', err.message);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// --- Delete all tasks (Clear All button) ---
app.delete('/api/tasks', async (req, res) => {
  try {
    const result = await Task.deleteMany({});
    console.log(`🗑️ Deleted ${result.deletedCount} tasks`);
    res.json({ deleted: result.deletedCount });
  } catch (err) {
    console.error('Error deleting tasks:', err.message);
    res.status(500).json({ error: 'Failed to delete tasks' });
  }
});

// --- Update task status ---
app.patch('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['pending', 'in-progress', 'done'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be pending, in-progress, or done.' });
  }

  try {
    const task = await Task.findByIdAndUpdate(id, { status }, { returnDocument: 'after' });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    console.log(`🔄 Task status updated: ${task.title} → ${status}`);
    res.json({ task });
  } catch (err) {
    console.error('Error updating task:', err.message);
    res.status(500).json({ error: 'Failed to update task', details: err.message });
  }
});

// --- Draft a polite reminder for a task ---
app.post('/api/draft-reminder', apiLimiter, async (req, res) => {
  const { taskId } = req.body;

  if (!taskId) {
    return res.status(400).json({ error: 'taskId is required' });
  }

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    console.log(`--- Drafting reminder for: ${task.title} ---`);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });

    const prompt = `You are an assistant that drafts short, polite reminder emails to clients.

Write a professional reminder email for the following task. Keep it under 100 words. Be warm but direct. Do NOT include a subject line. Do NOT include signatures beyond a simple sign-off.

Task details:
- Title: ${task.title}
- Client: ${task.client}
- Deadline: ${task.deadline}
- Priority: ${task.priority}

Return ONLY the email body text, no JSON, no markdown.`;

    const result = await model.generateContent(prompt);
    const draft = result.response.text().trim();

    res.json({ draft, taskId: task._id, taskTitle: task.title });
  } catch (err) {
    console.error('Error drafting reminder:', err.message);
    res.status(500).json({ error: 'Failed to draft reminder', details: err.message });
  }
});

// --- Send a reminder (logs to console for demo) ---
app.post('/api/send-reminder', async (req, res) => {
  const { taskId, draft } = req.body;

  if (!taskId || !draft) {
    return res.status(400).json({ error: 'taskId and draft are required' });
  }

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    console.log('=== REMINDER SENT (Simulated) ===');
    console.log(`To: ${task.client}`);
    console.log(`Re: ${task.title}`);
    console.log('---');
    console.log(draft);
    console.log('====================');

    res.json({ sent: true, to: task.client, taskId: task._id });
  } catch (err) {
    console.error('Error sending reminder:', err.message);
    res.status(500).json({ error: 'Failed to send reminder', details: err.message });
  }
});

// --- Parse a client reply and suggest a status update ---
app.post('/api/parse-reply', apiLimiter, async (req, res) => {
  const { taskId, replyText } = req.body;

  if (!taskId || !replyText || !replyText.trim()) {
    return res.status(400).json({ error: 'taskId and replyText are required' });
  }

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    console.log(`--- Analyzing reply for: ${task.title} ---`);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3.5-flash-lite',
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `You are an assistant that reads a client's reply to a task reminder and determines the task's new status.
Return ONLY valid JSON, no markdown, no extra text.
Format: { "status": "done" | "in-progress" | "pending", "confidence": "high" | "medium" | "low", "reasoning": "one short sentence" }
Rules:
- "done" → client says it's completed, finished, sent, submitted, or approved
- "in-progress" → client says it's delayed, still working on it, needs more time, will send later
- "pending" → client asks a question, needs clarification, or is non-committal

Task: ${task.title}
Client: ${task.client}
Client's reply:
"""
${replyText}
"""`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    // Fix 5: Validate status coming from AI
    if (!['done', 'in-progress', 'pending'].includes(parsed.status)) {
      parsed.status = 'pending';
    }

    console.log(`Suggested status: ${parsed.status} (${parsed.confidence} confidence)`);

    res.json({
      suggestedStatus: parsed.status,
      confidence: parsed.confidence,
      reasoning: parsed.reasoning,
      currentStatus: task.status,
      taskTitle: task.title,
    });
  } catch (err) {
    console.error('Error parsing reply:', err.message);
    res.status(500).json({ error: 'Failed to analyze reply', details: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
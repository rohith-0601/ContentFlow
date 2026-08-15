const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const ContentAsset = require('../models/ContentAsset');
const Task = require('../models/Task');
const ChatLog = require('../models/ChatLog');

// POST /api/chatbot
router.post('/', async (req, res, next) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-api-key-here') {
      // Return a helpful fallback response when no API key is set
      const fallbackResponse = generateFallbackResponse(message);
      
      await ChatLog.create({ role: 'user', message });
      await ChatLog.create({ role: 'assistant', message: fallbackResponse });
      
      return res.json({ role: 'assistant', message: fallbackResponse });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Build context based on the request
    let systemPrompt = `You are ContentFlow Assistant, an AI helper for a CMS and sprint tracking tool. You help with:
1. Content QA: Review content for grammar, clarity, and tone consistency.
2. Delay Flagging: Identify overdue tasks (past due date, not in "Done" column).
3. Standup Summaries: Summarize what changed across tasks in the last 24 hours.

Be concise, professional, and direct. Do not use emojis. Use plain text formatting.`;

    // Detect intent and fetch relevant data
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('delay') || lowerMessage.includes('overdue') || lowerMessage.includes('behind') || lowerMessage.includes('late')) {
      const overdueTasks = await Task.find({
        dueDate: { $lt: new Date() },
        column: { $ne: 'Done' },
      });
      systemPrompt += `\n\nOverdue tasks (due date passed, not in Done column):\n${JSON.stringify(overdueTasks, null, 2)}`;
    }

    if (lowerMessage.includes('standup') || lowerMessage.includes('summary') || lowerMessage.includes('update') || lowerMessage.includes('changed')) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentTasks = await Task.find({ updatedAt: { $gte: since } });
      systemPrompt += `\n\nTasks updated in the last 24 hours:\n${JSON.stringify(recentTasks, null, 2)}`;
    }

    if (lowerMessage.includes('review') || lowerMessage.includes('content') || lowerMessage.includes('grammar') || lowerMessage.includes('clarity') || lowerMessage.includes('tone')) {
      if (context && context.contentAssetId) {
        const asset = await ContentAsset.findById(context.contentAssetId);
        if (asset) {
          systemPrompt += `\n\nContent asset to review:\nTitle: ${asset.title}\nBody: ${asset.body}\nStatus: ${asset.status}`;
        }
      } else {
        const assets = await ContentAsset.find({ status: { $in: ['Draft', 'In Review'] } }).limit(5);
        if (assets.length > 0) {
          systemPrompt += `\n\nRecent content assets in Draft/In Review:\n${JSON.stringify(assets.map(a => ({ title: a.title, body: a.body, status: a.status })), null, 2)}`;
        }
      }
    }

    // Get recent chat history for context
    const recentLogs = await ChatLog.find().sort({ timestamp: -1 }).limit(10);
    const chatHistory = recentLogs.reverse().map((log) => ({
      role: log.role,
      content: log.message,
    }));

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...chatHistory,
        { role: 'user', content: message },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const assistantMessage = completion.choices[0].message.content;

    // Save chat logs
    await ChatLog.create({ role: 'user', message });
    await ChatLog.create({ role: 'assistant', message: assistantMessage });

    res.json({ role: 'assistant', message: assistantMessage });
  } catch (err) {
    next(err);
  }
});

// GET chat history
router.get('/history', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = await ChatLog.find().sort({ timestamp: -1 }).limit(limit);
    res.json(logs.reverse());
  } catch (err) {
    next(err);
  }
});

// DELETE clear chat history
router.delete('/history', async (req, res, next) => {
  try {
    await ChatLog.deleteMany({});
    res.json({ message: 'Chat history cleared' });
  } catch (err) {
    next(err);
  }
});

// Fallback response generator when no API key is configured
function generateFallbackResponse(message) {
  const lower = message.toLowerCase();

  if (lower.includes('delay') || lower.includes('overdue') || lower.includes("what's delayed")) {
    return 'To check delayed tasks, I need to connect to the OpenAI API. Please configure your OPENAI_API_KEY in the server/.env file. In the meantime, you can check the Sprint Board for tasks with past due dates that are not in the Done column.';
  }

  if (lower.includes('standup') || lower.includes('summary')) {
    return 'To generate standup summaries, I need the OpenAI API connection. Please set your OPENAI_API_KEY in server/.env. You can view the Standup Summary page for a manual overview of recent task changes.';
  }

  if (lower.includes('review') || lower.includes('grammar') || lower.includes('content')) {
    return 'Content QA requires the OpenAI API for analysis. Please configure your OPENAI_API_KEY in server/.env to enable grammar, clarity, and tone review features.';
  }

  return 'I am the ContentFlow Assistant. I can help with content QA, delay flagging, and standup summaries. Please configure the OPENAI_API_KEY in your server/.env file to enable full AI capabilities.';
}

module.exports = router;

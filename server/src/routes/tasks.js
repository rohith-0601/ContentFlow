const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// GET standup summary (tasks updated in last 24h grouped by assignee)
router.get('/standup', async (req, res, next) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const tasks = await Task.find({ updatedAt: { $gte: since } }).sort({ updatedAt: -1 });

    const grouped = {};
    tasks.forEach((task) => {
      if (!grouped[task.assignee]) {
        grouped[task.assignee] = [];
      }
      grouped[task.assignee].push(task);
    });

    res.json({ since: since.toISOString(), groups: grouped });
  } catch (err) {
    next(err);
  }
});

// GET all tasks
router.get('/', async (req, res, next) => {
  try {
    const { column, assignee, priority } = req.query;
    const filter = {};
    if (column) filter.column = column;
    if (assignee) filter.assignee = assignee;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter).sort({ updatedAt: -1 });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// GET single task
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// POST create task
router.post('/', async (req, res, next) => {
  try {
    const { title, description, assignee, dueDate, priority, column } = req.body;
    const task = new Task({
      title,
      description,
      assignee,
      dueDate,
      priority: priority || 'Medium',
      column: column || 'Backlog',
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

// PUT update task
router.put('/:id', async (req, res, next) => {
  try {
    const { title, description, assignee, dueDate, priority, column } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, assignee, dueDate, priority, column },
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// PATCH move task to a different column (drag-and-drop)
router.patch('/:id/column', async (req, res, next) => {
  try {
    const { column } = req.body;
    const validColumns = ['Backlog', 'In Progress', 'QA', 'Done'];
    if (!validColumns.includes(column)) {
      return res.status(400).json({ error: `Invalid column: ${column}` });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { column },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// DELETE task
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

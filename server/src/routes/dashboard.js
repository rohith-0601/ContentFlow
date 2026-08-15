const express = require('express');
const router = express.Router();
const ContentAsset = require('../models/ContentAsset');
const Task = require('../models/Task');

// GET /api/dashboard
router.get('/', async (req, res, next) => {
  try {
    // Content stats by status
    const contentStats = await ContentAsset.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const contentByStatus = { Draft: 0, 'In Review': 0, Approved: 0, Published: 0 };
    contentStats.forEach((s) => {
      contentByStatus[s._id] = s.count;
    });

    // Task stats by column
    const taskStats = await Task.aggregate([
      { $group: { _id: '$column', count: { $sum: 1 } } },
    ]);
    const tasksByColumn = { Backlog: 0, 'In Progress': 0, QA: 0, Done: 0 };
    taskStats.forEach((s) => {
      tasksByColumn[s._id] = s.count;
    });

    // Overdue tasks count
    const overdueCount = await Task.countDocuments({
      dueDate: { $lt: new Date() },
      column: { $ne: 'Done' },
    });

    // Recent activity (last 20 status changes from content assets)
    const assetsWithHistory = await ContentAsset.find({
      'history.0': { $exists: true },
    })
      .sort({ updatedAt: -1 })
      .limit(20);

    const recentActivity = [];
    assetsWithHistory.forEach((asset) => {
      asset.history.forEach((entry) => {
        recentActivity.push({
          assetId: asset._id,
          assetTitle: asset.title,
          status: entry.status,
          changedBy: entry.changedBy,
          comment: entry.comment,
          timestamp: entry.timestamp,
        });
      });
    });

    // Sort by timestamp descending, limit to 20
    recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedActivity = recentActivity.slice(0, 20);

    res.json({
      contentByStatus,
      tasksByColumn,
      overdueCount,
      totalContent: Object.values(contentByStatus).reduce((a, b) => a + b, 0),
      totalTasks: Object.values(tasksByColumn).reduce((a, b) => a + b, 0),
      recentActivity: limitedActivity,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    assignee: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    column: {
      type: String,
      enum: ['Backlog', 'In Progress', 'QA', 'Done'],
      default: 'Backlog',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', taskSchema);

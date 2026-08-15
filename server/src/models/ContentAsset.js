const mongoose = require('mongoose');

const historyEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['Draft', 'In Review', 'Approved', 'Published'],
      required: true,
    },
    changedBy: { type: String, required: true },
    comment: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const contentAssetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Draft', 'In Review', 'Approved', 'Published'],
      default: 'Draft',
    },
    owner: { type: String, required: true, trim: true },
    history: [historyEntrySchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ContentAsset', contentAssetSchema);

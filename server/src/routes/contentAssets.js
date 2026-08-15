const express = require('express');
const router = express.Router();
const ContentAsset = require('../models/ContentAsset');

// Valid status transitions
const VALID_TRANSITIONS = {
  Draft: ['In Review'],
  'In Review': ['Approved', 'Draft'],
  Approved: ['Published', 'Draft'],
  Published: [],
};

// GET all content assets
router.get('/', async (req, res, next) => {
  try {
    const { status, owner } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (owner) filter.owner = owner;

    const assets = await ContentAsset.find(filter).sort({ updatedAt: -1 });
    res.json(assets);
  } catch (err) {
    next(err);
  }
});

// GET single content asset
router.get('/:id', async (req, res, next) => {
  try {
    const asset = await ContentAsset.findById(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Content asset not found' });
    res.json(asset);
  } catch (err) {
    next(err);
  }
});

// POST create content asset
router.post('/', async (req, res, next) => {
  try {
    const { title, body, owner } = req.body;
    const asset = new ContentAsset({
      title,
      body,
      owner,
      status: 'Draft',
      history: [
        {
          status: 'Draft',
          changedBy: owner,
          timestamp: new Date(),
        },
      ],
    });
    await asset.save();
    res.status(201).json(asset);
  } catch (err) {
    next(err);
  }
});

// PUT update content asset (title, body, owner)
router.put('/:id', async (req, res, next) => {
  try {
    const { title, body, owner } = req.body;
    const asset = await ContentAsset.findByIdAndUpdate(
      req.params.id,
      { title, body, owner },
      { new: true, runValidators: true }
    );
    if (!asset) return res.status(404).json({ error: 'Content asset not found' });
    res.json(asset);
  } catch (err) {
    next(err);
  }
});

// PATCH update status with workflow validation
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status, changedBy, comment } = req.body;
    const asset = await ContentAsset.findById(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Content asset not found' });

    const allowed = VALID_TRANSITIONS[asset.status];
    if (!allowed || !allowed.includes(status)) {
      return res.status(400).json({
        error: `Cannot transition from "${asset.status}" to "${status}"`,
      });
    }

    asset.status = status;
    asset.history.push({
      status,
      changedBy: changedBy || 'System',
      comment: comment || '',
      timestamp: new Date(),
    });
    await asset.save();
    res.json(asset);
  } catch (err) {
    next(err);
  }
});

// DELETE content asset
router.delete('/:id', async (req, res, next) => {
  try {
    const asset = await ContentAsset.findByIdAndDelete(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Content asset not found' });
    res.json({ message: 'Content asset deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

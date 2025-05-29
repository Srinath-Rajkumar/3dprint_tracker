// backend/controllers/costController.js
import asyncHandler from 'express-async-handler';
import CostSettings from '../models/CostSettings.js';

// @desc    Get current cost settings
// @route   GET /api/cost/settings
// @access  Private (Admin can view, users might need it for estimation)
const getCostSettings = asyncHandler(async (req, res) => {
  const settings = await CostSettings.getSettings(); // Uses the static method
  res.json(settings);
});

// @desc    Update cost settings
// @route   PUT /api/cost/settings
// @access  Private/Admin
const updateCostSettings = asyncHandler(async (req, res) => {
  const { pricePerMinute, pricePerGramFilament } = req.body;

  let settings = await CostSettings.findOne();
  if (!settings) {
    // If somehow no settings exist, create them (getSettings would also do this)
    settings = await CostSettings.create({
        pricePerMinute: pricePerMinute || 0.10,
        pricePerGramFilament: pricePerGramFilament || 0.05,
        lastUpdatedBy: req.user._id,
    });
  } else {
    settings.pricePerMinute = pricePerMinute !== undefined ? Number(pricePerMinute) : settings.pricePerMinute;
    settings.pricePerGramFilament = pricePerGramFilament !== undefined ? Number(pricePerGramFilament) : settings.pricePerGramFilament;
    settings.lastUpdatedBy = req.user._id;
    await settings.save();
  }
  res.json(settings);
});

export { getCostSettings, updateCostSettings };
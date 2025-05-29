// backend/models/CostSettings.js
import mongoose from 'mongoose';

const costSettingsSchema = mongoose.Schema(
  {
    // Using a single document for cost settings, can be found by a unique identifier or just the first one.
    // For simplicity, we can assume there's only one document.
    // Or, if you want settings per profile (FDM, Resin etc.)
    // profileType: { type: String, enum: ['FDM', 'Resin', 'Laser'], unique: true, required: true },
    
    pricePerMinute: {
      type: Number,
      required: true,
      default: 0.1, // Example: $0.10 per minute
    },
    pricePerGramFilament: {
      type: Number,
      required: true,
      default: 0.05, // Example: $0.05 per gram
    },
    // You can add more settings if needed
    // currencySymbol: { type: String, default: '$' },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Ensure only one cost settings document exists for simplicity, or manage by profileType
// costSettingsSchema.index({ /* some unique field if needed */ }, { unique: true });


const CostSettings = mongoose.model('CostSettings', costSettingsSchema);

// Function to get or create default settings
CostSettings.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      pricePerMinute: 0.10, // Default price per minute
      pricePerGramFilament: 0.05, // Default price per gram
    });
    console.log('Default cost settings created.');
  }
  return settings;
};


export default CostSettings;
import mongoose from 'mongoose';

const printerSchema = mongoose.Schema({
    name: { type: String, required: true },
    company: { type: String },
    model: { type: String },
    buildSize: { // Example: { x: 200, y: 200, z: 250 } for mm
        x: { type: Number },
        y: { type: Number },
        z: { type: Number },
    },
    imagePath: { type: String }, // Path to uploaded image
    status: { type: String, enum: ['available', 'in_production', 'maintenance'], default: 'available' },
    // Aggregated stats (can be calculated or updated via triggers/jobs)
    totalPrintTimeSeconds: { type: Number, default: 0 },
    totalFilamentUsedGrams: { type: Number, default: 0 },
    completedJobsCount: { type: Number, default: 0 },
    failedJobsCount: { type: Number, default: 0 },
}, { timestamps: true });

const Printer = mongoose.model('Printer', printerSchema);
export default Printer;
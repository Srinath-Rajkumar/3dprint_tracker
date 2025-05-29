import mongoose from 'mongoose';

const projectSchema = mongoose.Schema({
    projectName: { type: String, required: true },
    orderId: { type: String, unique: true, sparse: true }, // sparse allows multiple nulls
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    status: { type: String, enum: ['ongoing', 'completed', 'cancelled'], default: 'ongoing' },
    // Cost related fields can be calculated or stored if needed
    // totalCostTimeBased: { type: Number },
    // totalCostFilamentBased: { type: Number },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);
export default Project;
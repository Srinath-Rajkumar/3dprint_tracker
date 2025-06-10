import mongoose from 'mongoose';


const printJobSchema = mongoose.Schema({
    project: { // For easier querying and denormalization
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    part: { // Reference to the conceptual Part document (e.g., "Hand")
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Part',
      required: true,
    },
    // 'partName' can be removed if you always populate 'part' and get conceptualPartName from there.
    // Or keep it for denormalization if you frequently display it without populating.
    // For now, let's assume you'll populate part.conceptualPartName for display.

    machinePlateNo: { // Identifier for the specific piece of the conceptual part
      type: String, // Can be "1", "2", "A", "Top Section", etc.
      required: true, // This piece identifier is crucial
    },
    machine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Printer',
      required: true,
    },
    printTimeScheduledSeconds: { type: Number, required: true },
    weightGrams: { type: Number, required: true },
    jobStartDate: { type: Date, default: Date.now },
    jobStartTime: { type: String },
    status: { type: String, enum: ['printing', 'completed', 'failed'], default: 'printing' },
    isReprint: { type: Boolean, default: false },
    originalFailedJob: { type: mongoose.Schema.Types.ObjectId, ref: 'PrintJob', default: null },
    actualPrintTimeSeconds: { type: Number },
    actualEndTime: { type: Date },
    failReason: { type: String },
    filamentType: { type: String, trim: true }, 
}, { timestamps: true });

// Helper to convert "days hrs mins" string to seconds
printJobSchema.statics.parsePrintTimeToSeconds = function(timeString) {
    if (!timeString || typeof timeString !== 'string') return NaN;
    let totalSeconds = 0;
    const daysMatch = timeString.match(/(\d+)\s*days?/i);
    const hoursMatch = timeString.match(/(\d+)\s*hrs?/i);
    const minsMatch = timeString.match(/(\d+)\s*mins?/i);

    if (daysMatch) totalSeconds += parseInt(daysMatch[1]) * 24 * 60 * 60;
    if (hoursMatch) totalSeconds += parseInt(hoursMatch[1]) * 60 * 60;
    if (minsMatch) totalSeconds += parseInt(minsMatch[1]) * 60;
    
    // If no specific unit matched, but it's just a number, assume minutes.
    // This part is tricky and depends on your expected input format.
    // if (totalSeconds === 0 && /^\d+$/.test(timeString)) {
    //     totalSeconds = parseInt(timeString) * 60; // Or handle as error
    // }

    return totalSeconds > 0 ? totalSeconds : NaN; // Return NaN if parsing failed or resulted in 0/negative
};

// Helper to format seconds to "X days Y hrs Z mins"
printJobSchema.methods.formatPrintTime = function(totalSeconds) {
    if (!totalSeconds && totalSeconds !== 0) return '';
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    totalSeconds %= (24 * 60 * 60);
    const hours = Math.floor(totalSeconds / (60 * 60));
    totalSeconds %= (60 * 60);
    const minutes = Math.floor(totalSeconds / 60);

    let result = [];
    if (days > 0) result.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) result.push(`${hours} hr${hours > 1 ? 's' : ''}`);
    if (minutes > 0) result.push(`${minutes} min${minutes > 1 ? 's' : ''}`);
    return result.join(' ') || '0 min';
};


const PrintJob = mongoose.model('PrintJob', printJobSchema);
export default PrintJob;
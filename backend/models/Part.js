// import mongoose from 'mongoose';

// const partSchema = mongoose.Schema({
//     project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
//     partName: { type: String, required: true },
//     // Fields from your tracking sheet example
//     // These might be better suited in a PrintJob model linked to this Part
// }, { timestamps: true });

// const Part = mongoose.model('Part', partSchema);
// export default Part;

// backend/models/Part.js
import mongoose from 'mongoose';

const partSchema = mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    conceptualPartName: { // Renamed from partName for clarity
      type: String,
      required: true,
    },
    totalPieces: { // Optional: if you want to track how many pieces this conceptual part is split into
        type: Number,
        min: 1
    }
    // Add other fields specific to the conceptual part if needed
    // e.g., notes, design_file_link, etc.
  },
  { timestamps: true }
);

// A conceptual part name should be unique within a project
partSchema.index({ project: 1, conceptualPartName: 1 }, { unique: true });

const Part = mongoose.model('Part', partSchema);
export default Part;
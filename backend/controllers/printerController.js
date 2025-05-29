// backend/controllers/printerController.js
import asyncHandler from 'express-async-handler';
import Printer from '../models/Printer.js';
import PrintJob from '../models/PrintJob.js'; // For calculating stats

// @desc    Add a new printer
// @route   POST /api/printers
// @access  Private (User or Admin) - Assuming users can add printers they use
// const addPrinter = asyncHandler(async (req, res) => {
//   const { name, company, model, buildSizeX, buildSizeY, buildSizeZ } = req.body;

//   // buildSize could be an object { x, y, z }
//   const buildSize = {
//     x: buildSizeX ? Number(buildSizeX) : undefined,
//     y: buildSizeY ? Number(buildSizeY) : undefined,
//     z: buildSizeZ ? Number(buildSizeZ) : undefined,
//   };

//   const printer = new Printer({
//     name,
//     company,
//     model,
//     buildSize,
//     imagePath: req.file ? `/${req.file.path.replace(/\\/g, "/")}` : undefined, // Handle image path
//     // status will default to 'available'
//   });

//   const createdPrinter = await printer.save();
//   res.status(201).json(createdPrinter);
// });
const addPrinter = asyncHandler(async (req, res) => {
  // console.log('req.file in addPrinter:', req.file); // Good for debugging
  // console.log('req.body in addPrinter:', req.body);

  // It's good practice to check if req.file exists after multer processing
  if (!req.file && req.method === 'POST') { // For POST, an image might be expected
      // Decide if an image is mandatory for new printers
      // res.status(400);
      // throw new Error('Printer image is required for new printers.');
      // Or allow creation without an image:
      console.warn('No image uploaded for new printer, proceeding without it.');
  }


  const { name, company, model, buildSizeX, buildSizeY, buildSizeZ, status } = req.body;

  const buildSize = {
    x: buildSizeX ? Number(buildSizeX) : undefined,
    y: buildSizeY ? Number(buildSizeY) : undefined,
    z: buildSizeZ ? Number(buildSizeZ) : undefined,
  };

  const printer = new Printer({
    name,
    company,
    model,
    buildSize,
    // req.file.path from multer will be like 'uploads/image-123.jpg' (relative to backend root)
    // Prepending '/' makes it suitable for serving from the domain root if '/uploads' is static path
    imagePath: req.file ? `/${req.file.path.replace(/\\/g, "/")}` : undefined,
    status: status || 'available', // Default to available if not provided
  });

  const createdPrinter = await printer.save();
  res.status(201).json(createdPrinter);
});
// @desc    Get all printers
// @route   GET /api/printers
// @access  Private
const getPrinters = asyncHandler(async (req, res) => {
  const printers = await Printer.find({});
  // Optionally, enrich with dynamic stats if not stored directly
  // For now, assuming stats are updated separately or we query them live if needed
  res.json(printers);
});

// @desc    Get printer by ID
// @route   GET /api/printers/:id
// @access  Private
const getPrinterById = asyncHandler(async (req, res) => {
  const printer = await Printer.findById(req.params.id);
  if (printer) {
    // Calculate live stats for this specific printer if not stored
    const jobs = await PrintJob.find({ machine: printer._id });
    let totalPrintTimeSeconds = 0;
    let totalFilamentUsedGrams = 0;
    let completedJobsCount = 0;
    let failedJobsCount = 0;

    jobs.forEach(job => {
        if (job.actualPrintTimeSeconds) {
            totalPrintTimeSeconds += job.actualPrintTimeSeconds;
        }
        if(job.status === 'completed') {
            completedJobsCount++;
            if (job.weightGrams) totalFilamentUsedGrams += job.weightGrams; // Only count filament for completed jobs
        } else if (job.status === 'failed') {
            failedJobsCount++;
        }
    });

    // This is for display, actual printer model might store aggregated values updated via hooks/jobs
    const printerWithStats = {
        ...printer.toObject(),
        calculatedTotalPrintTimeSeconds: totalPrintTimeSeconds,
        calculatedTotalFilamentUsedGrams: totalFilamentUsedGrams,
        calculatedCompletedJobsCount: completedJobsCount,
        calculatedFailedJobsCount: failedJobsCount,
        successRate: (completedJobsCount + failedJobsCount) > 0 ? (completedJobsCount / (completedJobsCount + failedJobsCount)) * 100 : 0,
        failureRate: (completedJobsCount + failedJobsCount) > 0 ? (failedJobsCount / (completedJobsCount + failedJobsCount)) * 100 : 0,
    };

    res.json(printerWithStats);
  } else {
    res.status(404);
    throw new Error('Printer not found');
  }
});

// @desc    Update a printer
// @route   PUT /api/printers/:id
// @access  Private (User or Admin)
const updatePrinter = asyncHandler(async (req, res) => {
  const { name, company, model, buildSizeX, buildSizeY, buildSizeZ, status } = req.body;

  const printer = await Printer.findById(req.params.id);

  if (printer) {
    printer.name = name || printer.name;
    printer.company = company || printer.company;
    printer.model = model || printer.model;
    if (buildSizeX || buildSizeY || buildSizeZ) {
        printer.buildSize = {
            x: buildSizeX ? Number(buildSizeX) : printer.buildSize.x,
            y: buildSizeY ? Number(buildSizeY) : printer.buildSize.y,
            z: buildSizeZ ? Number(buildSizeZ) : printer.buildSize.z,
        };
    }
    printer.status = status || printer.status;

    if (req.file) {
      printer.imagePath = `/${req.file.path.replace(/\\/g, "/")}`; // Update image path if a new one is uploaded
    }

    const updatedPrinter = await printer.save();
    res.json(updatedPrinter);
  } else {
    res.status(404);
    throw new Error('Printer not found');
  }
});

// @desc    Delete a printer
// @route   DELETE /api/printers/:id
// @access  Private/Admin (Only admin can delete printers)
const deletePrinter = asyncHandler(async (req, res) => {
  const printer = await Printer.findById(req.params.id);

  if (printer) {
    // Optional: Check if printer is used in any active print jobs before deleting
    const activeJobs = await PrintJob.findOne({ machine: printer._id, status: 'printing' });
    if (activeJobs) {
        res.status(400);
        throw new Error('Cannot delete printer. It is currently in use for an active print job.');
    }
    // Optional: unassign printer from completed/failed jobs or handle as needed
    
    await Printer.deleteOne({ _id: printer._id });
    res.json({ message: 'Printer removed' });
  } else {
    res.status(404);
    throw new Error('Printer not found');
  }
});

export { addPrinter, getPrinters, getPrinterById, updatePrinter, deletePrinter };
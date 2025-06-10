
import asyncHandler from 'express-async-handler';
import PrintJob from '../models/PrintJob.js';
import Project from '../models/Project.js';
import Printer from '../models/Printer.js';
import Part from '../models/Part.js';
import { PRINT_JOB_STATUS } from '../utils/constants.js';
import { parseGcodeFile } from '../utils/gcodeParser.js'; // Your new parser utility
import fs from 'fs'; // For deleting temp file
// Part model is somewhat implicit within PrintJob for this structure,
// as each PrintJob *is* for a "part". If you need a separate Part entity, adjust accordingly.

// @desc    Add a print job (a part to be printed) to a project
// @route   POST /api/tracking/project/:projectId/jobs
// @access  Private
const addPrintJobToProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const {
    conceptualPartName, // User provides the name for the conceptual part (e.g., "Hand")
    machinePlateNo,    // User provides the identifier for THIS specific piece (e.g., "1", "2", "Top")
    machineId,
    printTimeScheduled,
    weightGrams,
    jobStartDate,
    jobStartTime,
    totalPiecesInConcept, 
    filamentType,// Optional: if user specifies how many total pieces the "Hand" has
  } = req.body;

  const projectDoc = await Project.findById(projectId); // Renamed to avoid conflict
  if (!projectDoc) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (projectDoc.status === 'completed' || projectDoc.status === 'cancelled') {
    res.status(400);
    throw new Error(`Cannot add jobs to a ${projectDoc.status} project.`);
  }


 
  const machine = await Printer.findById(machineId);
  if (!machine) {
    res.status(404);
    throw new Error('Selected printer (machine) not found');
  }

  if (!conceptualPartName || conceptualPartName.trim() === '') {
    res.status(400);
    throw new Error('Conceptual Part Name (e.g., Hand, Leg) is required.');
  }
  if (!machinePlateNo || machinePlateNo.trim() === '') {
    res.status(400);
    throw new Error('Machine Plate No. / Piece Identifier is required.');
  }

  // Find or Create the conceptual Part document
  let partDoc = await Part.findOne({ project: projectId, conceptualPartName: conceptualPartName.trim() });

  if (!partDoc) {
    partDoc = new Part({
      project: projectId,
      conceptualPartName: conceptualPartName.trim(),
      totalPieces: totalPiecesInConcept ? Number(totalPiecesInConcept) : undefined,
    });
    await partDoc.save();
  } else if (totalPiecesInConcept && partDoc.totalPieces !== Number(totalPiecesInConcept)) {
    // Optional: Update totalPieces if provided and different
    partDoc.totalPieces = Number(totalPiecesInConcept);
    await partDoc.save();
  }

  // Parse printTimeScheduled (string) to seconds
  // This requires the static method in PrintJob model
  const printTimeScheduledSeconds = PrintJob.parsePrintTimeToSeconds(printTimeScheduled);
  if (isNaN(printTimeScheduledSeconds) || printTimeScheduledSeconds <=0) {
    res.status(400);
    throw new Error('Invalid scheduled print time format or value.');
  }
  // Optional: Check if this specific piece (part + machinePlateNo) is already actively printing
  const existingActiveJobForPiece = await PrintJob.findOne({
    part: partDoc._id,
    machinePlateNo: machinePlateNo.trim(),
    status: 'printing'
});
if (existingActiveJobForPiece) {
    res.status(400);
    throw new Error(`Piece "${machinePlateNo.trim()}" of part "${partDoc.conceptualPartName}" is already printing.`);
}

const printJob = new PrintJob({
  project: projectId,
  part: partDoc._id, // Link to the conceptual Part document
  machinePlateNo: machinePlateNo.trim(), // Store the piece identifier
  machine: machineId,
  printTimeScheduledSeconds,
  weightGrams: Number(weightGrams),
  jobStartDate: jobStartDate ? new Date(jobStartDate) : Date.now(),
  jobStartTime,
  status: 'printing',
  filamentType: filamentType || undefined,
});

  const createdPrintJob = await printJob.save();
  
  // Update printer status
  machine.status = 'in_production';
  await machine.save();
  // const populatedJob = await PrintJob.findById(createdPrintJob._id)
  //                                   .populate('part', 'conceptualPartName totalPieces')
  //                                   .populate('machine', 'name model');
  res.status(201).json(createdPrintJob);
});

// @desc    Get all print jobs for a specific project
// @route   GET /api/tracking/project/:projectId/jobs
// @access  Private
const getPrintJobsForProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const printJobs = await PrintJob.find({ project: projectId })
    .populate('machine', 'name model')
    .populate({ // Populate the 'part' field
      path: 'part',
      select: 'conceptualPartName totalPieces' // Select the fields you need
  }) // Populate conceptual part details
    .sort({ createdAt: 'asc' }); 
  res.json(printJobs);
});

// @desc    Get a single print job by its ID
// @route   GET /api/tracking/jobs/:jobId
// @access  Private
const getPrintJobById = asyncHandler(async (req, res) => {
    const printJob = await PrintJob.findById(req.params.jobId)
        .populate('machine', 'name status')
        .populate('project', 'projectName status')
        .populate('part', 'conceptualPartName totalPieces');
    if (printJob) {
        res.json(printJob);
    } else {
        res.status(404);
        throw new Error('Print job not found');
    }
});


// @desc    Update a print job (e.g., status, actual time, re-print info)
// @route   PUT /api/tracking/jobs/:jobId
// @access  Private
const updatePrintJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const {
    // Fields for editing the job itself
    machinePlateNo,
    machineId,
    printTimeScheduled, // This is a string like "2hr 30min"
    weightGrams,
    jobStartDate,
    jobStartTime,
    // Status related fields
    status,
    actualPrintTime, // This is a string like "2hr 15min"
    failReason,
    filamentType ,
  } = req.body;

  const printJob = await PrintJob.findById(jobId).populate('machine');
  if (!printJob) {
    res.status(404);
    throw new Error('Print job not found');
  }

  const oldStatus = printJob.status;
  const oldMachineId = printJob.machine?._id.toString();

  // Update core job details if provided
  if (machinePlateNo) printJob.machinePlateNo = machinePlateNo.trim();
  if (weightGrams) printJob.weightGrams = Number(weightGrams);
  if (jobStartDate) printJob.jobStartDate = new Date(jobStartDate);
  if (jobStartTime !== undefined) printJob.jobStartTime = jobStartTime; // Allow empty string
  if (filamentType !== undefined) printJob.filamentType = filamentType.trim() || null;
  if (printTimeScheduled) {
    const seconds = PrintJob.parsePrintTimeToSeconds(printTimeScheduled);
    if (!isNaN(seconds) && seconds > 0) {
      printJob.printTimeScheduledSeconds = seconds;
    } else {
      // Optionally throw error or ignore if format is invalid
      console.warn(`Invalid printTimeScheduled format for job ${jobId}: ${printTimeScheduled}`);
    }
  }

  if (machineId && machineId !== oldMachineId) {
    const newMachine = await Printer.findById(machineId);
    if (!newMachine) {
      res.status(404); throw new Error('New selected machine not found.');
    }
    if (newMachine.status === 'maintenance') {
      res.status(400); throw new Error('New selected machine is under maintenance.');
    }
    printJob.machine = newMachine._id;
    // Logic to update old and new printer statuses (if oldMachine existed)
    if (oldMachineId) {
        const oldMachineDoc = await Printer.findById(oldMachineId);
        if (oldMachineDoc && oldStatus === PRINT_JOB_STATUS.PRINTING) { // Only if it was printing on old machine
            const otherJobsOnOldMachine = await PrintJob.findOne({ machine: oldMachineId, status: 'printing', _id: { $ne: printJob._id } });
            if (!otherJobsOnOldMachine) oldMachineDoc.status = 'available';
            await oldMachineDoc.save();
        }
    }
    if (status === PRINT_JOB_STATUS.PRINTING || printJob.status === PRINT_JOB_STATUS.PRINTING) { // If new status is printing or was already printing
        newMachine.status = 'in_production';
        await newMachine.save();
    }
  }


  // Update status and related fields
  if (status) printJob.status = status;
  if (failReason && printJob.status === PRINT_JOB_STATUS.FAILED) {
    printJob.failReason = failReason;
  } else if (printJob.status !== PRINT_JOB_STATUS.FAILED) {
    printJob.failReason = undefined; // Clear fail reason if not failed
  }

  if (printJob.status === PRINT_JOB_STATUS.COMPLETED || printJob.status === PRINT_JOB_STATUS.FAILED) {
    printJob.actualEndTime = Date.now(); // Set/update end time
    if (actualPrintTime) { // User provided a specific actual time
      const seconds = PrintJob.parsePrintTimeToSeconds(actualPrintTime);
      if (!isNaN(seconds) && seconds >= 0) { // Allow 0 actual time
        printJob.actualPrintTimeSeconds = seconds;
      } else {
        console.warn(`Invalid actualPrintTime format for job ${jobId}: ${actualPrintTime}`);
        // Decide: use scheduled time, or clear it, or error?
        // If completed and actualPrintTime is invalid/blank, use scheduled time
        if (printJob.status === PRINT_JOB_STATUS.COMPLETED && (!printJob.actualPrintTimeSeconds || printJob.actualPrintTimeSeconds <= 0)) {
            printJob.actualPrintTimeSeconds = printJob.printTimeScheduledSeconds;
        }
      }
    } else if (printJob.status === PRINT_JOB_STATUS.COMPLETED && (!printJob.actualPrintTimeSeconds || printJob.actualPrintTimeSeconds <= 0) ) {
      // If status is completed and no actual time given, assume it took the scheduled time
      printJob.actualPrintTimeSeconds = printJob.printTimeScheduledSeconds;
    }
  } else { // If status is 'printing' or other non-final state
    printJob.actualEndTime = undefined;
    printJob.actualPrintTimeSeconds = undefined;
  }

  // Update printer stats and status (if status changed to final or machine changed)
  const finalMachine = await Printer.findById(printJob.machine);
  if (finalMachine) {
      if (printJob.status === PRINT_JOB_STATUS.COMPLETED && oldStatus !== PRINT_JOB_STATUS.COMPLETED) {
          finalMachine.completedJobsCount = (finalMachine.completedJobsCount || 0) + 1;
          finalMachine.totalPrintTimeSeconds = (finalMachine.totalPrintTimeSeconds || 0) + (printJob.actualPrintTimeSeconds || 0);
          finalMachine.totalFilamentUsedGrams = (finalMachine.totalFilamentUsedGrams || 0) + (printJob.weightGrams || 0);
          if (oldStatus === PRINT_JOB_STATUS.FAILED) finalMachine.failedJobsCount = Math.max(0, (finalMachine.failedJobsCount || 0) - 1); // Correct if changed from failed to completed
      } else if (printJob.status === PRINT_JOB_STATUS.FAILED && oldStatus !== PRINT_JOB_STATUS.FAILED) {
          finalMachine.failedJobsCount = (finalMachine.failedJobsCount || 0) + 1;
          if (oldStatus === PRINT_JOB_STATUS.COMPLETED) { // Correct if changed from completed to failed
            finalMachine.completedJobsCount = Math.max(0, (finalMachine.completedJobsCount || 0) - 1);
            finalMachine.totalPrintTimeSeconds = Math.max(0, (finalMachine.totalPrintTimeSeconds || 0) - (printJob.actualPrintTimeSeconds || 0)); // Revert previous actual time
            finalMachine.totalFilamentUsedGrams = Math.max(0, (finalMachine.totalFilamentUsedGrams || 0) - (printJob.weightGrams || 0));
          }
      }

      // Set machine status based on current jobs on it
      if (printJob.status === PRINT_JOB_STATUS.PRINTING) {
          finalMachine.status = 'in_production';
      } else { // Completed or Failed
          const otherJobsOnMachine = await PrintJob.findOne({ machine: finalMachine._id, status: 'printing', _id: { $ne: printJob._id } });
          if (!otherJobsOnMachine) {
              finalMachine.status = 'available';
          }
      }
      await finalMachine.save();
  }


  const updatedPrintJob = await printJob.save();
  res.json(updatedPrintJob);
});


// @desc    Handle re-printing a failed job
// @route   POST /api/tracking/jobs/:failedJobId/reprint
// @access  Private
const reprintFailedJob = asyncHandler(async (req, res) => {
  const { failedJobId } = req.params;
  const { newMachineId, newPrintTimeScheduled, newJobStartDate, newJobStartTime, newMachinePlateNoOverride } = req.body;

  const failedJob = await PrintJob.findById(failedJobId).populate('part'); // Populate part to get conceptualPartName if needed
  if (!failedJob || failedJob.status !== 'failed') {
      res.status(400);
      throw new Error('Original job not found or was not marked as failed.');
  }
  if (!failedJob.part) { // Should not happen if data is consistent
      res.status(500);
      throw new Error('Failed job is missing its conceptual part link.');
  }

    const newMachine = await Printer.findById(newMachineId);
    if (!newMachine) {
        res.status(404);
        throw new Error('New selected printer (machine) not found');
    }
    if (newMachine.status === 'maintenance') {
        res.status(400);
        throw new Error('Selected printer is under maintenance.');
    }


    let printTimeSeconds = failedJob.printTimeScheduledSeconds; // Default to original time
    if (newPrintTimeScheduled) {
        printTimeSeconds = PrintJob.parsePrintTimeToSeconds(newPrintTimeScheduled);
        if (isNaN(printTimeSeconds) || printTimeSeconds <= 0) {
            res.status(400);
            throw new Error('Invalid new scheduled print time format or value.');
        }
    }
    
    const reprintJob = new PrintJob({
      project: failedJob.project,
      part: failedJob.part._id, // Link to the SAME conceptual part
      machinePlateNo: newMachinePlateNoOverride || failedJob.machinePlateNo, // Use original plate no unless overridden
      machine: newMachineId,
      printTimeScheduledSeconds: printTimeSeconds,
      weightGrams: failedJob.weightGrams,
      jobStartDate: newJobStartDate ? new Date(newJobStartDate) : Date.now(),
      jobStartTime: newJobStartTime,
      status: 'printing',
      isReprint: true,
      originalFailedJob: failedJob._id,
  });

    const createdReprintJob = await reprintJob.save();
    
    newMachine.status = 'in_production';
    await newMachine.save();

    res.status(201).json(createdReprintJob);
});


// @desc    Delete a print job (e.g. if added by mistake)
// @route   DELETE /api/tracking/jobs/:jobId
// @access  Private (Admin or user who added it, if job not started)
const deletePrintJob = asyncHandler(async (req, res) => {
  const printJob = await PrintJob.findById(req.params.jobId).populate('machine');
  if (!printJob) {
    res.status(404);
    throw new Error('Print job not found');
  }

  // Add logic for who can delete, e.g., only if not completed/failed, or by admin.
  if (printJob.status === 'completed' || printJob.status === 'failed') {
      if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Completed or failed jobs can only be deleted by an admin.');
      }
  }

  const machine = printJob.machine;

  await PrintJob.deleteOne({ _id: printJob._id });

  // If this was the only job on the machine, set machine to available
  if (machine) {
      const otherJobsOnMachine = await PrintJob.findOne({ machine: machine._id, status: 'printing' });
      if (!otherJobsOnMachine) {
          const printerToUpdate = await Printer.findById(machine._id);
          if (printerToUpdate) {
              printerToUpdate.status = 'available';
              await printerToUpdate.save();
          }
      }
  }

  res.json({ message: 'Print job removed' });
});

// @desc    Parse an uploaded G-code file and extract details
// @route   POST /api/tracking/parse-gcode
// @access  Private
const parseGcodeAndExtractDetails = asyncHandler(async (req, res) => {
  // console.log('parseGcodeAndExtractDetails controller called.'); // Debug
  if (!req.file) {
    // console.log('No file received by controller in parseGcodeAndExtractDetails.'); // Debug
    res.status(400);
    throw new Error('No G-code file uploaded.');
  }
  // console.log('File received by controller:', req.file); // Debug

  const filePath = req.file.path;
  const originalFilename = req.file.originalname; // Get the original filename

  try {
    // Pass originalFilename to the parser
    const extractedData = await parseGcodeFile(filePath, originalFilename);
    // console.log('Controller received from parser:', extractedData); // Debug
    res.json(extractedData);
  } catch (error) {
    console.error('G-code parsing error in controller:', error);
    res.status(500);
    throw new Error('Failed to parse G-code file on server.');
  } finally {
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting temp gcode file:', filePath, err);
    });
  }
});

export {
  addPrintJobToProject,
  getPrintJobsForProject,
  getPrintJobById,
  updatePrintJob,
  reprintFailedJob,
  deletePrintJob,
  parseGcodeAndExtractDetails,
};
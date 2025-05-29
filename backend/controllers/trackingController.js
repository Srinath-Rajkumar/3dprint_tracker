// // backend/controllers/trackingController.js
// import asyncHandler from 'express-async-handler';
// import PrintJob from '../models/PrintJob.js';
// import Project from '../models/Project.js';
// import Printer from '../models/Printer.js';

// // Part model is somewhat implicit within PrintJob for this structure,
// // as each PrintJob *is* for a "part". If you need a separate Part entity, adjust accordingly.

// // @desc    Add a print job (a part to be printed) to a project
// // @route   POST /api/tracking/project/:projectId/jobs
// // @access  Private
// const addPrintJobToProject = asyncHandler(async (req, res) => {
//   const { projectId } = req.params;
//   const {
//     partName, // This effectively becomes the "Part Name" from your sheet
//     machinePlateNo,
//     machineId,
//     printTimeScheduled, // e.g., "2days 3hrs 30min" or "4hr 30min"
//     weightGrams,
//     jobStartDate, // Date string
//     jobStartTime, // Time string like "8:00pm"
//   } = req.body;

//   const project = await Project.findById(projectId);
//   if (!project) {
//     res.status(404);
//     throw new Error('Project not found');
//   }
//   if (project.status === 'completed') {
//     res.status(400);
//     throw new Error('Cannot add jobs to a completed project.');
//   }


//   const machine = await Printer.findById(machineId);
//   if (!machine) {
//     res.status(404);
//     throw new Error('Selected printer (machine) not found');
//   }

//   // Parse printTimeScheduled (string) to seconds
//   // This requires the static method in PrintJob model
//   const printTimeScheduledSeconds = PrintJob.parsePrintTimeToSeconds(printTimeScheduled);
//   if (isNaN(printTimeScheduledSeconds) || printTimeScheduledSeconds <=0) {
//     res.status(400);
//     throw new Error('Invalid scheduled print time format or value.');
//   }


//   const printJob = new PrintJob({
//     project: projectId,
//     partName, // Storing part name directly in print job
//     machinePlateNo,
//     machine: machineId,
//     printTimeScheduledSeconds,
//     weightGrams: Number(weightGrams),
//     jobStartDate: jobStartDate ? new Date(jobStartDate) : Date.now(),
//     jobStartTime, // Store as string for now, or combine with jobStartDate
//     status: 'printing', // Default status
//   });

//   const createdPrintJob = await printJob.save();
  
//   // Update printer status
//   machine.status = 'in_production';
//   await machine.save();
  
//   res.status(201).json(createdPrintJob);
// });

// // @desc    Get all print jobs for a specific project
// // @route   GET /api/tracking/project/:projectId/jobs
// // @access  Private
// const getPrintJobsForProject = asyncHandler(async (req, res) => {
//   const { projectId } = req.params;
//   const printJobs = await PrintJob.find({ project: projectId })
//     .populate('machine', 'name') // Populate machine name
//     .sort({ createdAt: 'asc' }); // Or by jobStartDate

//   res.json(printJobs);
// });

// // @desc    Get a single print job by its ID
// // @route   GET /api/tracking/jobs/:jobId
// // @access  Private
// const getPrintJobById = asyncHandler(async (req, res) => {
//     const printJob = await PrintJob.findById(req.params.jobId)
//         .populate('machine', 'name status')
//         .populate('project', 'projectName status');
    
//     if (printJob) {
//         res.json(printJob);
//     } else {
//         res.status(404);
//         throw new Error('Print job not found');
//     }
// });


// // @desc    Update a print job (e.g., status, actual time, re-print info)
// // @route   PUT /api/tracking/jobs/:jobId
// // @access  Private
// const updatePrintJob = asyncHandler(async (req, res) => {
//   const { jobId } = req.params;
//   const {
//     status, // 'completed', 'failed'
//     actualPrintTime, // "X days Y hrs Z mins" - will be parsed
//     failReason,
//     // Fields for re-printing (if status is 'failed' and user wants to re-print)
//     // This would typically trigger creating a NEW print job linked to this failed one.
//     // For simplicity, this update handles marking as failed/completed. Re-print is a new job.
//   } = req.body;

//   const printJob = await PrintJob.findById(jobId).populate('machine');
//   if (!printJob) {
//     res.status(404);
//     throw new Error('Print job not found');
//   }

//   const oldStatus = printJob.status;
//   const oldMachine = printJob.machine;

//   if (status) printJob.status = status;
//   if (failReason && status === 'failed') printJob.failReason = failReason;

//   if (status === 'completed' || status === 'failed') {
//     printJob.actualEndTime = Date.now();
//     if (actualPrintTime) {
//         printJob.actualPrintTimeSeconds = PrintJob.parsePrintTimeToSeconds(actualPrintTime);
//     } else if (status === 'completed' && !printJob.actualPrintTimeSeconds) {
//         // If completed and no actual time, assume it took the scheduled time
//         printJob.actualPrintTimeSeconds = printJob.printTimeScheduledSeconds;
//     }

//     // Update printer stats and status
//     if (oldMachine) {
//         const machine = await Printer.findById(oldMachine._id);
//         if (machine) {
//             if (status === 'completed') {
//                 machine.completedJobsCount = (machine.completedJobsCount || 0) + 1;
//                 machine.totalPrintTimeSeconds = (machine.totalPrintTimeSeconds || 0) + (printJob.actualPrintTimeSeconds || 0);
//                 machine.totalFilamentUsedGrams = (machine.totalFilamentUsedGrams || 0) + (printJob.weightGrams || 0);
//             } else if (status === 'failed') {
//                 machine.failedJobsCount = (machine.failedJobsCount || 0) + 1;
//             }
//             // Check if other jobs are running on this printer before setting to available
//             const otherJobsOnMachine = await PrintJob.findOne({ machine: machine._id, status: 'printing', _id: { $ne: printJob._id } });
//             if (!otherJobsOnMachine) {
//                 machine.status = 'available';
//             }
//             await machine.save();
//         }
//     }
//   }
//   // Update other fields if needed (partName, machinePlateNo, etc.)
//   // For now, focusing on status changes
//   const updatedPrintJob = await printJob.save();
//   res.json(updatedPrintJob);
// });


// // @desc    Handle re-printing a failed job
// // @route   POST /api/tracking/jobs/:failedJobId/reprint
// // @access  Private
// const reprintFailedJob = asyncHandler(async (req, res) => {
//     const { failedJobId } = req.params;
//     const { newMachineId, newPrintTimeScheduled, newJobStartDate, newJobStartTime } = req.body; // User provides new machine and potentially new time

//     const failedJob = await PrintJob.findById(failedJobId);
//     if (!failedJob || failedJob.status !== 'failed') {
//         res.status(400);
//         throw new Error('Original job not found or was not marked as failed.');
//     }

//     const newMachine = await Printer.findById(newMachineId);
//     if (!newMachine) {
//         res.status(404);
//         throw new Error('New selected printer (machine) not found');
//     }
//     if (newMachine.status === 'maintenance') {
//         res.status(400);
//         throw new Error('Selected printer is under maintenance.');
//     }


//     let printTimeSeconds = failedJob.printTimeScheduledSeconds; // Default to original time
//     if (newPrintTimeScheduled) {
//         printTimeSeconds = PrintJob.parsePrintTimeToSeconds(newPrintTimeScheduled);
//         if (isNaN(printTimeSeconds) || printTimeSeconds <= 0) {
//             res.status(400);
//             throw new Error('Invalid new scheduled print time format or value.');
//         }
//     }
    
//     const reprintJob = new PrintJob({
//         project: failedJob.project,
//         partName: failedJob.partName, // Same part
//         machinePlateNo: req.body.machinePlateNo || failedJob.machinePlateNo, // Can provide new plate no
//         machine: newMachineId,
//         printTimeScheduledSeconds: printTimeSeconds,
//         weightGrams: failedJob.weightGrams, // Same weight
//         jobStartDate: newJobStartDate ? new Date(newJobStartDate) : Date.now(),
//         jobStartTime: newJobStartTime,
//         status: 'printing',
//         isReprint: true,
//         originalFailedJob: failedJob._id,
//     });

//     const createdReprintJob = await reprintJob.save();
    
//     newMachine.status = 'in_production';
//     await newMachine.save();

//     res.status(201).json(createdReprintJob);
// });


// // @desc    Delete a print job (e.g. if added by mistake)
// // @route   DELETE /api/tracking/jobs/:jobId
// // @access  Private (Admin or user who added it, if job not started)
// const deletePrintJob = asyncHandler(async (req, res) => {
//   const printJob = await PrintJob.findById(req.params.jobId).populate('machine');
//   if (!printJob) {
//     res.status(404);
//     throw new Error('Print job not found');
//   }

//   // Add logic for who can delete, e.g., only if not completed/failed, or by admin.
//   if (printJob.status === 'completed' || printJob.status === 'failed') {
//       if (req.user.role !== 'admin') {
//         res.status(403);
//         throw new Error('Completed or failed jobs can only be deleted by an admin.');
//       }
//   }

//   const machine = printJob.machine;

//   await PrintJob.deleteOne({ _id: printJob._id });

//   // If this was the only job on the machine, set machine to available
//   if (machine) {
//       const otherJobsOnMachine = await PrintJob.findOne({ machine: machine._id, status: 'printing' });
//       if (!otherJobsOnMachine) {
//           const printerToUpdate = await Printer.findById(machine._id);
//           if (printerToUpdate) {
//               printerToUpdate.status = 'available';
//               await printerToUpdate.save();
//           }
//       }
//   }

//   res.json({ message: 'Print job removed' });
// });


// export {
//   addPrintJobToProject,
//   getPrintJobsForProject,
//   getPrintJobById,
//   updatePrintJob,
//   reprintFailedJob,
//   deletePrintJob,
// };
// backend/controllers/trackingController.js
import asyncHandler from 'express-async-handler';
import PrintJob from '../models/PrintJob.js';
import Project from '../models/Project.js';
import Printer from '../models/Printer.js';
import Part from '../models/Part.js';
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
    totalPiecesInConcept, // Optional: if user specifies how many total pieces the "Hand" has
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
});

  const createdPrintJob = await printJob.save();
  
  // Update printer status
  machine.status = 'in_production';
  await machine.save();
  
  res.status(201).json(createdPrintJob);
});

// @desc    Get all print jobs for a specific project
// @route   GET /api/tracking/project/:projectId/jobs
// @access  Private
const getPrintJobsForProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const printJobs = await PrintJob.find({ project: projectId })
    .populate('machine', 'name model')
    .populate('part', 'conceptualPartName totalPieces') // Populate conceptual part details
    .sort({ createdAt: 'asc' }); 
  res.json(printJobs);
});

// @desc    Get a single print job by its ID
// @route   GET /api/tracking/jobs/:jobId
// @access  Private
const getPrintJobById = asyncHandler(async (req, res) => {
    const printJob = await PrintJob.findById(req.params.jobId)
        .populate('machine', 'name status')
        .populate('project', 'projectName status');
    
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
    status, // 'completed', 'failed'
    actualPrintTime, // "X days Y hrs Z mins" - will be parsed
    failReason,
    // Fields for re-printing (if status is 'failed' and user wants to re-print)
    // This would typically trigger creating a NEW print job linked to this failed one.
    // For simplicity, this update handles marking as failed/completed. Re-print is a new job.
  } = req.body;

  const printJob = await PrintJob.findById(jobId).populate('machine');
  if (!printJob) {
    res.status(404);
    throw new Error('Print job not found');
  }

  const oldStatus = printJob.status;
  const oldMachine = printJob.machine;

  if (status) printJob.status = status;
  if (failReason && status === 'failed') printJob.failReason = failReason;

  if (status === 'completed' || status === 'failed') {
    printJob.actualEndTime = Date.now();
    if (actualPrintTime) {
        printJob.actualPrintTimeSeconds = PrintJob.parsePrintTimeToSeconds(actualPrintTime);
    } else if (status === 'completed' && !printJob.actualPrintTimeSeconds) {
        // If completed and no actual time, assume it took the scheduled time
        printJob.actualPrintTimeSeconds = printJob.printTimeScheduledSeconds;
    }

    // Update printer stats and status
    if (oldMachine) {
        const machine = await Printer.findById(oldMachine._id);
        if (machine) {
            if (status === 'completed') {
                machine.completedJobsCount = (machine.completedJobsCount || 0) + 1;
                machine.totalPrintTimeSeconds = (machine.totalPrintTimeSeconds || 0) + (printJob.actualPrintTimeSeconds || 0);
                machine.totalFilamentUsedGrams = (machine.totalFilamentUsedGrams || 0) + (printJob.weightGrams || 0);
            } else if (status === 'failed') {
                machine.failedJobsCount = (machine.failedJobsCount || 0) + 1;
            }
            // Check if other jobs are running on this printer before setting to available
            const otherJobsOnMachine = await PrintJob.findOne({ machine: machine._id, status: 'printing', _id: { $ne: printJob._id } });
            if (!otherJobsOnMachine) {
                machine.status = 'available';
            }
            await machine.save();
        }
    }
  }
  // Update other fields if needed (partName, machinePlateNo, etc.)
  // For now, focusing on status changes
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


export {
  addPrintJobToProject,
  getPrintJobsForProject,
  getPrintJobById,
  updatePrintJob,
  reprintFailedJob,
  deletePrintJob,
};
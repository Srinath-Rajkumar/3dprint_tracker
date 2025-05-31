// backend/controllers/dashboardController.js (New File)
import asyncHandler from 'express-async-handler';
import Printer from '../models/Printer.js';
import Project from '../models/Project.js';
import PrintJob from '../models/PrintJob.js';
import CostSettings from '../models/CostSettings.js'; // If needed for cost estimations on dashboard

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = asyncHandler(async (req, res) => {
  const totalPrinters = await Printer.countDocuments();
  const availablePrinters = await Printer.countDocuments({ status: 'available' });
  const maintenancePrinters = await Printer.countDocuments({ status: 'maintenance' });
  const inProductionPrinters = await Printer.countDocuments({ status: 'in_production' });

  const ongoingProjects = await Project.countDocuments({ status: 'ongoing' });
  const completedProjects = await Project.countDocuments({ status: 'completed' });

  // More complex aggregations for filament, print time, success rates
  const completedJobStats = await PrintJob.aggregate([ // Renamed for clarity
    {
      $match: { status: 'completed' }
    },
    {
      $group: {
        _id: null,
        totalFilamentUsedGrams: { $sum: '$weightGrams' },
        totalPrintTimeSeconds: { $sum: '$actualPrintTimeSeconds' },
        count: { $sum: 1 } // Count of completed jobs
      }
    },
    {
      $project: { // Reshape the output
        _id: 0, // Exclude the _id field
        totalFilamentUsedGrams: 1,
        totalPrintTimeSeconds: 1,
        totalCompletedJobs: '$count' // Rename count to totalCompletedJobs
      }
    }
  ]);
  
  const failedPrintJobsCount = await PrintJob.countDocuments({ status: 'failed' }); // Renamed for clarity
  const totalCompletedJobsCount = completedJobStats[0]?.totalCompletedJobs || 0;
  const totalAttemptedJobs = totalCompletedJobsCount + failedPrintJobsCount;

  const overallSuccessRate = totalAttemptedJobs > 0 ? ((totalCompletedJobsCount / totalAttemptedJobs) * 100) : 0;
  const overallFailureRate = totalAttemptedJobs > 0 ? ((failedPrintJobsCount / totalAttemptedJobs) * 100) : 0; // <<< ADDED FAILURE RATE


  res.json({
    totalPrinters,
    availablePrinters,
    maintenancePrinters,
    inProductionPrinters,
    ongoingProjects,
    completedProjects,
    totalFilamentUsedGrams: completedJobStats[0]?.totalFilamentUsedGrams || 0,
    totalPrintTimeSeconds: completedJobStats[0]?.totalPrintTimeSeconds || 0,
    totalCompletedParts: totalCompletedJobsCount, // Assuming one job is one part successfully printed
    projectSuccessRate: parseFloat(overallSuccessRate.toFixed(1)),
    projectFailureRate: parseFloat(overallFailureRate.toFixed(1)), // <<< ADDED TO RESPONSE
  });
});

export { getDashboardSummary };
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
  const printJobStats = await PrintJob.aggregate([
    {
      $match: { status: 'completed' } // Only consider completed jobs for these stats
    },
    {
      $group: {
        _id: null,
        totalFilamentUsedGrams: { $sum: '$weightGrams' },
        totalPrintTimeSeconds: { $sum: '$actualPrintTimeSeconds' },
        totalCompletedJobs: { $sum: 1 }
      }
    }
  ]);
  
  const failedPrintJobs = await PrintJob.countDocuments({ status: 'failed' });
  const totalAttemptedJobs = (printJobStats[0]?.totalCompletedJobs || 0) + failedPrintJobs;
  const overallSuccessRate = totalAttemptedJobs > 0 ? (((printJobStats[0]?.totalCompletedJobs || 0) / totalAttemptedJobs) * 100) : 0;


  res.json({
    totalPrinters,
    availablePrinters,
    maintenancePrinters,
    inProductionPrinters,
    ongoingProjects,
    completedProjects,
    totalFilamentUsedGrams: printJobStats[0]?.totalFilamentUsedGrams || 0,
    totalPrintTimeSeconds: printJobStats[0]?.totalPrintTimeSeconds || 0,
    totalCompletedParts: printJobStats[0]?.totalCompletedJobs || 0, // Assuming one job is one part
    projectSuccessRate: parseFloat(overallSuccessRate.toFixed(1)), // Example, needs more refined calculation
    // Add other stats as needed
  });
});

export { getDashboardSummary };
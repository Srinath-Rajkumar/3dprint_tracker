// backend/routes/trackingRoutes.js
import express from 'express';
import multer from 'multer';
import fs from 'fs'; // <--- ADD THIS LINE TO IMPORT THE FILE SYSTEM MODULE
import { protect } from '../middleware/authMiddleware.js'; // Assuming this is your auth middleware
import {
  addPrintJobToProject,
  getPrintJobsForProject,
  getPrintJobById,
  updatePrintJob,
  reprintFailedJob,
  deletePrintJob,
  parseGcodeAndExtractDetails // Ensure this is imported
} from '../controllers/trackingController.js';

const router = express.Router();

// Multer diskStorage configuration
const gcodeStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/gcode_temp/';
        // Ensure this directory exists or multer might have issues
        try {
            if (!fs.existsSync(uploadPath)) { // Check if directory exists before creating
                fs.mkdirSync(uploadPath, { recursive: true });
            }
            cb(null, uploadPath);
        } catch (error) {
            console.error("Error ensuring upload directory exists:", error);
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});

const gcodeUpload = multer({
    storage: gcodeStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/octet-stream' ||
            file.originalname.toLowerCase().endsWith('.gcode') ||
            file.originalname.toLowerCase().endsWith('.gc')) {
            cb(null, true);
        } else {
            cb(new Error('Only .gcode or .gc files are allowed!'), false);
        }
    },
    limits: { fileSize: 100 * 1024 * 1024 } // Example: 100MB limit
});

// Routes for print jobs within a project
router.route('/project/:projectId/jobs')
  .post(protect, addPrintJobToProject)
  .get(protect, getPrintJobsForProject);

// Routes for individual print jobs
router.route('/jobs/:jobId')
  .get(protect, getPrintJobById)
  .put(protect, updatePrintJob)
  .delete(protect, deletePrintJob);

router.post('/jobs/:failedJobId/reprint', protect, reprintFailedJob);

// New route for G-code parsing
router.post('/parse-gcode', protect, gcodeUpload.single('gcode'), parseGcodeAndExtractDetails);


export default router;
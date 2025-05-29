// backend/routes/trackingRoutes.js
import express from 'express';
const router = express.Router();
import {
  addPrintJobToProject,
  getPrintJobsForProject,
  getPrintJobById,
  updatePrintJob,
  reprintFailedJob,
  deletePrintJob,
} from '../controllers/trackingController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// Routes for print jobs within a project
router.route('/project/:projectId/jobs')
  .post(protect, addPrintJobToProject)
  .get(protect, getPrintJobsForProject);

// Routes for individual print jobs
router.route('/jobs/:jobId')
  .get(protect, getPrintJobById)
  .put(protect, updatePrintJob)
  .delete(protect, deletePrintJob); // Consider admin only for delete

router.post('/jobs/:failedJobId/reprint', protect, reprintFailedJob);


export default router;
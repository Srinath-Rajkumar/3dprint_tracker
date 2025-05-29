// backend/routes/dashboardRoutes.js (New File)
import express from 'express';
const router = express.Router();
import { getDashboardSummary } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

router.get('/summary', protect, getDashboardSummary);

export default router;
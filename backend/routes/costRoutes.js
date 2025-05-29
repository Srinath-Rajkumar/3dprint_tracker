// backend/routes/costRoutes.js
import express from 'express';
const router = express.Router();
import {
  getCostSettings,
  updateCostSettings,
} from '../controllers/costController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/settings')
  .get(protect, getCostSettings) // All authenticated users can see cost settings
  .put(protect, admin, updateCostSettings); // Only admin can update

export default router;
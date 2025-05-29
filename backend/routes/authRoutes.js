// backend/routes/authRoutes.js
import express from 'express';
const router = express.Router();
import {
  loginUser,
  setupAdminProfile,
  getUserProfile,
  updateUserProfile,
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.post('/login', loginUser);
router.put('/admin-setup', protect, admin, setupAdminProfile);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default router;
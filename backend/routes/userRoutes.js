// backend/routes/userRoutes.js
import express from 'express';
const router = express.Router();
import {
  registerUserByAdmin,
  getUsers,
  getUserById,
  updateUserByAdmin,
  deleteUser,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/')
  .post(protect, admin, registerUserByAdmin)
  .get(protect, admin, getUsers);

router.route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUserByAdmin)
  .delete(protect, admin, deleteUser);

export default router;
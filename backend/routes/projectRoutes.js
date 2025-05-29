// backend/routes/projectRoutes.js
import express from 'express';
const router = express.Router();
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/')
  .post(protect, createProject)
  .get(protect, getProjects);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, updateProject) // Allow users to update projects they created, or admin for all
  .delete(protect, admin, deleteProject); // Only admin can delete projects

export default router;
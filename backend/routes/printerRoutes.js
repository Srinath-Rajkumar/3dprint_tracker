// backend/routes/printerRoutes.js
import express from 'express';
const router = express.Router();
import {
  addPrinter,
  getPrinters,
  getPrinterById,
  updatePrinter,
  deletePrinter,
} from '../controllers/printerController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js'; // For image uploads

router.route('/')
  .post(protect, upload.single('image'), addPrinter) // 'image' is the field name in the form-data
  .get(protect, getPrinters);

router.route('/:id')
  .get(protect, getPrinterById)
  .put(protect, upload.single('image'), updatePrinter)
  .delete(protect, admin, deletePrinter); // Only admin can delete

export default router;
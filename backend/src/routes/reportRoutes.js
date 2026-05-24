import express from 'express';
import { getDashboardStats, getDetailedReports } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardStats);
router.get('/detailed', protect, getDetailedReports);

export default router;

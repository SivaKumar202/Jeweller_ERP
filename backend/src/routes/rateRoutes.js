import express from 'express';
import { getLatestRates, updateRates } from '../controllers/rateController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getLatestRates)
  .post(protect, admin, updateRates);

export default router;

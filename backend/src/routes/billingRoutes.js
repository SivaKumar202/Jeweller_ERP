import express from 'express';
import {
  createSale,
  getSales,
  getSaleById,
  payInvoiceBalance,
} from '../controllers/billingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getSales)
  .post(protect, createSale);

router.route('/:id')
  .get(protect, getSaleById);

router.route('/:id/pay')
  .post(protect, payInvoiceBalance);

export default router;

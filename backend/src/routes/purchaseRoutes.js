import express from 'express';
import {
  getPurchases,
  createPurchase,
  getVendors,
  createVendor,
} from '../controllers/purchaseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getPurchases)
  .post(protect, createPurchase);

router.route('/vendors')
  .get(protect, getVendors)
  .post(protect, createVendor);

export default router;

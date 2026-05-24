import Purchase from '../models/Purchase.js';
import Vendor from '../models/Vendor.js';
import Payment from '../models/Payment.js';

// ==========================================
// VENDOR CONTROLLERS
// ==========================================

// @desc    Get all vendors
// @route   GET /api/purchases/vendors
// @access  Private
export const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: vendors.length, data: vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a vendor
// @route   POST /api/purchases/vendors
// @access  Private
export const createVendor = async (req, res) => {
  const { name, companyName, phone, address, gstNumber } = req.body;

  try {
    const vendorExists = await Vendor.findOne({ phone });
    if (vendorExists) {
      return res.status(400).json({ success: false, message: 'Vendor with this phone number already exists' });
    }

    const vendor = new Vendor({
      name,
      companyName,
      phone,
      address,
      gstNumber,
    });

    const savedVendor = await vendor.save();
    res.status(201).json({ success: true, data: savedVendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// PURCHASE CONTROLLERS
// ==========================================

// @desc    Get all purchases
// @route   GET /api/purchases
// @access  Private
export const getPurchases = async (req, res) => {
  const { search, startDate, endDate } = req.query;

  try {
    const query = {};

    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { 'vendor.name': { $regex: search, $options: 'i' } },
        { 'vendor.companyName': { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.purchaseDate = {};
      if (startDate) {
        query.purchaseDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.purchaseDate.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
      }
    }

    const purchases = await Purchase.find(query).sort({ purchaseDate: -1 });
    res.json({ success: true, count: purchases.length, data: purchases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a purchase log
// @route   POST /api/purchases
// @access  Private
export const createPurchase = async (req, res) => {
  const {
    vendorId,
    itemName,
    metalType,
    purity,
    weight,
    rateApplied,
    otherCharges,
    amountPaid,
    notes,
  } = req.body;

  try {
    if (!vendorId) {
      return res.status(400).json({ success: false, message: 'Vendor is required' });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const wt = Number(weight);
    const rt = Number(rateApplied);
    const ot = Number(otherCharges || 0);
    const purchaseAmount = (wt * rt) + ot;
    const paid = Number(amountPaid || 0);
    const balanceDue = purchaseAmount - paid;

    let paymentStatus = 'unpaid';
    if (paid >= purchaseAmount) {
      paymentStatus = 'paid';
    } else if (paid > 0) {
      paymentStatus = 'partially_paid';
    }

    const purchase = new Purchase({
      vendor: {
        id: vendor._id,
        name: vendor.name,
        companyName: vendor.companyName,
        phone: vendor.phone,
      },
      itemName,
      metalType,
      purity,
      weight: wt,
      rateApplied: rt,
      otherCharges: ot,
      purchaseAmount,
      amountPaid: paid,
      balanceDue,
      paymentStatus,
      notes,
      createdBy: req.user._id,
    });

    const savedPurchase = await purchase.save();

    // Log payment in Payments ledger if payment was made
    if (paid > 0) {
      await Payment.create({
        type: 'purchase_payment',
        purchaseId: savedPurchase._id,
        vendorId: vendor._id,
        amount: paid,
        method: 'cash', // Default to cash for simplicity, or we can make editable
        notes: `Initial downpayment for purchase: ${itemName}`,
        createdBy: req.user._id,
      });
    }

    res.status(201).json({ success: true, data: savedPurchase });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

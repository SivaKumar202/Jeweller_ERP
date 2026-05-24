import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import Payment from '../models/Payment.js';

// @desc    Create a new sale/invoice
// @route   POST /api/billing
// @access  Private
export const createSale = async (req, res) => {
  const {
    customerId,
    items, // Array of { productId, weight, rateApplied, stonePrice, makingCharge, makingChargeType }
    oldGoldExchange, // { weight, purity, deduction, exchangeValue }
    discount,
    payments, // Array of { method, amount, paymentId }
    amountPaid,
  } = req.body;

  try {
    if (!customerId) {
      return res.status(400).json({ success: false, message: 'Customer is required' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one item is required' });
    }

    // 1. Fetch Customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // 2. Process Items and compute Item Totals
    let grossTotal = 0;
    const processedItems = [];

    for (const item of items) {
      // If product exists in DB, fetch and mark sold
      let productDetails = null;
      if (item.productId) {
        productDetails = await Product.findById(item.productId);
        if (productDetails && productDetails.stockStatus === 'sold') {
          return res.status(400).json({ success: false, message: `Product ${productDetails.name} is already sold` });
        }
      }

      const weight = Number(item.weight);
      const rateApplied = Number(item.rateApplied);
      const stonePrice = Number(item.stonePrice || 0);
      const makingCharge = Number(item.makingCharge || 0);
      const makingChargeType = item.makingChargeType || 'fixed';

      // Calculate making charge
      let makingChargeTotal = 0;
      if (makingChargeType === 'fixed') {
        makingChargeTotal = makingCharge;
      } else if (makingChargeType === 'per_gram') {
        makingChargeTotal = makingCharge * weight;
      } else if (makingChargeType === 'percentage') {
        makingChargeTotal = (weight * rateApplied) * (makingCharge / 100);
      }

      const itemTotal = (weight * rateApplied) + stonePrice + makingChargeTotal;
      grossTotal += itemTotal;

      processedItems.push({
        productId: item.productId || null,
        name: item.name || (productDetails ? productDetails.name : 'Custom Jewellery Item'),
        metalType: item.metalType || (productDetails ? productDetails.metalType : 'gold'),
        purity: item.purity || (productDetails ? productDetails.purity : '22K'),
        weight,
        rateApplied,
        stonePrice,
        makingCharge,
        makingChargeType,
        makingChargeTotal: Math.round(makingChargeTotal * 100) / 100,
        itemTotal: Math.round(itemTotal * 100) / 100,
      });

      // Mark product as sold
      if (productDetails) {
        productDetails.stockStatus = 'sold';
        await productDetails.save();
      }
    }

    // 3. Indian GST Calculation (3% total, splits into CGST 1.5% + SGST 1.5%)
    const discountAmount = Number(discount || 0);
    const taxableValue = Math.max(0, grossTotal - discountAmount);
    
    const cgst = Math.round((taxableValue * 0.015) * 100) / 100;
    const sgst = Math.round((taxableValue * 0.015) * 100) / 100;
    const gstTotal = cgst + sgst;

    // Old gold exchange adjustments
    const exchangeVal = Number(oldGoldExchange?.exchangeValue || 0);

    const finalAmount = Math.round((taxableValue + gstTotal - exchangeVal) * 100) / 100;
    const paidAmount = Number(amountPaid || 0);
    const balanceDue = Math.round((finalAmount - paidAmount) * 100) / 100;

    // Determine status
    let paymentStatus = 'unpaid';
    if (paidAmount >= finalAmount) {
      paymentStatus = 'paid';
    } else if (paidAmount > 0) {
      paymentStatus = 'partially_paid';
    }

    // Generate Invoice Number: INV-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await Sale.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    });
    const seq = String(count + 1).padStart(4, '0');
    const invoiceNumber = `INV-${dateStr}-${seq}`;

    // 4. Save Invoice (Sale)
    const sale = new Sale({
      invoiceNumber,
      customer: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        gstNumber: customer.gstNumber,
      },
      items: processedItems,
      oldGoldExchange: {
        weight: Number(oldGoldExchange?.weight || 0),
        purity: Number(oldGoldExchange?.purity || 0),
        deduction: Number(oldGoldExchange?.deduction || 0),
        exchangeValue: exchangeVal,
      },
      totals: {
        grossTotal: Math.round(grossTotal * 100) / 100,
        discount: discountAmount,
        taxableValue: Math.round(taxableValue * 100) / 100,
        cgst,
        sgst,
        gstTotal,
        exchangeValue: exchangeVal,
        finalAmount,
      },
      payments,
      amountPaid: paidAmount,
      balanceDue,
      paymentStatus,
      createdBy: req.user._id,
    });

    const savedSale = await sale.save();

    // 5. Update Customer ledger balance
    customer.pendingAmount += balanceDue;
    await customer.save();

    // 6. Log payment in Payments collection if amount is paid immediately
    if (paidAmount > 0) {
      for (const p of payments) {
        await Payment.create({
          type: 'sales_payment',
          saleId: savedSale._id,
          customerId: customer._id,
          amount: p.amount,
          method: p.method,
          referenceId: p.paymentId || '',
          notes: `Initial invoice downpayment for ${invoiceNumber}`,
          createdBy: req.user._id,
        });
      }
    }

    res.status(201).json({ success: true, data: savedSale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all sales/invoices
// @route   GET /api/billing
// @access  Private
export const getSales = async (req, res) => {
  const { search, paymentStatus, startDate, endDate } = req.query;

  try {
    const query = {};

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
      ];
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
      }
    }

    const sales = await Sale.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: sales.length, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get specific sale by ID
// @route   GET /api/billing/:id
// @access  Private
export const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    res.json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit outstanding dues payment for customer/invoice
// @route   POST /api/billing/:id/pay
// @access  Private
export const payInvoiceBalance = async (req, res) => {
  const { amount, method, referenceId, notes } = req.body;

  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const payVal = Number(amount);
    if (payVal <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero' });
    }

    if (payVal > sale.balanceDue) {
      return res.status(400).json({ success: false, message: `Payment exceed outstanding balance of ₹${sale.balanceDue}` });
    }

    // Update sale amounts
    sale.amountPaid += payVal;
    sale.balanceDue = Math.round((sale.balanceDue - payVal) * 100) / 100;
    
    if (sale.balanceDue === 0) {
      sale.paymentStatus = 'paid';
    } else {
      sale.paymentStatus = 'partially_paid';
    }

    // Append to payments array in Sale record
    sale.payments.push({
      method,
      amount: payVal,
      paymentId: referenceId,
    });

    const updatedSale = await sale.save();

    // Update Customer ledger balance
    const customer = await Customer.findById(sale.customer.id);
    if (customer) {
      customer.pendingAmount = Math.max(0, Math.round((customer.pendingAmount - payVal) * 100) / 100);
      await customer.save();
    }

    // Log in global Ledger
    await Payment.create({
      type: 'sales_payment',
      saleId: sale._id,
      customerId: sale.customer.id,
      amount: payVal,
      method,
      referenceId: referenceId || '',
      notes: notes || `Follow-up balance payment for ${sale.invoiceNumber}`,
      createdBy: req.user._id,
    });

    res.json({ success: true, data: updatedSale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

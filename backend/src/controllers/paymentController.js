import Razorpay from 'razorpay';
import crypto from 'crypto';
import Sale from '../models/Sale.js';
import Customer from '../models/Customer.js';
import Payment from '../models/Payment.js';

// Initialize Razorpay conditionally to support mock mode gracefully
let razorpay = null;
const isMockMode = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.startsWith('rzp_test_mockKey');

if (!isMockMode) {
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } catch (error) {
    console.error('Razorpay initialization failed, falling back to Mock Mode:', error.message);
  }
}

// @desc    Create Razorpay Order
// @route   POST /api/payments/order
// @access  Private
export const createRazorpayOrder = async (req, res) => {
  const { amount, invoiceNumber } = req.body;

  try {
    const amountInPaise = Math.round(Number(amount) * 100);

    if (isMockMode || !razorpay) {
      console.log('Razorpay is in Mock Mode. Generating simulated order.');
      // Return a simulated Razorpay order structure
      return res.json({
        success: true,
        mock: true,
        data: {
          id: `order_mock_${Date.now()}`,
          entity: 'order',
          amount: amountInPaise,
          amount_paid: 0,
          amount_due: amountInPaise,
          currency: 'INR',
          receipt: invoiceNumber || `rcpt_${Date.now()}`,
          status: 'created',
          attempts: 0,
          created_at: Math.floor(Date.now() / 1000),
        },
      });
    }

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: invoiceNumber || `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, mock: false, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay Signature and record payment
// @route   POST /api/payments/verify
// @access  Private
export const verifyRazorpayPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    saleId,
    amount,
  } = req.body;

  try {
    // 1. Signature Verification
    if (isMockMode || razorpay_order_id.startsWith('order_mock_')) {
      console.log('Razorpay is in Mock Mode. Verification bypassed.');
    } else {
      const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = shasum.digest('hex');

      if (digest !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Transaction signature verification failed' });
      }
    }

    const payVal = Number(amount);
    
    // 2. Log payment in Sale / Customer record if saleId is provided
    if (saleId) {
      const sale = await Sale.findById(saleId);
      if (sale) {
        sale.amountPaid += payVal;
        sale.balanceDue = Math.max(0, Math.round((sale.balanceDue - payVal) * 100) / 100);
        
        if (sale.balanceDue === 0) {
          sale.paymentStatus = 'paid';
        } else {
          sale.paymentStatus = 'partially_paid';
        }

        sale.payments.push({
          method: 'razorpay',
          amount: payVal,
          paymentId: razorpay_payment_id || `pay_mock_${Date.now()}`,
        });

        await sale.save();

        // Update Customer Ledger Dues
        const customer = await Customer.findById(sale.customer.id);
        if (customer) {
          customer.pendingAmount = Math.max(0, Math.round((customer.pendingAmount - payVal) * 100) / 100);
          await customer.save();
        }

        // Create Payment transaction
        await Payment.create({
          type: 'sales_payment',
          saleId: sale._id,
          customerId: sale.customer.id,
          amount: payVal,
          method: 'razorpay',
          referenceId: razorpay_payment_id || `pay_mock_${Date.now()}`,
          notes: `Razorpay online payment for invoice ${sale.invoiceNumber}`,
          createdBy: req.user._id,
        });
      }
    }

    res.json({
      success: true,
      message: 'Payment verified and captured successfully',
      paymentId: razorpay_payment_id || `pay_mock_${Date.now()}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

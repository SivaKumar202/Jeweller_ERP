import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  name: {
    type: String,
    required: true,
  },
  metalType: String,
  purity: String,
  weight: {
    type: Number,
    required: true,
  },
  rateApplied: {
    type: Number,
    required: true,
  },
  stonePrice: {
    type: Number,
    default: 0,
  },
  makingCharge: {
    type: Number,
    required: true,
  },
  makingChargeType: {
    type: String,
    enum: ['percentage', 'fixed', 'per_gram'],
    required: true,
  },
  makingChargeTotal: {
    type: Number,
    required: true,
  },
  itemTotal: {
    type: Number,
    required: true, // (weight * rate) + stonePrice + makingChargeTotal
  },
});

const oldGoldExchangeSchema = new mongoose.Schema({
  weight: {
    type: Number,
    default: 0,
  },
  purity: {
    type: Number,
    default: 0, // e.g. 75%
  },
  deduction: {
    type: Number,
    default: 0, // e.g. 10%
  },
  exchangeValue: {
    type: Number,
    default: 0, // (weight * liveRate * purity%) - deduction%
  },
});

const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      gstNumber: String,
    },
    items: [saleItemSchema],
    oldGoldExchange: {
      type: oldGoldExchangeSchema,
      default: () => ({}),
    },
    totals: {
      grossTotal: { type: Number, required: true }, // sum(itemTotal)
      discount: { type: Number, default: 0 },
      taxableValue: { type: Number, required: true }, // grossTotal - discount
      cgst: { type: Number, default: 0 }, // 1.5%
      sgst: { type: Number, default: 0 }, // 1.5%
      igst: { type: Number, default: 0 }, // optional 3%
      gstTotal: { type: Number, required: true }, // cgst + sgst + igst
      exchangeValue: { type: Number, default: 0 }, // old gold exchange deduction
      finalAmount: { type: Number, required: true }, // taxableValue + gstTotal - exchangeValue
    },
    payments: [
      {
        method: {
          type: String,
          enum: ['cash', 'upi', 'card', 'razorpay'],
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        paymentId: String, // Transaction/Razorpay ID
      },
    ],
    amountPaid: {
      type: Number,
      required: true,
      default: 0,
    },
    balanceDue: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'partially_paid', 'unpaid'],
      default: 'unpaid',
    },
    branchId: {
      type: String,
      default: 'main-branch',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Sale = mongoose.model('Sale', saleSchema);
export default Sale;

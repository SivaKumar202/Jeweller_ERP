import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema(
  {
    vendor: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      companyName: String,
      phone: String,
    },
    itemName: {
      type: String,
      required: true,
    },
    metalType: {
      type: String,
      required: true,
      enum: ['gold', 'silver', 'platinum', 'diamond', 'other'],
    },
    purity: String,
    weight: {
      type: Number,
      required: true, // weight in grams
    },
    rateApplied: {
      type: Number,
      required: true,
    },
    otherCharges: {
      type: Number,
      default: 0,
    },
    purchaseAmount: {
      type: Number,
      required: true, // (weight * rate) + otherCharges
    },
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
    notes: String,
    purchaseDate: {
      type: Date,
      default: Date.now,
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

const Purchase = mongoose.model('Purchase', purchaseSchema);
export default Purchase;

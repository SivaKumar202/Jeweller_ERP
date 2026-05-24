import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true, // e.g. Rings, Necklaces, Chains
      trim: true,
    },
    metalType: {
      type: String,
      required: true,
      enum: ['gold', 'silver', 'platinum', 'diamond', 'customized'],
      lowercase: true,
    },
    purity: {
      type: String,
      required: true, // e.g. '18K', '22K', '24K', 'Sterling', '950'
      trim: true,
    },
    weight: {
      type: Number,
      required: true, // Weight in grams
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
      required: true,
      enum: ['percentage', 'fixed', 'per_gram'],
      default: 'fixed',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    barcodeId: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple nulls if barcode not assigned
    },
    stockStatus: {
      type: String,
      enum: ['in_stock', 'sold', 'out_of_stock'],
      default: 'in_stock',
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);
export default Product;

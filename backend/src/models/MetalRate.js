import mongoose from 'mongoose';

const metalRateSchema = new mongoose.Schema(
  {
    gold18k: {
      type: Number,
      required: true,
      default: 5800,
    },
    gold22k: {
      type: Number,
      required: true,
      default: 7000,
    },
    gold24k: {
      type: Number,
      required: true,
      default: 7600,
    },
    silver: {
      type: Number,
      required: true,
      default: 90, // per gram
    },
    platinum: {
      type: Number,
      required: true,
      default: 3500,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const MetalRate = mongoose.model('MetalRate', metalRateSchema);
export default MetalRate;

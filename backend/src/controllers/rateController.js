import MetalRate from '../models/MetalRate.js';

// @desc    Get today's live metal rates
// @route   GET /api/rates
// @access  Public
export const getLatestRates = async (req, res) => {
  try {
    let rates = await MetalRate.findOne().sort({ createdAt: -1 });
    
    // If no rates exist in DB, create initial default rates
    if (!rates) {
      rates = await MetalRate.create({
        gold18k: 5800,
        gold22k: 7000,
        gold24k: 7600,
        silver: 90,
        platinum: 3500,
      });
    }

    res.json({ success: true, data: rates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update metal rates
// @route   POST /api/rates
// @access  Private (Admin Only)
export const updateRates = async (req, res) => {
  const { gold18k, gold22k, gold24k, silver, platinum } = req.body;

  try {
    const newRates = new MetalRate({
      gold18k: Number(gold18k),
      gold22k: Number(gold22k),
      gold24k: Number(gold24k),
      silver: Number(silver),
      platinum: Number(platinum),
      updatedBy: req.user._id,
    });

    await newRates.save();
    res.status(201).json({ success: true, data: newRates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

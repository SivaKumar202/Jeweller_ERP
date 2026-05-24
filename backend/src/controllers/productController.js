import Product from '../models/Product.js';

// @desc    Get all products with searching and filtering
// @route   GET /api/products
// @access  Private
export const getProducts = async (req, res) => {
  const { search, category, metalType, stockStatus } = req.query;

  try {
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { barcodeId: { $regex: search, $options: 'i' } },
        { purity: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (metalType) {
      query.metalType = metalType.toLowerCase();
    }

    if (stockStatus) {
      query.stockStatus = stockStatus;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private
export const createProduct = async (req, res) => {
  const {
    name,
    category,
    metalType,
    purity,
    weight,
    stonePrice,
    makingCharge,
    makingChargeType,
    imageUrl,
    barcodeId,
    description,
  } = req.body;

  try {
    // Generate barcode if not provided
    const barcode = barcodeId || `BAR-${Date.now()}`;

    const product = new Product({
      name,
      category,
      metalType,
      purity,
      weight: Number(weight),
      stonePrice: Number(stonePrice || 0),
      makingCharge: Number(makingCharge || 0),
      makingChargeType,
      imageUrl,
      barcodeId: barcode,
      description,
      stockStatus: 'in_stock',
    });

    const savedProduct = await product.save();
    res.status(201).json({ success: true, data: savedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const {
      name,
      category,
      metalType,
      purity,
      weight,
      stonePrice,
      makingCharge,
      makingChargeType,
      imageUrl,
      barcodeId,
      stockStatus,
      description,
    } = req.body;

    product.name = name || product.name;
    product.category = category || product.category;
    product.metalType = metalType || product.metalType;
    product.purity = purity || product.purity;
    product.weight = weight !== undefined ? Number(weight) : product.weight;
    product.stonePrice = stonePrice !== undefined ? Number(stonePrice) : product.stonePrice;
    product.makingCharge = makingCharge !== undefined ? Number(makingCharge) : product.makingCharge;
    product.makingChargeType = makingChargeType || product.makingChargeType;
    product.imageUrl = imageUrl !== undefined ? imageUrl : product.imageUrl;
    product.barcodeId = barcodeId || product.barcodeId;
    product.stockStatus = stockStatus || product.stockStatus;
    product.description = description !== undefined ? description : product.description;

    const updatedProduct = await product.save();
    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Admin only or protect)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import Customer from '../models/Customer.js';
import Sale from '../models/Sale.js';

// @desc    Get all customers with search
// @route   GET /api/customers
// @access  Private
export const getCustomers = async (req, res) => {
  const { search } = req.query;

  try {
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await Customer.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get customer by ID with sales history
// @route   GET /api/customers/:id
// @access  Private
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Fetch purchase/sales history
    const salesHistory = await Sale.find({ 'customer.id': customer._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        customer,
        salesHistory,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a customer
// @route   POST /api/customers
// @access  Private
export const createCustomer = async (req, res) => {
  const { name, phone, address, gstNumber } = req.body;

  try {
    const customerExists = await Customer.findOne({ phone });

    if (customerExists) {
      return res.status(400).json({ success: false, message: 'Customer with this phone number already exists' });
    }

    const customer = new Customer({
      name,
      phone,
      address,
      gstNumber,
    });

    const savedCustomer = await customer.save();
    res.status(201).json({ success: true, data: savedCustomer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Private
export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const { name, phone, address, gstNumber, pendingAmount } = req.body;

    customer.name = name || customer.name;
    customer.phone = phone || customer.phone;
    customer.address = address !== undefined ? address : customer.address;
    customer.gstNumber = gstNumber !== undefined ? gstNumber : customer.gstNumber;
    customer.pendingAmount = pendingAmount !== undefined ? Number(pendingAmount) : customer.pendingAmount;

    const updatedCustomer = await customer.save();
    res.json({ success: true, data: updatedCustomer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    await Customer.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Customer removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

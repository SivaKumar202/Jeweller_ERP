import Sale from '../models/Sale.js';
import Purchase from '../models/Purchase.js';
import Customer from '../models/Customer.js';
import Payment from '../models/Payment.js';

// @desc    Get summary dashboard/reports stats
// @route   GET /api/reports/dashboard
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Sales today
    const salesToday = await Sale.find({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });
    const totalSalesToday = salesToday.reduce((acc, sale) => acc + sale.totals.finalAmount, 0);

    // 2. Purchases today
    const purchasesToday = await Purchase.find({
      purchaseDate: { $gte: todayStart, $lte: todayEnd },
    });
    const totalPurchasesToday = purchasesToday.reduce((acc, p) => acc + p.purchaseAmount, 0);

    // 3. Customers total
    const totalCustomers = await Customer.countDocuments({});

    // 4. Customer total pending balance (outstanding dues)
    const customers = await Customer.find({ pendingAmount: { $gt: 0 } });
    const totalPendingPayments = customers.reduce((acc, c) => acc + c.pendingAmount, 0);

    // 5. Daily Sales Trend (for last 7 days chart)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0,0,0,0);

    const salesLastSevenDays = await Sale.find({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Group sales by day
    const salesByDay = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      salesByDay[dateKey] = 0;
    }

    salesLastSevenDays.forEach((sale) => {
      const dateKey = new Date(sale.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      if (salesByDay[dateKey] !== undefined) {
        salesByDay[dateKey] += sale.totals.finalAmount;
      }
    });

    const salesChartData = Object.keys(salesByDay).map((key) => ({
      date: key,
      sales: Math.round(salesByDay[key]),
    }));

    // 6. Cash flow summary (payments by method)
    const allPayments = await Payment.find({
      paymentDate: { $gte: todayStart, $lte: todayEnd }
    });

    const cashFlow = { cash: 0, upi: 0, card: 0, razorpay: 0 };
    allPayments.forEach(p => {
      if (cashFlow[p.method] !== undefined) {
        if (p.type === 'sales_payment' || p.type === 'direct_income') {
          cashFlow[p.method] += p.amount;
        } else {
          cashFlow[p.method] -= p.amount;
        }
      }
    });

    res.json({
      success: true,
      data: {
        todaySales: Math.round(totalSalesToday * 100) / 100,
        todayPurchases: Math.round(totalPurchasesToday * 100) / 100,
        totalCustomers,
        pendingPayments: Math.round(totalPendingPayments * 100) / 100,
        salesChart: salesChartData,
        cashFlow
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get detailed reports (Sales, Purchases, Cashflow, Dues, Profitability)
// @route   GET /api/reports/detailed
// @access  Private
export const getDetailedReports = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    start.setHours(0, 0, 0, 0);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    // Sales list in duration
    const sales = await Sale.find({ createdAt: { $gte: start, $lte: end } }).sort({ createdAt: -1 });
    const totalSales = sales.reduce((acc, s) => acc + s.totals.finalAmount, 0);
    const totalTaxable = sales.reduce((acc, s) => acc + s.totals.taxableValue, 0);
    const totalGst = sales.reduce((acc, s) => acc + s.totals.gstTotal, 0);

    // Purchases list in duration
    const purchases = await Purchase.find({ purchaseDate: { $gte: start, $lte: end } }).sort({ purchaseDate: -1 });
    const totalPurchases = purchases.reduce((acc, p) => acc + p.purchaseAmount, 0);

    // Customer dues list (all time outstanding)
    const duesList = await Customer.find({ pendingAmount: { $gt: 0 } }).sort({ pendingAmount: -1 });
    const totalDuesOutstanding = duesList.reduce((acc, c) => acc + c.pendingAmount, 0);

    // Cash flow details (Payments list)
    const cashbook = await Payment.find({ paymentDate: { $gte: start, $lte: end } }).sort({ paymentDate: -1 });
    
    // Profit Summary
    // Simple profit margin calculation: Taxable Sales value - Purchases
    // In jewellery, raw materials cost is a significant purchase expense.
    const grossProfit = totalTaxable - totalPurchases;

    res.json({
      success: true,
      data: {
        duration: { start, end },
        sales: {
          list: sales,
          total: Math.round(totalSales * 100) / 100,
          taxable: Math.round(totalTaxable * 100) / 100,
          gst: Math.round(totalGst * 100) / 100,
        },
        purchases: {
          list: purchases,
          total: Math.round(totalPurchases * 100) / 100,
        },
        dues: {
          list: duesList,
          total: Math.round(totalDuesOutstanding * 100) / 100,
        },
        cashbook: cashbook,
        profitSummary: {
          grossProfit: Math.round(grossProfit * 100) / 100,
          marginPercent: totalTaxable > 0 ? Math.round((grossProfit / totalTaxable) * 100) : 0,
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

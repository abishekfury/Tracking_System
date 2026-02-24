const express = require('express');
const Payment = require('../models/Payment');
const Client = require('../models/Client');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/payments
// @desc    Get all payments (trainer only)
// @access  Private/Trainer
router.get('/', auth, authorize('trainer'), async (req, res) => {
  try {
    const { clientId, status, month, year, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (clientId) {
      query.client = clientId;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (month && year) {
      query.paymentMonth = `${year}-${month.toString().padStart(2, '0')}`;
    } else if (year) {
      query.paymentMonth = { $regex: `^${year}` };
    }

    const payments = await Payment.find(query)
      .populate('client', 'firstName lastName')
      .populate('recordedBy', 'username')
      .sort({ paymentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      payments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/payments/my-payments
// @desc    Get current client's payment records
// @access  Private/Client
router.get('/my-payments', auth, authorize('client'), async (req, res) => {
  try {
    const { month, year, page = 1, limit = 10 } = req.query;
    
    // Get client profile
    const client = await Client.findOne({ user: req.user._id });
    if (!client) {
      return res.status(404).json({ message: 'Client profile not found' });
    }

    let query = { client: client._id };
    
    if (month && year) {
      query.paymentMonth = `${year}-${month.toString().padStart(2, '0')}`;
    } else if (year) {
      query.paymentMonth = { $regex: `^${year}` };
    }

    const payments = await Payment.find(query)
      .populate('recordedBy', 'username')
      .sort({ paymentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      payments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/payments/stats/my-stats
// @desc    Get current client's payment statistics
// @access  Private/Client
router.get('/stats/my-stats', auth, authorize('client'), async (req, res) => {
  try {
    const { year } = req.query;

    // Get client profile
    const client = await Client.findOne({ user: req.user._id });
    if (!client) {
      return res.status(404).json({ message: 'Client profile not found' });
    }

    let query = { client: client._id };
    
    if (year) {
      query.paymentMonth = { $regex: `^${year}` };
    }

    const totalPayments = await Payment.countDocuments(query);
    const paidPayments = await Payment.countDocuments({ ...query, status: 'paid' });
    const pendingPayments = await Payment.countDocuments({ ...query, status: 'pending' });
    const overduePayments = await Payment.countDocuments({ ...query, status: 'overdue' });

    const totalAmount = await Payment.aggregate([
      { $match: { ...query, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Calculate current month payment status
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthPayment = await Payment.findOne({
      client: client._id,
      paymentMonth: currentMonth
    });

    res.json({
      success: true,
      stats: {
        totalPayments,
        paidPayments,
        pendingPayments,
        overduePayments,
        totalAmountPaid: totalAmount[0]?.total || 0,
        currentMonthStatus: currentMonthPayment?.status || 'not_paid',
        currentMonthAmount: currentMonthPayment?.amount || 0
      }
    });
  } catch (error) {
    console.error('Payment stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/payments
// @desc    Record payment (trainer only)
// @access  Private/Trainer
router.post('/', auth, authorize('trainer'), async (req, res) => {
  try {
    const { clientId, amount, paymentMonth, paymentMethod, paymentDate, notes } = req.body;

    // Verify client exists
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Check if payment already exists for this client and month
    const existingPayment = await Payment.findOne({
      client: clientId,
      paymentMonth
    });

    if (existingPayment) {
      return res.status(400).json({ 
        message: 'Payment already recorded for this client and month' 
      });
    }

    const payment = new Payment({
      client: clientId,
      amount,
      paymentMonth,
      paymentMethod,
      paymentDate: paymentDate || Date.now(),
      notes,
      recordedBy: req.user._id
    });

    await payment.save();
    await payment.populate('client', 'firstName lastName');
    await payment.populate('recordedBy', 'username');

    res.status(201).json({
      success: true,
      payment
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/payments/:id
// @desc    Update payment record (trainer only)
// @access  Private/Trainer
router.put('/:id', auth, authorize('trainer'), async (req, res) => {
  try {
    const { amount, paymentMethod, paymentDate, status, notes } = req.body;

    const updateData = {};
    
    if (amount) updateData.amount = amount;
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (paymentDate) updateData.paymentDate = paymentDate;
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('client', 'firstName lastName')
     .populate('recordedBy', 'username');

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    res.json({
      success: true,
      payment
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/payments/:id
// @desc    Delete payment record (trainer only)
// @access  Private/Trainer
router.delete('/:id', auth, authorize('trainer'), async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    res.json({
      success: true,
      message: 'Payment record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/payments/stats/:clientId
// @desc    Get payment statistics for a client
// @access  Private
router.get('/stats/:clientId', auth, async (req, res) => {
  try {
    const { clientId } = req.params;
    const { year } = req.query;

    // Verify client exists and check permissions
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Clients can only access their own stats
    if (req.user.role === 'client' && client.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let query = { client: clientId };
    
    if (year) {
      query.paymentMonth = { $regex: `^${year}` };
    }

    const totalPaid = await Payment.aggregate([
      { $match: { ...query, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalPending = await Payment.countDocuments({ ...query, status: 'pending' });
    const totalOverdue = await Payment.countDocuments({ ...query, status: 'overdue' });

    res.json({
      success: true,
      stats: {
        totalPaidAmount: totalPaid[0]?.total || 0,
        totalPendingPayments: totalPending,
        totalOverduePayments: totalOverdue
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/payments/monthly-revenue
// @desc    Get monthly revenue statistics (trainer only)
// @access  Private/Trainer
router.get('/monthly-revenue', auth, authorize('trainer'), async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();

    const revenue = await Payment.aggregate([
      {
        $match: {
          status: 'paid',
          paymentMonth: { $regex: `^${currentYear}` }
        }
      },
      {
        $group: {
          _id: '$paymentMonth',
          totalAmount: { $sum: '$amount' },
          totalPayments: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      revenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/payments/:id
// @desc    Update payment record (trainer only)
// @access  Private/Trainer
router.put('/:id', auth, authorize('trainer'), async (req, res) => {
  try {
    const { status, amount, paymentMethod, notes } = req.body;
    
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (amount !== undefined) updateData.amount = amount;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (notes !== undefined) updateData.notes = notes;

    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('client', 'firstName lastName')
     .populate('recordedBy', 'username');

    res.json({
      success: true,
      payment: updatedPayment
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/payments/:id
// @desc    Delete payment record (trainer only)
// @access  Private/Trainer
router.delete('/:id', auth, authorize('trainer'), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    await Payment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Payment record deleted successfully'
    });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
const express = require('express');
const Attendance = require('../models/Attendance');
const Client = require('../models/Client');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/attendance
// @desc    Get all attendance records (trainer only)
// @access  Private/Trainer
router.get('/', auth, authorize('trainer'), async (req, res) => {
  try {
    const { clientId, startDate, endDate, page = 1, limit = 50 } = req.query;
    
    let query = {};
    
    if (clientId) {
      query.client = clientId;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
      .populate('client', 'firstName lastName')
      .populate('markedBy', 'username')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Transform the data to match frontend expectations
    const transformedAttendance = attendance.map(record => ({
      _id: record._id,
      clientId: record.client._id,
      client: record.client,
      date: record.date,
      checkIn: record.checkIn ? record.checkIn.toTimeString().slice(0, 5) : null,
      checkOut: record.checkOut ? record.checkOut.toTimeString().slice(0, 5) : null,
      duration: record.duration,
      notes: record.notes,
      markedBy: record.markedBy
    }));

    const total = await Attendance.countDocuments(query);

    res.json({
      success: true,
      attendance: transformedAttendance,
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

// @route   GET /api/attendance/my-records
// @desc    Get current client's attendance records
// @access  Private/Client
router.get('/my-records', auth, authorize('client'), async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;
    
    // Get client profile
    const client = await Client.findOne({ user: req.user._id });
    if (!client) {
      return res.status(404).json({ message: 'Client profile not found' });
    }

    let query = { client: client._id };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
      .populate('markedBy', 'username')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Attendance.countDocuments(query);

    res.json({
      success: true,
      attendance,
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

// @route   POST /api/attendance
// @desc    Mark attendance (trainer only)
// @access  Private/Trainer
router.post('/', auth, authorize('trainer'), async (req, res) => {
  try {
    const { clientId, date, checkIn, checkOut, notes } = req.body;

    // Verify client exists
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Check if attendance already exists for this client on this date
    const attendanceDate = new Date(date || Date.now());
    const startOfDay = new Date(attendanceDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(attendanceDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAttendance = await Attendance.findOne({
      client: clientId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingAttendance) {
      return res.status(400).json({ 
        message: 'Attendance already marked for this client today' 
      });
    }

    // Handle time fields - convert HH:MM format to Date objects
    let checkInTime = null;
    let checkOutTime = null;
    let duration = null;

    if (checkIn) {
      checkInTime = new Date(`${date}T${checkIn}:00.000Z`);
    } else {
      checkInTime = new Date();
    }

    if (checkOut) {
      checkOutTime = new Date(`${date}T${checkOut}:00.000Z`);
      
      if (checkInTime && checkOutTime) {
        duration = Math.round((checkOutTime - checkInTime) / (1000 * 60)); // duration in minutes
      }
    }

    const attendance = new Attendance({
      client: clientId,
      date: attendanceDate,
      checkIn: checkInTime,
      checkOut: checkOutTime,
      duration,
      notes,
      markedBy: req.user._id
    });

    await attendance.save();
    await attendance.populate('client', 'firstName lastName');
    await attendance.populate('markedBy', 'username');

    res.status(201).json({
      success: true,
      attendance: {
        _id: attendance._id,
        clientId: attendance.client._id,
        client: attendance.client,
        date: attendance.date,
        checkIn: attendance.checkIn ? attendance.checkIn.toTimeString().slice(0, 5) : null,
        checkOut: attendance.checkOut ? attendance.checkOut.toTimeString().slice(0, 5) : null,
        duration: attendance.duration,
        notes: attendance.notes,
        markedBy: attendance.markedBy
      }
    });
  } catch (error) {
    console.error('Attendance creation error:', error);
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/attendance/:id
// @desc    Update attendance record (trainer only)
// @access  Private/Trainer
router.put('/:id', auth, authorize('trainer'), async (req, res) => {
  try {
    const { checkOut, notes } = req.body;

    const attendance = await Attendance.findById(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    const updateData = {};
    
    if (checkOut) {
      updateData.checkOut = checkOut;
      // Calculate duration if checkOut is provided
      if (attendance.checkIn) {
        const checkInTime = new Date(attendance.checkIn);
        const checkOutTime = new Date(checkOut);
        updateData.duration = Math.round((checkOutTime - checkInTime) / (1000 * 60));
      }
    }
    
    if (notes !== undefined) updateData.notes = notes;

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('client', 'firstName lastName')
     .populate('markedBy', 'username');

    res.json({
      success: true,
      attendance: updatedAttendance
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/attendance/:id
// @desc    Delete attendance record (trainer only)
// @access  Private/Trainer
router.delete('/:id', auth, authorize('trainer'), async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/attendance/stats/my-stats
// @desc    Get current client's attendance statistics
// @access  Private/Client
router.get('/stats/my-stats', auth, authorize('client'), async (req, res) => {
  try {
    const { month, year } = req.query;

    // Get client profile
    const client = await Client.findOne({ user: req.user._id });
    if (!client) {
      return res.status(404).json({ message: 'Client profile not found' });
    }

    // Build date query
    let dateQuery = {};
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      dateQuery = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      dateQuery = { $gte: startDate, $lte: endDate };
    }

    const query = { client: client._id };
    if (Object.keys(dateQuery).length > 0) {
      query.date = dateQuery;
    }

    const totalDays = await Attendance.countDocuments(query);
    const totalDuration = await Attendance.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$duration' } } }
    ]);

    // Calculate current month stats
    const currentMonth = new Date();
    const currentMonthQuery = {
      client: client._id,
      date: {
        $gte: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
        $lte: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59)
      }
    };
    const currentMonthDays = await Attendance.countDocuments(currentMonthQuery);

    res.json({
      success: true,
      stats: {
        totalDays,
        currentMonthDays,
        totalDuration: totalDuration[0]?.total || 0,
        averageDuration: totalDays > 0 ? Math.round((totalDuration[0]?.total || 0) / totalDays) : 0
      }
    });
  } catch (error) {
    console.error('My stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/attendance/stats/:clientId
// @desc    Get attendance statistics for a client
// @access  Private
router.get('/stats/:clientId', auth, async (req, res) => {
  try {
    const { clientId } = req.params;
    const { month, year } = req.query;

    // Verify client exists and check permissions
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Clients can only access their own stats
    if (req.user.role === 'client' && client.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Build date query
    let dateQuery = {};
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      dateQuery = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      dateQuery = { $gte: startDate, $lte: endDate };
    }

    const query = { client: clientId };
    if (Object.keys(dateQuery).length > 0) {
      query.date = dateQuery;
    }

    const totalDays = await Attendance.countDocuments(query);
    const totalDuration = await Attendance.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$duration' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalDays,
        totalDuration: totalDuration[0]?.total || 0,
        averageDuration: totalDays > 0 ? Math.round((totalDuration[0]?.total || 0) / totalDays) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/attendance/:id
// @desc    Delete attendance record (trainer only)
// @access  Private/Trainer
router.delete('/:id', auth, authorize('trainer'), async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    await Attendance.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
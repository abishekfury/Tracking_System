import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    overduePayments: 0
  });

  const [recordForm, setRecordForm] = useState({
    clientId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMonth: new Date().toISOString().slice(0, 7),
    paymentMethod: 'cash',
    status: 'paid',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [filterMonth, filterYear, filterStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, clientsRes, revenueRes] = await Promise.all([
        axios.get('/payments', {
          params: {
            month: filterMonth,
            year: filterYear,
            status: filterStatus,
            limit: 50
          }
        }),
        axios.get('/clients'),
        axios.get('/payments/monthly-revenue')
      ]);
      
      const paymentsData = paymentsRes.data.payments || [];
      const clientsData = clientsRes.data.clients || [];
      const revenueData = revenueRes.data;

      setPayments(paymentsData);
      setClients(clientsData);
      calculateStats(paymentsData, revenueData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (paymentsData, revenueData) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const totalRevenue = revenueData.totalRevenue || 0;
    const monthlyRevenue = revenueData.currentMonthRevenue || 0;
    
    const pendingPayments = paymentsData.filter(p => p.status === 'pending').length;
    const overduePayments = paymentsData.filter(p => p.status === 'overdue').length;

    setStats({
      totalRevenue,
      monthlyRevenue,
      pendingPayments,
      overduePayments
    });
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    
    if (!recordForm.clientId || !recordForm.amount) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const paymentData = {
        clientId: recordForm.clientId,
        amount: parseFloat(recordForm.amount),
        paymentDate: recordForm.paymentDate,
        paymentMonth: recordForm.paymentMonth,
        paymentMethod: recordForm.paymentMethod,
        status: recordForm.status,
        notes: recordForm.notes
      };

      await axios.post('/payments', paymentData);
      
      setShowRecordForm(false);
      setRecordForm({
        clientId: '',
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMonth: new Date().toISOString().slice(0, 7),
        paymentMethod: 'cash',
        status: 'paid',
        notes: ''
      });
      
      fetchData();
      alert('Payment recorded successfully!');
    } catch (error) {
      alert('Error recording payment: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment record?')) {
      return;
    }

    try {
      await axios.delete(`/payments/${paymentId}`);
      fetchData();
      alert('Payment record deleted successfully!');
    } catch (error) {
      alert('Error deleting payment: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdatePaymentStatus = async (paymentId, newStatus) => {
    try {
      await axios.put(`/payments/${paymentId}`, { status: newStatus });
      fetchData();
      alert('Payment status updated successfully!');
    } catch (error) {
      alert('Error updating payment status: ' + (error.response?.data?.message || error.message));
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c._id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Unknown Client';
  };

  const getFilteredPayments = () => {
    let filtered = [...payments];

    if (searchTerm) {
      filtered = filtered.filter(payment => {
        const clientName = getClientName(payment.client._id || payment.client).toLowerCase();
        return clientName.includes(searchTerm.toLowerCase()) ||
               payment.amount.toString().includes(searchTerm) ||
               payment.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    return filtered.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
  };

  const recordQuickPayment = async (clientId, amount) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Check if payment already exists for current month
    const existingPayment = payments.find(p => 
      (p.client._id || p.client) === clientId && p.paymentMonth === currentMonth
    );

    if (existingPayment) {
      alert('Payment already recorded for this client this month!');
      return;
    }

    try {
      await axios.post('/payments', {
        clientId: clientId,
        amount: amount,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMonth: currentMonth,
        paymentMethod: 'cash',
        status: 'paid',
        notes: 'Quick payment record'
      });
      
      fetchData();
      alert('Payment recorded successfully!');
    } catch (error) {
      alert('Error recording payment: ' + (error.response?.data?.message || error.message));
    }
  };

  const getCurrentMonthYear = () => {
    const date = new Date();
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading payments...</div>
      </div>
    );
  }

  return (
    <div className="payment-management">
      <div className="page-header">
        <h1>Payment Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowRecordForm(true)}
        >
          Record New Payment
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>₹{stats.monthlyRevenue.toLocaleString()}</h3>
            <p>This Month</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pendingPayments}</h3>
            <p>Pending Payments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <h3>{stats.overduePayments}</h3>
            <p>Overdue Payments</p>
          </div>
        </div>
      </div>

      {/* Quick Payment Recording */}
      <div className="quick-payment-section">
        <h2>Quick Payment Recording</h2>
        <div className="quick-payment-grid">
          {clients.filter(client => client.isActive).map(client => {
            const currentMonth = getCurrentMonthYear();
            const monthlyPayment = payments.find(p => 
              (p.client._id || p.client) === client._id && p.paymentMonth === currentMonth
            );
            
            const membershipAmount = client.membershipType === 'monthly' ? 1000 : 
                                   client.membershipType === 'quarterly' ? 2500 : 5000;

            return (
              <div key={client._id} className="quick-payment-card">
                <div className="client-info">
                  <h4>{client.firstName} {client.lastName}</h4>
                  <p>{client.membershipType} - ₹{membershipAmount}</p>
                </div>
                <div className="payment-status">
                  {monthlyPayment ? (
                    <div className={`status ${monthlyPayment.status}`}>
                      ✅ {monthlyPayment.status.toUpperCase()}
                    </div>
                  ) : (
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => recordQuickPayment(client._id, membershipAmount)}
                    >
                      Record Payment
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters">
          <input
            type="text"
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="filter-select"
          >
            <option value="">All Months</option>
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(month => (
              <option key={month} value={month.toString().padStart(2, '0')}>
                {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="filter-select"
          >
            {[2024, 2025, 2026, 2027].map(year => (
              <option key={year} value={year.toString()}>{year}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              setSearchTerm('');
              setFilterMonth('');
              setFilterYear(new Date().getFullYear().toString());
              setFilterStatus('');
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Payment Records */}
      <div className="payment-records">
        <h2>Payment Records</h2>
        {getFilteredPayments().length === 0 ? (
          <div className="no-data">
            <p>No payment records found.</p>
            {payments.length === 0 && (
              <p>Start by recording payments for your clients!</p>
            )}
          </div>
        ) : (
          <div className="records-table">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Month</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredPayments().map((payment) => (
                  <tr key={payment._id}>
                    <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                    <td>{getClientName(payment.client._id || payment.client)}</td>
                    <td>₹{payment.amount.toLocaleString()}</td>
                    <td>{payment.paymentMonth}</td>
                    <td className="payment-method">{payment.paymentMethod.replace('_', ' ')}</td>
                    <td>
                      <select
                        value={payment.status}
                        onChange={(e) => handleUpdatePaymentStatus(payment._id, e.target.value)}
                        className={`status-select status-${payment.status}`}
                      >
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </td>
                    <td>{payment.notes || '-'}</td>
                    <td>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeletePayment(payment._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {showRecordForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Record New Payment</h3>
              <button 
                className="close-btn"
                onClick={() => setShowRecordForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleRecordPayment} className="modal-content">
              <div className="form-group">
                <label>Select Client</label>
                <select
                  value={recordForm.clientId}
                  onChange={(e) => setRecordForm({...recordForm, clientId: e.target.value})}
                  required
                  className="form-control"
                >
                  <option value="">Choose a client...</option>
                  {clients.filter(client => client.isActive).map(client => (
                    <option key={client._id} value={client._id}>
                      {client.firstName} {client.lastName} - {client.membershipType}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input
                    type="number"
                    value={recordForm.amount}
                    onChange={(e) => setRecordForm({...recordForm, amount: e.target.value})}
                    required
                    min="0"
                    className="form-control"
                    placeholder="1000"
                  />
                </div>
                <div className="form-group">
                  <label>Payment Date</label>
                  <input
                    type="date"
                    value={recordForm.paymentDate}
                    onChange={(e) => setRecordForm({...recordForm, paymentDate: e.target.value})}
                    required
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Payment Month</label>
                  <input
                    type="month"
                    value={recordForm.paymentMonth}
                    onChange={(e) => setRecordForm({...recordForm, paymentMonth: e.target.value})}
                    required
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    value={recordForm.paymentMethod}
                    onChange={(e) => setRecordForm({...recordForm, paymentMethod: e.target.value})}
                    className="form-control"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Payment Status</label>
                <select
                  value={recordForm.status}
                  onChange={(e) => setRecordForm({...recordForm, status: e.target.value})}
                  className="form-control"
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  value={recordForm.notes}
                  onChange={(e) => setRecordForm({...recordForm, notes: e.target.value})}
                  className="form-control"
                  rows="3"
                  placeholder="Any additional notes..."
                ></textarea>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRecordForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
  
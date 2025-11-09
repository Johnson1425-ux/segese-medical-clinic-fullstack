import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  FileText,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Plus,
  Search,
  Download,
  RefreshCw
} from 'lucide-react';
import api from '../utils/api.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { toast } from 'react-hot-toast';

const BillingDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    invoices: {},
    payments: [],
    overdueCount: 0
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      
      // Fetch statistics
      const statsResponse = await api.get('/billing/statistics');
      setStatistics(statsResponse.data.data);

      // Fetch recent invoices
      const invoicesResponse = await api.get('/billing/invoices?limit=5');
      setRecentInvoices(invoicesResponse.data.data.invoices);

      // Fetch recent payments
      const paymentsResponse = await api.get('/billing/payments?limit=5');
      setRecentPayments(paymentsResponse.data.data.payments);

    } catch (error) {
      toast.error('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'paid': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'overdue': 'bg-red-100 text-red-800',
      'partial': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing Dashboard</h1>
          <p className="text-gray-600">Manage invoices, payments, and financial reports</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/billing/invoices/new')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </button>
          <button
            onClick={() => navigate('/billing/payments/new')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Record Payment
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(statistics.invoices.totalAmount)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">
              {statistics.invoices.totalInvoices || 0} invoices
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Collected</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(statistics.invoices.totalPaid)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">
              {((statistics.invoices.totalPaid / statistics.invoices.totalAmount) * 100 || 0).toFixed(1)}% collected
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(statistics.invoices.totalDue)}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">
              Pending collection
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">
                {statistics.overdueCount || 0}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">
              Invoices overdue
            </span>
          </div>
        </div>
      </div>

      {/* Payment Methods Chart */}
      {statistics.payments && statistics.payments.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Payment Methods</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statistics.payments.map((payment) => (
              <div key={payment._id} className="text-center">
                <p className="text-sm text-gray-600 capitalize">{payment._id.replace('_', ' ')}</p>
                <p className="text-xl font-bold">{formatCurrency(payment.total)}</p>
                <p className="text-xs text-gray-500">{payment.count} transactions</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Recent Invoices</h2>
              <button
                onClick={() => navigate('/billing/invoices')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View all →
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentInvoices.map((invoice) => (
              <div
                key={invoice._id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/billing/invoices/${invoice._id}`)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-gray-600">
                      {invoice.patient?.firstName} {invoice.patient?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(invoice.totalAmount)}</p>
                    {getStatusBadge(invoice.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Recent Payments</h2>
              <button
                onClick={() => navigate('/billing/payments')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View all →
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentPayments.map((payment) => (
              <div key={payment._id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{payment.paymentNumber}</p>
                    <p className="text-sm text-gray-600">
                      {payment.patient?.firstName} {payment.patient?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {payment.method.replace('_', ' ')} • {new Date(payment.paymentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      {formatCurrency(payment.amount)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      payment.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/billing/invoices')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
          >
            <FileText className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <span className="text-sm">Manage Invoices</span>
          </button>
          <button
            onClick={() => navigate('/billing/reports')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
          >
            <Download className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <span className="text-sm">Generate Reports</span>
          </button>
          <button
            onClick={() => navigate('/billing/insurance')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
          >
            <FileText className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <span className="text-sm">Insurance Claims</span>
          </button>
          <button
            onClick={() => navigate('/billing/statements')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
          >
            <Search className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <span className="text-sm">Patient Statements</span>
          </button>
          <button
            onClick={fetchBillingData}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
          >
            <RefreshCw className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <span className="text-sm">Refresh Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillingDashboard;

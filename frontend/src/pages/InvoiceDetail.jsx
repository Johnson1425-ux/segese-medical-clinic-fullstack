import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Printer, CreditCard, DollarSign, Loader2 } from 'lucide-react';
import { billingService } from '../utils/billingService.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import PaymentModal from '../components/billing/PaymentModal.jsx';
// import { set } from 'mongoose';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Fetch invoice details
  const { data: invoice, isLoading, isError, refetch } = useQuery(
    ['invoice', id],
    () => billingService.getInvoiceById(id).then(res => res.data.data)
  );

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    queryClient.invalidateQueries(['invoice', id]);
  }
  
  // Mutation for adding a payment
  /*const addPaymentMutation = useMutation(
    (paymentData) => billingService.addPayment(id, paymentData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['invoice', id]);
        toast.success('Payment recorded successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Payment failed.');
      }
    }
  );

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    addPaymentMutation.mutate({
      amount: paymentAmount,
      method: paymentMethod,
    });
  };*/

  if (isLoading) return <LoadingSpinner />;
  if (isError || !invoice) return <div>Error loading invoice details.</div>;

  const getStatusChip = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="btn-secondary flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>
        <button className="btn-secondary flex items-center">
          <Printer className="w-4 h-4 mr-2" /> Print Invoice
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Invoice</h1>
            <p className="text-gray-500">{invoice.invoiceNumber}</p>
          </div>
          <div className={`text-lg font-semibold px-3 py-1 rounded-full ${getStatusChip(invoice.status)}`}>
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </div>
        </div>

        {/* Patient and Date Info */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Billed To</h3>
            <p className="text-lg font-medium text-gray-800">{invoice.patient.firstName} {invoice.patient.lastName}</p>
            <p className="text-gray-600">{invoice.patient.email}</p>
          </div>
          <div className="text-left md:text-right">
            <p><span className="font-semibold">Invoice Date:</span> {new Date(invoice.createdAt).toLocaleDateString()}</p>
            <p><span className="font-semibold">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Invoice Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-2 font-semibold text-gray-600">Service Description</th>
              <th className="text-right py-2 font-semibold text-gray-600">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-3">{item.description}</td>
                <td className="py-3 text-right">{item.total.toLocaleString()} TZS</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="flex justify-end mb-8">
          <div className="w-full md:w-1/3">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Subtotal</span>
              <span>{invoice.totalAmount.toLocaleString()} TZS</span>
            </div>
            <div className="flex justify-between py-2 font-bold text-xl text-gray-800 border-t-2 border-gray-200">
              <span>Amount Due</span>
              <span>{invoice.balanceDue.toLocaleString()} TZS</span>
            </div>
          </div>
        </div>

        {/* Payment Section */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h3 className="font-bold text-lg">Payment Status</h3>
            <p className="text-gray-600">Manage payments for this invoice.</p>
          </div>
          {/* 3. This button now opens the modal */}
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="btn-primary flex items-center mt-4 md:mt-0"
            disabled={invoice.status === 'paid'}
          >
            <CreditCard className="w-5 h-5 mr-2" />
            {invoice.status === 'paid' ? 'Invoice Paid' : 'Record Payment'}
          </button>
        </div>
      </div>

      {/* 4. Conditionally render the Payment Modal */}
      {isPaymentModalOpen && (
        <PaymentModal
          invoice={invoice}
          onClose={() => setIsPaymentModalOpen(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
      </div>
    </div>
  );
};

export default InvoiceDetail;
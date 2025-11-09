import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { X, DollarSign, Loader2 } from 'lucide-react';
import { billingService } from '../../utils/billingService.js';

const PaymentModal = ({ invoice, onClose, onPaymentSuccess }) => {
    const [amount, setAmount] = useState(invoice.balanceDue);
    const [method, setMethod] = useState('cash');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const paymentData = {
                invoice: invoice._id,
                patient: invoice.patient._id,
                amount,
                method,
            };
            await billingService.addPayment(invoice._id, paymentData);
            toast.success('Payment recorded successfully!');
            onPaymentSuccess(); // This will refetch the invoice data
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to record payment.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Record Payment for Invoice #{invoice.invoiceNumber}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Amount (TZS)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(parseFloat(e.target.value))}
                            className="input-field mt-1"
                            max={invoice.balanceDue}
                            required
                        />
                         <p className="text-xs text-gray-500 mt-1">Balance Due: {invoice.balanceDue.toLocaleString()} TZS</p>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="input-field mt-1"
                        >
                            <option value="cash">Cash</option>
                            <option value="credit_card">Credit Card</option>
                            <option value="insurance">Insurance</option>
                            <option value="bank_transfer">Bank Transfer</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="btn-secondary-outline">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary flex items-center" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <DollarSign className="w-5 h-5 mr-2" />}
                            {isSubmitting ? 'Processing...' : 'Confirm Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;
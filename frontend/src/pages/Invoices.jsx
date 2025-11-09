import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Search, Filter, Eye, ChevronLeft, ChevronRight, FileText, Plus } from 'lucide-react';
import { billingService } from '../utils/billingService.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const Invoices = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    const { data: invoiceData, isLoading, isError } = useQuery(
        ['invoices', currentPage, statusFilter, searchTerm],
        () => billingService.getAllInvoices({ page: currentPage, limit: 10, status: statusFilter, search: searchTerm }),
        { keepPreviousData: true }
    );

    const invoices = invoiceData?.data?.data?.invoices || [];
    const totalPages = invoiceData?.data?.data?.totalPages || 1;

    const getStatusChip = (status) => {
        const statusClasses = {
            paid: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            overdue: 'bg-red-100 text-red-800',
            partial: 'bg-blue-100 text-blue-800',
            cancelled: 'bg-gray-100 text-gray-800',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status] || 'bg-gray-100'}`}>{status}</span>;
    };

    if (isLoading) return <LoadingSpinner />;
    if (isError) return <div className="text-red-500">Error loading invoices.</div>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Invoice Management</h1>
            <Link to="/billing/invoices/new" className="btn-primary inline-flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Create New Invoice
            </Link>

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by patient name or invoice #"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10 w-full"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        className="input-field pl-10 w-full sm:w-auto"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="partial">Partial</option>
                        <option value="overdue">Overdue</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                    </select>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount (TZS)</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {invoices.map((invoice) => (
                                <tr key={invoice._id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{invoice.invoiceNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{invoice.patient?.firstName} {invoice.patient?.lastName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">{invoice.totalAmount.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">{getStatusChip(invoice.status)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/billing/invoices/${invoice._id}`} className="text-blue-600 hover:text-blue-800">
                                            <Eye className="inline h-5 w-5" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="btn-secondary disabled:opacity-50">
                    <ChevronLeft className="w-5 h-5 mr-2" /> Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="btn-secondary disabled:opacity-50">
                    Next <ChevronRight className="w-5 h-5 ml-2" />
                </button>
            </div>
        </div>
    );
};

export default Invoices;
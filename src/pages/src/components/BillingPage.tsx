import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BillingService } from '../services/billingService';
import { ClosingService } from '../services/closingService';
import LoadingSpinner from './LoadingSpinner';
import { formatCurrency, getInvoiceStatusColor, getPaymentStatusColor } from '../types/billing';
import { getClosingStatusColor } from '../types/closing';
import type { Invoice, PaymentHistory } from '../types/billing';
import type { Closing } from '../types/closing';

export default function BillingPage() {
  const { currentUser, clientData } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'closings' | 'invoices' | 'payments'>('overview');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [closings, setClosings] = useState<Closing[]>([]);
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingInvoice, setGeneratingInvoice] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser && clientData) {
      loadBillingData();
    }
  }, [currentUser, clientData]);

  const loadBillingData = async () => {
    if (!currentUser || !clientData) return;

    try {
      setLoading(true);
      setError(null);

      const billingService = new BillingService(clientData.tenantId, clientData.id);
      const closingService = new ClosingService(clientData.tenantId, clientData.id);

      const [invoicesData, closingsData, paymentsData] = await Promise.all([
        billingService.getInvoices(),
        closingService.getClosings(),
        billingService.getPaymentHistory()
      ]);

      setInvoices(invoicesData);
      setClosings(closingsData);
      setPayments(paymentsData);
    } catch (err: any) {
      setError('Failed to load billing information');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = async (closing: Closing) => {
    if (!clientData) return;

    try {
      setGeneratingInvoice(closing.id);
      const closingService = new ClosingService(clientData.tenantId, clientData.id);
      await closingService.generateClosingInvoice(closing.id);
      
      // Reload billing data to show the new invoice
      await loadBillingData();
    } catch (err: any) {
      setError('Failed to generate invoice: ' + err.message);
    } finally {
      setGeneratingInvoice(null);
    }
  };

  const calculateTotals = () => {
    const totalDue = invoices.reduce((sum, inv) => sum + inv.amountDue, 0);
    const totalPaid = payments
      .filter(p => p.status === 'succeeded')
      .reduce((sum, p) => sum + p.amount, 0);
    const openInvoices = invoices.filter(inv => inv.status === 'open').length;
    const upcomingClosings = closings.filter(c => c.status === 'scheduled').length;

    return { totalDue, totalPaid, openInvoices, upcomingClosings };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner text="Loading billing information..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Payments</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your closings, invoices, and payment history
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Due
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(totals.totalDue)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Paid
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(totals.totalPaid)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Open Invoices
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {totals.openInvoices}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Upcoming Closings
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {totals.upcomingClosings}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('closings')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'closings'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Closings
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'invoices'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Invoices
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'payments'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Payment History
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Recent Activity</h3>
              
              {/* Recent Closings */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Upcoming Closings</h4>
                {closings.filter(c => c.status === 'scheduled').slice(0, 3).map(closing => (
                  <div key={closing.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{closing.propertyAddress.street}</p>
                      <p className="text-xs text-gray-500">
                        {closing.transactionType} • {new Date(closing.scheduledClosingDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getClosingStatusColor(closing.status)}`}>
                      {closing.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Recent Invoices */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Invoices</h4>
                {invoices.slice(0, 3).map(invoice => (
                  <div key={invoice.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">Invoice #{invoice.invoiceNumber}</p>
                      <p className="text-xs text-gray-500">
                        Due {new Date(invoice.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(invoice.total)}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getInvoiceStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'closings' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Closings</h3>
              <div className="space-y-4">
                {closings.map(closing => (
                  <div key={closing.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{closing.propertyAddress.street}</h4>
                        <p className="text-sm text-gray-600">
                          {closing.propertyAddress.city}, {closing.propertyAddress.state} {closing.propertyAddress.zipCode}
                        </p>
                        <div className="mt-2 space-y-1 text-sm">
                          <p>Type: <span className="font-medium capitalize">{closing.transactionType}</span></p>
                          <p>Closing Date: <span className="font-medium">{new Date(closing.scheduledClosingDate).toLocaleDateString()}</span></p>
                          <p>Fixed Fee: <span className="font-medium">{formatCurrency(closing.fixedFee)}</span></p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getClosingStatusColor(closing.status)}`}>
                          {closing.status}
                        </span>
                        <p className="mt-2 text-sm font-medium">{formatCurrency(closing.amountDue)} due</p>
                        {!closing.invoiceId && closing.status === 'scheduled' && (
                          <button
                            onClick={() => generateInvoice(closing)}
                            disabled={generatingInvoice === closing.id}
                            className="mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            {generatingInvoice === closing.id ? 'Generating...' : 'Generate Invoice'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Invoices</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map(invoice => (
                      <tr key={invoice.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{invoice.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(invoice.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getInvoiceStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {invoice.hostedInvoiceUrl && (
                            <a
                              href={invoice.hostedInvoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              View
                            </a>
                          )}
                          {invoice.status === 'open' && (
                            <button className="text-green-600 hover:text-green-900">
                              Pay Now
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Payment History</h3>
              <div className="space-y-4">
                {payments.map(payment => (
                  <div key={payment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{formatCurrency(payment.amount)}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(payment.createdAt).toLocaleDateString()}
                          {payment.invoiceId && ` • Invoice #${payment.invoiceId}`}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
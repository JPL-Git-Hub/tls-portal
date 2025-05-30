import React, { useState, useEffect } from 'react';
import { Invoice } from '../types/billing';
import { PaymentForm } from './PaymentForm';
import { paymentService } from '../services/paymentService';
import { LoadingSpinner } from './LoadingSpinner';

interface PaymentModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && invoice) {
      createPaymentIntent();
    }
  }, [isOpen, invoice]);

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { clientSecret } = await paymentService.createPaymentIntent(invoice.id);
      setClientSecret(clientSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Make Payment
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Complete your payment securely with Stripe
            </p>
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner className="w-8 h-8" />
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
              <div className="mt-3">
                <button
                  onClick={createPaymentIntent}
                  className="text-sm text-red-600 hover:text-red-500"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {clientSecret && !loading && (
            <PaymentForm
              invoice={invoice}
              clientSecret={clientSecret}
              onSuccess={() => {
                onSuccess();
                onClose();
              }}
              onCancel={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};
import { Invoice } from '../types/billing';
import { db } from '../config/firebase';
import { addDoc, collection, onSnapshot, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

export const paymentService = {
  /**
   * Create a payment intent using Stripe Firestore extension
   */
  async createPaymentIntent(invoiceId: string): Promise<PaymentIntent> {
    // Get current user from auth context
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.uid) {
      throw new Error('User not authenticated');
    }

    // Create checkout session using Stripe extension
    const checkoutSessionRef = await addDoc(
      collection(db, 'customers', user.uid, 'checkout_sessions'),
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Invoice Payment`,
            description: `Payment for invoice ${invoiceId}`,
          },
          unit_amount: 100 * 100, // Amount in cents (replace with actual invoice amount)
        },
        quantity: 1,
        mode: 'payment',
        success_url: `${window.location.origin}/billing/success`,
        cancel_url: `${window.location.origin}/billing`,
        metadata: {
          invoiceId,
        },
      }
    );

    return new Promise((resolve, reject) => {
      const unsubscribe = onSnapshot(checkoutSessionRef, (snap) => {
        const data = snap.data();
        if (data?.clientSecret) {
          unsubscribe();
          resolve({
            clientSecret: data.clientSecret,
            paymentIntentId: data.payment_intent,
          });
        } else if (data?.error) {
          unsubscribe();
          reject(new Error(data.error.message));
        }
      });
    });
  },

  /**
   * Get payment history using Stripe extension collections
   */
  async getPaymentHistory(): Promise<any[]> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.uid) {
      throw new Error('User not authenticated');
    }

    // Extension automatically creates payments collection
    // This would be implemented with a Firestore query
    // For now, return empty array since extension handles this
    return [];
  },
};
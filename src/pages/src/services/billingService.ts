import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db, functions } from '../config/firebase';
import { httpsCallable } from 'firebase/functions';
import { loadStripe } from '@stripe/stripe-js';
import type { 
  Invoice, 
  PaymentHistory, 
  PaymentMethod, 
  CustomerBilling 
} from '../types/billing';

// Initialize Stripe
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
);

export class BillingService {
  private tenantId: string;
  private clientId: string;

  constructor(tenantId: string, clientId: string) {
    this.tenantId = tenantId;
    this.clientId = clientId;
  }

  // Get all invoices for the client
  async getInvoices(
    options: { 
      status?: Invoice['status']; 
      limit?: number;
      startAfter?: Date;
    } = {}
  ): Promise<Invoice[]> {
    const invoicesRef = collection(
      db,
      'tenants',
      this.tenantId,
      'clients',
      this.clientId,
      'invoices'
    );
    
    let q = query(invoicesRef, orderBy('createdAt', 'desc'));
    
    if (options.status) {
      q = query(q, where('status', '==', options.status));
    }
    
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    
    const snapshot = await getDocs(q);
    
    const invoices: Invoice[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      invoices.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        dueDate: data.dueDate.toDate(),
        paidAt: data.paidAt?.toDate(),
        lineItems: data.lineItems.map((item: any) => ({
          ...item,
          period: item.period ? {
            start: item.period.start.toDate(),
            end: item.period.end.toDate()
          } : undefined
        }))
      } as Invoice);
    });
    
    return invoices;
  }

  // Get a single invoice
  async getInvoice(invoiceId: string): Promise<Invoice | null> {
    const docRef = doc(
      db,
      'tenants',
      this.tenantId,
      'clients',
      this.clientId,
      'invoices',
      invoiceId
    );
    
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      dueDate: data.dueDate.toDate(),
      paidAt: data.paidAt?.toDate(),
      lineItems: data.lineItems.map((item: any) => ({
        ...item,
        period: item.period ? {
          start: item.period.start.toDate(),
          end: item.period.end.toDate()
        } : undefined
      }))
    } as Invoice;
  }

  // Get payment history
  async getPaymentHistory(
    options: {
      invoiceId?: string;
      limit?: number;
      status?: PaymentHistory['status'];
    } = {}
  ): Promise<PaymentHistory[]> {
    const paymentsRef = collection(
      db,
      'tenants',
      this.tenantId,
      'clients',
      this.clientId,
      'payments'
    );
    
    let q = query(paymentsRef, orderBy('createdAt', 'desc'));
    
    if (options.invoiceId) {
      q = query(q, where('invoiceId', '==', options.invoiceId));
    }
    
    if (options.status) {
      q = query(q, where('status', '==', options.status));
    }
    
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    
    const snapshot = await getDocs(q);
    
    const payments: PaymentHistory[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      payments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        succeededAt: data.succeededAt?.toDate()
      } as PaymentHistory);
    });
    
    return payments;
  }

  // Get payment methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const methodsRef = collection(
      db,
      'tenants',
      this.tenantId,
      'clients',
      this.clientId,
      'paymentMethods'
    );
    
    const q = query(methodsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const methods: PaymentMethod[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      methods.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate()
      } as PaymentMethod);
    });
    
    return methods;
  }

  // Get customer billing info
  async getCustomerBilling(): Promise<CustomerBilling | null> {
    const docRef = doc(
      db,
      'tenants',
      this.tenantId,
      'clients',
      this.clientId,
      'billing',
      'customer'
    );
    
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    const data = snapshot.data();
    return {
      ...data,
      currentPeriodEnd: data.currentPeriodEnd?.toDate()
    } as CustomerBilling;
  }

  // Pay an invoice
  async payInvoice(invoiceId: string, paymentMethodId: string): Promise<void> {
    const payInvoice = httpsCallable(functions, 'payInvoice');
    await payInvoice({
      invoiceId,
      paymentMethodId,
      clientId: this.clientId,
      tenantId: this.tenantId
    });
  }

  // Add a payment method
  async addPaymentMethod(paymentMethodId: string): Promise<void> {
    const addMethod = httpsCallable(functions, 'addPaymentMethod');
    await addMethod({
      paymentMethodId,
      clientId: this.clientId,
      tenantId: this.tenantId
    });
  }

  // Remove a payment method
  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    const removeMethod = httpsCallable(functions, 'removePaymentMethod');
    await removeMethod({
      paymentMethodId,
      clientId: this.clientId,
      tenantId: this.tenantId
    });
  }

  // Create a setup intent for adding payment methods
  async createSetupIntent(): Promise<{ clientSecret: string }> {
    const createIntent = httpsCallable(functions, 'createSetupIntent');
    const result = await createIntent({
      clientId: this.clientId,
      tenantId: this.tenantId
    });
    
    return result.data as { clientSecret: string };
  }

  // Get Stripe instance
  async getStripe() {
    return stripePromise;
  }

  // Download invoice PDF
  async downloadInvoicePDF(invoice: Invoice): Promise<void> {
    if (!invoice.invoicePdf) {
      throw new Error('Invoice PDF not available');
    }
    
    // Open PDF in new tab
    window.open(invoice.invoicePdf, '_blank');
  }

  // Calculate totals from invoices
  calculateTotals(invoices: Invoice[]) {
    return {
      totalDue: invoices.reduce((sum, inv) => sum + inv.amountDue, 0),
      totalPaid: invoices.reduce((sum, inv) => sum + inv.amountPaid, 0),
      openInvoices: invoices.filter(inv => inv.status === 'open').length,
      paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
    };
  }
}
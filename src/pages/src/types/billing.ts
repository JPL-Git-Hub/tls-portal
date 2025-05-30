export interface Invoice {
  id: string;
  clientId: string;
  tenantId: string;
  
  // Stripe data
  stripeInvoiceId: string;
  stripeCustomerId: string;
  stripePaymentIntentId?: string;
  
  // Invoice details
  invoiceNumber: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  
  // Amounts (in cents)
  subtotal: number;
  tax: number;
  total: number;
  amount: number; // Total amount for Stripe
  amountPaid: number;
  amountDue: number;
  currency: string;
  
  // Dates
  createdAt: Date;
  updatedAt: Date;
  dueDate: Date;
  paidAt?: Date;
  
  // Line items
  lineItems: InvoiceLineItem[];
  
  // URLs
  invoicePdf?: string;
  hostedInvoiceUrl?: string;
  
  // Metadata
  description?: string;
  metadata?: Record<string, any>;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitAmount: number; // in cents
  amount: number; // in cents
  currency: string;
  period?: {
    start: Date;
    end: Date;
  };
  closingId?: string; // Reference to closing transaction
  feeType?: 'closing-fee' | 'recording-fee' | 'courier-fee' | 'wire-fee' | 'other';
}

export interface PaymentMethod {
  id: string;
  stripePaymentMethodId: string;
  type: 'card' | 'us_bank_account' | 'ach_debit';
  
  // Card details (if type === 'card')
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  
  // Bank details (if type === 'us_bank_account')
  usBankAccount?: {
    accountHolderType: 'individual' | 'company';
    bankName: string;
    last4: string;
    routingNumber?: string;
  };
  
  isDefault: boolean;
  createdAt: Date;
}

export interface PaymentHistory {
  id: string;
  clientId: string;
  invoiceId: string;
  
  // Stripe data
  stripePaymentIntentId: string;
  stripeChargeId?: string;
  
  // Payment details
  amount: number; // in cents
  currency: string;
  status: 'succeeded' | 'processing' | 'failed' | 'canceled';
  
  // Payment method
  paymentMethodType: string;
  paymentMethodDetails?: {
    card?: {
      brand: string;
      last4: string;
    };
    bankAccount?: {
      bankName: string;
      last4: string;
    };
  };
  
  // Dates
  createdAt: Date;
  succeededAt?: Date;
  
  // Error info
  failureReason?: string;
  failureMessage?: string;
  
  // Receipt
  receiptUrl?: string;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CustomerBilling {
  stripeCustomerId: string;
  email: string;
  name: string;
  phone?: string;
  address?: BillingAddress;
  taxId?: string;
  taxExempt?: boolean;
  
  // Subscription info
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'past_due' | 'canceled' | 'unpaid';
  currentPeriodEnd?: Date;
  
  // Balance
  accountBalance: number; // in cents
  creditBalance: number; // in cents
}

// Helper functions
export function formatCurrency(amountInCents: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountInCents / 100);
}

export function getInvoiceStatusColor(status: Invoice['status']): string {
  const colors: Record<Invoice['status'], string> = {
    draft: 'bg-gray-100 text-gray-800',
    open: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    void: 'bg-red-100 text-red-800',
    uncollectible: 'bg-red-100 text-red-800',
  };
  return colors[status];
}

export function getPaymentStatusColor(status: PaymentHistory['status']): string {
  const colors: Record<PaymentHistory['status'], string> = {
    succeeded: 'bg-green-100 text-green-800',
    processing: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    canceled: 'bg-gray-100 text-gray-800',
  };
  return colors[status];
}
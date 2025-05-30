export interface Closing {
  id: string;
  clientId: string;
  tenantId: string;
  
  // Property details
  propertyAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  propertyType: 'single-family' | 'condo' | 'townhouse' | 'multi-family' | 'land';
  
  // Transaction details
  transactionType: 'purchase' | 'sale' | 'refinance';
  purchasePrice?: number; // in cents
  loanAmount?: number; // in cents
  
  // Dates
  contractDate: Date;
  scheduledClosingDate: Date;
  actualClosingDate?: Date;
  
  // Status
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  
  // Fee information
  fixedFee: number; // in cents
  additionalFees: AdditionalFee[];
  totalFees: number; // in cents
  
  // Payment status
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded';
  amountPaid: number; // in cents
  amountDue: number; // in cents
  
  // Related invoice
  invoiceId?: string;
  
  // Parties involved
  buyers?: Party[];
  sellers?: Party[];
  lender?: string;
  titleCompany?: string;
  
  // Documents checklist
  documentsChecklist: DocumentChecklistItem[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface Party {
  name: string;
  email?: string;
  phone?: string;
}

export interface AdditionalFee {
  description: string;
  amount: number; // in cents
  type: 'recording' | 'courier' | 'wire' | 'other';
}

export interface DocumentChecklistItem {
  id: string;
  name: string;
  required: boolean;
  completed: boolean;
  completedAt?: Date;
  documentId?: string; // Reference to uploaded document
}

export interface ClosingFeeSchedule {
  id: string;
  tenantId: string;
  
  // Base fees by transaction type
  purchaseFee: number; // in cents
  saleFee: number; // in cents
  refinanceFee: number; // in cents
  
  // Additional service fees
  additionalServices: {
    name: string;
    description: string;
    fee: number; // in cents
  }[];
  
  // Effective date
  effectiveDate: Date;
  expirationDate?: Date;
  
  // Status
  isActive: boolean;
}

// Standard document checklist templates
export const PURCHASE_CHECKLIST: Omit<DocumentChecklistItem, 'id' | 'completed' | 'completedAt' | 'documentId'>[] = [
  { name: 'Purchase Agreement', required: true },
  { name: 'Loan Approval Letter', required: true },
  { name: 'Property Inspection Report', required: false },
  { name: 'Title Search', required: true },
  { name: 'Survey', required: false },
  { name: 'Homeowners Insurance', required: true },
  { name: 'Government ID', required: true },
];

export const SALE_CHECKLIST: Omit<DocumentChecklistItem, 'id' | 'completed' | 'completedAt' | 'documentId'>[] = [
  { name: 'Sales Agreement', required: true },
  { name: 'Property Deed', required: true },
  { name: 'Property Tax Records', required: true },
  { name: 'HOA Documents', required: false },
  { name: 'Disclosure Forms', required: true },
  { name: 'Government ID', required: true },
];

export const REFINANCE_CHECKLIST: Omit<DocumentChecklistItem, 'id' | 'completed' | 'completedAt' | 'documentId'>[] = [
  { name: 'Current Mortgage Statement', required: true },
  { name: 'Loan Application', required: true },
  { name: 'Property Appraisal', required: true },
  { name: 'Homeowners Insurance', required: true },
  { name: 'Government ID', required: true },
  { name: 'Income Verification', required: true },
];

// Helper functions
export function getClosingStatusColor(status: Closing['status']): string {
  const colors: Record<Closing['status'], string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };
  return colors[status];
}

export function getPaymentStatusColor(status: Closing['paymentStatus']): string {
  const colors: Record<Closing['paymentStatus'], string> = {
    unpaid: 'bg-red-100 text-red-800',
    partial: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    refunded: 'bg-gray-100 text-gray-800',
  };
  return colors[status];
}

export function calculateDaysUntilClosing(closingDate: Date): number {
  const today = new Date();
  const timeDiff = closingDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

export function getChecklistByType(type: Closing['transactionType']) {
  switch (type) {
    case 'purchase':
      return PURCHASE_CHECKLIST;
    case 'sale':
      return SALE_CHECKLIST;
    case 'refinance':
      return REFINANCE_CHECKLIST;
    default:
      return [];
  }
}
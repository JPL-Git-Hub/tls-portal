import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc,
  updateDoc,
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { 
  Closing, 
  ClosingFeeSchedule,
  DocumentChecklistItem,
  getChecklistByType
} from '../types/closing';
import { v4 as uuidv4 } from 'uuid';

export class ClosingService {
  private tenantId: string;
  private clientId: string;

  constructor(tenantId: string, clientId: string) {
    this.tenantId = tenantId;
    this.clientId = clientId;
  }

  // Get all closings for the client
  async getClosings(
    options: { 
      status?: Closing['status']; 
      limit?: number;
    } = {}
  ): Promise<Closing[]> {
    const closingsRef = collection(
      db,
      'tenants',
      this.tenantId,
      'clients',
      this.clientId,
      'closings'
    );
    
    let q = query(closingsRef, orderBy('scheduledClosingDate', 'desc'));
    
    if (options.status) {
      q = query(q, where('status', '==', options.status));
    }
    
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    
    const snapshot = await getDocs(q);
    
    const closings: Closing[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      closings.push({
        id: doc.id,
        ...data,
        contractDate: data.contractDate.toDate(),
        scheduledClosingDate: data.scheduledClosingDate.toDate(),
        actualClosingDate: data.actualClosingDate?.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        documentsChecklist: data.documentsChecklist.map((item: any) => ({
          ...item,
          completedAt: item.completedAt?.toDate()
        }))
      } as Closing);
    });
    
    return closings;
  }

  // Get a single closing
  async getClosing(closingId: string): Promise<Closing | null> {
    const docRef = doc(
      db,
      'tenants',
      this.tenantId,
      'clients',
      this.clientId,
      'closings',
      closingId
    );
    
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data,
      contractDate: data.contractDate.toDate(),
      scheduledClosingDate: data.scheduledClosingDate.toDate(),
      actualClosingDate: data.actualClosingDate?.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      documentsChecklist: data.documentsChecklist.map((item: any) => ({
        ...item,
        completedAt: item.completedAt?.toDate()
      }))
    } as Closing;
  }

  // Create a new closing
  async createClosing(closingData: Omit<Closing, 'id' | 'createdAt' | 'updatedAt'>): Promise<Closing> {
    const closingId = uuidv4();
    const now = new Date();
    
    const closing: Closing = {
      ...closingData,
      id: closingId,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = doc(
      db,
      'tenants',
      this.tenantId,
      'clients',
      this.clientId,
      'closings',
      closingId
    );
    
    await setDoc(docRef, {
      ...closing,
      contractDate: Timestamp.fromDate(closing.contractDate),
      scheduledClosingDate: Timestamp.fromDate(closing.scheduledClosingDate),
      actualClosingDate: closing.actualClosingDate ? Timestamp.fromDate(closing.actualClosingDate) : null,
      createdAt: Timestamp.fromDate(closing.createdAt),
      updatedAt: Timestamp.fromDate(closing.updatedAt),
      documentsChecklist: closing.documentsChecklist.map(item => ({
        ...item,
        completedAt: item.completedAt ? Timestamp.fromDate(item.completedAt) : null
      }))
    });
    
    return closing;
  }

  // Update closing status
  async updateClosingStatus(closingId: string, status: Closing['status']): Promise<void> {
    const docRef = doc(
      db,
      'tenants',
      this.tenantId,
      'clients',
      this.clientId,
      'closings',
      closingId
    );
    
    const updates: any = {
      status,
      updatedAt: Timestamp.fromDate(new Date())
    };
    
    if (status === 'completed') {
      updates.actualClosingDate = Timestamp.fromDate(new Date());
    }
    
    await updateDoc(docRef, updates);
  }

  // Update document checklist item
  async updateChecklistItem(
    closingId: string, 
    itemId: string, 
    completed: boolean,
    documentId?: string
  ): Promise<void> {
    const closing = await this.getClosing(closingId);
    if (!closing) throw new Error('Closing not found');
    
    const updatedChecklist = closing.documentsChecklist.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          completed,
          completedAt: completed ? new Date() : undefined,
          documentId
        };
      }
      return item;
    });
    
    const docRef = doc(
      db,
      'tenants',
      this.tenantId,
      'clients',
      this.clientId,
      'closings',
      closingId
    );
    
    await updateDoc(docRef, {
      documentsChecklist: updatedChecklist.map(item => ({
        ...item,
        completedAt: item.completedAt ? Timestamp.fromDate(item.completedAt) : null
      })),
      updatedAt: Timestamp.fromDate(new Date())
    });
  }

  // Get active fee schedule
  async getActiveFeeSchedule(): Promise<ClosingFeeSchedule | null> {
    const schedulesRef = collection(
      db,
      'tenants',
      this.tenantId,
      'feeSchedules'
    );
    
    const q = query(
      schedulesRef, 
      where('isActive', '==', true),
      orderBy('effectiveDate', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      ...data,
      effectiveDate: data.effectiveDate.toDate(),
      expirationDate: data.expirationDate?.toDate()
    } as ClosingFeeSchedule;
  }

  // Calculate closing fees
  async calculateClosingFees(transactionType: Closing['transactionType']): Promise<number> {
    const feeSchedule = await this.getActiveFeeSchedule();
    if (!feeSchedule) {
      throw new Error('No active fee schedule found');
    }
    
    switch (transactionType) {
      case 'purchase':
        return feeSchedule.purchaseFee;
      case 'sale':
        return feeSchedule.saleFee;
      case 'refinance':
        return feeSchedule.refinanceFee;
      default:
        throw new Error('Invalid transaction type');
    }
  }

  // Generate invoice for closing
  async generateClosingInvoice(closingId: string): Promise<string> {
    const closing = await this.getClosing(closingId);
    if (!closing) throw new Error('Closing not found');
    
    // Call Firebase Function to create the invoice in Stripe
    const { functions } = await import('../config/firebase');
    const { httpsCallable } = await import('firebase/functions');
    
    const createInvoice = httpsCallable(functions, 'createClosingInvoice');
    const result = await createInvoice({
      closingId,
      clientId: this.clientId,
      tenantId: this.tenantId
    });
    
    const data = result.data as { invoiceId: string; hostedInvoiceUrl: string; invoicePdf: string };
    return data.invoiceId;
  }

  // Get closing statistics
  async getClosingStats() {
    const closings = await this.getClosings();
    
    const now = new Date();
    const thisMonth = closings.filter(c => {
      const closingMonth = c.scheduledClosingDate.getMonth();
      const currentMonth = now.getMonth();
      const closingYear = c.scheduledClosingDate.getFullYear();
      const currentYear = now.getFullYear();
      return closingMonth === currentMonth && closingYear === currentYear;
    });
    
    return {
      total: closings.length,
      scheduled: closings.filter(c => c.status === 'scheduled').length,
      inProgress: closings.filter(c => c.status === 'in-progress').length,
      completed: closings.filter(c => c.status === 'completed').length,
      thisMonth: thisMonth.length,
      totalRevenue: closings
        .filter(c => c.paymentStatus === 'paid')
        .reduce((sum, c) => sum + c.totalFees, 0),
      pendingRevenue: closings
        .filter(c => c.paymentStatus !== 'paid' && c.status !== 'cancelled')
        .reduce((sum, c) => sum + c.amountDue, 0)
    };
  }
}
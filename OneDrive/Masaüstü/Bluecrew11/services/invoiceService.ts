import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { Invoice } from '@/types';

const INVOICES_COLLECTION = 'invoices';

export const InvoiceService = {
  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'created_at'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, INVOICES_COLLECTION), {
        ...invoiceData,
        created_at: new Date().toISOString(),
        invoice_date: invoiceData.invoice_date || new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  },

  async getInvoices(): Promise<Invoice[]> {
    try {
      const invoicesCol = collection(db, INVOICES_COLLECTION);
      const q = query(invoicesCol, orderBy('created_at', 'desc'));
      const invoiceSnapshot = await getDocs(q);
      const invoicesList = invoiceSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Invoice[];
      return invoicesList;
    } catch (error) {
      console.error('Error getting invoices:', error);
      return [];
    }
  },

  async getInvoiceById(invoiceId: string): Promise<Invoice | null> {
    try {
      const invoiceDocRef = doc(db, INVOICES_COLLECTION, invoiceId);
      const invoiceDocSnap = await getDoc(invoiceDocRef);

      if (invoiceDocSnap.exists()) {
        return { id: invoiceDocSnap.id, ...invoiceDocSnap.data() } as Invoice;
      }
      return null;
    } catch (error) {
      console.error('Error getting invoice by ID:', error);
      return null;
    }
  },

  async getInvoicesByProjectId(projectId: string): Promise<Invoice[]> {
    try {
      const invoicesCol = collection(db, INVOICES_COLLECTION);
      const q = query(invoicesCol, where('project_id', '==', projectId), orderBy('created_at', 'desc'));
      const invoiceSnapshot = await getDocs(q);
      const invoicesList = invoiceSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Invoice[];
      return invoicesList;
    } catch (error) {
      console.error('Error getting invoices by project ID:', error);
      return [];
    }
  },

  async updateInvoice(invoiceId: string, updates: Partial<Invoice>): Promise<void> {
    try {
      const invoiceRef = doc(db, INVOICES_COLLECTION, invoiceId);
      await updateDoc(invoiceRef, {
        ...updates,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  },

  async deleteInvoice(invoiceId: string): Promise<void> {
    try {
      const invoiceRef = doc(db, INVOICES_COLLECTION, invoiceId);
      await deleteDoc(invoiceRef);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  },

  async generateInvoiceNumber(): Promise<string> {
    try {
      const invoices = await InvoiceService.getInvoices();
      const invoiceCount = invoices.length + 1;
      const year = new Date().getFullYear();
      return `INV-${year}-${String(invoiceCount).padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating invoice number:', error);
      const year = new Date().getFullYear();
      return `INV-${year}-0001`;
    }
  },
};


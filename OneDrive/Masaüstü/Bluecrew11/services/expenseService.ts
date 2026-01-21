import { db, storage } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Expense, ExpenseDocument, ExpensePayment } from '@/types';

const EXPENSES_COLLECTION = 'expenses';

export const ExpenseService = {
  async createExpense(expenseData: Omit<Expense, 'id' | 'created_at'>): Promise<string> {
    try {
      // Remove undefined values from expenseData
      const cleanData: any = {
        type: expenseData.type,
        amount: expenseData.amount,
        description: expenseData.description,
        is_office: expenseData.is_office,
        date: expenseData.date,
        status: expenseData.status || 'pending',
        total_paid: expenseData.total_paid || 0,
        created_by: expenseData.created_by,
        created_by_name: expenseData.created_by_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Only add optional fields if they exist and are not undefined
      if (expenseData.category !== undefined && expenseData.category !== null && expenseData.category !== '') {
        cleanData.category = expenseData.category;
      }
      if (expenseData.project_id !== undefined && expenseData.project_id !== null && expenseData.project_id !== '') {
        cleanData.project_id = expenseData.project_id;
      }
      if (expenseData.project_name !== undefined && expenseData.project_name !== null && expenseData.project_name !== '') {
        cleanData.project_name = expenseData.project_name;
      }
      if (expenseData.vendor_id !== undefined && expenseData.vendor_id !== null && expenseData.vendor_id !== '') {
        cleanData.vendor_id = expenseData.vendor_id;
      }
      if (expenseData.vendor_name !== undefined && expenseData.vendor_name !== null && expenseData.vendor_name !== '') {
        cleanData.vendor_name = expenseData.vendor_name;
      }
      if (expenseData.subcontractor_id !== undefined && expenseData.subcontractor_id !== null && expenseData.subcontractor_id !== '') {
        cleanData.subcontractor_id = expenseData.subcontractor_id;
      }
      if (expenseData.subcontractor_name !== undefined && expenseData.subcontractor_name !== null && expenseData.subcontractor_name !== '') {
        cleanData.subcontractor_name = expenseData.subcontractor_name;
      }
      if (expenseData.material_request_id !== undefined && expenseData.material_request_id !== null && expenseData.material_request_id !== '') {
        cleanData.material_request_id = expenseData.material_request_id;
      }
      if (expenseData.documents !== undefined && expenseData.documents !== null && Array.isArray(expenseData.documents) && expenseData.documents.length > 0) {
        cleanData.documents = expenseData.documents;
      }

      const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), cleanData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  },

  async getExpenses(): Promise<Expense[]> {
    try {
      const expensesCol = collection(db, EXPENSES_COLLECTION);
      const q = query(expensesCol, orderBy('date', 'desc'));
      const expenseSnapshot = await getDocs(q);
      const expensesList = expenseSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Expense[];
      return expensesList;
    } catch (error) {
      console.error('Error getting expenses:', error);
      return [];
    }
  },

  async getExpensesByProjectId(projectId: string): Promise<Expense[]> {
    try {
      const expensesCol = collection(db, EXPENSES_COLLECTION);
      const q = query(
        expensesCol, 
        where('project_id', '==', projectId),
        orderBy('date', 'desc')
      );
      const expenseSnapshot = await getDocs(q);
      const expensesList = expenseSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Expense[];
      return expensesList;
    } catch (error) {
      console.error('Error getting expenses by project ID:', error);
      return [];
    }
  },

  async getOfficeExpenses(): Promise<Expense[]> {
    try {
      const expensesCol = collection(db, EXPENSES_COLLECTION);
      const q = query(
        expensesCol,
        where('is_office', '==', true),
        orderBy('date', 'desc')
      );
      const expenseSnapshot = await getDocs(q);
      const expensesList = expenseSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Expense[];
      return expensesList;
    } catch (error) {
      console.error('Error getting office expenses:', error);
      return [];
    }
  },

  async getExpenseById(expenseId: string): Promise<Expense | null> {
    try {
      const expenseDocRef = doc(db, EXPENSES_COLLECTION, expenseId);
      const expenseDocSnap = await getDoc(expenseDocRef);

      if (expenseDocSnap.exists()) {
        return { id: expenseDocSnap.id, ...expenseDocSnap.data() } as Expense;
      }
      return null;
    } catch (error) {
      console.error('Error getting expense by ID:', error);
      return null;
    }
  },

  async updateExpense(expenseId: string, updates: Partial<Expense>): Promise<void> {
    try {
      const expenseDocRef = doc(db, EXPENSES_COLLECTION, expenseId);
      await updateDoc(expenseDocRef, {
        ...updates,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  },

  async deleteExpense(expenseId: string): Promise<void> {
    try {
      // Get expense to delete associated documents
      const expense = await this.getExpenseById(expenseId);
      if (expense && expense.documents) {
        // Delete all documents from storage
        for (const document of expense.documents) {
          try {
            const fileRef = ref(storage, document.file_url);
            await deleteObject(fileRef);
          } catch (storageError) {
            console.error('Error deleting document from storage:', storageError);
          }
        }
      }

      const expenseDocRef = doc(db, EXPENSES_COLLECTION, expenseId);
      await deleteDoc(expenseDocRef);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  },

  async uploadExpenseDocument(
    expenseId: string,
    file: File | Blob,
    fileName: string,
    fileType: 'image' | 'document',
    uploadedBy: string,
    uploadedByName: string
  ): Promise<ExpenseDocument> {
    try {
      // Upload file to Firebase Storage
      const storageRef = ref(storage, `expenses/${expenseId}/${Date.now()}_${fileName}`);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      // Create document object
      const document: ExpenseDocument = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: fileName,
        file_url: fileUrl,
        file_type: fileType,
        file_size: file.size,
        uploaded_at: new Date().toISOString(),
        uploaded_by: uploadedBy,
        uploaded_by_name: uploadedByName,
      };

      // Update expense with new document
      const expenseDocRef = doc(db, EXPENSES_COLLECTION, expenseId);
      const expense = await this.getExpenseById(expenseId);
      
      const currentDocuments = expense?.documents || [];
      const updatedDocuments = [...currentDocuments, document];

      await updateDoc(expenseDocRef, {
        documents: updatedDocuments,
        updated_at: new Date().toISOString(),
      });

      return document;
    } catch (error) {
      console.error('Error uploading expense document:', error);
      throw error;
    }
  },

  async deleteExpenseDocument(expenseId: string, documentId: string): Promise<void> {
    try {
      const expense = await this.getExpenseById(expenseId);
      if (!expense) {
        throw new Error('Expense not found');
      }

      const document = expense.documents?.find(doc => doc.id === documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      // Delete file from Storage
      try {
        const fileRef = ref(storage, document.file_url);
        await deleteObject(fileRef);
      } catch (storageError) {
        console.error('Error deleting file from storage:', storageError);
      }

      // Remove document from expense
      const updatedDocuments = expense.documents?.filter(doc => doc.id !== documentId) || [];
      const expenseDocRef = doc(db, EXPENSES_COLLECTION, expenseId);
      await updateDoc(expenseDocRef, {
        documents: updatedDocuments,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error deleting expense document:', error);
      throw error;
    }
  },

  async approveExpense(expenseId: string, approvedBy: string, approvedByName: string): Promise<void> {
    try {
      const expenseDocRef = doc(db, EXPENSES_COLLECTION, expenseId);
      await updateDoc(expenseDocRef, {
        status: 'approved',
        approved_by: approvedBy,
        approved_by_name: approvedByName,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error approving expense:', error);
      throw error;
    }
  },

  async rejectExpense(expenseId: string, rejectedBy: string, rejectedByName: string, reason: string): Promise<void> {
    try {
      const expenseDocRef = doc(db, EXPENSES_COLLECTION, expenseId);
      await updateDoc(expenseDocRef, {
        status: 'rejected',
        rejected_by: rejectedBy,
        rejected_by_name: rejectedByName,
        rejected_at: new Date().toISOString(),
        rejection_reason: reason,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error rejecting expense:', error);
      throw error;
    }
  },

  async addPayment(expenseId: string, payment: Omit<ExpensePayment, 'id' | 'created_at'>): Promise<void> {
    try {
      const expense = await this.getExpenseById(expenseId);
      if (!expense) {
        throw new Error('Expense not found');
      }

      // Clean payment data - remove undefined values
      const cleanPayment: ExpensePayment = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: payment.amount,
        payment_date: payment.payment_date,
        payment_method: payment.payment_method,
        paid_by: payment.paid_by,
        paid_by_name: payment.paid_by_name,
        created_at: new Date().toISOString(),
      };

      // Only add optional fields if they exist
      if (payment.check_number !== undefined && payment.check_number !== null && payment.check_number !== '') {
        cleanPayment.check_number = payment.check_number;
      }
      if (payment.reference_number !== undefined && payment.reference_number !== null && payment.reference_number !== '') {
        cleanPayment.reference_number = payment.reference_number;
      }
      if (payment.notes !== undefined && payment.notes !== null && payment.notes !== '') {
        cleanPayment.notes = payment.notes;
      }

      const currentPayments = expense.payments || [];
      const updatedPayments = [...currentPayments, cleanPayment];
      const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);

      let newStatus: Expense['status'] = expense.status || 'pending';
      if (totalPaid >= expense.amount) {
        newStatus = 'paid';
      } else if (totalPaid > 0) {
        newStatus = 'partially_paid';
      }

      // Clean update data - remove undefined values
      const updateData: any = {
        payments: updatedPayments,
        total_paid: totalPaid,
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      const expenseDocRef = doc(db, EXPENSES_COLLECTION, expenseId);
      await updateDoc(expenseDocRef, updateData);
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  },

  async deletePayment(expenseId: string, paymentId: string): Promise<void> {
    try {
      const expense = await this.getExpenseById(expenseId);
      if (!expense) {
        throw new Error('Expense not found');
      }

      const updatedPayments = expense.payments?.filter(p => p.id !== paymentId) || [];
      const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);

      let newStatus: Expense['status'] = expense.status;
      if (totalPaid === 0) {
        newStatus = expense.approved_by ? 'approved' : 'pending';
      } else if (totalPaid < expense.amount) {
        newStatus = 'partially_paid';
      } else {
        newStatus = 'paid';
      }

      const expenseDocRef = doc(db, EXPENSES_COLLECTION, expenseId);
      await updateDoc(expenseDocRef, {
        payments: updatedPayments,
        total_paid: totalPaid,
        status: newStatus,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  },
};


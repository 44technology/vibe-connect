import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export class ChangeOrderRequestService {
  private static collectionName = 'changeOrderRequests';

  static async createChangeOrderRequest(request: any): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...request,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating change order request:', error);
      throw new Error('Failed to create change order request');
    }
  }

  static async getChangeOrderRequests(): Promise<any[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting change order requests:', error);
      throw new Error('Failed to get change order requests');
    }
  }

  static async getChangeOrderRequestsByProject(projectId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('project_id', '==', projectId),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting change order requests by project:', error);
      throw new Error('Failed to get change order requests by project');
    }
  }

  static async updateChangeOrderRequest(requestId: string, updates: any): Promise<void> {
    try {
      const requestRef = doc(db, this.collectionName, requestId);
      await updateDoc(requestRef, {
        ...updates,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating change order request:', error);
      throw new Error('Failed to update change order request');
    }
  }

  static async deleteChangeOrderRequest(requestId: string): Promise<void> {
    try {
      const requestRef = doc(db, this.collectionName, requestId);
      await deleteDoc(requestRef);
    } catch (error) {
      console.error('Error deleting change order request:', error);
      throw new Error('Failed to delete change order request');
    }
  }
}






















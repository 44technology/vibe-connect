import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ChangeOrderRequest } from '@/types';
import { NotificationService } from './notificationService';
import { ProjectService } from './projectService';
import { UserService } from './userService';

export const ChangeOrderService = {
  async createChangeOrderRequest(requestData: Omit<ChangeOrderRequest, 'id' | 'created_at'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'changeOrderRequests'), {
        ...requestData,
        created_at: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating change order request:', error);
      throw error;
    }
  },

  async getChangeOrderRequests(): Promise<ChangeOrderRequest[]> {
    try {
      const requestsCol = collection(db, 'changeOrderRequests');
      const requestSnapshot = await getDocs(requestsCol);
      const requestsList = requestSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChangeOrderRequest[];
      return requestsList;
    } catch (error) {
      console.error('Error getting change order requests:', error);
      return [];
    }
  },

  async getChangeOrderRequestById(requestId: string): Promise<ChangeOrderRequest | null> {
    try {
      const requestDocRef = doc(db, 'changeOrderRequests', requestId);
      const requestDocSnap = await getDoc(requestDocRef);

      if (requestDocSnap.exists()) {
        return { id: requestDocSnap.id, ...requestDocSnap.data() } as ChangeOrderRequest;
      }
      return null;
    } catch (error) {
      console.error('Error getting change order request by ID:', error);
      return null;
    }
  },

  async getChangeOrderRequestsByProjectId(projectId: string): Promise<ChangeOrderRequest[]> {
    try {
      const requestsCol = collection(db, 'changeOrderRequests');
      const q = query(requestsCol, where('project_id', '==', projectId));
      const requestSnapshot = await getDocs(q);
      const requestsList = requestSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChangeOrderRequest[];
      return requestsList;
    } catch (error) {
      console.error('Error getting change order requests by project ID:', error);
      return [];
    }
  },

  async updateChangeOrderRequest(requestId: string, updates: Partial<ChangeOrderRequest>): Promise<void> {
    try {
      const requestDocRef = doc(db, 'changeOrderRequests', requestId);
      const requestDoc = await getDoc(requestDocRef);
      const oldData = requestDoc.data() as ChangeOrderRequest;
      
      await updateDoc(requestDocRef, updates);

      // Create notifications for approval/rejection
      try {
        if (updates.status && updates.status !== oldData.status && (updates.status === 'approved' || updates.status === 'rejected')) {
          const project = await ProjectService.getProject(oldData.project_id);
          if (project) {
            const allUsers = await UserService.getAllUsers();
            const recipients: string[] = [];

            // Add requester
            if (oldData.requested_by && !recipients.includes(oldData.requested_by)) {
              recipients.push(oldData.requested_by);
            }

            // Add project PMs
            if (project.assigned_pms && project.assigned_pms.length > 0) {
              project.assigned_pms.forEach((pmId: string) => {
                if (!recipients.includes(pmId)) {
                  recipients.push(pmId);
                }
              });
            }

            // Add client
            if (project.client_id && !recipients.includes(project.client_id)) {
              recipients.push(project.client_id);
            }

            // Add admin users
            const adminUsers = allUsers.filter(u => u.role === 'admin');
            adminUsers.forEach(admin => {
              if (!recipients.includes(admin.id)) {
                recipients.push(admin.id);
              }
            });

            if (recipients.length > 0) {
              await NotificationService.createChangeOrderNotification(
                requestId,
                oldData.project_id,
                project.title || 'Project',
                updates.status as 'approved' | 'rejected',
                recipients,
                updates.approved_by || updates.rejected_by,
                updates.approved_by_name || updates.rejected_by_name
              );
            }
          }
        }
      } catch (notifError) {
        // Don't fail update if notification fails
        console.error('Error creating notification:', notifError);
      }
    } catch (error) {
      console.error('Error updating change order request:', error);
      throw error;
    }
  },

  async deleteChangeOrderRequest(requestId: string): Promise<void> {
    try {
      const requestDocRef = doc(db, 'changeOrderRequests', requestId);
      await deleteDoc(requestDocRef);
    } catch (error) {
      console.error('Error deleting change order request:', error);
      throw error;
    }
  },
};
























import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { Comment } from '@/types';
import { NotificationService } from './notificationService';
import { ProjectService } from './projectService';

export class CommentService {
  // created_at is generated server-side here, so callers don't need to pass it.
  static async addComment(comment: Omit<Comment, 'id' | 'created_at'>): Promise<string> {
    try {
      // Test connection first
      const { testFirebaseConnection } = await import('@/lib/firebase');
      const isConnected = await testFirebaseConnection();
      
      if (!isConnected) {
        throw new Error('Firebase connection failed. Please check your internet connection.');
      }

      const docRef = await addDoc(collection(db, 'comments'), {
        ...comment,
        created_at: new Date().toISOString(),
      });

      // Create notifications for project chat
      if (comment.project_id) {
        try {
          const project = await ProjectService.getProject(comment.project_id);
          if (project) {
            // Get all users who should be notified (PMs, client, admin)
            const { UserService } = await import('./userService');
            const allUsers = await UserService.getAllUsers();
            
            // Find project participants
            const participants: string[] = [];
            
            // Add client
            if (project.client_id) {
              participants.push(project.client_id);
            }
            
            // Add assigned PMs
            if (project.assigned_pms && project.assigned_pms.length > 0) {
              project.assigned_pms.forEach((pmId: string) => {
                if (!participants.includes(pmId)) {
                  participants.push(pmId);
                }
              });
            }
            
            // Add admin users
            const adminUsers = allUsers.filter(u => u.role === 'admin');
            adminUsers.forEach(admin => {
              if (!participants.includes(admin.id)) {
                participants.push(admin.id);
              }
            });
            
            // Remove the sender from notification list
            const recipients = participants.filter(id => id !== comment.user_id);
            
            // Create notifications
            if (recipients.length > 0) {
              const projectName = project.title || 'Project';
              await NotificationService.createChatNotification(
                comment.project_id, // Use project_id as chat identifier
                comment.project_id,
                comment.user_id,
                comment.user_name,
                comment.comment,
                recipients
              );
            }
          }
        } catch (notifError) {
          // Don't fail comment creation if notification fails
          console.error('Error creating notification:', notifError);
        }
      }

      return docRef.id;
    } catch (error) {
      console.error('Error adding comment:', error);
      if (error instanceof Error && error.message.includes('connection')) {
        throw new Error('Connection failed. Please check your internet connection or VPN.');
      }
      throw error;
    }
  }

  static async getCommentsByProjectId(projectId: string): Promise<Comment[]> {
    try {
      // First, try with index (if it exists)
      try {
        const q = query(
          collection(db, 'comments'),
          where('project_id', '==', projectId),
          orderBy('created_at', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Comment[];
      } catch (indexError: any) {
        // If index doesn't exist, fallback to client-side sorting
        if (indexError.code === 'failed-precondition' || indexError.message?.includes('index')) {
          console.warn('Index not found for comments, using client-side sorting. Please create the index:', indexError.message);
          
          // Get all comments for the project without orderBy
          const q = query(
            collection(db, 'comments'),
            where('project_id', '==', projectId)
          );
          const querySnapshot = await getDocs(q);
          
          // Sort on client side
          const comments = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Comment[];
          
          // Sort by created_at descending
          return comments.sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA; // descending
          });
        }
        throw indexError;
      }
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  }

  static async getCommentsByProposalId(proposalId: string): Promise<Comment[]> {
    try {
      // First, try with index (if it exists)
      try {
        const q = query(
          collection(db, 'comments'),
          where('proposal_id', '==', proposalId),
          orderBy('created_at', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Comment[];
      } catch (indexError: any) {
        // If index doesn't exist, fallback to client-side sorting
        if (indexError.code === 'failed-precondition' || indexError.message?.includes('index')) {
          console.warn('Index not found for proposal comments, using client-side sorting.');
          
          // Get all comments for the proposal without orderBy
          const q = query(
            collection(db, 'comments'),
            where('proposal_id', '==', proposalId)
          );
          const querySnapshot = await getDocs(q);
          
          // Sort on client side
          const comments = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Comment[];
          
          // Sort by created_at descending
          return comments.sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA; // descending
          });
        }
        throw indexError;
      }
    } catch (error) {
      console.error('Error getting proposal comments:', error);
      return [];
    }
  }

  static async getCommentsByInvoiceId(invoiceId: string): Promise<Comment[]> {
    try {
      // First, try with index (if it exists)
      try {
        const q = query(
          collection(db, 'comments'),
          where('invoice_id', '==', invoiceId),
          orderBy('created_at', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Comment[];
      } catch (indexError: any) {
        // If index doesn't exist, fallback to client-side sorting
        if (indexError.code === 'failed-precondition' || indexError.message?.includes('index')) {
          console.warn('Index not found for invoice comments, using client-side sorting.');
          
          // Get all comments for the invoice without orderBy
          const q = query(
            collection(db, 'comments'),
            where('invoice_id', '==', invoiceId)
          );
          const querySnapshot = await getDocs(q);
          
          // Sort on client side
          const comments = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Comment[];
          
          // Sort by created_at descending
          return comments.sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA; // descending
          });
        }
        throw indexError;
      }
    } catch (error) {
      console.error('Error getting invoice comments:', error);
      return [];
    }
  }

  static async updateComment(commentId: string, updates: Partial<Comment>): Promise<void> {
    try {
      const commentRef = doc(db, 'comments', commentId);
      await updateDoc(commentRef, {
        ...updates,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  static async getCommentsByChangeOrderId(changeOrderId: string): Promise<Comment[]> {
    try {
      // First, try with index (if it exists)
      try {
        const q = query(
          collection(db, 'comments'),
          where('change_order_id', '==', changeOrderId),
          orderBy('created_at', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Comment[];
      } catch (indexError: any) {
        // If index doesn't exist, fallback to client-side sorting
        if (indexError.code === 'failed-precondition' || indexError.message?.includes('index')) {
          console.warn('Index not found for change order comments, using client-side sorting.');
          
          // Get all comments for the change order without orderBy
          const q = query(
            collection(db, 'comments'),
            where('change_order_id', '==', changeOrderId)
          );
          const querySnapshot = await getDocs(q);
          
          // Sort on client side
          const comments = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Comment[];
          
          // Sort by created_at descending
          return comments.sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA; // descending
          });
        }
        throw indexError;
      }
    } catch (error) {
      console.error('Error getting change order comments:', error);
      return [];
    }
  }

  static async getCommentsByMaterialRequestId(materialRequestId: string): Promise<Comment[]> {
    try {
      // First, try with index (if it exists)
      try {
        const q = query(
          collection(db, 'comments'),
          where('material_request_id', '==', materialRequestId),
          orderBy('created_at', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Comment[];
      } catch (indexError: any) {
        // If index doesn't exist, fallback to client-side sorting
        if (indexError.code === 'failed-precondition' || indexError.message?.includes('index')) {
          console.warn('Index not found for material request comments, using client-side sorting.');
          
          // Get all comments for the material request without orderBy
          const q = query(
            collection(db, 'comments'),
            where('material_request_id', '==', materialRequestId)
          );
          const querySnapshot = await getDocs(q);
          
          // Sort on client side
          const comments = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Comment[];
          
          // Sort by created_at descending
          return comments.sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA; // descending
          });
        }
        throw indexError;
      }
    } catch (error) {
      console.error('Error getting material request comments:', error);
      return [];
    }
  }

  static async deleteComment(commentId: string): Promise<void> {
    try {
      const commentRef = doc(db, 'comments', commentId);
      await deleteDoc(commentRef);
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
}

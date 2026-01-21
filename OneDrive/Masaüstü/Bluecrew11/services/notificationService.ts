import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  doc,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';

export interface Notification {
  id: string;
  user_id: string; // Target user who should see this notification
  type: 'chat' | 'project' | 'proposal' | 'invoice' | 'change_order' | 'material_request' | 'system';
  title: string;
  message: string;
  related_id?: string; // ID of related item (project_id, chat_id, etc.)
  related_type?: string; // Type of related item
  sender_id?: string; // User who triggered the notification
  sender_name?: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

export class NotificationService {
  // Create a notification
  static async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<string> {
    try {
      const notificationData = {
        ...notification,
        is_read: false,
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Create notification for chat message
  static async createChatNotification(
    chatId: string,
    projectId: string | undefined,
    senderId: string,
    senderName: string,
    message: string,
    recipientIds: string[] // All participants except sender
  ): Promise<void> {
    try {
      const notifications = recipientIds.map(userId => ({
        user_id: userId,
        type: 'chat' as const,
        title: 'New Message',
        message: `${senderName}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
        related_id: chatId,
        related_type: projectId ? 'project_chat' : 'direct_chat',
        sender_id: senderId,
        sender_name: senderName,
        is_read: false,
      }));

      // Create notifications for all recipients
      await Promise.all(
        notifications.map(notif => this.createNotification(notif))
      );
    } catch (error) {
      console.error('Error creating chat notification:', error);
      throw error;
    }
  }

  // Create notification for material request status change
  static async createMaterialRequestStatusNotification(
    requestId: string,
    projectId: string,
    projectName: string,
    status: 'ordered' | 'shipped' | 'delivered',
    recipientIds: string[],
    updatedBy?: string,
    updatedByName?: string
  ): Promise<void> {
    try {
      const statusMessages = {
        ordered: 'Material request has been ordered',
        shipped: 'Material request has been shipped',
        delivered: 'Material request has been delivered',
      };

      const notifications = recipientIds.map(userId => ({
        user_id: userId,
        type: 'material_request' as const,
        title: statusMessages[status],
        message: `${projectName}: Material request status updated to ${status}`,
        related_id: requestId,
        related_type: 'material_request',
        sender_id: updatedBy,
        sender_name: updatedByName,
        is_read: false,
      }));

      await Promise.all(
        notifications.map(notif => this.createNotification(notif))
      );
    } catch (error) {
      console.error('Error creating material request status notification:', error);
      throw error;
    }
  }

  // Create notification for change order approval/rejection
  static async createChangeOrderNotification(
    changeOrderId: string,
    projectId: string,
    projectName: string,
    status: 'approved' | 'rejected',
    recipientIds: string[],
    approvedBy?: string,
    approvedByName?: string
  ): Promise<void> {
    try {
      const title = status === 'approved' 
        ? 'Change Order Approved' 
        : 'Change Order Rejected';
      
      const message = status === 'approved'
        ? `${projectName}: Change order has been approved`
        : `${projectName}: Change order has been rejected`;

      const notifications = recipientIds.map(userId => ({
        user_id: userId,
        type: 'change_order' as const,
        title: title,
        message: message,
        related_id: changeOrderId,
        related_type: 'change_order',
        sender_id: approvedBy,
        sender_name: approvedByName,
        is_read: false,
      }));

      await Promise.all(
        notifications.map(notif => this.createNotification(notif))
      );
    } catch (error) {
      console.error('Error creating change order notification:', error);
      throw error;
    }
  }

  // Create notification for material request approval/rejection
  static async createMaterialRequestApprovalNotification(
    requestId: string,
    projectId: string,
    projectName: string,
    status: 'approved' | 'rejected',
    recipientIds: string[],
    approvedBy?: string,
    approvedByName?: string
  ): Promise<void> {
    try {
      const title = status === 'approved' 
        ? 'Material Request Approved' 
        : 'Material Request Rejected';
      
      const message = status === 'approved'
        ? `${projectName}: Material request has been approved`
        : `${projectName}: Material request has been rejected`;

      const notifications = recipientIds.map(userId => ({
        user_id: userId,
        type: 'material_request' as const,
        title: title,
        message: message,
        related_id: requestId,
        related_type: 'material_request',
        sender_id: approvedBy,
        sender_name: approvedByName,
        is_read: false,
      }));

      await Promise.all(
        notifications.map(notif => this.createNotification(notif))
      );
    } catch (error) {
      console.error('Error creating material request approval notification:', error);
      throw error;
    }
  }

  // Get notifications for a user
  static async getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const notifications = querySnapshot.docs
        .slice(0, limit)
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Notification[];

      return notifications;
    } catch (error) {
      console.error('Error getting notifications:', error);
      // If index doesn't exist, try without orderBy
      try {
        const q = query(
          collection(db, 'notifications'),
          where('user_id', '==', userId)
        );
        const querySnapshot = await getDocs(q);
        const notifications = querySnapshot.docs
          .slice(0, limit)
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Notification[];

        // Sort by created_at descending
        return notifications.sort((a, b) => {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return dateB - dateA;
        });
      } catch (fallbackError) {
        console.error('Error getting notifications (fallback):', fallbackError);
        return [];
      }
    }
  }

  // Get unread notification count
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('user_id', '==', userId),
        where('is_read', '==', false)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        is_read: true,
        read_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('user_id', '==', userId),
        where('is_read', '==', false)
      );

      const querySnapshot = await getDocs(q);
      const updatePromises = querySnapshot.docs.map(doc => {
        const notificationRef = doc.ref;
        return updateDoc(notificationRef, {
          is_read: true,
          read_at: new Date().toISOString(),
        });
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Subscribe to notifications (real-time)
  static subscribeToNotifications(
    userId: string,
    callback: (notifications: Notification[]) => void
  ): () => void {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Notification[];
          callback(notifications);
        },
        (error) => {
          console.error('Error subscribing to notifications:', error);
          // Fallback: try without orderBy
          const fallbackQ = query(
            collection(db, 'notifications'),
            where('user_id', '==', userId)
          );
          const fallbackUnsubscribe = onSnapshot(
            fallbackQ,
            (snapshot) => {
              const notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
              })) as Notification[];
              // Sort by created_at descending
              notifications.sort((a, b) => {
                const dateA = new Date(a.created_at || 0).getTime();
                const dateB = new Date(b.created_at || 0).getTime();
                return dateB - dateA;
              });
              callback(notifications);
            },
            (fallbackError) => {
              console.error('Error subscribing to notifications (fallback):', fallbackError);
            }
          );
          return fallbackUnsubscribe;
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up notification subscription:', error);
      throw error;
    }
  }

  // Delete notification
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        is_read: true, // Mark as read instead of deleting
        read_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
}


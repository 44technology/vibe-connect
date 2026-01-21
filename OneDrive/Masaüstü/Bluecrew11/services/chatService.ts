import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  created_at: string;
  updated_at?: string;
  read_by?: { [userId: string]: string }; // userId -> timestamp
  is_edited?: boolean;
}

export interface Chat {
  id: string;
  type: 'direct' | 'group' | 'project'; // direct: 1-1, group: multiple users, project: project-related
  name?: string; // For group chats
  project_id?: string; // If project-related
  participants: string[]; // User IDs
  participant_names?: { [userId: string]: string }; // userId -> name
  last_message?: string;
  last_message_time?: string;
  last_message_sender?: string;
  unread_count?: { [userId: string]: number }; // userId -> count
  created_at: string;
  updated_at?: string;
  created_by: string;
  is_archived?: { [userId: string]: boolean }; // userId -> archived status
}

export interface ChatParticipant {
  id: string;
  chat_id: string;
  user_id: string;
  user_name: string;
  role?: 'admin' | 'member'; // For group chats
  joined_at: string;
  left_at?: string;
  is_active: boolean;
}

export class ChatService {
  // Create a new chat
  static async createChat(
    type: 'direct' | 'group' | 'project',
    participants: string[],
    participantNames: { [userId: string]: string },
    createdBy: string,
    name?: string,
    projectId?: string
  ): Promise<string> {
    try {
      const chatData: Omit<Chat, 'id'> = {
        type,
        name,
        project_id: projectId,
        participants,
        participant_names: participantNames,
        unread_count: {},
        created_at: new Date().toISOString(),
        created_by: createdBy,
        is_archived: {},
      };

      // Initialize unread_count for all participants
      participants.forEach(userId => {
        chatData.unread_count![userId] = 0;
        chatData.is_archived![userId] = false;
      });

      const chatRef = await addDoc(collection(db, 'chats'), chatData);
      return chatRef.id;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }

  // Get chat by ID
  static async getChatById(chatId: string): Promise<Chat | null> {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);
      
      if (chatSnap.exists()) {
        return {
          id: chatSnap.id,
          ...chatSnap.data(),
        } as Chat;
      }
      return null;
    } catch (error) {
      console.error('Error getting chat:', error);
      throw error;
    }
  }

  // Get all chats for a user
  static async getUserChats(userId: string): Promise<Chat[]> {
    try {
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('participants', 'array-contains', userId),
        orderBy('updated_at', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Chat[];
    } catch (error) {
      console.error('Error getting user chats:', error);
      throw error;
    }
  }

  // Subscribe to user chats (real-time)
  static subscribeToUserChats(
    userId: string,
    callback: (chats: Chat[]) => void
  ): () => void {
    try {
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('participants', 'array-contains', userId),
        orderBy('updated_at', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const chats = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Chat[];
          callback(chats);
        },
        (error) => {
          console.error('Error subscribing to chats:', error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up chat subscription:', error);
      throw error;
    }
  }

  // Send a message
  static async sendMessage(
    chatId: string,
    senderId: string,
    senderName: string,
    message: string,
    messageType: 'text' | 'image' | 'file' = 'text',
    fileUrl?: string,
    fileName?: string,
    fileSize?: number
  ): Promise<string> {
    try {
      const messageData: Omit<ChatMessage, 'id'> = {
        chat_id: chatId,
        sender_id: senderId,
        sender_name: senderName,
        message,
        message_type: messageType,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
        created_at: new Date().toISOString(),
        read_by: { [senderId]: new Date().toISOString() }, // Sender has read it
      };

      const messageRef = await addDoc(collection(db, 'messages'), messageData);

      // Update chat's last message
      const chatRef = doc(db, 'chats', chatId);
      const chat = await this.getChatById(chatId);
      
      if (chat) {
        const updateData: any = {
          last_message: message,
          last_message_time: new Date().toISOString(),
          last_message_sender: senderName,
          updated_at: new Date().toISOString(),
        };

        // Increment unread count for all participants except sender
        chat.participants.forEach(userId => {
          if (userId !== senderId) {
            updateData[`unread_count.${userId}`] = (chat.unread_count?.[userId] || 0) + 1;
          }
        });

        await updateDoc(chatRef, updateData);
      }

      return messageRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Get messages for a chat
  static async getChatMessages(chatId: string, limitCount: number = 50): Promise<ChatMessage[]> {
    try {
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('chat_id', '==', chatId),
        orderBy('created_at', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .reverse() as ChatMessage[]; // Reverse to show oldest first
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  // Subscribe to chat messages (real-time)
  static subscribeToChatMessages(
    chatId: string,
    callback: (messages: ChatMessage[]) => void,
    limitCount: number = 50
  ): () => void {
    try {
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('chat_id', '==', chatId),
        orderBy('created_at', 'desc'),
        limit(limitCount)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const messages = snapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data(),
            }))
            .reverse() as ChatMessage[]; // Reverse to show oldest first
          callback(messages);
        },
        (error) => {
          console.error('Error subscribing to messages:', error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up message subscription:', error);
      throw error;
    }
  }

  // Mark messages as read
  static async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chat = await this.getChatById(chatId);
      
      if (chat) {
        // Reset unread count for this user
        await updateDoc(chatRef, {
          [`unread_count.${userId}`]: 0,
        });

        // Mark all unread messages as read
        const messagesRef = collection(db, 'messages');
        const q = query(
          messagesRef,
          where('chat_id', '==', chatId),
          where('sender_id', '!=', userId) // Don't mark own messages
        );

        const snapshot = await getDocs(q);
        const batch = snapshot.docs.map(docRef => {
          const messageData = docRef.data() as ChatMessage;
          if (!messageData.read_by?.[userId]) {
            return updateDoc(doc(db, 'messages', docRef.id), {
              [`read_by.${userId}`]: new Date().toISOString(),
            });
          }
          return Promise.resolve();
        });

        await Promise.all(batch);
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  // Upload file (image or document)
  static async uploadFile(
    file: Blob | File,
    fileName: string,
    chatId: string
  ): Promise<string> {
    try {
      const fileRef = ref(storage, `chats/${chatId}/${Date.now()}_${fileName}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Edit a message
  static async editMessage(messageId: string, newMessage: string): Promise<void> {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, {
        message: newMessage,
        is_edited: true,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  }

  // Delete a message
  static async deleteMessage(messageId: string): Promise<void> {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await deleteDoc(messageRef);
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // Add participant to group chat
  static async addParticipant(
    chatId: string,
    userId: string,
    userName: string
  ): Promise<void> {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chat = await this.getChatById(chatId);
      
      if (chat && !chat.participants.includes(userId)) {
        await updateDoc(chatRef, {
          participants: [...chat.participants, userId],
          [`participant_names.${userId}`]: userName,
          [`unread_count.${userId}`]: 0,
          [`is_archived.${userId}`]: false,
        });
      }
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  }

  // Remove participant from group chat
  static async removeParticipant(chatId: string, userId: string): Promise<void> {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chat = await this.getChatById(chatId);
      
      if (chat && chat.participants.includes(userId)) {
        const updatedParticipants = chat.participants.filter(id => id !== userId);
        const updateData: any = {
          participants: updatedParticipants,
        };
        
        // Remove from participant_names, unread_count, is_archived
        delete chat.participant_names?.[userId];
        delete chat.unread_count?.[userId];
        delete chat.is_archived?.[userId];

        await updateDoc(chatRef, updateData);
      }
    } catch (error) {
      console.error('Error removing participant:', error);
      throw error;
    }
  }

  // Archive/unarchive chat for a user
  static async toggleArchive(chatId: string, userId: string, archived: boolean): Promise<void> {
    try {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        [`is_archived.${userId}`]: archived,
      });
    } catch (error) {
      console.error('Error toggling archive:', error);
      throw error;
    }
  }
}


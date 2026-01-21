import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';

export interface FirebaseUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'pm' | 'client' | 'sales';
  company?: string;
  phone?: string;
  profile_picture?: string;
  created_at: string;
  updated_at?: string;
}

export const UserService = {
  async getAllUsers(): Promise<FirebaseUser[]> {
    try {
      const usersCol = collection(db, 'users');
      const userSnapshot = await getDocs(usersCol);
      const usersList = userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseUser[];
      return usersList;
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  },

  async getUsersByRole(role: 'admin' | 'pm' | 'client' | 'sales'): Promise<FirebaseUser[]> {
    try {
      const usersCol = collection(db, 'users');
      const q = query(usersCol, where('role', '==', role));
      const userSnapshot = await getDocs(q);
      const usersList = userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseUser[];
      return usersList;
    } catch (error) {
      console.error('Error getting users by role:', error);
      return [];
    }
  },

  async createUser(userData: Omit<FirebaseUser, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const now = new Date().toISOString();
      // Remove undefined values before saving to Firestore
      const cleanUserData: any = {
        created_at: now,
        updated_at: now,
      };
      
      // Only include fields that are not undefined
      Object.keys(userData).forEach(key => {
        const value = (userData as any)[key];
        if (value !== undefined) {
          cleanUserData[key] = value;
        }
      });
      
      const docRef = await addDoc(collection(db, 'users'), cleanUserData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async deleteUser(userId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  async updateUser(userId: string, userData: Partial<FirebaseUser>): Promise<void> {
    try {
      // Remove undefined values before saving to Firestore
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };
      
      // Only include fields that are not undefined
      Object.keys(userData).forEach(key => {
        const value = (userData as any)[key];
        if (value !== undefined) {
          updateData[key] = value;
        }
      });
      
      await updateDoc(doc(db, 'users', userId), updateData);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },
};


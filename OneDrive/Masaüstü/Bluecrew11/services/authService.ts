import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'pm' | 'client' | 'sales';
  company?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export class AuthService {
  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<UserProfile> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userProfile = await this.getUserProfile(userCredential.user.uid);
      return userProfile;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  // Create new user account
  // SECURITY: Admin role cannot be created through this method - only existing admins can create admin accounts
  static async signUp(email: string, password: string, userData: {
    name: string;
    role: 'admin' | 'pm' | 'client';
    company?: string;
    phone?: string;
  }): Promise<UserProfile> {
    try {
      // Security check: Prevent admin role creation through public registration
      if (userData.role === 'admin') {
        throw new Error('Admin accounts cannot be created through registration. Please contact an existing administrator.');
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      // Firestore doesn't accept undefined values, so we only include fields that have values
      const userProfileData: any = {
        id: userCredential.user.uid,
        email: userCredential.user.email!,
        name: userData.name,
        role: userData.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Only add optional fields if they have values
      if (userData.company) {
        userProfileData.company = userData.company;
      }
      if (userData.phone) {
        userProfileData.phone = userData.phone;
      }

      await setDoc(doc(db, 'users', userCredential.user.uid), userProfileData);
      
      // Return the profile with all fields (including undefined ones for TypeScript)
      const userProfile: UserProfile = {
        id: userCredential.user.uid,
        email: userCredential.user.email!,
        name: userData.name,
        role: userData.role,
        company: userData.company,
        phone: userData.phone,
        created_at: userProfileData.created_at,
        updated_at: userProfileData.updated_at,
      };

      return userProfile;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  // Sign out current user
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Get current user profile
  static async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      if (!auth.currentUser) return null;
      return await this.getUserProfile(auth.currentUser.uid);
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Get user profile by UID
  static async getUserProfile(uid: string): Promise<UserProfile> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }
      
      return userDoc.data() as UserProfile;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      // Remove undefined values before saving to Firestore
      const cleanUpdates: any = {
        updated_at: new Date().toISOString()
      };
      
      // Only include fields that are not undefined
      Object.keys(updates).forEach(key => {
        const value = (updates as any)[key];
        if (value !== undefined) {
          cleanUpdates[key] = value;
        }
      });
      
      await setDoc(userRef, cleanUpdates, { merge: true });
    } catch (error) {
      console.error('Update user profile error:', error);
      throw error;
    }
  }

  // Listen to auth state changes
  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  // Create user as admin (preserves admin session)
  // This function creates a new user and then restores the admin session
  static async createUserAsAdmin(
    adminEmail: string,
    adminPassword: string,
    newUserEmail: string,
    newUserPassword: string,
    userData: {
      name: string;
      role: 'admin' | 'pm' | 'client' | 'sales' | 'office';
      company?: string;
      phone?: string;
      jobTitle?: string;
    }
  ): Promise<UserProfile> {
    try {
      // Save current admin user before creating new user
      const currentAdminEmail = adminEmail;
      const currentAdminPassword = adminPassword;
      
      // Create new user (this will automatically sign in the new user)
      const userCredential = await createUserWithEmailAndPassword(auth, newUserEmail, newUserPassword);
      
      // Create user profile in Firestore
      const userProfileData: any = {
        id: userCredential.user.uid,
        email: userCredential.user.email!,
        name: userData.name,
        role: userData.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Only add optional fields if they have values
      if (userData.company) {
        userProfileData.company = userData.company;
      }
      if (userData.phone) {
        userProfileData.phone = userData.phone;
      }
      if (userData.jobTitle) {
        userProfileData.jobTitle = userData.jobTitle;
      }

      await setDoc(doc(db, 'users', userCredential.user.uid), userProfileData);
      
      // Wait a bit to ensure Firestore write is fully propagated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Sign out the new user
      await signOut(auth);
      
      // Sign in the admin again to restore admin session
      await signInWithEmailAndPassword(auth, currentAdminEmail, currentAdminPassword);
      
      // Return the new user profile
      const userProfile: UserProfile = {
        id: userCredential.user.uid,
        email: userCredential.user.email!,
        name: userData.name,
        role: userData.role,
        company: userData.company,
        phone: userData.phone,
        created_at: userProfileData.created_at,
        updated_at: userProfileData.updated_at,
      };

      return userProfile;
    } catch (error) {
      console.error('Create user as admin error:', error);
      throw error;
    }
  }

  // Check if user has permission
  static hasPermission(userRole: string, requiredRole: string): boolean {
    const roleHierarchy = {
      'client': 1,
      'pm': 2,
      'admin': 3
    };
    
    return roleHierarchy[userRole as keyof typeof roleHierarchy] >= 
           roleHierarchy[requiredRole as keyof typeof roleHierarchy];
  }
}









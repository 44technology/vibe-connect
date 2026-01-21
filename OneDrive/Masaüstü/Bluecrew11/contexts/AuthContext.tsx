import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';
import { AuthService, UserProfile } from '@/services/authService';
import { router } from 'expo-router';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  userRole: 'admin' | 'pm' | 'client' | 'sales';
  setUser: (user: User | null) => void;
  setUserRole: (role: 'admin' | 'pm' | 'client' | 'sales') => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: Omit<User, 'id' | 'created_at'>) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    password: 'admin123',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'PM User',
    email: 'pm@example.com',
    role: 'pm',
    password: 'pm123',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Client User',
    email: 'client@example.com',
    role: 'client',
    password: 'client123',
    created_at: '2024-01-01T00:00:00Z',
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'pm' | 'client' | 'sales'>('client');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Firebase auth state changed:', firebaseUser?.email);
      
      if (firebaseUser) {
        try {
          // Get user profile from Firestore
          const userProfile = await AuthService.getUserProfile(firebaseUser.uid);
          if (userProfile) {
            const userData: User = {
              id: userProfile.id,
              name: userProfile.name,
              email: userProfile.email,
              role: userProfile.role,
              created_at: userProfile.created_at,
            };
            
            setUser(userData);
            setUserRole(userProfile.role);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            await AsyncStorage.setItem('userRole', userProfile.role);
          }
        } catch (error: any) {
          // If user profile not found, it might be a newly created user
          // Retry a few times with delay to handle race conditions
          if (error?.message?.includes('User profile not found')) {
            console.log('User profile not found in Firestore, retrying...');
            
            // Retry up to 5 times with increasing delays (more retries for new user creation)
            let retries = 5;
            let found = false;
            
            while (retries > 0 && !found) {
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
              try {
                const userProfile = await AuthService.getUserProfile(firebaseUser.uid);
                if (userProfile) {
                  const userData: User = {
                    id: userProfile.id,
                    name: userProfile.name,
                    email: userProfile.email,
                    role: userProfile.role,
                    created_at: userProfile.created_at,
                  };
                  
                  setUser(userData);
                  setUserRole(userProfile.role);
                  await AsyncStorage.setItem('user', JSON.stringify(userData));
                  await AsyncStorage.setItem('userRole', userProfile.role);
                  found = true;
                  console.log('User profile found after retry');
                }
              } catch (retryError) {
                retries--;
                if (retries === 0) {
                  // After all retries failed, DON'T sign out - just log the error
                  // This might be a newly created user that's still being processed
                  console.log('User profile still not found after retries, but not signing out (might be new user)');
                  // Don't sign out - let the user continue
                }
              }
            }
          } else {
            console.error('Error getting user profile:', error);
          }
        }
      } else {
        // User signed out
        setUser(null);
        setUserRole('client');
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('userRole');
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await AuthService.signIn(email, password);
      // Firebase auth state listener will handle the rest
      router.replace('/projects');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AuthService.signOut();
      // Firebase auth state listener will handle the rest
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const register = async (userData: Omit<User, 'id' | 'created_at'>): Promise<boolean> => {
    try {
      await AuthService.signUp(userData.email, userData.password!, {
        name: userData.name,
        role: userData.role as 'admin' | 'pm' | 'client',
        company: userData.company || undefined, // Only include if has value
        phone: userData.phone || undefined, // Only include if has value
      });
      
      // Firebase auth state listener will handle the rest
      router.replace('/projects');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const handleSetUserRole = async (role: 'admin' | 'pm' | 'client' | 'sales') => {
    setUserRole(role);
    try {
      await AsyncStorage.setItem('userRole', role);
    } catch (error) {
      console.error('Error saving user role:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userRole, 
      setUser, 
      setUserRole: handleSetUserRole, 
      login,
      logout,
      register,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
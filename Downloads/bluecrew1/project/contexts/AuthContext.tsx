import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  userRole: 'admin' | 'pm' | 'client';
  setUser: (user: User | null) => void;
  setUserRole: (role: 'admin' | 'pm' | 'client') => void;
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
  const [userRole, setUserRole] = useState<'admin' | 'pm' | 'client'>('client');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('user');
      const savedRole = await AsyncStorage.getItem('userRole');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setUserRole(userData.role);
      } else if (savedRole) {
        setUserRole(savedRole as 'admin' | 'pm' | 'client');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      if (foundUser) {
        const userData = { ...foundUser };
        delete userData.password; // Don't store password
        setUser(userData);
        setUserRole(userData.role);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        await AsyncStorage.setItem('userRole', userData.role);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setUser(null);
      setUserRole('client');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userRole');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const register = async (userData: Omit<User, 'id' | 'created_at'>): Promise<boolean> => {
    try {
      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === userData.email);
      if (existingUser) {
        return false;
      }

      // Create new user
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };

      // Add to mock users (in real app, this would be API call)
      mockUsers.push(newUser);

      // Auto login after registration
      const userDataWithoutPassword = { ...newUser };
      delete userDataWithoutPassword.password;
      setUser(userDataWithoutPassword);
      setUserRole(newUser.role);
      await AsyncStorage.setItem('user', JSON.stringify(userDataWithoutPassword));
      await AsyncStorage.setItem('userRole', newUser.role);

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const handleSetUserRole = async (role: 'admin' | 'pm' | 'client') => {
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
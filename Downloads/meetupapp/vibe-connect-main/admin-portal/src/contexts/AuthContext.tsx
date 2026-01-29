import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'support' | 'analyst';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem('portal_token');
    const storedRole = localStorage.getItem('portal_role') as 'admin' | 'venue' | 'instructor' | null;
    if (token && storedRole) {
      // TODO: Verify token with backend
      // For now, set mock user based on role
      if (storedRole === 'venue') {
        setUser({
          id: '1',
          email: 'venue@ulikme.com',
          name: 'Venue Manager',
          venueName: 'Sample Restaurant',
          role: 'venue',
        });
      } else if (storedRole === 'instructor') {
        setUser({
          id: '1',
          email: 'instructor@ulikme.com',
          name: 'Instructor',
          role: 'instructor',
        });
      } else {
        setUser({
          id: '1',
          email: 'admin@ulikme.com',
          name: 'Admin User',
          role: 'admin',
        });
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: 'admin' | 'venue' | 'instructor') => {
    // TODO: Implement actual login API call
    // Mock login for now
    let mockUser: User;
    
    if (role === 'venue') {
      mockUser = {
        id: '1',
        email,
        name: 'Venue Manager',
        venueName: 'Sample Restaurant',
        role: 'venue',
      };
    } else if (role === 'instructor') {
      mockUser = {
        id: '1',
        email,
        name: 'Instructor',
        role: 'instructor',
      };
    } else {
      mockUser = {
        id: '1',
        email,
        name: 'Admin User',
        role: 'admin',
      };
    }
    
    setUser(mockUser);
    localStorage.setItem('portal_token', 'mock_token');
    localStorage.setItem('portal_role', role);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_role');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

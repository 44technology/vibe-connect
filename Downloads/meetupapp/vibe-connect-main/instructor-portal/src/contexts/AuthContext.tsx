import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface InstructorUser {
  id: string;
  email: string;
  name: string;
  role: 'instructor';
}

interface AuthContextType {
  user: InstructorUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<InstructorUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('instructor_token');
    if (token) {
      setUser({
        id: '1',
        email: 'instructor@ulikme.com',
        name: 'Instructor',
        role: 'instructor',
      });
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const mockUser: InstructorUser = {
      id: '1',
      email,
      name: 'Instructor',
      role: 'instructor',
    };
    setUser(mockUser);
    localStorage.setItem('instructor_token', 'mock_token');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('instructor_token');
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

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface VenueUser {
  id: string;
  email: string;
  name: string;
  venueName: string;
  role: 'venue';
}

interface AuthContextType {
  user: VenueUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<VenueUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('venue_token');
    if (token) {
      setUser({
        id: '1',
        email: 'venue@ulikme.com',
        name: 'Venue Manager',
        venueName: 'Sample Restaurant',
        role: 'venue',
      });
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const mockUser: VenueUser = {
      id: '1',
      email,
      name: 'Venue Manager',
      venueName: 'Sample Restaurant',
      role: 'venue',
    };
    setUser(mockUser);
    localStorage.setItem('venue_token', 'mock_token');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('venue_token');
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

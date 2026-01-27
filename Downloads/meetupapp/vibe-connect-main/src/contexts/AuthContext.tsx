import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest, API_ENDPOINTS, getAuthToken, setAuthToken, removeAuthToken } from '@/lib/api';

interface User {
  id: string;
  email?: string;
  phone?: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  photos?: string[];
  interests?: string[];
  lookingFor?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  sendOTP: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, code: string) => Promise<{ success: boolean; data?: { user: User; token: string }; message?: string; verified?: boolean }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

interface RegisterData {
  email?: string;
  phone?: string;
  password?: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  dateOfBirth?: string;
  gender?: string;
  lookingFor?: string[];
  interests?: string[];
  photos?: string[];
  selfie?: string;
  authProvider?: 'EMAIL' | 'PHONE' | 'GOOGLE' | 'APPLE';
  providerId?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const existingToken = getAuthToken();
    if (existingToken) {
      setTokenState(existingToken);
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await apiRequest<{ success: boolean; data: User }>(API_ENDPOINTS.AUTH.ME);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      removeAuthToken();
      setTokenState(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiRequest<{ success: boolean; data: { user: User; token: string } }>(
      API_ENDPOINTS.AUTH.LOGIN,
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    
    setAuthToken(response.data.token);
    setTokenState(response.data.token);
    setUser(response.data.user);
  };

  const register = async (data: RegisterData) => {
    const response = await apiRequest<{ success: boolean; data: { user: User; token: string } }>(
      API_ENDPOINTS.AUTH.REGISTER,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    
    setAuthToken(response.data.token);
    setTokenState(response.data.token);
    setUser(response.data.user);
  };

  const loginWithGoogle = async () => {
    return new Promise<void>((resolve, reject) => {
      // Check if Google Sign-In SDK is loaded
      if (typeof window === 'undefined' || !(window as any).google) {
        reject(new Error('Google Sign-In SDK not loaded. Please check your internet connection.'));
        return;
      }

      // Check if client_id is configured
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId || clientId.trim() === '') {
        reject(new Error('Google Client ID is not configured. Please add VITE_GOOGLE_CLIENT_ID to your .env file and restart the frontend server.'));
        return;
      }

      const google = (window as any).google;
      
      // Use One Tap or button flow - this doesn't require redirect URI
      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            if (!response.credential) {
              reject(new Error('No credential received from Google'));
              return;
            }

            // Send the credential token to backend
            const apiResponse = await apiRequest<{ success: boolean; data: { user: User; token: string } }>(
              API_ENDPOINTS.AUTH.GOOGLE,
              {
                method: 'POST',
                body: JSON.stringify({ idToken: response.credential }),
              }
            );
            
            setAuthToken(apiResponse.data.token);
            setTokenState(apiResponse.data.token);
            setUser(apiResponse.data.user);
            resolve();
          } catch (error: any) {
            reject(new Error(error.message || 'Google sign in failed'));
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Try to show One Tap (automatic sign-in prompt)
      google.accounts.id.prompt((notification: any) => {
        // If One Tap is not shown, trigger manual sign-in
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Create a temporary button and click it programmatically
          const button = document.createElement('div');
          button.id = 'google-signin-button';
          button.style.display = 'none';
          document.body.appendChild(button);

          google.accounts.id.renderButton(button, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          });

          // Simulate button click
          const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
          });
          button.querySelector('div[role="button"]')?.dispatchEvent(clickEvent);

          // Clean up after a delay
          setTimeout(() => {
            button.remove();
          }, 1000);
        }
      });
    });
  };

  const loginWithApple = async () => {
    return new Promise<void>((resolve, reject) => {
      // Check if Apple Sign-In is available
      if (typeof window === 'undefined' || !(window as any).AppleID) {
        reject(new Error('Apple Sign-In is not available. Please use a supported browser.'));
        return;
      }

      const AppleID = (window as any).AppleID;
      
      // Initialize Apple Sign-In
      AppleID.auth.init({
        clientId: import.meta.env.VITE_APPLE_CLIENT_ID || '',
        scope: 'name email',
        redirectURI: window.location.origin + '/auth/apple/callback',
        usePopup: true,
      });

      // Sign in with Apple
      AppleID.auth.signIn({
        requestedScopes: ['name', 'email'],
      }).then(async (response: any) => {
        try {
          // Send the authorization response to backend
          const apiResponse = await apiRequest<{ success: boolean; data: { user: User; token: string } }>(
            API_ENDPOINTS.AUTH.APPLE,
            {
              method: 'POST',
              body: JSON.stringify({
                identityToken: response.id_token,
                authorizationCode: response.code,
                user: response.user,
              }),
            }
          );
          
          setAuthToken(apiResponse.data.token);
          setTokenState(apiResponse.data.token);
          setUser(apiResponse.data.user);
          resolve();
        } catch (error: any) {
          reject(new Error(error.message || 'Apple sign in failed'));
        }
      }).catch((error: any) => {
        reject(new Error(error.message || 'Apple sign in failed'));
      });
    });
  };

  const sendOTP = async (phone: string) => {
    const response = await apiRequest<{ success: boolean; message: string; otp?: string }>(
      API_ENDPOINTS.AUTH.SEND_OTP,
      {
        method: 'POST',
        body: JSON.stringify({ phone }),
      }
    );
    
    // In development, log OTP for testing
    if (response.otp) {
      console.log('OTP (dev only):', response.otp);
    }
  };

  const verifyOTP = async (phone: string, code: string, userData?: { firstName: string; lastName: string; displayName?: string }) => {
    const response = await apiRequest<{ success: boolean; data?: { user: User; token: string }; message?: string; verified?: boolean }>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      {
        method: 'POST',
        body: JSON.stringify({ 
          phone, 
          code,
          ...(userData && userData),
        }),
      }
    );
    
    // If user was created/authenticated, save token
    if (response.data?.token) {
      setAuthToken(response.data.token);
      setTokenState(response.data.token);
      setUser(response.data.user);
    }
    
    return response;
  };

  const logout = () => {
    removeAuthToken();
    setTokenState(null);
    setUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    const response = await apiRequest<{ success: boolean; data: User }>(
      API_ENDPOINTS.USERS.UPDATE,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    
    setUser(response.data);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        loginWithGoogle,
        loginWithApple,
        sendOTP,
        verifyOTP,
        logout,
        updateUser,
        isAuthenticated: !!token && !!user,
      }}
    >
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

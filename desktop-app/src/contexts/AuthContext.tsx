'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  discordId: string;
  username: string;
  avatar?: string;
  discriminator?: string;
  roleId: string;
  role: {
    id: string;
    name: string;
    discordId: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier le token au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      
      if (storedToken) {
        try {
          // Vérifier le token avec le backend
          const response = await fetch(`http://localhost:3001/auth/verify?token=${storedToken}`);
          const data = await response.json();
          
          if (data.valid && data.user) {
            setToken(storedToken);
            setUser(data.user);
          } else {
            localStorage.removeItem('auth_token');
          }
        } catch (error) {
          console.error('Erreur de vérification du token:', error);
          localStorage.removeItem('auth_token');
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
    
    // Décoder le token pour obtenir les infos utilisateur
    try {
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      setUser({
        discordId: payload.sub,
        username: payload.username,
        avatar: payload.avatar,
        discriminator: payload.discriminator,
        roleId: payload.roleId,
        role: payload.role || { id: '', name: '', discordId: '' }
      });
    } catch (error) {
      console.error('Erreur de décodage du token:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      login,
      logout,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 
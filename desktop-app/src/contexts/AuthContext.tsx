'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { AUTH_CONFIG, initAuthConfig } from '../utils/authConfig';

interface User {
  discordId: string;
  username: string;
  avatar?: string;
  discriminator?: string;
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
  error: string | null;
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
  const [error, setError] = useState<string | null>(null);

  // Initialiser la configuration au chargement
  useEffect(() => {
    initAuthConfig();
  }, []);

  // Vérifier le token au chargement
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Vérification de l\'authentification...');
      const storedToken = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
      
      if (storedToken) {
        console.log('📦 Token trouvé dans le localStorage');
        
        // Option pour désactiver la vérification backend (pour développement)
        const skipBackendVerification = localStorage.getItem(AUTH_CONFIG.SKIP_VERIFICATION_KEY) === 'true';
        
        if (!skipBackendVerification) {
          try {
            console.log('🌐 Vérification du token avec le backend...');
            // Vérifier le token avec le backend
            const response = await fetch(`${AUTH_CONFIG.BACKEND_URL}/auth/verify?token=${storedToken}`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              signal: AbortSignal.timeout(AUTH_CONFIG.REQUEST_TIMEOUT)
            });
            
            const data = await response.json();
            console.log('📡 Réponse du backend:', data);
            
            if (response.ok && data.valid && data.user) {
              console.log('✅ Token valide, utilisateur connecté');
              setToken(storedToken);
              setUser(data.user);
              setError(null);
              setIsLoading(false);
              return;
            } else {
              console.log('❌ Token invalide, suppression du localStorage');
              localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
              setError('Token invalide');
              setIsLoading(false);
              return;
            }
          } catch (error) {
            console.log('⚠️ Erreur lors de la vérification du token:', error);
            // Ici, c'est vraiment un problème réseau (timeout, backend down, etc.)
            if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('Failed to fetch'))) {
              console.log('🌐 Backend non accessible, utilisation du token local');
              setError('Backend non accessible, utilisation du token local');
              // Décodage local du token (optionnel)
              try {
                const payload = JSON.parse(atob(storedToken.split('.')[1]));
                console.log('🔍 Payload du token décodé:', payload);
                setToken(storedToken);
                setUser({
                  discordId: payload.sub,
                  username: payload.username,
                  avatar: payload.avatar,
                  discriminator: payload.discriminator,
                  role: payload.role || { id: '', name: '', discordId: '' }
                });
              } catch (decodeError) {
                console.error('❌ Erreur de décodage du token:', decodeError);
                localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
                setError('Erreur de décodage du token');
              }
            } else {
              // Autre erreur inattendue
              console.error('❌ Erreur de vérification du token:', error);
              localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
              setError('Erreur de vérification du token');
            }
          }
        } else {
          console.log('🔧 Vérification backend désactivée, utilisation du token local');
        }
        
        // Si le backend n'est pas accessible ou si la vérification est désactivée, utiliser le token stocké
        try {
          const payload = JSON.parse(atob(storedToken.split('.')[1]));
          console.log('🔍 Payload du token décodé (fallback):', payload);
          setToken(storedToken);
          setUser({
            discordId: payload.sub,
            username: payload.username,
            avatar: payload.avatar,
            discriminator: payload.discriminator,
            role: payload.role || { id: '', name: '', discordId: '' }
          });
          setError(null);
        } catch (decodeError) {
          console.error('❌ Erreur de décodage du token:', decodeError);
          localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
          setError('Erreur de décodage du token');
        }
      } else {
        console.log('📭 Aucun token trouvé dans le localStorage');
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback((newToken: string) => {
    console.log('🔑 Connexion avec nouveau token...');
    localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, newToken);
    setToken(newToken);
    setError(null);
    
    // Décoder le token pour obtenir les infos utilisateur
    try {
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      const userData = {
        discordId: payload.sub,
        username: payload.username,
        avatar: payload.avatar,
        discriminator: payload.discriminator,
        role: payload.role || { id: '', name: '', discordId: '' }
      };
      setUser(userData);
      console.log('✅ Utilisateur connecté:', userData);
    } catch (error) {
      console.error('❌ Erreur de décodage du token:', error);
      setError('Erreur de décodage du token');
    }
  }, []);

  const logout = useCallback(() => {
    console.log('🚪 Déconnexion...');
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const isAuthenticated = useMemo(() => !!token && !!user, [token, user]);

  // Log uniquement quand l'état change significativement
  useEffect(() => {
    console.log('🔄 État de l\'authentification mis à jour:', { 
      isAuthenticated, 
      isLoading, 
      hasToken: !!token, 
      hasUser: !!user,
      userDetails: user ? {
        discordId: user.discordId,
        username: user.username,
        avatar: user.avatar,
        discriminator: user.discriminator,
        role: user.role
      } : null,
      error 
    });
  }, [isAuthenticated, isLoading, token, user, error]);

  const contextValue = useMemo(() => ({
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated,
    error
  }), [user, token, isLoading, login, logout, isAuthenticated, error]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}; 
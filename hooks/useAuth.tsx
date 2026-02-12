import { AuthContextType, User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');

      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'authentification:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (token: string, userData: User) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['userToken', 'userData']);

      setUser(null);
      console.log('Déconnexion réussie');

      return true;
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      setUser(null);
      throw error;
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      // Mettre à jour l'objet utilisateur local
      const updatedUser = { ...user, ...userData } as User;

      // Sauvegarder dans AsyncStorage
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));

      // Mettre à jour l'état
      setUser(updatedUser);

      console.log('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw new Error('Impossible de mettre à jour le profil');
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      // Simuler la vérification du mot de passe actuel
      // En production, cela serait appelé via une API sécurisée
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        throw new Error('Données utilisateur non trouvées');
      }

      // Note: En production, envoyer au serveur via API sécurisée
      // et vérifier le mot de passe actuel côté serveur

      // Pour la démo, nous acceptons juste le changement
      console.log('Mot de passe changé avec succès (simulation)');

      // En production:
      // const response = await fetch('/api/auth/change-password', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify({
      //     currentPassword,
      //     newPassword
      //   })
      // });
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      throw new Error('Impossible de changer le mot de passe');
    }
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated,
        updateProfile,
        changePassword,
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

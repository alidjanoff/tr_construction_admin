import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { secureStorage, STORAGE_KEYS } from '../utils/secureStorage';
import { authAPI } from '../services/api';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isSuperAdmin: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user;
    const isSuperAdmin = user?.role === 'superAdmin';

    // Check for existing token on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = secureStorage.getItem<string>(STORAGE_KEYS.ACCESS_TOKEN);

            if (token) {
                try {
                    const response = await authAPI.getMe();
                    setUser(response.data);
                    secureStorage.setItem(STORAGE_KEYS.USER_DATA, response.data);
                } catch (error) {
                    // Token invalid, clear storage
                    secureStorage.clear();
                    setUser(null);
                }
            }

            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string): Promise<void> => {
        const response = await authAPI.login(email, password);
        const { access_token } = response.data;

        // Store token securely
        secureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);

        // Fetch user profile
        const userResponse = await authAPI.getMe();
        setUser(userResponse.data);
        secureStorage.setItem(STORAGE_KEYS.USER_DATA, userResponse.data);
    };

    const logout = async (): Promise<void> => {
        try {
            await authAPI.logout();
        } catch (error) {
            // Ignore logout API errors
        } finally {
            secureStorage.clear();
            setUser(null);
        }
    };

    const updateUser = (updatedUser: User): void => {
        setUser(updatedUser);
        secureStorage.setItem(STORAGE_KEYS.USER_DATA, updatedUser);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                isSuperAdmin,
                login,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

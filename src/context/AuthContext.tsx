import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

interface User {
    id: number;
    email: string;
    peran: string;
    // Add other user fields as needed
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
    };

    useEffect(() => {
        const checkAuth = async () => {
             const storedToken = localStorage.getItem('token');
             if (storedToken) {
                 try {
                     api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                     const response = await api.get('/me');
                     setUser(response.data.user);
                 } catch (error) {
                     console.error("Auth check failed:", error);
                     logout();
                 }
             }
             setIsLoading(false);
        };
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
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

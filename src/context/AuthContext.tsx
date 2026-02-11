import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { AuthContext, User } from './AuthContextData';

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

    const switchCompany = async (id_perusahaan: number) => {
        try {
            const response = await api.post('/switch-company', { id_perusahaan });
            setUser(response.data.user);
            // After switching, we might want to refresh the entire page to reset queries
            window.location.reload(); 
            return true;
        } catch (error) {
            console.error("Switch company failed:", error);
            return false;
        }
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
        <AuthContext.Provider value={{ user, token, login, logout, switchCompany, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

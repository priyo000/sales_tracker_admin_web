import { createContext } from 'react';

export interface User {
    id: number;
    username: string;
    peran: 'super_admin' | 'admin_perusahaan' | 'admin_divisi' | 'sales' | 'manager';
    id_perusahaan: number;
    perusahaan?: {
        id: number;
        nama_perusahaan: string;
    };
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    switchCompany: (perusahaanId: number) => Promise<boolean>;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

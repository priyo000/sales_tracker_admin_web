import { Karyawan } from '../karyawan/types';

export type UserRole = 'admin_perusahaan' | 'admin_divisi' | 'sales' | 'manager';

export interface User {
    id: number;
    id_karyawan: number;
    id_perusahaan: number;
    username: string;
    peran: UserRole;
    created_at: string;
    karyawan?: Karyawan;
}

export interface UserFormData {
    id_karyawan: number;
    username: string;
    password?: string;
    peran: UserRole;
}

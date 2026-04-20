import { Karyawan } from '../karyawan/types';

export type UserRole = 'super_admin' | 'admin_perusahaan' | 'admin_divisi' | 'spv' | 'sales';

export type ViewScope = 'SELF' | 'DIVISION' | 'COMPANY';

export interface User {
    id: number;
    id_karyawan: number;
    id_perusahaan: number;
    username: string;
    peran: UserRole;
    view_scope?: ViewScope;
    fcm_token?: string;
    created_at: string;
    karyawan?: Karyawan;
}

export interface UserFormData {
    id_karyawan: number;
    username: string;
    password?: string;
    peran: UserRole;
    view_scope?: ViewScope;
}

import { useState, useCallback } from 'react';
import api from '@/services/api';
import { useCrudResource } from '@/hooks/useCrudResource';
import { Karyawan, KaryawanFormData } from '../types';

export const useKaryawan = () => {
    const crud = useCrudResource<Karyawan>('/karyawan', { resourceName: 'karyawan' });
    const [divisiOptions, setDivisiOptions] = useState<{ id: number; nama_divisi: string }[]>([]);

    const fetchDivisiOptions = useCallback(async () => {
        try {
            const response = await api.get('/divisi', { params: { per_page: -1 } });
            setDivisiOptions(response.data.data);
        } catch {
            // silently fail
        }
    }, []);

    return {
        karyawans: crud.items,
        divisiOptions,
        loading: crud.loading,
        error: crud.error,
        fetchKaryawans: crud.fetchItems,
        fetchDivisiOptions,
        createKaryawan: (data: KaryawanFormData) => crud.createItem(data),
        updateKaryawan: (id: number, data: KaryawanFormData) => crud.updateItem(id, data),
        deleteKaryawan: (id: number) => crud.deleteItem(id),
        importKaryawan: (file: File) => crud.importItems(file),
        pagination: crud.pagination,
    };
};

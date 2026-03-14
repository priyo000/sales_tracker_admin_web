import { useCrudResource } from '@/hooks/useCrudResource';
import { Divisi, DivisiFormData } from '../types';

export const useDivisi = () => {
    const crud = useCrudResource<Divisi>('/divisi', { resourceName: 'divisi' });

    return {
        divisis: crud.items,
        loading: crud.loading,
        error: crud.error,
        fetchDivisis: crud.fetchItems,
        createDivisi: (data: DivisiFormData) => crud.createItem(data),
        updateDivisi: (id: number, data: DivisiFormData) => crud.updateItem(id, data),
        deleteDivisi: (id: number) => crud.deleteItem(id),
        pagination: crud.pagination,
    };
};

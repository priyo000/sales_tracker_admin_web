import { useCrudResource } from '@/hooks/useCrudResource';
import { Perusahaan, PerusahaanFormData } from '../types';

export const usePerusahaan = () => {
    const crud = useCrudResource<Perusahaan>('/perusahaan', {
        resourceName: 'perusahaan',
        autoRefreshOnMutate: false,
    });

    return {
        perusahaans: crud.items,
        loading: crud.loading,
        error: crud.error,
        fetchPerusahaans: crud.fetchItems,
        createPerusahaan: async (data: PerusahaanFormData) => {
            const result = await crud.createItem(data);
            return result.success
                ? { success: true, data: result.data }
                : { success: false, message: result.message };
        },
        updatePerusahaan: async (id: number, data: PerusahaanFormData) => {
            const result = await crud.updateItem(id, data);
            return result.success
                ? { success: true, data: result.data }
                : { success: false, message: result.message };
        },
        deletePerusahaan: (id: number) => crud.deleteItem(id),
        pagination: crud.pagination,
    };
};

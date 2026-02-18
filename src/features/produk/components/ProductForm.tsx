import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { Produk, ProductFormData } from '../types';

interface ProductFormProps {
    initialData?: Produk | null;
    onSubmit: (data: FormData) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
    const [formData, setFormData] = useState<ProductFormData>({
        kode_barang: initialData?.kode_barang || '',
        sku: initialData?.sku || '',
        nama_produk: initialData?.nama_produk || '',
        harga_jual: initialData?.harga_jual?.toString() || '',
        stok_tersedia: initialData?.stok_tersedia?.toString() || '0',
        satuan: initialData?.satuan || 'pcs'
    });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(() => {
        if (initialData?.gambar_url) {
            return initialData.gambar_url.startsWith('http') 
                ? initialData.gambar_url 
                : `http://backend-salestracker/storage/${initialData.gambar_url}`;
        }
        return null;
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key as keyof ProductFormData]);
        });
        
        if (selectedImage) {
            data.append('gambar', selectedImage);
        }

        await onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload */}
            <div className="flex justify-center">
                <div className="relative h-32 w-32 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden group hover:border-indigo-500 transition-colors">
                    {imagePreview ? (
                        <>
                            <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button type="button" onClick={clearImage} className="text-white bg-red-500 rounded-full p-1">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                            <Upload className="h-8 w-8 text-gray-400" />
                            <span className="text-xs text-gray-500 mt-1">Upload Foto</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Kode Barang</label>
                    <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        value={formData.kode_barang}
                        onChange={(e) => setFormData({ ...formData, kode_barang: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">SKU</label>
                    <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    />
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Nama Produk</label>
                <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    value={formData.nama_produk}
                    onChange={(e) => setFormData({ ...formData, nama_produk: e.target.value })}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Harga</label>
                    <input
                        type="number"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        value={formData.harga_jual}
                        onChange={(e) => setFormData({ ...formData, harga_jual: e.target.value })}
                        placeholder="0"
                    />
                    <p className="mt-1 text-xs text-gray-500">Harga ini adalah Open Price (dapat diubah oleh Sales saat transaksi).</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Stok Awal</label>
                    <input
                        type="number"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        value={formData.stok_tersedia}
                        onChange={(e) => setFormData({ ...formData, stok_tersedia: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Satuan</label>
                    <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        value={formData.satuan}
                        onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    disabled={isLoading}
                >
                    Batal
                </button>
                <button
                    type="submit"
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
                    disabled={isLoading}
                >
                    {isLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;

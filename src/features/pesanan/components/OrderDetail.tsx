import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle, XCircle, Printer, Edit3, Save, Trash2, Plus, Search, Truck } from 'lucide-react';
import { Pesanan, ItemPesanan, UpdatePesananData } from '../types';
import { ConfirmModal } from '../../../components/ui/Modal';
import { useProduk } from '../../produk/hooks/useProduk';
import { Produk } from '../../produk/types';

interface OrderDetailProps {
    pesanan: Pesanan;
    onStatusChange: (id: number, status: string) => Promise<void>;
    onUpdatePesanan?: (id: number, data: UpdatePesananData) => Promise<{ success: boolean; message?: string }>;
    onClose: () => void;
}

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'sukses': return 'bg-green-100 text-green-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'batal': return 'bg-red-100 text-red-800';
        case 'proses': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const OrderDetail: React.FC<OrderDetailProps> = ({ pesanan, onStatusChange, onUpdatePesanan, onClose }) => {
    const [statusToConfirm, setStatusToConfirm] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedItems, setEditedItems] = useState<ItemPesanan[]>([]);
    const [catatan, setCatatan] = useState(pesanan.catatan || '');
    const [isSaving, setIsSaving] = useState(false);
    
    // Product Search for adding items
    const { produks, fetchProduks } = useProduk();
    const [productSearch, setProductSearch] = useState('');
    const [showProductSearch, setShowProductSearch] = useState(false);

    useEffect(() => {
        if (pesanan.items) {
            setEditedItems([...pesanan.items]);
        }
        setCatatan(pesanan.catatan || '');
    }, [pesanan]);

    useEffect(() => {
        if (showProductSearch) {
            fetchProduks({ search: productSearch });
        }
    }, [productSearch, showProductSearch, fetchProduks]);

    const totalTagihan = useMemo(() => {
        return editedItems.reduce((acc, item) => acc + (item.jumlah * item.harga_satuan), 0);
    }, [editedItems]);

    const handleUpdateItemQty = (id_produk: number, newQty: number) => {
        if (newQty < 0) return;
        setEditedItems(items => items.map(item => 
            item.id_produk === id_produk ? { ...item, jumlah: newQty, total_harga: newQty * item.harga_satuan } : item
        ));
    };

    const handleUpdateItemPrice = (id_produk: number, newPrice: number) => {
        if (newPrice < 0) return;
        setEditedItems(items => items.map(item => 
            item.id_produk === id_produk ? { ...item, harga_satuan: newPrice, total_harga: item.jumlah * newPrice } : item
        ));
    };

    const handleRemoveItem = (id_produk: number) => {
        setEditedItems(items => items.filter(item => item.id_produk !== id_produk));
    };

    const handleAddProduct = (produk: Produk) => {
        if (editedItems.find(item => item.id_produk === produk.id)) {
            // Already added
            setShowProductSearch(false);
            return;
        }
        const newItem: ItemPesanan = {
            id: 0, // Temp ID
            id_produk: produk.id,
            produk: {
                nama_produk: produk.nama_produk,
                satuan: produk.satuan
            },
            jumlah: 1,
            jumlah_pesanan: 1,
            harga_satuan: Number(produk.harga_jual),
            total_harga: Number(produk.harga_jual)
        };
        setEditedItems([...editedItems, newItem]);
        setShowProductSearch(false);
        setProductSearch('');
    };

    const saveOrderAdjustment = async () => {
        if (!onUpdatePesanan) return;
        setIsSaving(true);
        try {
            const result = await onUpdatePesanan(pesanan.id, {
                items: editedItems.map(item => ({
                    id_produk: item.id_produk,
                    jumlah: item.jumlah,
                    jumlah_pesanan: item.jumlah_pesanan || item.jumlah,
                    harga_satuan: item.harga_satuan
                })),
                catatan
            });
            if (result.success) {
                setIsEditing(false);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const confirmStatusChange = () => {
        if (statusToConfirm) {
            onStatusChange(pesanan.id, statusToConfirm);
            setStatusToConfirm(null);
        }
    };
    return (
        <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Informasi Pesanan</h3>
                    {!isEditing && pesanan.status === 'PENDING' && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800"
                        >
                            <Edit3 className="mr-1 h-3 w-3" /> Edit Pesanan
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500 mb-1">No. PO</p>
                        <p className="font-bold text-indigo-700">{pesanan.no_pesanan}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 mb-1">Pelanggan</p>
                        <p className="font-semibold text-gray-900">{pesanan.pelanggan?.nama_toko || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 mb-1">Sales</p>
                        <p className="font-semibold text-gray-900">{pesanan.karyawan?.nama_lengkap || 'Unknown'}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 mb-1">Tanggal Pesanan</p>
                        <p className="font-medium text-gray-700">{pesanan.tanggal_transaksi}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 mb-1">Status Saat Ini</p>
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(pesanan.status || '')}`}>
                            {pesanan.status}
                        </span>
                    </div>
                    {pesanan.pelanggan && (
                        <div className="col-span-2 pt-2 border-t border-gray-100 mt-1">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Limit Kredit Berjalan Pelanggan:</span>
                                <span className={`text-sm font-bold ${Number(pesanan.pelanggan.limit_kredit_berjalan) < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                    Rp {(Number(pesanan.pelanggan.limit_kredit_berjalan) || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
                {/* Status Tracking Timeline */}
                <div className="mt-4 border-t border-gray-100 pt-3">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Riwayat Status</h4>
                    <div className="space-y-2 text-sm">
                        {pesanan.waktu_proses && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Diproses:</span>
                                <span className="font-medium text-gray-900">{new Date(pesanan.waktu_proses).toLocaleString('id-ID')}</span>
                            </div>
                        )}
                        {pesanan.waktu_kirim && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Dikirim:</span>
                                <span className="font-medium text-gray-900">{new Date(pesanan.waktu_kirim).toLocaleString('id-ID')}</span>
                            </div>
                        )}
                        {pesanan.waktu_selesai && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Selesai:</span>
                                <span className="font-medium text-green-600">{new Date(pesanan.waktu_selesai).toLocaleString('id-ID')}</span>
                            </div>
                        )}
                        {pesanan.waktu_batal && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Dibatalkan:</span>
                                <span className="font-medium text-red-600">{new Date(pesanan.waktu_batal).toLocaleString('id-ID')}</span>
                            </div>
                        )}
                        {!pesanan.waktu_proses && !pesanan.waktu_kirim && !pesanan.waktu_selesai && !pesanan.waktu_batal && (
                             <span className="text-gray-400 italic">Belum ada riwayat status.</span>
                        )}
                    </div>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Item Pesanan</h4>
                    {isEditing && (
                        <button 
                            onClick={() => setShowProductSearch(true)}
                            className="flex items-center text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100"
                        >
                            <Plus className="mr-1 h-3 w-3" /> Tambah Barang
                        </button>
                    )}
                </div>

                {/* Product search dropdown for editing */}
                {isEditing && showProductSearch && (
                    <div className="mb-4 bg-white border border-indigo-100 rounded-lg shadow-sm p-3 animate-in fade-in slide-in-from-top-2">
                        <div className="relative mb-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input 
                                autoFocus
                                type="text" 
                                placeholder="Cari nama barang..."
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-indigo-500"
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                            />
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                            {produks.length === 0 ? (
                                <p className="text-xs text-center text-gray-500 py-4">Produk tidak ditemukan</p>
                            ) : (
                                produks.map(p => (
                                    <button 
                                        key={p.id}
                                        onClick={() => handleAddProduct(p)}
                                        className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex justify-between rounded"
                                    >
                                        <span className="font-medium">{p.nama_produk}</span>
                                        <span className="text-gray-500">Rp {Number(p.harga_jual).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                                    </button>
                                ))
                            )}
                        </div>
                        <button 
                            onClick={() => setShowProductSearch(false)}
                            className="w-full mt-2 text-xs text-gray-400 py-1"
                        >
                            Batal
                        </button>
                    </div>
                )}

                <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Barang</th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Harga</th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Qty Pesanan</th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-indigo-600 uppercase whitespace-nowrap">Qty Disetujui</th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-amber-600 uppercase whitespace-nowrap">Sisa (BO)</th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Subtotal</th>
                                {isEditing && <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {(isEditing ? editedItems : pesanan.items)?.map((item) => (
                                <tr key={item.id_produk}>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {item.produk?.nama_produk || item.nama_barang || 'Produk Dihapus'}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm text-gray-500 whitespace-nowrap">
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-24 text-right px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                                                value={Number(item.harga_satuan).toString()}
                                                onChange={(e) => handleUpdateItemPrice(item.id_produk, Number(e.target.value))}
                                            />
                                        ) : (
                                            `Rp ${(Number(item.harga_satuan) || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}`
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-400">
                                        {item.jumlah_pesanan || item.jumlah}
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm font-semibold text-indigo-700 bg-indigo-50/30">
                                        {isEditing ? (
                                            <div className="flex items-center justify-center space-x-2">
                                                <button 
                                                    onClick={() => handleUpdateItemQty(item.id_produk, item.jumlah - 1)}
                                                    className="w-5 h-5 rounded border border-indigo-200 bg-white flex items-center justify-center hover:bg-indigo-50 text-indigo-600"
                                                >-</button>
                                                <span className="w-8 text-center text-indigo-700">{item.jumlah}</span>
                                                <button 
                                                    onClick={() => handleUpdateItemQty(item.id_produk, item.jumlah + 1)}
                                                    className="w-5 h-5 rounded border border-indigo-200 bg-white flex items-center justify-center hover:bg-indigo-50 text-indigo-600"
                                                >+</button>
                                            </div>
                                        ) : item.jumlah}
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm font-medium text-amber-600 italic">
                                        {(item.jumlah_pesanan || item.jumlah) - item.jumlah}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 whitespace-nowrap">
                                        Rp {(Number(item.total_harga) || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                                    </td>
                                    {isEditing && (
                                        <td className="px-4 py-3 text-center">
                                            <button 
                                                onClick={() => handleRemoveItem(item.id_produk)}
                                                className="text-red-400 hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            <tr className="bg-gray-50 text-gray-900 font-bold">
                                <td colSpan={5} className="px-4 py-3 text-right text-sm">Total Pembayaran (Disetujui)</td>
                                <td className="px-4 py-3 text-right text-sm text-indigo-700 whitespace-nowrap">
                                    Rp {(Number(isEditing ? totalTagihan : pesanan.total_tagihan) || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                                </td>
                                {isEditing && <td></td>}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Note Section */}
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Catatan</label>
                {isEditing ? (
                    <textarea 
                        className="w-full text-sm border border-gray-200 rounded-lg p-3 h-20 focus:ring-1 focus:ring-indigo-500"
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        placeholder="Tambahkan catatan untuk pesanan ini..."
                    />
                ) : (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[40px]">
                        <p className="text-sm text-gray-700 italic">{pesanan.catatan || 'Tidak ada catatan.'}</p>
                    </div>
                )}
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                {isEditing ? (
                    <>
                        <button 
                            onClick={() => setIsEditing(false)}
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            disabled={isSaving}
                        >
                            Batal
                        </button>
                        <button 
                            onClick={saveOrderAdjustment}
                            className="flex items-center justify-center rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                            disabled={isSaving || editedItems.length === 0}
                        >
                            {isSaving ? 'Menyimpan...' : (
                                <><Save className="mr-2 h-4 w-4" /> Simpan Perubahan</>
                            )}
                        </button>
                    </>
                ) : (
                    <>
                        {(pesanan.status === 'PENDING' || pesanan.status === 'PROSES') && (
                            <button 
                                onClick={() => setStatusToConfirm('BATAL')}
                                className="flex items-center justify-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                            >
                                <XCircle className="mr-2 h-4 w-4" /> {pesanan.status === 'PENDING' ? 'Tolak' : 'Batalkan'}
                            </button>
                        )}
                        {(pesanan.status === 'PROSES' || pesanan.status === 'PENDING') && (
                            <button 
                                onClick={() => setStatusToConfirm(pesanan.status === 'PENDING' ? 'PROSES' : 'DIKIRIM')}
                                className="flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                            >
                                {pesanan.status === 'PENDING' ? (
                                    <><CheckCircle className="mr-2 h-4 w-4" /> Proses</>
                                ) : (
                                    <><Truck className="mr-2 h-4 w-4" /> Kirim Barang</>
                                )}
                            </button>
                        )}
                        {pesanan.status === 'DIKIRIM' && (
                            <button 
                                onClick={() => setStatusToConfirm('SUKSES')}
                                className="flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700"
                            >
                                <CheckCircle className="mr-2 h-4 w-4" /> Selesaikan
                            </button>
                        )}
                        {pesanan.status === 'SUKSES' && (
                            <button 
                                className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                onClick={() => window.print()} 
                            >
                                <Printer className="mr-2 h-4 w-4" /> Cetak
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Tutup
                        </button>
                    </>
                )}
            </div>

            {/* Confirm Modal for Status Changes */}
            <ConfirmModal 
                isOpen={!!statusToConfirm}
                onClose={() => setStatusToConfirm(null)}
                onConfirm={confirmStatusChange}
                title="Konfirmasi Status"
                message={`Sistem akan mengubah status pesanan dari ${pesanan.status} menjadi ${statusToConfirm}. ${statusToConfirm === 'SUKSES' ? 'Jika ada sisa barang yang belum disetujui, sistem akan otomatis membuat pesanan Backorder (BO) baru.' : ''} Lanjutkan?`}
                confirmText="Ya, Lanjutkan"
                type={statusToConfirm === 'BATAL' ? 'danger' : 'info'}
            />
        </div>
    );
};

export default OrderDetail;

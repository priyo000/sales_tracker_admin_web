import React from 'react';
import { CheckCircle, XCircle, Printer } from 'lucide-react';
import { Pesanan } from '../types';

interface OrderDetailProps {
    pesanan: Pesanan;
    onStatusChange: (id: number, status: string) => void;
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

const OrderDetail: React.FC<OrderDetailProps> = ({ pesanan, onStatusChange, onClose }) => {
    return (
        <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500 mb-1">Pelanggan</p>
                        <p className="font-semibold text-gray-900">{pesanan.nama_toko}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 mb-1">Sales</p>
                        <p className="font-semibold text-gray-900">{pesanan.sales}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 mb-1">Tanggal Pesanan</p>
                        <p className="font-medium text-gray-700">{pesanan.tanggal}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 mb-1">Status Saat Ini</p>
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(pesanan.status)}`}>
                            {pesanan.status}
                        </span>
                    </div>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Item Pesanan</h4>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barang</th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Harga</th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {pesanan.items?.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-3 text-sm text-gray-900">{item.nama_barang}</td>
                                    <td className="px-4 py-3 text-right text-sm text-gray-500">
                                        Rp {item.harga_satuan.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-500">{item.jumlah}</td>
                                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                        Rp {item.subtotal.toLocaleString('id-ID')}
                                    </td>
                                </tr>
                            ))}
                            <tr className="bg-gray-50 text-gray-900 font-bold">
                                <td colSpan={3} className="px-4 py-3 text-right text-sm">Total Pembayaran</td>
                                <td className="px-4 py-3 text-right text-sm text-indigo-700">
                                    Rp {pesanan.total_harga.toLocaleString('id-ID')}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                {pesanan.status === 'PENDING' && (
                    <>
                        <button 
                            onClick={() => onStatusChange(pesanan.id, 'BATAL')}
                            className="flex items-center justify-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                        >
                            <XCircle className="mr-2 h-4 w-4" /> Tolak Pesanan
                        </button>
                        <button 
                            onClick={() => onStatusChange(pesanan.id, 'PROSES')}
                            className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                        >
                            <CheckCircle className="mr-2 h-4 w-4" /> Proses Pesanan
                        </button>
                    </>
                )}
                {pesanan.status === 'PROSES' && (
                    <button 
                        onClick={() => onStatusChange(pesanan.id, 'SUKSES')}
                        className="flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                    >
                        <CheckCircle className="mr-2 h-4 w-4" /> Selesaikan Order
                    </button>
                )}
                {pesanan.status === 'SUKSES' && (
                    <button 
                        className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                        onClick={() => window.print()} 
                    >
                        <Printer className="mr-2 h-4 w-4" /> Cetak Invoice
                    </button>
                )}
                <button
                    onClick={onClose}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 text-gray-500"
                >
                    Tutup
                </button>
            </div>
        </div>
    );
};

export default OrderDetail;

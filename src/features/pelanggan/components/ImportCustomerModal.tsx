import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';

interface ImportCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (file: File) => Promise<{ success: boolean; message?: string }>;
}

const ImportCustomerModal: React.FC<ImportCustomerModalProps> = ({ isOpen, onClose, onImport }) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            validateAndSetFile(selectedFile);
        }
    };

    const validateAndSetFile = (file: File) => {
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel', // .xls
            'text/csv' // .csv
        ];

        // Check extension as fallback
        const validExtensions = ['.xlsx', '.xls', '.csv'];
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

        if (validTypes.includes(file.type) || validExtensions.includes(fileExtension)) {
            setFile(file);
            setError(null);
            setSuccess(false);
        } else {
            setFile(null);
            setError('Format file tidak didukung. Harap gunakan format .xlsx, .xls, atau .csv');
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            validateAndSetFile(droppedFile);
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            const result = await onImport(file);
            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    handleClose();
                }, 1500);
            } else {
                setError(result.message || 'Gagal mengimport data.');
            }
        } catch (err) {
            setError('Terjadi kesalahan saat mengupload file.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setError(null);
        setSuccess(false);
        setLoading(false);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Import Data Pelanggan"
            size="lg"
        >
            <div className="space-y-6">
                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-blue-800 mb-2">Panduan Import:</h3>
                    <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                        <li>Gunakan format excel (.xlsx / .xls).</li>
                        <li>Pastikan kolom header sesuai dengan template.</li>
                        <li>Kolom wajib: <strong>nama_toko</strong>.</li>
                        <li>Kolom opsional: kode_pelanggan, alamat_pelanggan, no_hp_pelanggan, kode_karyawan, Status, latitude, longitude, kecamatan, kota.</li>
                    </ul>
                </div>

                {/* Dropzone */}
                {!file && !success ? (
                    <div 
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <div className="bg-indigo-100 p-4 rounded-full mb-4 group-hover:bg-indigo-200 transition-colors">
                            <Upload className="w-8 h-8 text-indigo-600" />
                        </div>
                        <p className="text-gray-700 font-medium mb-1">Klik untuk upload atau drag & drop file Excel disini</p>
                        <p className="text-gray-400 text-xs">Mendukung format .xlsx, .xls</p>
                        <input 
                            type="file" 
                            className="hidden" 
                            ref={fileInputRef} 
                            accept=".xlsx, .xls, .csv" 
                            onChange={handleFileChange}
                        />
                    </div>
                ) : null}

                {/* Selected File State */}
                {file && !success && (
                    <div className="bg-white border rounded-lg p-4 flex items-center justify-between shadow-sm">
                        <div className="flex items-center space-x-4">
                            <div className="bg-green-100 p-3 rounded-lg">
                                <FileSpreadsheet className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setFile(null)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            disabled={loading}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Success State */}
                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95">
                        <div className="bg-green-100 p-3 rounded-full mb-3">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-green-800">Berhasil!</h3>
                        <p className="text-green-600">Data pelanggan berhasil diimport.</p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3 animate-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                        <span className="text-sm text-red-700 font-medium">{error}</span>
                    </div>
                )}

                {/* Action Buttons */}
                {!success && (
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                            disabled={loading}
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={!file || loading}
                            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all active:scale-95"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Import Sekarang
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ImportCustomerModal;

import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';

interface ImportJadwalMasterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (file: File) => Promise<{ 
        success: boolean; 
        message?: string; 
        data?: {
            message: string;
            summary: { 
                success: number; 
                failed: number; 
                total: number;
                failures: Array<{ sheet: string; row: number; name: string; error: string }>;
            };
        } 
    }>;
}

const ImportJadwalMasterModal: React.FC<ImportJadwalMasterModalProps> = ({ isOpen, onClose, onImport }) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{
        message: string;
        summary: { 
            success: number; 
            failed: number; 
            total: number;
            failures: Array<{ sheet: string; row: number; name: string; error: string }>;
        };
    } | null>(null);
    const [showFailures, setShowFailures] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            validateAndSetFile(selectedFile);
        }
    };

    const validateAndSetFile = (file: File) => {
        const validExtensions = ['.xlsx', '.xls'];
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

        if (validExtensions.includes(fileExtension)) {
            setFile(file);
            setError(null);
            setResult(null);
        } else {
            setFile(null);
            setError('Format file tidak didukung. Harap gunakan format .xlsx atau .xls');
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
            const res = await onImport(file);
            if (res.success && res.data) {
                setResult(res.data);
                if (res.data.summary.failed === 0) {
                   setTimeout(() => {
                        handleClose();
                   }, 3000);
                }
            } else {
                setError(res.message || 'Gagal mengimport data.');
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
        setResult(null);
        setLoading(false);
        setShowFailures(false);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Import Master Jadwal"
            size="lg"
        >
            <div className="space-y-6">
                {!result && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-blue-800 mb-2">Panduan Import Master Jadwal:</h3>
                        <div className="text-sm text-blue-700 space-y-3">
                            <div>
                                <p className="font-bold underline">Sheet 1: RuteMingguan</p>
                                <p className="mb-1 italic text-xs">Mendukung format Horizontal (Hari 1-7 sebagai kolom) atau Vertikal.</p>
                                <ul className="list-disc list-inside ml-2">
                                    <li>Kolom Wajib: <strong>nama_per_minggu</strong>.</li>
                                    <li>Format Horizontal: Kolom <strong>1, 2, 3, 4, 5, 6, 7</strong> (isi dengan nama rute).</li>
                                    <li>Format Vertikal: Kolom <strong>hari_ke</strong> dan <strong>nama_rute</strong>.</li>
                                </ul>
                            </div>
                            <div>
                                <p className="font-bold underline">Sheet 2: MingguanKaryawan</p>
                                <p className="mb-1 italic text-xs">Mendukung format Horizontal (Minggu 1-4 sebagai kolom) atau Vertikal.</p>
                                <ul className="list-disc list-inside ml-2">
                                    <li>Kolom Wajib: <strong>kode_karyawan</strong>.</li>
                                    <li>Format Horizontal: Kolom <strong>Minggu 1, Minggu 2, Minggu 3, Minggu 4</strong>.</li>
                                    <li>Format Vertikal: Kolom <strong>minggu_ke</strong> dan <strong>WeeklyRouteName</strong>.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {!file && !result ? (
                    <div 
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <div className="bg-indigo-100 p-4 rounded-full mb-4 group-hover:bg-indigo-200 transition-colors">
                            <Upload className="w-8 h-8 text-indigo-600" />
                        </div>
                        <p className="text-gray-700 font-medium mb-1 text-center">Klik untuk upload atau drag & drop file Excel disini</p>
                        <input 
                            type="file" 
                            className="hidden" 
                            ref={fileInputRef} 
                            accept=".xlsx, .xls" 
                            onChange={handleFileChange}
                        />
                    </div>
                ) : null}

                {file && !result && (
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

                {result && (
                    <div className="space-y-4 animate-in fade-in zoom-in-95">
                        <div className={`rounded-xl p-6 border flex flex-col items-center text-center ${result.summary.failed > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
                            <div className={`p-3 rounded-full mb-3 ${result.summary.failed > 0 ? 'bg-amber-100' : 'bg-green-100'}`}>
                                {result.summary.failed > 0 ? <AlertCircle className="w-8 h-8 text-amber-600" /> : <CheckCircle className="w-8 h-8 text-green-600" />}
                            </div>
                            <h3 className={`text-lg font-bold ${result.summary.failed > 0 ? 'text-amber-800' : 'text-green-800'}`}>
                                {result.summary.failed > 0 ? 'Import Selesai dengan Catatan' : 'Import Berhasil Sempurna!'}
                            </h3>
                            
                            <div className="grid grid-cols-3 gap-4 mt-6 w-full max-w-sm">
                                <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-tight">Total Rows</p>
                                    <p className="text-xl font-black text-gray-800">{result.summary.total}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                    <p className="text-xs text-green-500 font-bold uppercase tracking-tight">Berhasil</p>
                                    <p className="text-xl font-black text-green-600">{result.summary.success}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                    <p className="text-xs text-red-500 font-bold uppercase tracking-tight">Gagal</p>
                                    <p className="text-xl font-black text-red-600">{result.summary.failed}</p>
                                </div>
                            </div>
                        </div>

                        {result.summary.failures.length > 0 && (
                            <div className="border rounded-xl overflow-hidden bg-white">
                                <button 
                                    onClick={() => setShowFailures(!showFailures)}
                                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-semibold text-gray-700"
                                >
                                    <div className="flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
                                        Lihat Detail Kegagalan ({result.summary.failures.length})
                                    </div>
                                    {showFailures ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                                
                                {showFailures && (
                                    <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                                        {result.summary.failures.map((fail, idx) => (
                                            <div key={idx} className="p-3 text-xs">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-bold text-gray-900">
                                                        [{fail.sheet}] Baris {fail.row}: {fail.name}
                                                    </span>
                                                </div>
                                                <p className="text-red-600 font-medium">{fail.error}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-center pt-2">
                            <button 
                                onClick={handleClose}
                                className="px-6 py-2 bg-gray-800 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-black transition-all active:scale-95"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3 animate-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                        <span className="text-sm text-red-700 font-medium">{error}</span>
                    </div>
                )}

                {!result && (
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                            disabled={loading}
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={!file || loading}
                            className="flex items-center px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:scale-95"
                        >
                            {loading ? 'Memproses...' : 'Import Sekarang'}
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ImportJadwalMasterModal;

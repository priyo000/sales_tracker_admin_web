import React, { useEffect, useState } from "react";
import { Smartphone, Plus, Trash2, Download, AlertCircle } from "lucide-react";
import api from "../services/api";
import { Button } from "../components/ui/button";
import { Modal, ConfirmModal } from "../components/ui/Modal";
import toast from "react-hot-toast";

interface AppUpdate {
  id: number;
  version_name: string;
  version_code: number;
  download_url: string;
  release_notes: string | null;
  is_force: boolean;
  created_at: string;
}

const AppUpdatePage: React.FC = () => {
  const [updates, setUpdates] = useState<AppUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    version_name: "",
    version_code: "",
    download_url: "",
    release_notes: "",
    is_force: false,
  });

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const response = await api.get("/app-update");
      if (response.data.status === "success") {
        setUpdates(response.data.data);
      }
    } catch {
      toast.error("Gagal mengambil data update");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post("/app-update", formData);
      if (response.data.status === "success") {
        toast.success("Versi baru berhasil dipublikasikan");
        setIsModalOpen(false);
        setFormData({
            version_name: "",
            version_code: "",
            download_url: "",
            release_notes: "",
            is_force: false,
        });
        fetchUpdates();
      }
    } catch (error: unknown) {
      const axiosError = error as any;
      toast.error(axiosError.response?.data?.message || "Gagal memproses data");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const response = await api.delete(`/app-update/${deletingId}`);
      if (response.data.status === "success") {
        toast.success("Versi berhasil dihapus");
        setDeletingId(null);
        fetchUpdates();
      }
    } catch {
      toast.error("Gagal menghapus data");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-600/30">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Update Aplikasi Mobile
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Kelola versi APK dan rilis update untuk Sales Lapangan.
            </p>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 shadow-md">
          <Plus className="h-4 w-4" /> Rilis Versi Baru
        </Button>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : updates.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-500">
            Belum ada data update yang dirilis.
          </div>
        ) : (
          updates.map((update, index) => (
            <div
              key={update.id}
              className={`bg-white rounded-2xl border p-6 flex flex-col md:flex-row gap-6 items-start relative overflow-hidden ${
                index === 0 ? "border-indigo-500 ring-1 ring-indigo-500/20" : "border-gray-200"
              }`}
            >
              {index === 0 && (
                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                  Terbaru
                </div>
              )}
              
              <div className={`p-4 rounded-xl shrink-0 ${index === 0 ? "bg-indigo-50" : "bg-gray-50"}`}>
                <Smartphone className={`h-8 w-8 ${index === 0 ? "text-indigo-600" : "text-gray-400"}`} />
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <h3 className="text-lg font-bold">Version {update.version_name}</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    Build {update.version_code}
                  </span>
                  {update.is_force && (
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                      <AlertCircle className="h-3 w-3" /> Wajib Update
                    </span>
                  )}
                </div>

                {update.release_notes && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 italic whitespace-pre-line">
                    "{update.release_notes}"
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <a
                    href={update.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-indigo-600 font-semibold hover:underline"
                  >
                    <Download className="h-4 w-4" /> Download APK
                  </a>
                  <span className="text-xs text-gray-400">
                    Dirilis pada: {new Date(update.created_at).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="flex md:flex-col gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => setDeletingId(update.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Rilis Versi Aplikasi Baru"
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Versi (e.g. 1.0.5)</label>
              <input
                required
                className="w-full h-10 px-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="1.0.0"
                value={formData.version_name}
                onChange={(e) => setFormData({ ...formData, version_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Kode Versi (Build Number)</label>
              <input
                required
                type="number"
                className="w-full h-10 px-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="12"
                value={formData.version_code}
                onChange={(e) => setFormData({ ...formData, version_code: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Download URL (Direct link to APK)</label>
            <input
              required
              type="text"
              className="w-full h-10 px-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="https://example.com/app.apk"
              value={formData.download_url}
              onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Catatan Rilis (Opsional)</label>
            <textarea
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24"
              placeholder="Perbaikan bug dan peningkatan performa..."
              value={formData.release_notes}
              onChange={(e) => setFormData({ ...formData, release_notes: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500"
              checked={formData.is_force}
              onChange={(e) => setFormData({ ...formData, is_force: e.target.checked })}
            />
            <div>
              <p className="text-sm font-medium">Wajib Update (Force Update)</p>
              <p className="text-xs text-gray-500">Sales tidak bisa menggunakan versi lama.</p>
            </div>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit">Publikasikan Sekarang</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Hapus Versi"
        message="Apakah Anda yakin ingin menghapus data versi ini? Riwayat update akan hilang."
        type="danger"
        confirmText="Hapus"
      />
    </div>
  );
};

export default AppUpdatePage;

import React, { useEffect, useState } from "react";
import { Smartphone, Plus, Trash2, Download, AlertCircle, History, ExternalLink } from "lucide-react";
import api from "../services/api";
import { Button } from "../components/ui/button";
import { Modal, ConfirmModal } from "../components/ui/Modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary text-white rounded-lg shadow-lg shadow-primary/30">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Update Aplikasi Mobile
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Kelola versi APK dan distribusi aplikasi untuk sales lapangan.
            </p>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 shadow-md">
          <Plus className="h-4 w-4" /> Rilis Versi Baru
        </Button>
      </div>

      <div className="grid gap-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-widest px-1">
          <History className="h-4 w-4" /> Riwayat Rilis
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed animate-pulse">
             <Smartphone className="h-8 w-8 text-primary/20 animate-bounce" />
          </div>
        ) : updates.length === 0 ? (
          <Card className="border-dashed bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                 <Smartphone className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <CardTitle className="text-xl">Belum Ada Rilis</CardTitle>
              <CardDescription className="max-w-xs mt-2">
                Anda belum mempublikasikan versi aplikasi apapun. Klik tombol di atas untuk memulai rilis pertama.
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {updates.map((update, index) => (
              <Card 
                key={update.id} 
                className={`group border-2 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 relative overflow-hidden ${
                  index === 0 
                  ? "border-primary/40 bg-linear-to-br from-primary/2 to-transparent shadow-md" 
                  : "border-border/60 hover:border-primary/20"
                }`}
              >
                {index === 0 && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-[0.2em] shadow-sm">
                      Latest Release
                    </div>
                  </div>
                )}
                
                <CardHeader className="pb-3 px-6 pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-2xl shadow-inner transition-colors ${index === 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        <Smartphone className="h-7 w-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                           <CardTitle className="text-2xl font-black">v{update.version_name}</CardTitle>
                           <Badge variant="outline" className="bg-white/50 font-mono text-[10px]">
                              Build #{update.version_code}
                           </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-2 mt-1 font-medium">
                          Dirilis pada {new Date(update.created_at).toLocaleString("id-ID", { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </CardDescription>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {update.is_force && (
                        <Badge variant="destructive" className="gap-1.5 py-1 px-3 shadow-sm animate-pulse border-white/20">
                          <AlertCircle className="h-3 w-3" /> Wajib Update
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                        onClick={() => setDeletingId(update.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="px-6 pb-6 pt-0 space-y-5">
                   {update.release_notes && (
                    <div className="rounded-2xl bg-muted/40 p-5 border border-border/40 relative group/notes">
                       <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest mb-2 flex items-center gap-2">
                          <History className="h-3 w-3" /> Change Log
                       </p>
                       <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line italic font-serif">
                          "{update.release_notes}"
                       </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                     <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 px-4 py-2 rounded-full border border-border/20 max-w-md truncate">
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        <span className="truncate">{update.download_url}</span>
                     </div>
                     <Button 
                       variant="outline" 
                       className="gap-2 rounded-full border-primary/20 text-primary hover:bg-primary hover:text-white transition-all group/dl" 
                       asChild
                     >
                       <a href={update.download_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 group-hover/dl:animate-bounce" /> Unduh APK
                       </a>
                     </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Rilis Versi Aplikasi Baru"
        size="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nama Versi</Label>
              <Input
                required
                placeholder="misal: 1.0.8"
                className="rounded-xl border-border/60 focus-visible:ring-primary shadow-sm h-11"
                value={formData.version_name}
                onChange={(e) => setFormData({ ...formData, version_name: e.target.value })}
              />
              <p className="text-[10px] text-muted-foreground px-1">Terlihat oleh pengguna di aplikasi mobile.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Kode Versi (Build)</Label>
              <Input
                required
                type="number"
                placeholder="misal: 15"
                className="rounded-xl border-border/60 focus-visible:ring-primary shadow-sm h-11"
                value={formData.version_code}
                onChange={(e) => setFormData({ ...formData, version_code: e.target.value })}
              />
              <p className="text-[10px] text-muted-foreground px-1">Harus lebih besar dari versi sebelumnya.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">URL Download Langsung</Label>
            <Input
              required
              type="url"
              placeholder="https://instansi.com/downloads/v1.0.8.apk"
              className="rounded-xl border-border/60 focus-visible:ring-primary shadow-sm h-11"
              value={formData.download_url}
              onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
            />
            <p className="text-[10px] text-muted-foreground px-1">Pastikan link ini langsung mendownload file APK.</p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Catatan Rilis</Label>
            <Textarea
              className="rounded-xl border-border/60 focus-visible:ring-primary shadow-sm min-h-[120px] resize-none"
              placeholder="Jelaskan perubahan di versi ini (perbaikan bug, fitur baru, dll)..."
              value={formData.release_notes}
              onChange={(e) => setFormData({ ...formData, release_notes: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border/40 transition-colors hover:bg-muted/60">
            <div className="space-y-0.5">
              <Label className="text-sm font-bold">Wajib Update (Force Update)</Label>
              <p className="text-xs text-muted-foreground">Pengguna tidak bisa melewati update ini untuk masuk ke aplikasi.</p>
            </div>
            <Switch
              checked={formData.is_force}
              onCheckedChange={(checked) => setFormData({ ...formData, is_force: checked })}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border/60">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl px-6">
              Batal
            </Button>
            <Button type="submit" className="rounded-xl px-8 bg-primary hover:bg-primary/90 shadow-md transform transition-all active:scale-95">
              Gelar Update Sekarang
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Hapus Rilis"
        message="Menghapus rilis ini akan menghentikan distribusi versi ini ke pengguna. Versi yang sudah terinstal tidak akan terpengaruh. Lanjutkan?"
        type="danger"
        confirmText="Hapus Permanen"
      />
    </div>
  );
};

export default AppUpdatePage;

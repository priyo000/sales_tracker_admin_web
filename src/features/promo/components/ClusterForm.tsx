import React, { useState, useEffect } from "react";
import { PromoCluster } from "../types";
import { Users, FileText, Save, X, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/FormField";
import { useAuth } from "@/hooks/useAuth";
import { useDivisi } from "@/features/divisi/hooks/useDivisi";

interface ClusterFormProps {
  initialData?: PromoCluster;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ClusterForm: React.FC<ClusterFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading,
}) => {
  const { user } = useAuth();
  const { divisis, fetchDivisis } = useDivisi();
  
  const [namaCluster, setNamaCluster] = useState(initialData?.nama_cluster || "");
  const [deskripsi, setDeskripsi] = useState(initialData?.deskripsi || "");
  const [isAktif, setIsAktif] = useState(initialData?.is_aktif ?? true);
  const [idDivisi, setIdDivisi] = useState<string>(initialData?.id_divisi?.toString() || "");

  const isSuperOrCompanyAdmin = user?.peran === "super_admin" || user?.peran === "admin_perusahaan";

  useEffect(() => {
    if (isSuperOrCompanyAdmin) {
      fetchDivisis();
    }
  }, [isSuperOrCompanyAdmin, fetchDivisis]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      nama_cluster: namaCluster,
      deskripsi,
      is_aktif: isAktif,
      id_divisi: isSuperOrCompanyAdmin ? (idDivisi || null) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-2">
      <div className="grid grid-cols-1 gap-4">
        <FormField label="Nama Cluster" icon={Users} required>
          <Input
            required
            className="h-10 bg-card border-border/50 focus-visible:ring-primary shadow-sm font-bold italic"
            placeholder="CONTOH: GROSIR TINGKAT 1"
            value={namaCluster}
            onChange={(e) => setNamaCluster(e.target.value.toUpperCase())}
          />
        </FormField>

        {isSuperOrCompanyAdmin && (
          <FormField label="Target Divisi" icon={LayoutGrid} description="* Kosongkan jika berlaku untuk semua divisi.">
            <select
              className="flex h-10 w-full rounded-xl border border-border/50 bg-card px-3 py-2 text-sm font-bold italic shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              value={idDivisi}
              onChange={(e) => setIdDivisi(e.target.value)}
            >
              <option value="">SEMUA DIVISI (GLOBAL)</option>
              {divisis.map((div) => (
                <option key={div.id} value={div.id}>
                  {div.nama_divisi.toUpperCase()}
                </option>
              ))}
            </select>
          </FormField>
        )}

        <FormField label="Keterangan / Deskripsi" icon={FileText}>
          <textarea
            className="flex min-h-[100px] w-full rounded-xl border border-border/50 bg-card px-3 py-2 text-sm font-bold italic shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            placeholder="Jelaskan kriteria pelanggan untuk cluster ini..."
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
          />
        </FormField>

        <div className="flex items-center gap-2 px-1">
           <input 
            type="checkbox" 
            id="is_aktif"
            checked={isAktif}
            onChange={(e) => setIsAktif(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
           />
           <label htmlFor="is_aktif" className="text-xs font-black uppercase italic tracking-wider text-muted-foreground cursor-pointer">
             Cluster ini Sedang Aktif
           </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t font-semibold">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="h-10 px-8 text-[11px] font-black uppercase tracking-wider text-muted-foreground hover:text-foreground rounded-xl italic"
          disabled={loading}
        >
          <X className="mr-2 h-4 w-4" /> Batal
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="h-10 px-10 text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white rounded-xl italic"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Menyimpan...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {initialData ? "Simpan Perubahan" : "Buat Cluster Baru"}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};

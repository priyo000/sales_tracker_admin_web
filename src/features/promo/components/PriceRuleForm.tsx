import React, { useState, useEffect } from "react";
import { PromoAturanHarga, PromoCluster } from "../types";
import { 
  Package, 
  Users, 
  Calendar, 
  Percent, 
  Banknote, 
  Save, 
  X,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/FormField";
import { useProduk } from "@/features/produk/hooks/useProduk";
import { useAuth } from "@/hooks/useAuth";
import { useDivisi } from "@/features/divisi/hooks/useDivisi";

interface PriceRuleFormProps {
  clusters: PromoCluster[];
  initialData?: PromoAturanHarga;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const PriceRuleForm: React.FC<PriceRuleFormProps> = ({
  clusters,
  initialData,
  onSubmit,
  onCancel,
  loading,
}) => {
  const { user } = useAuth();
  const { produks, fetchProduks } = useProduk();
  const { divisis, fetchDivisis } = useDivisi();

  const [idProduk, setIdProduk] = useState<string>(initialData?.id_produk?.toString() || "");
  const [idCluster, setIdCluster] = useState<string>(initialData?.id_promo_cluster?.toString() || "");
  const [idDivisi, setIdDivisi] = useState<string>(initialData?.id_divisi?.toString() || "");
  const [hargaManual, setHargaManual] = useState<string>(initialData?.harga_manual?.toString() || "");
  const [diskonPersen, setDiskonPersen] = useState<string>(initialData?.diskon_persen?.toString() || "");
  const [tanggalMulai, setTanggalMulai] = useState(initialData?.tanggal_mulai || "");
  const [tanggalAkhir, setTanggalAkhir] = useState(initialData?.tanggal_akhir || "");

  const isSuperOrCompanyAdmin = user?.peran === "super_admin" || user?.peran === "admin_perusahaan";

  useEffect(() => {
    fetchProduks({ per_page: 100 });
    if (isSuperOrCompanyAdmin) {
      fetchDivisis();
    }
  }, [fetchProduks, fetchDivisis, isSuperOrCompanyAdmin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id_produk: idProduk,
      id_promo_cluster: idCluster || null,
      id_divisi: isSuperOrCompanyAdmin ? (idDivisi || null) : undefined,
      harga_manual: hargaManual || null,
      diskon_persen: diskonPersen || null,
      tanggal_mulai: tanggalMulai,
      tanggal_akhir: tanggalAkhir,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Pilih Produk" icon={Package} required className="md:col-span-2">
          <select
            required
            className="flex h-10 w-full rounded-xl border border-border/50 bg-card px-3 py-2 text-sm font-bold italic shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            value={idProduk}
            onChange={(e) => setIdProduk(e.target.value)}
          >
            <option value="">-- PILIH PRODUK --</option>
            {produks.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.sku}] {p.nama_produk.toUpperCase()}
              </option>
            ))}
          </select>
        </FormField>

        {isSuperOrCompanyAdmin && (
          <FormField label="Target Divisi" icon={LayoutGrid} className="md:col-span-2">
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

        <FormField label="Target Cluster Toko" icon={Users}>
          <select
            className="flex h-10 w-full rounded-xl border border-border/50 bg-card px-3 py-2 text-sm font-bold italic shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            value={idCluster}
            onChange={(e) => setIdCluster(e.target.value)}
          >
            <option value="">SEMUA TOKO (GLOBAL)</option>
            {clusters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nama_cluster.toUpperCase()}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid grid-cols-2 gap-4 md:col-span-1">
          <FormField label="Diskon (%)" icon={Percent}>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="100"
              className="h-10 bg-card border-border/50 font-bold italic"
              placeholder="0"
              value={diskonPersen}
              onChange={(e) => setDiskonPersen(e.target.value)}
            />
          </FormField>
          <FormField label="Harga Lock (Rp)" icon={Banknote}>
            <Input
              type="number"
              className="h-10 bg-card border-border/50 font-bold italic"
              placeholder="0"
              value={hargaManual}
              onChange={(e) => setHargaManual(e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="Tanggal Mulai" icon={Calendar} required>
          <Input
            type="date"
            required
            className="h-10 bg-card border-border/50 font-bold italic"
            value={tanggalMulai}
            onChange={(e) => setTanggalMulai(e.target.value)}
          />
        </FormField>

        <FormField label="Tanggal Berakhir" icon={Calendar} required>
          <Input
            type="date"
            required
            className="h-10 bg-card border-border/50 font-bold italic"
            value={tanggalAkhir}
            onChange={(e) => setTanggalAkhir(e.target.value)}
          />
        </FormField>
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
              {initialData ? "Simpan Perubahan" : "Aktifkan Promo"}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Tag, Package, Percent, Save, X, LayoutGrid, Search } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useProduk } from "@/features/produk/hooks/useProduk";
import { FormField } from "@/components/ui/FormField";
import { useDivisi } from "@/features/divisi/hooks/useDivisi";
import { cn } from "@/lib/utils";
import { PromoCluster, PromoAturanHarga } from "../types";
import { Divisi } from "@/features/divisi/types";
import { Produk } from "@/features/produk/types";

interface PriceRuleFormProps {
  clusters: PromoCluster[];
  initialData?: PromoAturanHarga;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const PriceRuleForm = ({ clusters, initialData, onSubmit, onCancel, loading }: PriceRuleFormProps) => {
  const { produks, fetchProduks } = useProduk();
  const { divisis, fetchDivisis } = useDivisi();
  
  const [formData, setFormData] = useState({
    id_produk: initialData?.id_produk?.toString() || "",
    id_promo_cluster: initialData?.id_promo_cluster?.toString() || "null",
    id_divisi: initialData?.id_divisi?.toString() || "null",
    harga_manual: initialData?.harga_manual || "",
    diskon_persen: initialData?.diskon_persen || "",
    tanggal_mulai: initialData?.tanggal_mulai ? new Date(initialData.tanggal_mulai) : new Date(),
    tanggal_akhir: initialData?.tanggal_akhir ? new Date(initialData.tanggal_akhir) : new Date(new Date().setMonth(new Date().getMonth() + 1)),
  });

  const [searchProduk, setSearchProduk] = useState("");

  useEffect(() => {
    fetchProduks({ search: searchProduk, per_page: 10 });
    fetchDivisis();
  }, [fetchProduks, fetchDivisis, searchProduk]);

  const userRole = localStorage.getItem("user_role");
  const isSuperOrCompanyAdmin = userRole === "superadmin" || userRole === "admin_perusahaan";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id_promo_cluster: formData.id_promo_cluster === "null" ? null : parseInt(formData.id_promo_cluster),
      id_divisi: formData.id_divisi === "null" ? null : parseInt(formData.id_divisi),
      tanggal_mulai: format(formData.tanggal_mulai, "yyyy-MM-dd"),
      tanggal_akhir: format(formData.tanggal_akhir, "yyyy-MM-dd"),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Pilih Produk" icon={Package} required className="md:col-span-2">
          <Select 
            value={formData.id_produk} 
            onValueChange={(val) => setFormData({ ...formData, id_produk: val })}
          >
            <SelectTrigger className="h-9 bg-card border-border/50 shadow-sm text-[13px] font-semibold">
              <SelectValue placeholder="Pilih Produk Target..." />
            </SelectTrigger>
            <SelectContent>
              <div className="flex items-center gap-2 p-2 border-b bg-muted/20">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <input 
                  className="bg-transparent text-xs outline-none w-full" 
                  placeholder="Cari SKU atau Nama..." 
                  value={searchProduk}
                  onChange={(e) => setSearchProduk(e.target.value)}
                />
              </div>
              {produks.map((p: Produk) => (
                <SelectItem key={p.id} value={p.id.toString()}>
                  <div className="flex flex-col">
                    <span className="font-semibold">{p.nama_produk}</span>
                    <span className="text-[9px] text-muted-foreground uppercase">{p.sku} | Rp {p.harga_jual.toLocaleString()}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        {isSuperOrCompanyAdmin && (
          <FormField label="Target Divisi" icon={LayoutGrid}>
            <Select 
              value={formData.id_divisi} 
              onValueChange={(val) => setFormData({ ...formData, id_divisi: val })}
            >
              <SelectTrigger className="h-9 bg-card border-border/50 shadow-sm text-[13px] font-semibold">
                <SelectValue placeholder="Global (Semua Divisi)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">Global (Semua Divisi)</SelectItem>
                {divisis.map((d: Divisi) => (
                  <SelectItem key={d.id} value={d.id.toString()}>
                    {d.nama_divisi}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        )}

        <FormField label="Target Cluster" icon={Tag}>
          <Select 
            value={formData.id_promo_cluster} 
            onValueChange={(val) => setFormData({ ...formData, id_promo_cluster: val })}
          >
            <SelectTrigger className="h-9 bg-card border-border/50 shadow-sm text-[13px] font-semibold">
              <SelectValue placeholder="Semua Pelanggan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="null">Semua Pelanggan</SelectItem>
              {clusters.map((c: PromoCluster) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.nama_cluster}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Potongan Persen (%)" icon={Percent}>
          <Input 
            type="number"
            placeholder="Contoh: 10" 
            value={formData.diskon_persen}
            onChange={(e) => setFormData({ ...formData, diskon_persen: e.target.value, harga_manual: "" })}
            className="h-9 bg-card border-border/50 shadow-sm text-[13px] font-semibold"
          />
        </FormField>

        <FormField label="Atau Harga Lock (Rp)" icon={Save}>
          <Input 
            type="number"
            placeholder="Contoh: 15000" 
            value={formData.harga_manual}
            onChange={(e) => setFormData({ ...formData, harga_manual: e.target.value, diskon_persen: "" })}
            className="h-9 bg-card border-border/50 shadow-sm text-[13px] font-semibold"
          />
        </FormField>

        <FormField label="Tanggal Mulai" icon={CalendarIcon} required>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-semibold h-9 text-[13px] border-border/50",
                  !formData.tanggal_mulai && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                {formData.tanggal_mulai ? format(formData.tanggal_mulai, "dd MMMM yyyy", { locale: id }) : <span>Pilih Tanggal</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.tanggal_mulai}
                onSelect={(date) => date && setFormData({ ...formData, tanggal_mulai: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </FormField>

        <FormField label="Tanggal Berakhir" icon={CalendarIcon} required>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-semibold h-9 text-[13px] border-border/50",
                  !formData.tanggal_akhir && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                {formData.tanggal_akhir ? format(formData.tanggal_akhir, "dd MMMM yyyy", { locale: id }) : <span>Pilih Tanggal</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.tanggal_akhir}
                onSelect={(date) => date && setFormData({ ...formData, tanggal_akhir: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </FormField>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t font-semibold">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="h-9 px-8 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground rounded-lg"
          disabled={loading}
        >
          <X className="mr-2 h-3.5 w-3.5" /> Batal
        </Button>
        <Button
          type="submit"
          className="h-9 px-10 text-[10px] font-bold uppercase tracking-wider shadow-md shadow-primary/20 bg-primary hover:bg-primary/90 text-white rounded-lg"
          disabled={loading}
        >
          {loading ? (
             <span className="flex items-center gap-2">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Menyimpan...
             </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {initialData ? "Update Promo" : "Aktifkan Promo"}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};

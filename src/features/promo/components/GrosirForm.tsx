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
import { CalendarIcon, Tag, Package, Percent, Save, LayoutGrid, Search, Check, ChevronDown, Trash2, Info, Layers, Boxes } from "lucide-react";
import { format } from "date-fns";
import { useProduk } from "@/features/produk/hooks/useProduk";
import { FormField } from "@/components/ui/FormField";
import { useDivisi } from "@/features/divisi/hooks/useDivisi";
import { cn, formatCurrency } from "@/lib/utils";
import { PromoCluster, PromoGrosir } from "../types";
import { Divisi } from "@/features/divisi/types";
import { Produk } from "@/features/produk/types";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";


interface GrosirFormProps {
  clusters: PromoCluster[];
  initialData?: PromoGrosir;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const GrosirForm = ({ clusters, initialData, onSubmit, onCancel, loading }: GrosirFormProps) => {
  const { produks, fetchProduks, loading: searchLoading } = useProduk();
  const { divisis, fetchDivisis } = useDivisi();
  const { user } = useAuth();
  const isSuperOrCompanyAdmin = user?.peran === "super_admin" || user?.peran === "admin_perusahaan";

  const [selectedProductIds, setSelectedProductIds] = useState<number[]>(
    initialData?.id_produk ? [initialData.id_produk] : []
  );

  const [persistedProdukMap, setPersistedProdukMap] = useState<Record<number, Produk>>(() => {
    if (initialData?.produk) {
      return { [initialData.id_produk]: initialData.produk };
    }
    return {};
  });

  const [formData, setFormData] = useState({
    nama_promo: initialData?.nama_promo || "",
    id_promo_cluster: initialData?.id_promo_cluster?.toString() || "null",
    id_divisi: initialData?.id_divisi?.toString() || "null",
    min_qty: initialData?.min_qty?.toString() || "1",
    harga_spesial: initialData?.harga_spesial || "",
    diskon_persen: initialData?.diskon_persen || "",
    tanggal_mulai: initialData?.tanggal_mulai ? new Date(initialData.tanggal_mulai) : new Date(),
    tanggal_akhir: initialData?.tanggal_akhir ? new Date(initialData.tanggal_akhir) : new Date(new Date().setMonth(new Date().getMonth() + 1)),
  });

  const [searchProduk, setSearchProduk] = useState("");
  const [isProdukPopoverOpen, setIsProdukPopoverOpen] = useState(false);

  useEffect(() => {
    fetchDivisis();
  }, [fetchDivisis]);

  // Handle search with debounce
  useEffect(() => {
    if (isProdukPopoverOpen) {
      const timer = setTimeout(() => {
        fetchProduks({ search: searchProduk, per_page: 20 });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [fetchProduks, searchProduk, isProdukPopoverOpen]);

  // Safely sync product details to state
  useEffect(() => {
    if (produks.length > 0) {
      const hasNew = produks.some(p => !persistedProdukMap[p.id]);
      if (hasNew) {
        // eslint-disable-next-line
        setPersistedProdukMap(prev => {
          const next = { ...prev };
          produks.forEach(p => {
            if (!next[p.id]) next[p.id] = p;
          });
          return next;
        });
      }
    }
  }, [produks, persistedProdukMap]);

  const handleToggleProduct = (product: Produk) => {
    if (initialData) {
      setSelectedProductIds([product.id]);
      setIsProdukPopoverOpen(false);
      return;
    }

    const isSelected = selectedProductIds.includes(product.id);
    if (isSelected) {
      setSelectedProductIds(prev => prev.filter(id => id !== product.id));
    } else {
      setSelectedProductIds(prev => [...prev, product.id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProductIds.length === 0) return;

    onSubmit({
      ...formData,
      id_produk: initialData ? selectedProductIds[0] : selectedProductIds,
      min_qty: parseInt(formData.min_qty),
      id_promo_cluster: formData.id_promo_cluster === "null" ? null : parseInt(formData.id_promo_cluster),
      id_divisi: formData.id_divisi === "null" ? null : parseInt(formData.id_divisi),
      tanggal_mulai: format(formData.tanggal_mulai, "yyyy-MM-dd"),
      tanggal_akhir: format(formData.tanggal_akhir, "yyyy-MM-dd"),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-[750px] -m-2">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Target Section */}
        <div className="bg-muted/30 p-4 rounded-xl border border-border/50 shadow-inner space-y-4">
          <div className="flex items-center gap-2 mb-1">
             <div className="p-1.5 bg-primary/10 rounded-lg">
                <LayoutGrid className="h-4 w-4 text-primary" />
             </div>
             <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Konfigurasi Target Grosir</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
                <FormField label="Nama Promo / Batch" icon={Tag} required>
                    <Input 
                        placeholder="Contoh: Grosir Spesial Musim Hujan" 
                        value={formData.nama_promo}
                        onChange={(e) => setFormData({ ...formData, nama_promo: e.target.value })}
                        className="h-10 bg-card border-border/50 text-sm font-semibold"
                        required
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                            }
                        }}
                    />
                </FormField>
            </div>

            <FormField label="Pilih Target Cluster" icon={Tag}>
              <Select 
                value={formData.id_promo_cluster} 
                onValueChange={(val) => {
                  setFormData({ 
                    ...formData, 
                    id_promo_cluster: val,
                    id_divisi: val !== "null" ? "null" : formData.id_divisi 
                  });
                }}
              >
                <SelectTrigger className="h-10 bg-card border-border/50 text-sm font-semibold">
                  <SelectValue placeholder="Semua Pelanggan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Seluruh Pelanggan</SelectItem>
                  {clusters.map((c: PromoCluster) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.nama_cluster}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {isSuperOrCompanyAdmin && (
              <FormField label="Batasi ke Divisi" icon={LayoutGrid}>
                <Popover>
                    <PopoverTrigger asChild>
                        <div className="relative group cursor-help">
                            <Select 
                                value={formData.id_divisi} 
                                onValueChange={(val) => setFormData({ ...formData, id_divisi: val })}
                                disabled={formData.id_promo_cluster !== "null"}
                            >
                                <SelectTrigger className="h-10 bg-card border-border/50 text-sm font-semibold disabled:opacity-50">
                                <SelectValue placeholder="Global" />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectItem value="null">Global (Seluruh Divisi)</SelectItem>
                                {divisis.map((d: Divisi) => (
                                    <SelectItem key={d.id} value={d.id.toString()}>{d.nama_divisi}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            {formData.id_promo_cluster !== "null" && (
                                <div className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 shadow-sm">
                                    <Info className="h-3 w-3" />
                                </div>
                            )}
                        </div>
                    </PopoverTrigger>
                    {formData.id_promo_cluster !== "null" && (
                        <PopoverContent side="top" className="text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border-amber-200">
                            Divisi dikunci karena Anda memilih cluster spesifik.
                        </PopoverContent>
                    )}
                </Popover>
              </FormField>
            )}

            <FormField label="Tanggal Mulai" icon={CalendarIcon} required>
                <Popover>
                <PopoverTrigger asChild>
                    <Button type="button" variant="outline" className="w-full h-10 justify-start text-sm font-bold border-border/50 bg-card shadow-sm">
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    {formData.tanggal_mulai ? format(formData.tanggal_mulai, "dd MMM yyyy") : "Pilih Tanggal"}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={formData.tanggal_mulai} onSelect={(d) => d && setFormData({ ...formData, tanggal_mulai: d })} />
                </PopoverContent>
                </Popover>
            </FormField>

            <FormField label="Tanggal Berakhir" icon={CalendarIcon} required>
                <Popover>
                <PopoverTrigger asChild>
                    <Button type="button" variant="outline" className="w-full h-10 justify-start text-sm font-bold border-border/50 bg-card shadow-sm">
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    {formData.tanggal_akhir ? format(formData.tanggal_akhir, "dd MMM yyyy") : "Pilih Tanggal"}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={formData.tanggal_akhir} onSelect={(d) => d && setFormData({ ...formData, tanggal_akhir: d })} />
                </PopoverContent>
                </Popover>
            </FormField>
          </div>
        </div>

        {/* Product Selection */}
        <div className="space-y-4">
          <FormField 
            label={initialData ? "Produk" : `Cari Toko & Produk untuk Grosir (${selectedProductIds.length})`} 
            icon={Package} 
            required
          >
            <Popover open={isProdukPopoverOpen} onOpenChange={setIsProdukPopoverOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                    <Button
                        type="button"
                        variant="outline"
                        className={cn(
                            "w-full justify-between h-12 px-4 bg-card border-2 border-border/60 hover:border-primary/50 shadow-sm text-left font-bold text-sm rounded-xl transition-all",
                            selectedProductIds.length === 0 && "text-muted-foreground"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <Search className="h-4 w-4 text-primary" />
                            <span>{selectedProductIds.length > 0 ? `${selectedProductIds.length} Produk Dipilih` : "Cari produk dengan SKU atau Nama..."}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 opacity-50 transition-transform group-aria-expanded:rotate-180" />
                    </Button>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[550px] p-0 shadow-2xl rounded-2xl border-none overflow-hidden" align="start" sideOffset={8}>
                <div className="flex items-center gap-3 p-4 border-b bg-card">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Search className="h-4 w-4 text-primary" />
                  </div>
                  <input 
                    className="bg-transparent text-sm outline-none w-full font-bold placeholder:text-muted-foreground/50" 
                    placeholder="Contoh: Indomie, P-1002, dsb..." 
                    value={searchProduk}
                    onChange={(e) => setSearchProduk(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                    autoFocus
                  />
                  {searchLoading && <div className="h-4 w-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />}
                </div>
                
                <div className="max-h-[350px] overflow-y-auto w-full pointer-events-auto" onWheel={(e) => e.stopPropagation()} onTouchMove={(e) => e.stopPropagation()}>
                  <div className="p-3 space-y-1.5">
                    {produks.map((p: Produk) => {
                      const isSelected = selectedProductIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border border-transparent",
                            isSelected ? "bg-primary/5 border-primary/20" : "hover:bg-muted/50"
                          )}
                          onClick={() => handleToggleProduct(p)}
                        >
                          <div className={cn(
                              "h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all",
                              isSelected ? "bg-primary border-primary" : "border-border/60"
                          )}>
                              {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                          </div>
                          
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="font-bold text-[13px] text-foreground truncate">{p.nama_produk}</span>
                            <div className="flex items-center gap-3 mt-1">
                               <Badge variant="outline" className="h-5 text-[9px] font-black uppercase bg-muted/50">{p.sku}</Badge>
                               <span className="text-[10px] font-bold text-primary tabular-nums">{formatCurrency(parseFloat(p.harga_jual))}</span>
                               <span className="text-[10px] text-muted-foreground lowercase">Stok: {p.stok_tersedia}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {selectedProductIds.length > 0 && !initialData && (
                  <div className="p-4 border-t bg-muted/30 flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                       {selectedProductIds.length} Produk
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-9 px-4 text-[11px] font-black text-destructive uppercase hover:bg-destructive/10 rounded-xl"
                      onClick={() => setSelectedProductIds([])}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Reset Pilihan
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </FormField>

          {/* Pricing Config */}
          {selectedProductIds.length > 0 && (
            <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-200 shadow-sm space-y-5 animate-in fade-in slide-in-from-top-4">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500 rounded-xl shadow-lg shadow-orange-500/20">
                     <Layers className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                     <h3 className="text-sm font-bold text-orange-900">Aturan Grosir</h3>
                     <p className="text-[10px] text-orange-700/70 font-semibold uppercase tracking-wider">Setiap pembelian minimal akan mendapat harga khusus</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-orange-800 uppercase tracking-widest px-1">Minimal Beli (Qty)</label>
                    <div className="relative">
                       <Input 
                          type="number"
                          value={formData.min_qty}
                          onChange={(e) => setFormData({...formData, min_qty: e.target.value})}
                          className="h-11 bg-white font-bold text-sm pl-10 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-200"
                       />
                       <Boxes className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-orange-800 uppercase tracking-widest px-1">Potongan Persen (%)</label>
                    <div className="relative">
                       <Input 
                          type="number"
                          value={formData.diskon_persen}
                          onChange={(e) => setFormData({...formData, diskon_persen: e.target.value, harga_spesial: ""})}
                          className="h-11 bg-white font-bold text-sm pl-10 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-200"
                       />
                       <Percent className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-orange-800 uppercase tracking-widest px-1">Atau Harga NET (Rp)</label>
                    <div className="relative">
                       <Input 
                          type="number"
                          value={formData.harga_spesial}
                          onChange={(e) => setFormData({...formData, harga_spesial: e.target.value, diskon_persen: ""})}
                          className="h-11 bg-white font-bold text-sm pl-9 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-200"
                       />
                       <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-orange-400">RP</span>
                    </div>
                  </div>
               </div>

               <div className="p-3 bg-white/60 border border-orange-100 rounded-xl flex items-center gap-3">
                  <Info className="h-4 w-4 text-orange-500" />
                  <p className="text-[10px] font-semibold text-orange-800/80">
                     Gunakan salah satu: <span className="font-black text-orange-900">Potongan Persen</span> ATAU <span className="font-black text-orange-900">Harga NET</span>. Nilai yang terakhir diisi akan mengesampingkan yang lain.
                  </p>
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 pt-4 border-t bg-muted/10 backdrop-blur-sm">
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel} className="h-12 px-8 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white dark:hover:bg-black/20">
            Batal
          </Button>
          <Button 
            type="submit" 
            className="h-12 px-14 text-xs font-black uppercase tracking-widest shadow-2xl shadow-orange-500/30 bg-orange-600 text-white rounded-xl hover:scale-[1.02] active:scale-95 transition-all" 
            disabled={loading || selectedProductIds.length === 0}
          >
            {loading ? (
                <div className="flex items-center gap-3">
                    <div className="h-4 w-4 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    <span>{initialData ? "Simpan Perubahan" : `Aktifkan ${selectedProductIds.length} Aturan Grosir`}</span>
                </div>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

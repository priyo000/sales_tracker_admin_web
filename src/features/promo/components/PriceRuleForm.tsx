import React, { useState, useEffect, useMemo } from "react";
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
import { CalendarIcon, Tag, Package, Percent, Save, LayoutGrid, Search, Check, ChevronDown, Trash2, Calculator, ArrowRight, Info } from "lucide-react";
import { format } from "date-fns";
import { useProduk } from "@/features/produk/hooks/useProduk";
import { FormField } from "@/components/ui/FormField";
import { useDivisi } from "@/features/divisi/hooks/useDivisi";
import { cn, formatCurrency } from "@/lib/utils";
import { PromoCluster, PromoAturanHarga } from "../types";
import { Divisi } from "@/features/divisi/types";
import { Produk } from "@/features/produk/types";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PriceRuleFormProps {
  clusters: PromoCluster[];
  initialData?: PromoAturanHarga;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  loading?: boolean;
}

interface ProductPricing {
  id_produk: number;
  diskon_persen: string;
  harga_manual: string;
}

export const PriceRuleForm = ({ clusters, initialData, onSubmit, onCancel, loading }: PriceRuleFormProps) => {
  const { produks, fetchProduks, loading: searchLoading } = useProduk();
  const { divisis, fetchDivisis } = useDivisi();
  const { user } = useAuth();
  const isSuperOrCompanyAdmin = user?.peran === "super_admin" || user?.peran === "admin_perusahaan";

  const [selectedProductIds, setSelectedProductIds] = useState<number[]>(
    initialData?.id_produk ? [initialData.id_produk] : []
  );

  // Map of product details we've seen so far, to keep selected items visible when searching
  const [persistedProdukMap, setPersistedProdukMap] = useState<Record<number, Produk>>(() => {
    if (initialData?.produk) {
      return { [initialData.id_produk]: initialData.produk };
    }
    return {};
  });
  
  const [productPricings, setProductPricings] = useState<Record<number, ProductPricing>>(() => {
    if (initialData) {
      return {
        [initialData.id_produk]: {
          id_produk: initialData.id_produk,
          diskon_persen: initialData.diskon_persen || "",
          harga_manual: initialData.harga_manual || "",
        }
      };
    }
    return {};
  });
  
  const [bulkConfig, setBulkConfig] = useState({
    diskon_persen: initialData?.diskon_persen || "",
    harga_manual: initialData?.harga_manual || "",
  });

  const [targetConfig, setTargetConfig] = useState({
    nama_promo: initialData?.nama_promo || "",
    id_promo_cluster: initialData?.id_promo_cluster?.toString() || "null",
    id_divisi: initialData?.id_divisi?.toString() || "null",
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

  // Safely sync product details to state to avoid ref-during-render issues
  useEffect(() => {
    if (produks.length > 0) {
      setPersistedProdukMap(prev => {
        const next = { ...prev };
        let changed = false;
        produks.forEach(p => {
          if (!next[p.id]) {
            next[p.id] = p;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }
  }, [produks]);

  // Derive details for selected products
  const selectedProduksDetails = useMemo(() => {
    return selectedProductIds
      .map(id => persistedProdukMap[id])
      .filter(Boolean) as Produk[];
  }, [selectedProductIds, persistedProdukMap]);

  const calcPriceFromPercent = (base: number, percent: string) => {
    const p = parseFloat(percent);
    if (isNaN(p)) return "";
    return Math.round(base * (1 - p / 100)).toString();
  };

  const calcPercentFromPrice = (base: number, manual: string) => {
    const m = parseFloat(manual);
    if (isNaN(m) || base === 0) return "";
    return (((base - m) / base) * 100).toFixed(2);
  };

  const updateIndividualPricing = (id: number, field: keyof ProductPricing, value: string) => {
    const pDetail = persistedProdukMap[id];
    const basePrice = parseFloat(pDetail?.harga_jual || "0");

    setProductPricings(prev => {
      const current = prev[id] ? { ...prev[id], [field]: value } : { id_produk: id, diskon_persen: "", harga_manual: "", [field]: value };
      if (field === "diskon_persen") {
        current.harga_manual = calcPriceFromPercent(basePrice, value);
      } else if (field === "harga_manual") {
        current.diskon_persen = calcPercentFromPrice(basePrice, value);
      }
      return { ...prev, [id]: current };
    });
  };

  const handleBulkApply = (field: "diskon_persen" | "harga_manual", value: string) => {
    setBulkConfig(prev => ({ ...prev, [field]: value }));
    const nextPricings = { ...productPricings };
    
    selectedProductIds.forEach(id => {
      const pDetail = persistedProdukMap[id];
      const basePrice = parseFloat(pDetail?.harga_jual || "0");
      
      const item = nextPricings[id] ? { ...nextPricings[id], [field]: value } : { id_produk: id, diskon_persen: "", harga_manual: "", [field]: value };
      if (field === "diskon_persen") {
        item.harga_manual = calcPriceFromPercent(basePrice, value);
      } else {
        item.diskon_persen = calcPercentFromPrice(basePrice, value);
      }
      nextPricings[id] = item;
    });
    setProductPricings(nextPricings);
  };

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
      // Initialize pricing for this product using bulk config if exists
      const basePrice = parseFloat(product.harga_jual || "0");
      setProductPricings(prev => ({
        ...prev,
        [product.id]: {
          id_produk: product.id,
          diskon_persen: bulkConfig.diskon_persen,
          harga_manual: bulkConfig.diskon_persen ? calcPriceFromPercent(basePrice, bulkConfig.diskon_persen) : bulkConfig.harga_manual
        }
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProductIds.length === 0) return;

    const items = selectedProductIds.map(id => ({
        id_produk: id,
        harga_manual: productPricings[id]?.harga_manual || null,
        diskon_persen: productPricings[id]?.diskon_persen || null,
    }));

    onSubmit({
        ...targetConfig,
        items,
        id_promo_cluster: targetConfig.id_promo_cluster === "null" ? null : parseInt(targetConfig.id_promo_cluster),
        id_divisi: targetConfig.id_divisi === "null" ? null : parseInt(targetConfig.id_divisi),
        tanggal_mulai: format(targetConfig.tanggal_mulai, "yyyy-MM-dd"),
        tanggal_akhir: format(targetConfig.tanggal_akhir, "yyyy-MM-dd"),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-[750px] -m-2">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Step 1: Target Scope */}
        <div className="bg-muted/30 p-4 rounded-xl border border-border/50 shadow-inner space-y-4">
          <div className="flex items-center gap-2 mb-1">
             <div className="p-1.5 bg-primary/10 rounded-lg">
                <Calculator className="h-4 w-4 text-primary" />
             </div>
             <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Konfigurasi Target Promo</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
                <FormField label="Nama Promo / Batch" icon={Tag} required>
                    <Input 
                        placeholder="Contoh: Promo Akhir Tahun 2026" 
                        value={targetConfig.nama_promo}
                        onChange={(e) => setTargetConfig({ ...targetConfig, nama_promo: e.target.value })}
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
                value={targetConfig.id_promo_cluster} 
                onValueChange={(val) => {
                  setTargetConfig({ 
                    ...targetConfig, 
                    id_promo_cluster: val,
                    // If cluster is selected, division usually follows the cluster or is global
                    id_divisi: val !== "null" ? "null" : targetConfig.id_divisi 
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
                                value={targetConfig.id_divisi} 
                                onValueChange={(val) => setTargetConfig({ ...targetConfig, id_divisi: val })}
                                disabled={targetConfig.id_promo_cluster !== "null"}
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
                            {targetConfig.id_promo_cluster !== "null" && (
                                <div className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 shadow-sm">
                                    <Info className="h-3 w-3" />
                                </div>
                            )}
                        </div>
                    </PopoverTrigger>
                    {targetConfig.id_promo_cluster !== "null" && (
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
                    <Button variant="outline" className="w-full h-10 justify-start text-sm font-bold border-border/50 bg-card shadow-sm">
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    {format(targetConfig.tanggal_mulai, "dd MMM yyyy")}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={targetConfig.tanggal_mulai} onSelect={(d) => d && setTargetConfig({ ...targetConfig, tanggal_mulai: d })} />
                </PopoverContent>
                </Popover>
            </FormField>

            <FormField label="Tanggal Berakhir" icon={CalendarIcon} required>
                <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-10 justify-start text-sm font-bold border-border/50 bg-card shadow-sm">
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    {format(targetConfig.tanggal_akhir, "dd MMM yyyy")}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={targetConfig.tanggal_akhir} onSelect={(d) => d && setTargetConfig({ ...targetConfig, tanggal_akhir: d })} />
                </PopoverContent>
                </Popover>
            </FormField>
          </div>
        </div>

        {/* Step 2: Product Selector (Optimized for scale) */}
        <div className="space-y-4">
          <FormField 
            label={initialData ? "Produk" : `Cari & Tambah Produk (${selectedProductIds.length})`} 
            icon={Package} 
            required
          >
            <Popover open={isProdukPopoverOpen} onOpenChange={setIsProdukPopoverOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                    <Button
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
                    autoFocus
                  />
                  {searchLoading && <div className="h-4 w-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />}
                </div>
                
                <ScrollArea className="h-[400px]">
                  <div className="p-3 space-y-1.5">
                    {produks.length === 0 && !searchLoading && (
                        <div className="py-20 text-center flex flex-col items-center gap-3">
                            <div className="p-4 bg-muted rounded-full">
                                <Search className="h-8 w-8 text-muted-foreground/30" />
                            </div>
                            <span className="text-xs font-bold text-muted-foreground lowercase">Produk tidak ditemukan</span>
                        </div>
                    )}
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
                </ScrollArea>
                
                {selectedProductIds.length > 0 && (
                  <div className="p-4 border-t bg-muted/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                         <span className="text-[11px] font-black uppercase text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                           {selectedProductIds.length} Produk
                         </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-9 px-4 text-[11px] font-black text-destructive uppercase hover:bg-destructive/10 rounded-xl"
                      onClick={() => { setSelectedProductIds([]); }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Reset Pilihan
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </FormField>

          {/* Pricing Config Section */}
          {selectedProductIds.length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between bg-primary/5 p-4 rounded-2xl border border-primary/20">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
                      <Percent className="h-4 w-4 text-white" />
                   </div>
                   <div className="flex flex-col">
                      <h3 className="text-sm font-bold text-foreground">Pengaturan Promo</h3>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Tentukan diskon atau harga manual setiap produk</p>
                   </div>
                </div>
                
                 {/* Bulk Controls */}
                {!initialData && selectedProductIds.length > 1 && (
                   <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 p-1.5 rounded-xl border border-primary/20">
                      <span className="text-[10px] font-black px-2 text-primary uppercase">Set Semua:</span>
                      <div className="relative">
                        <Input 
                            placeholder="Diskon %" 
                            className="h-8 w-24 text-xs font-bold pl-7 rounded-lg border-primary/20" 
                            type="number" 
                            onBlur={(e) => handleBulkApply("diskon_persen", e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleBulkApply("diskon_persen", (e.target as HTMLInputElement).value);
                                }
                            }}
                        />
                        <Percent className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-primary/40" />
                      </div>
                   </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3">
                {selectedProduksDetails.map((p: Produk) => {
                  const pricing = productPricings[p.id] || { id_produk: p.id, diskon_persen: "", harga_manual: "" };

                  return (
                    <div key={p.id} className="group relative bg-card border-2 border-border/40 rounded-2xl p-4 shadow-sm hover:border-primary/30 transition-all">
                       <div className="flex flex-col xl:flex-row xl:items-center gap-5">
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-2 mb-1.5">
                                <Badge variant="outline" className="h-5 text-[9px] font-black bg-primary/5 text-primary border-primary/10">{p.sku}</Badge>
                                <span className="text-[14px] font-bold text-foreground truncate">{p.nama_produk}</span>
                             </div>
                             <div className="flex items-center gap-2 text-xs">
                                <span className="text-muted-foreground font-medium">Harga Normal:</span>
                                <span className="font-black text-foreground tabular-nums">{formatCurrency(parseFloat(p.harga_jual))}</span>
                             </div>
                          </div>

                          {/* Controls */}
                          <div className="flex items-center gap-4">
                             <div className="flex flex-col gap-1 w-28">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Diskon (%)</label>
                                <div className="relative">
                                   <Input 
                                      type="number"
                                      value={pricing.diskon_persen}
                                      onChange={(e) => updateIndividualPricing(p.id, "diskon_persen", e.target.value)}
                                      onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                              e.preventDefault();
                                          }
                                      }}
                                      className="h-10 bg-muted/40 font-bold text-sm pl-8 border-none rounded-xl focus:ring-2 focus:ring-primary/20"
                                   />
                                   <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
                                </div>
                             </div>

                             <div className="pt-5 opacity-20">
                                <ArrowRight className="h-4 w-4" />
                             </div>

                             <div className="flex flex-col gap-1 flex-1 xl:w-48">
                                <label className="text-[10px] font-black text-primary uppercase tracking-widest px-1">Harga Promo (Lock)</label>
                                <div className="relative">
                                   <Input 
                                      type="number"
                                      value={pricing.harga_manual}
                                      onChange={(e) => updateIndividualPricing(p.id, "harga_manual", e.target.value)}
                                      onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                              e.preventDefault();
                                          }
                                      }}
                                      className="h-10 bg-primary/5 font-bold text-sm pl-9 text-primary border-primary/20 rounded-xl focus:ring-2 focus:ring-primary/20"
                                   />
                                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary/40">RP</span>
                                </div>
                             </div>
                             
                             <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-xl mt-4 xl:mt-0"
                                onClick={() => setSelectedProductIds(prev => prev.filter(id => id !== p.id))}
                             >
                                <Trash2 className="h-4 w-4" />
                             </Button>
                          </div>
                       </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 pt-4 border-t bg-muted/10 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <Info className="h-3.5 w-3.5 text-primary" />
                <span>Tekan 'Enter' atau ketuk 'Buka' untuk menyimpan semua data ini.</span>
            </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel} className="h-12 px-8 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white dark:hover:bg-black/20">
            Batal
          </Button>
          <Button 
            type="submit" 
            className="h-12 px-14 text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/30 bg-primary text-white rounded-xl hover:scale-[1.02] active:scale-95 transition-all" 
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
                    <span>{initialData ? "Simpan Perubahan" : `Aktifkan ${selectedProductIds.length} Aturan Harga`}</span>
                </div>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

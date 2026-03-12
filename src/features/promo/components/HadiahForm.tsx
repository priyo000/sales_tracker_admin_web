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
import { CalendarIcon, Gift, Package, Save, LayoutGrid, Search, Check, ChevronDown, ArrowRight, Zap, Info, Layers, Coins, Tag } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useProductSelect } from "../hooks/useProductSelect";
import { useKategoriProduk } from "@/features/produk/hooks/useKategoriProduk";
import { FormField } from "@/components/ui/FormField";
import { useDivisi } from "@/features/divisi/hooks/useDivisi";
import { cn } from "@/lib/utils";
import { PromoHadiah, PromoCluster } from "../types";
import { Produk } from "@/features/produk/types";
import { useAuth } from "@/hooks/useAuth";

interface HadiahFormProps {
  clusters: PromoCluster[];
  initialData?: PromoHadiah;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const HadiahForm = ({ clusters, initialData, onSubmit, onCancel, loading }: HadiahFormProps) => {
  const { produks: popoverProduks, loading: popoverLoading, loadingMore: popoverLoadingMore, search: popoverSearch, setSearch: setPopoverSearch, idKategori, setIdKategori, hasMore, loadMore } = useProductSelect();
  const { kategoris, fetchKategoris } = useKategoriProduk();
  const { divisis, fetchDivisis } = useDivisi();
  const { user } = useAuth();
  const isSuperOrCompanyAdmin = user?.peran === "super_admin" || user?.peran === "admin_perusahaan";

  const [selectedPemicuIds, setSelectedPemicuIds] = useState<number[]>(
    initialData?.id_produk_pemicu ? 
      (Array.isArray(initialData.id_produk_pemicu) ? initialData.id_produk_pemicu : [initialData.id_produk_pemicu]) 
      : []
  );

  const [persistedProdukMap, setPersistedProdukMap] = useState<Record<number, Produk>>(() => {
    const map: Record<number, Produk> = {};
    if (initialData?.pemicu) {
       if (Array.isArray(initialData.pemicu)) {
          initialData.pemicu.forEach(p => map[p.id] = p);
       } else {
          map[initialData.pemicu.id] = initialData.pemicu;
       }
    }
    if (initialData?.hadiah) {
        map[initialData.id_produk_hadiah] = initialData.hadiah;
    }
    return map;
  });

  const [formData, setFormData] = useState({
    nama_promo: initialData?.nama_promo || "",
    id_divisi: initialData?.id_divisi?.toString() || "null",
    id_promo_cluster: initialData?.id_promo_cluster?.toString() || "null",
    jenis_pemicu: initialData?.jenis_pemicu || "produk",
    min_qty_pemicu: initialData?.min_qty_pemicu?.toString() || "1",
    min_amount_pemicu: initialData?.min_amount_pemicu?.toString() || "0",
    id_produk_hadiah: initialData?.id_produk_hadiah?.toString() || "",
    qty_hadiah: initialData?.qty_hadiah?.toString() || "1",
    harga_tebus: initialData?.harga_tebus?.toString() || "0",
    tanggal_mulai: initialData?.tanggal_mulai ? new Date(initialData.tanggal_mulai) : new Date(),
    tanggal_akhir: initialData?.tanggal_akhir ? new Date(initialData.tanggal_akhir) : new Date(new Date().setMonth(new Date().getMonth() + 1)),
  });

  const [isPemicuPopoverOpen, setIsPemicuPopoverOpen] = useState(false);
  const [isHadiahPopoverOpen, setIsHadiahPopoverOpen] = useState(false);

  useEffect(() => {
    fetchDivisis();
  }, [fetchDivisis]);
  useEffect(() => {
    fetchKategoris();
  }, [fetchKategoris]);

  // useProductSelect handles fetching automatically when popover is open

  // Safely sync product details to state
  // Sync popoverProduks to persisted map without triggering cascading renders in effect body
  // instead of setState, we just update the map if needed when we see new products
  useEffect(() => {
    if (popoverProduks.length > 0) {
      const hasNew = popoverProduks.some(p => !persistedProdukMap[p.id]);
      if (hasNew) {
        // eslint-disable-next-line 
        setPersistedProdukMap(prev => {
            const next = { ...prev };
            popoverProduks.forEach(p => { if (!next[p.id]) next[p.id] = p; });
            return next;
        });
      }
    }
  }, [popoverProduks, persistedProdukMap]);

  const handleTogglePemicu = (product: Produk) => {
    if (initialData) {
      setSelectedPemicuIds([product.id]);
      setIsPemicuPopoverOpen(false);
      return;
    }

    const isSelected = selectedPemicuIds.includes(product.id);
    if (isSelected) {
      setSelectedPemicuIds(prev => prev.filter(id => id !== product.id));
    } else {
      setSelectedPemicuIds(prev => [...prev, product.id]);
    }
  };

  const handleSelectHadiah = (product: Produk) => {
    setFormData({ ...formData, id_produk_hadiah: product.id.toString() });
    setIsHadiahPopoverOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.jenis_pemicu === 'produk' && selectedPemicuIds.length === 0) return;
    if (!formData.id_produk_hadiah) return;

    onSubmit({
      ...formData,
      id_produk_pemicu: formData.jenis_pemicu === 'produk' ? selectedPemicuIds : null,
      id_produk_hadiah: parseInt(formData.id_produk_hadiah),
      qty_hadiah: parseInt(formData.qty_hadiah),
      min_qty_pemicu: parseInt(formData.min_qty_pemicu),
      min_amount_pemicu: parseFloat(formData.min_amount_pemicu),
      harga_tebus: parseFloat(formData.harga_tebus),
      id_divisi: formData.id_divisi === "null" ? null : parseInt(formData.id_divisi),
      id_promo_cluster: formData.id_promo_cluster === "null" ? null : parseInt(formData.id_promo_cluster),
      tanggal_mulai: format(formData.tanggal_mulai, "yyyy-MM-dd"),
      tanggal_akhir: format(formData.tanggal_akhir, "yyyy-MM-dd"),
    });
  };

  const selectedHadiah = formData.id_produk_hadiah ? persistedProdukMap[parseInt(formData.id_produk_hadiah)] : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-2">
      <div className="space-y-6">
        
        {/* Basic Info Group */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <FormField label="Nama Program Promo" icon={Zap} required className="md:col-span-2">
              <Input 
                 value={formData.nama_promo} 
                 onChange={(e) => setFormData({...formData, nama_promo: e.target.value})} 
                 placeholder="Contoh: TEBUS MURAH GELAS CANTIK" 
                 className="h-9 bg-card font-bold uppercase tracking-tight rounded-lg placeholder:opacity-30" 
                 required 
              />
           </FormField>

           {isSuperOrCompanyAdmin && (
             <>
               <FormField label="Target Cluster" icon={Tag}>
                 <Select 
                    value={formData.id_promo_cluster} 
                    onValueChange={(v) => setFormData({
                        ...formData, 
                        id_promo_cluster: v,
                        id_divisi: v !== "null" ? "null" : formData.id_divisi
                    })}
                 >
                   <SelectTrigger className="h-9 bg-card font-bold text-sm rounded-lg">
                     <SelectValue placeholder="Semua Pelanggan" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="null">Seluruh Pelanggan</SelectItem>
                     {clusters.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nama_cluster}</SelectItem>)}
                   </SelectContent>
                 </Select>
               </FormField>

               <FormField label="Target Divisi" icon={LayoutGrid}>
                 <Popover>
                    <PopoverTrigger asChild>
                        <div className="relative group cursor-help">
                            <Select 
                                value={formData.id_divisi} 
                                onValueChange={(v) => setFormData({...formData, id_divisi: v})}
                                disabled={formData.id_promo_cluster !== "null"}
                            >
                                <SelectTrigger className="h-9 bg-card font-bold text-sm rounded-lg disabled:opacity-50">
                                    <SelectValue placeholder="Global (Semua Divisi)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="null">Global (Seluruh Divisi)</SelectItem>
                                    {divisis.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.nama_divisi}</SelectItem>)}
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
           </>
           )}

           <FormField label="Tanggal Mulai" icon={CalendarIcon} required>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className="w-full h-9 justify-start text-sm font-bold border-border/50 bg-card rounded-lg">
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    {format(formData.tanggal_mulai, "dd MMM yyyy", { locale: id })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar locale={id} mode="single" selected={formData.tanggal_mulai} onSelect={d => d && setFormData({ ...formData, tanggal_mulai: d })} />
                </PopoverContent>
              </Popover>
            </FormField>

            <FormField label="Tanggal Berakhir" icon={CalendarIcon} required>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className="w-full h-9 justify-start text-sm font-bold border-border/50 bg-card rounded-lg">
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    {format(formData.tanggal_akhir, "dd MMM yyyy", { locale: id })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar locale={id} mode="single" selected={formData.tanggal_akhir} onSelect={d => d && setFormData({ ...formData, tanggal_akhir: d })} />
                </PopoverContent>
              </Popover>
            </FormField>
        </div>

        {/* Trigger / Pemicu Section */}
        <div className="bg-muted/30 p-5 rounded-lg border border-border space-y-5">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="p-1.5 bg-primary/10 rounded-lg">
                    <ArrowRight className="h-4 w-4 text-primary" />
                 </div>
                 <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pemicu Promo</span>
              </div>
              <Select value={formData.jenis_pemicu} onValueChange={(v: 'produk' | 'total_nota') => setFormData({...formData, jenis_pemicu: v})}>
                  <SelectTrigger className="h-8 w-fit bg-white px-3 font-bold text-[10px] uppercase rounded-lg border-primary/20 text-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="produk">Melalui Produk</SelectItem>
                    <SelectItem value="nota">Melalui Total Nota</SelectItem>
                  </SelectContent>
              </Select>
           </div>

           {formData.jenis_pemicu === 'produk' ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                 <div className="md:col-span-3">
                    <FormField label={`Pilih Produk Pemicu (${selectedPemicuIds.length})`} icon={Package} required>
                        <Popover open={isPemicuPopoverOpen} onOpenChange={setIsPemicuPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full h-9 justify-between bg-white font-bold text-sm rounded-lg">
                                    <span className="truncate">{selectedPemicuIds.length > 0 ? `${selectedPemicuIds.length} Produk Dipilih` : "Cari produk pemicu..."}</span>
                                    <ChevronDown className="h-4 w-4 opacity-30" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[450px] p-0 shadow-2xl rounded-lg border-none overflow-hidden" sideOffset={8}>
                                <div className="p-3 border-b bg-card flex items-center gap-2">
                                    <Search className="h-4 w-4 text-muted-foreground" />
                                    <input className="bg-transparent text-sm font-bold outline-none w-full" placeholder="Cari..." value={popoverSearch} onChange={(e) => setPopoverSearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} />
                                    {popoverLoading && <div className="h-4 w-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />}
                                </div>
                                <div className="px-3 py-2 border-b bg-muted/30">
                                  <select
                                    className="w-full h-8 text-xs font-bold bg-white border border-border rounded-lg px-3 outline-none focus:ring-2 focus:ring-primary/20"
                                    value={idKategori}
                                    onChange={e => setIdKategori(e.target.value)}
                                  >
                                    <option value="">Semua Kategori</option>
                                    {kategoris.map(kat => (
                                      <option key={kat.id} value={kat.id.toString()}>{kat.nama_kategori}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
                                    <div className="p-2 space-y-1">
                                        {popoverProduks.map(p => {
                                            const isSelected = selectedPemicuIds.includes(p.id);
                                            return (
                                                <div key={p.id} className={cn("flex items-center gap-3 p-3 rounded-lg transition-all", isSelected ? "bg-primary/5" : "hover:bg-muted/50 cursor-pointer")} onClick={() => handleTogglePemicu(p)}>
                                                    <div className={cn("h-4 w-4 rounded border flex items-center justify-center", isSelected ? "bg-primary border-primary" : "border-border/60")}>
                                                        {isSelected && <Check className="h-3 w-3 text-white" />}
                                                    </div>
                                                    <div className="flex flex-col flex-1 min-w-0">
                                                        <span className="font-bold text-[12px] truncate">{p.nama_produk}</span>
                                                        <span className="text-[9px] uppercase font-bold opacity-30">{p.sku}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                {hasMore && (
                                  <div className="p-2 border-t bg-muted/30 text-center">
                                    <button 
                                      type="button"
                                      className="text-[10px] font-semibold text-primary hover:underline"
                                      onClick={() => loadMore()}
                                      disabled={popoverLoadingMore}
                                    >
                                      {popoverLoadingMore ? "Memuat..." : "Tampilkan lebih banyak"}
                                    </button>
                                  </div>
                                )}
                            </PopoverContent>
                        </Popover>
                    </FormField>
                 </div>
                 <div>
                    <FormField label="Min Qty" icon={Layers}>
                        <Input type="number" value={formData.min_qty_pemicu} onChange={(e) => setFormData({...formData, min_qty_pemicu: e.target.value})} className="h-9 bg-white font-bold text-center text-sm rounded-lg" />
                    </FormField>
                 </div>
              </div>
           ) : (
              <FormField label="Minimum Total Pembayaran Per Nota (Rp)" icon={Coins}>
                 <div className="relative">
                    <Input type="number" value={formData.min_amount_pemicu} onChange={(e) => setFormData({...formData, min_amount_pemicu: e.target.value})} className="h-9 bg-white font-bold pl-10 text-base rounded-lg border-emerald-200" />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">RP</span>
                 </div>
              </FormField>
           )}
        </div>

        {/* Gift / Hadiah Section */}
        <div className="bg-emerald-50/50 p-6 rounded-lg border-2 border-dashed border-emerald-200 space-y-5 animate-in fade-in slide-in-from-bottom-4">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-lg shadow-lg shadow-emerald-500/20">
                 <Gift className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col">
                 <h3 className="text-sm font-bold text-emerald-900">Hadiah & Tebus Murah</h3>
                 <p className="text-[10px] text-emerald-700/70 font-semibold uppercase tracking-wider">Tentukan item yang akan diberikan kepada pelanggan</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2">
                 <FormField label="Pilih Produk Hadiah" icon={Package} required>
                    <Popover open={isHadiahPopoverOpen} onOpenChange={setIsHadiahPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full h-9 justify-between bg-white border-emerald-100 font-bold text-sm rounded-lg">
                                <span className="truncate">{selectedHadiah ? selectedHadiah.nama_produk : "Cari hadiah..."}</span>
                                <ChevronDown className="h-4 w-4 opacity-30" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[450px] p-0 shadow-2xl rounded-lg border-none overflow-hidden" sideOffset={8}>
                            <div className="p-3 border-b bg-card flex items-center gap-2">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                <input className="bg-transparent text-sm font-bold outline-none w-full" placeholder="Cari..." value={popoverSearch} onChange={(e) => setPopoverSearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} />
                                {popoverLoading && <div className="h-4 w-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />}
                            </div>
                            <div className="px-3 py-2 border-b bg-muted/30">
                              <select
                                className="w-full h-8 text-xs font-bold bg-white border border-border rounded-lg px-3 outline-none focus:ring-2 focus:ring-primary/20"
                                value={idKategori}
                                onChange={e => setIdKategori(e.target.value)}
                              >
                                <option value="">Semua Kategori</option>
                                {kategoris.map(kat => (
                                  <option key={kat.id} value={kat.id.toString()}>{kat.nama_kategori}</option>
                                ))}
                              </select>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
                                <div className="p-2 space-y-1">
                                    {popoverProduks.map(p => (
                                        <div key={p.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-emerald-50 cursor-pointer" onClick={() => handleSelectHadiah(p)}>
                                           <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                              <Gift className="h-4 w-4 text-emerald-600" />
                                           </div>
                                           <div className="flex flex-col flex-1 min-w-0">
                                              <span className="font-bold text-[12px] truncate">{p.nama_produk}</span>
                                              <span className="text-[9px] uppercase font-bold opacity-30 italic">{p.sku}</span>
                                           </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {hasMore && (
                                <div className="p-2 border-t bg-muted/30 text-center">
                                  <button 
                                    type="button"
                                    className="text-[10px] font-semibold text-primary hover:underline"
                                    onClick={() => loadMore()}
                                    disabled={popoverLoadingMore}
                                  >
                                    {popoverLoadingMore ? "Memuat..." : "Tampilkan lebih banyak"}
                                  </button>
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>
                 </FormField>
              </div>

              <div>
                <FormField label="Qty" icon={Layers}>
                    <Input type="number" value={formData.qty_hadiah} onChange={(e) => setFormData({...formData, qty_hadiah: e.target.value})} className="h-9 bg-white border-emerald-100 font-bold text-center text-sm rounded-lg" />
                </FormField>
              </div>

              <div>
                <FormField label="Harga Tebus" icon={Save}>
                    <div className="relative">
                        <Input type="number" value={formData.harga_tebus} onChange={(e) => setFormData({...formData, harga_tebus: e.target.value})} className="h-9 bg-white border-emerald-100 font-bold pl-8 text-sm rounded-lg" />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-400">RP</span>
                    </div>
                </FormField>
              </div>
           </div>

           <div className="p-3 bg-white/60 border border-emerald-100 rounded-lg flex items-center gap-3">
              <Info className="h-4 w-4 text-emerald-500" />
              <p className="text-[10px] font-semibold text-emerald-800/80 uppercase tracking-tight">
                 Harga tebus <span className="font-bold text-emerald-600">RP 0</span> berarti hadiah diberikan secara <span className="font-bold text-emerald-600 underline">GRATIS</span>.
              </p>
           </div>
        </div>
      </div>
      {/* Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t font-semibold">
        <Button variant="ghost" onClick={onCancel} className="h-9 px-8 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground rounded-lg">
          Batal
        </Button>
        <Button 
          type="submit" 
          className="h-9 px-10 text-[10px] font-bold uppercase tracking-wider shadow-md shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all" 
          disabled={loading || !formData.id_produk_hadiah || (formData.jenis_pemicu === 'produk' && selectedPemicuIds.length === 0)}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Menyimpan...</span>
            </div>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              <span>{initialData ? "Simpan Perubahan" : `Aktifkan Program Hadiah`}</span>
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};

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
import {
  CalendarIcon, Tag, Package, Percent, Save, LayoutGrid, Search,
  Check, ChevronDown, Trash2, Info, Layers, Boxes, Plus, AlertCircle, ArrowRight
} from "lucide-react";
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

interface PriceTier {
  id: string;
  min_qty: string;
  harga_spesial: string;
  diskon_persen: string;
}

interface GrosirFormProps {
  clusters: PromoCluster[];
  initialData?: PromoGrosir;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const newTier = (): PriceTier => ({
  id: Math.random().toString(36).slice(2),
  min_qty: "",
  harga_spesial: "",
  diskon_persen: "",
});

export const GrosirForm = ({ clusters, initialData, onSubmit, onCancel, loading }: GrosirFormProps) => {
  const { produks, fetchProduks, loading: searchLoading } = useProduk();
  const { divisis, fetchDivisis } = useDivisi();
  const { user } = useAuth();
  const isSuperOrCompanyAdmin = user?.peran === "super_admin" || user?.peran === "admin_perusahaan";

  const [selectedProductIds, setSelectedProductIds] = useState<number[]>(
    initialData?.id_produk ? [initialData.id_produk] : []
  );

  const [persistedProdukMap, setPersistedProdukMap] = useState<Record<number, Produk>>(() => {
    if (initialData?.produk) return { [initialData.id_produk]: initialData.produk };
    return {};
  });

  const [formData, setFormData] = useState({
    nama_promo: initialData?.nama_promo || "",
    id_promo_cluster: initialData?.id_promo_cluster?.toString() || "null",
    id_divisi: initialData?.id_divisi?.toString() || "null",
    tanggal_mulai: initialData?.tanggal_mulai ? new Date(initialData.tanggal_mulai) : new Date(),
    tanggal_akhir: initialData?.tanggal_akhir
      ? new Date(initialData.tanggal_akhir)
      : new Date(new Date().setMonth(new Date().getMonth() + 1)),
  });

  // Tiers — for edit mode seed from initial data
  const [tiers, setTiers] = useState<PriceTier[]>(() => {
    if (initialData) {
      return [{
        id: "init",
        min_qty: initialData.min_qty?.toString() || "1",
        harga_spesial: initialData.harga_spesial || "",
        diskon_persen: initialData.diskon_persen || "",
      }];
    }
    return [newTier()];
  });

  const [searchProduk, setSearchProduk] = useState("");
  const [isProdukPopoverOpen, setIsProdukPopoverOpen] = useState(false);

  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => { fetchDivisis(); }, [fetchDivisis]);

  useEffect(() => {
    if (isProdukPopoverOpen) {
      const timer = setTimeout(() => {
        fetchProduks({ search: searchProduk, per_page: 30 });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [fetchProduks, searchProduk, isProdukPopoverOpen]);

  useEffect(() => {
    if (produks.length > 0) {
      const hasNew = produks.some(p => !persistedProdukMap[p.id]);
      if (hasNew) {
        setPersistedProdukMap(prev => {
          const next = { ...prev };
          produks.forEach(p => { if (!next[p.id]) next[p.id] = p; });
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
    setSelectedProductIds(prev =>
      prev.includes(product.id) ? prev.filter(id => id !== product.id) : [...prev, product.id]
    );
  };

  const handleSelectAllFiltered = () => {
    const ids = produks.map(p => p.id);
    setSelectedProductIds(prev => {
      const merged = [...new Set([...prev, ...ids])];
      ids.forEach(id => {
        const p = produks.find(x => x.id === id);
        if (p) setPersistedProdukMap(m => ({ ...m, [id]: p }));
      });
      return merged;
    });
  };

  // --- Tier management ---
  const addTier = () => setTiers(prev => [...prev, newTier()]);

  const removeTier = (id: string) =>
    setTiers(prev => prev.length > 1 ? prev.filter(t => t.id !== id) : prev);

  const updateTier = (id: string, field: keyof Omit<PriceTier, "id">, value: string) => {
    setTiers(prev => prev.map(t => {
      if (t.id !== id) return t;
      // Mutually exclusive: if filling one, clear the other
      if (field === "diskon_persen" && value) return { ...t, diskon_persen: value, harga_spesial: "" };
      if (field === "harga_spesial" && value) return { ...t, harga_spesial: value, diskon_persen: "" };
      return { ...t, [field]: value };
    }));
  };

  const validate = (): boolean => {
    const errs: string[] = [];
    if (selectedProductIds.length === 0) errs.push("Pilih minimal 1 produk.");
    if (!formData.nama_promo.trim()) errs.push("Nama promo wajib diisi.");

    const sortedTiers = [...tiers].sort((a, b) => parseInt(a.min_qty) - parseInt(b.min_qty));
    const tierQtys = new Set<string>();

    sortedTiers.forEach((t, i) => {
      if (!t.min_qty || parseInt(t.min_qty) < 1) errs.push(`Tier ${i + 1}: Minimal qty harus diisi dan > 0.`);
      if (!t.harga_spesial && !t.diskon_persen) errs.push(`Tier ${i + 1}: Isi Harga NET atau Diskon %.`);
      if (tierQtys.has(t.min_qty)) errs.push(`Tier ${i + 1}: Min qty duplikat (${t.min_qty}).`);
      tierQtys.add(t.min_qty);
    });

    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const sortedTiers = [...tiers]
      .sort((a, b) => parseInt(a.min_qty) - parseInt(b.min_qty))
      .map(t => ({
        min_qty: parseInt(t.min_qty),
        harga_spesial: t.harga_spesial ? parseFloat(t.harga_spesial) : null,
        diskon_persen: t.diskon_persen ? parseFloat(t.diskon_persen) : null,
      }));

    onSubmit({
      nama_promo: formData.nama_promo,
      id_produk: initialData ? selectedProductIds[0] : selectedProductIds,
      id_promo_cluster: formData.id_promo_cluster === "null" ? null : parseInt(formData.id_promo_cluster),
      id_divisi: formData.id_divisi === "null" ? null : parseInt(formData.id_divisi),
      tanggal_mulai: format(formData.tanggal_mulai, "yyyy-MM-dd"),
      tanggal_akhir: format(formData.tanggal_akhir, "yyyy-MM-dd"),
      tiers: sortedTiers,
    });
  };

  const sortedTiersPreview = [...tiers].sort((a, b) => parseInt(a.min_qty || "0") - parseInt(b.min_qty || "0"));
  const totalRows = selectedProductIds.length * tiers.length;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-[790px] -m-2">
      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* === Section 1: Campaign Info === */}
        <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-primary/10 rounded-lg"><Tag className="h-4 w-4 text-primary" /></div>
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Info Campaign</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormField label="Nama Kampanye Grosir" icon={Tag} required>
                <Input
                  placeholder="Contoh: Grosir Lebaran 2026"
                  value={formData.nama_promo}
                  onChange={(e) => setFormData({ ...formData, nama_promo: e.target.value })}
                  className="h-10 bg-card border-border/50 text-sm font-semibold"
                  required
                  onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                />
              </FormField>
            </div>

            <FormField label="Target Cluster" icon={Tag}>
              <Select
                value={formData.id_promo_cluster}
                onValueChange={(val) => setFormData({ ...formData, id_promo_cluster: val, id_divisi: val !== "null" ? "null" : formData.id_divisi })}
              >
                <SelectTrigger className="h-10 bg-card border-border/50 text-sm font-semibold">
                  <SelectValue placeholder="Seluruh Pelanggan" />
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
              </FormField>
            )}

            <FormField label="Tanggal Mulai" icon={CalendarIcon} required>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className="w-full h-10 justify-start text-sm font-bold border-border/50 bg-card">
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    {format(formData.tanggal_mulai, "dd MMM yyyy")}
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
                  <Button type="button" variant="outline" className="w-full h-10 justify-start text-sm font-bold border-border/50 bg-card">
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    {format(formData.tanggal_akhir, "dd MMM yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={formData.tanggal_akhir} onSelect={(d) => d && setFormData({ ...formData, tanggal_akhir: d })} />
                </PopoverContent>
              </Popover>
            </FormField>
          </div>
        </div>

        {/* === Section 2: Product Selection === */}
        <div className="space-y-3">
          <FormField
            label={`Produk yang Diikutkan (${selectedProductIds.length} dipilih)`}
            icon={Package}
            required
          >
            <Popover open={isProdukPopoverOpen} onOpenChange={setIsProdukPopoverOpen}>
              <PopoverTrigger asChild>
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
                    <span>{selectedProductIds.length > 0 ? `${selectedProductIds.length} Produk Dipilih` : "Cari produk..."}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[580px] p-0 shadow-2xl rounded-2xl border-none overflow-hidden" align="start" sideOffset={8}>
                <div className="flex items-center gap-3 p-4 border-b bg-card">
                  <div className="bg-primary/10 p-2 rounded-lg"><Search className="h-4 w-4 text-primary" /></div>
                  <input
                    className="bg-transparent text-sm outline-none w-full font-bold placeholder:text-muted-foreground/50"
                    placeholder="Cari nama produk atau SKU..."
                    value={searchProduk}
                    onChange={(e) => setSearchProduk(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                    autoFocus
                  />
                  {searchLoading && <div className="h-4 w-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />}
                </div>

                <div className="max-h-[320px] overflow-y-auto w-full pointer-events-auto" onWheel={(e) => e.stopPropagation()} onTouchMove={(e) => e.stopPropagation()}>
                  <div className="p-3 space-y-1">
                    {produks.map((p: Produk) => {
                      const isSelected = selectedProductIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          className={cn(
                            "flex items-center gap-4 p-3.5 rounded-xl cursor-pointer transition-all border border-transparent",
                            isSelected ? "bg-primary/5 border-primary/20" : "hover:bg-muted/50"
                          )}
                          onClick={() => handleToggleProduct(p)}
                        >
                          <div className={cn("h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0", isSelected ? "bg-primary border-primary" : "border-border/60")}>
                            {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                          </div>
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="font-bold text-[13px] text-foreground truncate">{p.nama_produk}</span>
                            <div className="flex items-center gap-3 mt-0.5">
                              <Badge variant="outline" className="h-5 text-[9px] font-black uppercase bg-muted/50">{p.sku}</Badge>
                              <span className="text-[10px] font-bold text-primary tabular-nums">{formatCurrency(parseFloat(p.harga_jual))}</span>
                              <span className="text-[10px] text-muted-foreground">Stok: {p.stok_tersedia}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {produks.length === 0 && !searchLoading && (
                      <div className="py-8 text-center text-muted-foreground text-xs font-semibold">Ketik untuk mencari produk</div>
                    )}
                  </div>
                </div>

                <div className="p-4 border-t bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                      {selectedProductIds.length} Dipilih
                    </span>
                    {produks.length > 0 && !initialData && (
                      <Button type="button" variant="outline" size="sm" className="h-8 px-3 text-[11px] font-bold rounded-xl border-primary/30 text-primary hover:bg-primary/10"
                        onClick={handleSelectAllFiltered}>
                        + Semua ({produks.length})
                      </Button>
                    )}
                  </div>
                  {selectedProductIds.length > 0 && !initialData && (
                    <Button type="button" variant="ghost" size="sm" className="h-8 px-3 text-[11px] font-black text-destructive hover:bg-destructive/10 rounded-xl"
                      onClick={() => setSelectedProductIds([])}>
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Reset
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </FormField>

          {/* Selected products pills */}
          {selectedProductIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
              {selectedProductIds.map(id => {
                const p = persistedProdukMap[id];
                return p ? (
                  <div key={id} className="flex items-center gap-1.5 bg-primary/5 border border-primary/20 rounded-full px-2.5 py-1 text-[11px] font-semibold text-foreground">
                    <span className="max-w-[120px] truncate">{p.nama_produk}</span>
                    {!initialData && (
                      <button type="button" className="text-muted-foreground hover:text-destructive transition-colors" onClick={() => setSelectedProductIds(prev => prev.filter(i => i !== id))}>×</button>
                    )}
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* === Section 3: Harga Bertingkat === */}
        <div className="bg-orange-50/60 p-5 rounded-2xl border border-orange-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-xl shadow-lg shadow-orange-500/20">
                <Layers className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-orange-900">Harga Bertingkat (Tiers)</h3>
                <p className="text-[10px] text-orange-700/70 font-semibold uppercase tracking-wider mt-0.5">Semakin banyak beli, semakin murah</p>
              </div>
            </div>
            <Button
              type="button"
              onClick={addTier}
              size="sm"
              className="h-8 px-3 text-[11px] font-black bg-orange-600 hover:bg-orange-700 text-white rounded-xl gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Tambah Tier
            </Button>
          </div>

          {/* Tier list */}
          <div className="space-y-3">
            {tiers.map((tier, idx) => (
              <div key={tier.id} className="bg-white rounded-xl border border-orange-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-orange-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </div>
                  <span className="text-xs font-bold text-orange-800 uppercase tracking-wide">
                    Tier {idx + 1} {idx === 0 ? "— Minimum Pembelian Terendah" : idx === tiers.length - 1 ? "— Tier Tertinggi" : ""}
                  </span>
                  {tiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTier(tier.id)}
                      className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 items-end">
                  {/* Min Qty */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-orange-800 uppercase tracking-widest px-0.5">Min. Beli (Pcs)</label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        placeholder="cth. 10"
                        value={tier.min_qty}
                        onChange={(e) => updateTier(tier.id, "min_qty", e.target.value)}
                        className="h-10 bg-orange-50 font-bold text-sm pl-9 border-orange-200 rounded-xl"
                      />
                      <Boxes className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
                    </div>
                  </div>

                  {/* Diskon % */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-orange-800 uppercase tracking-widest px-0.5">Diskon %</label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="cth. 10"
                        value={tier.diskon_persen}
                        onChange={(e) => updateTier(tier.id, "diskon_persen", e.target.value)}
                        className={cn(
                          "h-10 font-bold text-sm pl-9 border-orange-200 rounded-xl",
                          tier.diskon_persen ? "bg-emerald-50 border-emerald-300" : "bg-orange-50"
                        )}
                      />
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
                    </div>
                  </div>

                  {/* Harga NET */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-orange-800 uppercase tracking-widest px-0.5">Atau Harga NET (Rp)</label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        placeholder="cth. 45000"
                        value={tier.harga_spesial}
                        onChange={(e) => updateTier(tier.id, "harga_spesial", e.target.value)}
                        className={cn(
                          "h-10 font-bold text-sm pl-8 border-orange-200 rounded-xl",
                          tier.harga_spesial ? "bg-orange-50 border-orange-400" : "bg-orange-50"
                        )}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-orange-400">Rp</span>
                    </div>
                  </div>
                </div>

                {/* Tier preview row */}
                {tier.min_qty && (tier.diskon_persen || tier.harga_spesial) && (
                  <div className="mt-3 flex items-center gap-2 bg-orange-50 rounded-lg px-3 py-2 border border-orange-100">
                    <Boxes className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
                    <span className="text-[11px] font-bold text-orange-800">
                      Beli ≥ <strong>{tier.min_qty} pcs</strong>
                    </span>
                    <ArrowRight className="h-3 w-3 text-orange-400" />
                    {tier.diskon_persen ? (
                      <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Diskon {tier.diskon_persen}%</span>
                    ) : (
                      <span className="text-[11px] font-black text-orange-700 bg-orange-100 px-2 py-0.5 rounded-md">Harga Rp{parseFloat(tier.harga_spesial).toLocaleString('id-ID')}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-3 bg-white/60 border border-orange-100 rounded-xl flex items-start gap-2.5">
            <Info className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] font-semibold text-orange-800/80 leading-relaxed">
              Setiap tier akan diterapkan ke <strong>semua produk</strong> yang dipilih di atas. Pilih salah satu: <strong>Diskon %</strong> atau <strong>Harga NET</strong> per tier.
            </p>
          </div>
        </div>

        {/* === Summary Preview === */}
        {selectedProductIds.length > 0 && tiers.some(t => t.min_qty) && (
          <div className="bg-card border border-border/50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Preview Konfigurasi</span>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black">
                {totalRows} Aturan akan dibuat
              </Badge>
            </div>
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-3 py-2 font-black text-muted-foreground uppercase text-[10px] tracking-wide">Tier</th>
                    <th className="text-left px-3 py-2 font-black text-muted-foreground uppercase text-[10px] tracking-wide">Min. Qty</th>
                    <th className="text-left px-3 py-2 font-black text-muted-foreground uppercase text-[10px] tracking-wide">Benefit</th>
                    <th className="text-right px-3 py-2 font-black text-muted-foreground uppercase text-[10px] tracking-wide">Produk</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTiersPreview.filter(t => t.min_qty).map((t, i) => (
                    <tr key={t.id} className="border-t">
                      <td className="px-3 py-2">
                        <span className="bg-orange-100 text-orange-700 font-black text-[10px] px-2 py-0.5 rounded">Tier {i + 1}</span>
                      </td>
                      <td className="px-3 py-2 font-bold">≥ {t.min_qty} pcs</td>
                      <td className="px-3 py-2">
                        {t.diskon_persen && <span className="font-black text-emerald-600">Diskon {t.diskon_persen}%</span>}
                        {t.harga_spesial && <span className="font-black text-orange-600">Rp{parseFloat(t.harga_spesial).toLocaleString('id-ID')}</span>}
                        {!t.diskon_persen && !t.harga_spesial && <span className="text-muted-foreground italic">—</span>}
                      </td>
                      <td className="px-3 py-2 text-right font-bold">{selectedProductIds.length} produk</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* === Validation Errors === */}
        {errors.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-destructive font-black text-xs uppercase">
              <AlertCircle className="h-4 w-4" /> Perhatian
            </div>
            {errors.map((err, i) => (
              <p key={i} className="text-xs text-destructive font-semibold">• {err}</p>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-5 pt-4 border-t bg-muted/10">
        <div className="flex justify-between items-center">
          <div className="text-[11px] text-muted-foreground font-semibold">
            {selectedProductIds.length > 0 && tiers.length > 0 ? (
              <span><strong className="text-foreground">{selectedProductIds.length}</strong> produk × <strong className="text-foreground">{tiers.length}</strong> tier = <strong className="text-orange-600">{totalRows} aturan</strong></span>
            ) : null}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={onCancel} className="h-11 px-6 text-xs font-black uppercase tracking-widest rounded-xl">
              Batal
            </Button>
            <Button
              type="submit"
              className="h-11 px-10 text-xs font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 bg-orange-600 text-white rounded-xl hover:bg-orange-700 hover:scale-[1.02] active:scale-95 transition-all"
              disabled={loading || selectedProductIds.length === 0}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  <span>{initialData ? "Simpan" : `Buat ${totalRows > 0 ? totalRows + " Aturan" : "Campaign"}`}</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

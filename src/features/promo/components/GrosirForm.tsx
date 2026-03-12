import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  CalendarIcon, Tag, Package, Percent, Save, LayoutGrid, Search,
  Check, ChevronDown, Trash2, Info, Boxes, Plus, AlertCircle,
  ArrowRight, ChevronUp
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useProductSelect } from "../hooks/useProductSelect";
import { useKategoriProduk } from "@/features/produk/hooks/useKategoriProduk";
import { FormField } from "@/components/ui/FormField";
import { useDivisi } from "@/features/divisi/hooks/useDivisi";
import { cn, formatCurrency } from "@/lib/utils";
import { PromoCluster, PromoGrosir } from "../types";
import { Divisi } from "@/features/divisi/types";
import { Produk } from "@/features/produk/types";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PriceTier {
  id: string;
  min_qty: string;
  diskon_persen: string;
  harga_spesial: string;   // calculated or manual
  mode: "diskon" | "harga"; // which field is primary
}

interface ProductEntry {
  produk: Produk;
  tiers: PriceTier[];
  collapsed: boolean;
}

interface GrosirFormProps {
  clusters: PromoCluster[];
  initialData?: PromoGrosir;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  loading?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeTierId = () => Math.random().toString(36).slice(2);

const emptyTier = (): PriceTier => ({
  id: makeTierId(),
  min_qty: "",
  diskon_persen: "",
  harga_spesial: "",
  mode: "diskon",
});

const calcHarga = (hargaAsli: number, diskon: string): string => {
  const d = parseFloat(diskon);
  if (!d || d <= 0 || d >= 100) return "";
  return Math.round(hargaAsli * (1 - d / 100)).toString();
};

const calcDiskon = (hargaAsli: number, harga: string): string => {
  const h = parseFloat(harga);
  if (!h || h <= 0 || h >= hargaAsli) return "";
  return ((1 - h / hargaAsli) * 100).toFixed(2);
};

// ─── Component ───────────────────────────────────────────────────────────────

export const GrosirForm = ({ clusters, initialData, onSubmit, onCancel, loading }: GrosirFormProps) => {
  const { produks: popoverProduks, loading: popoverLoading, loadingMore: popoverLoadingMore, search: popoverSearch, setSearch: setPopoverSearch, idKategori, setIdKategori, hasMore, loadMore } = useProductSelect();
  const { kategoris, fetchKategoris } = useKategoriProduk();
  const { divisis, fetchDivisis } = useDivisi();
  const { user } = useAuth();
  const isSuperOrCompanyAdmin = user?.peran === "super_admin" || user?.peran === "admin_perusahaan";

  const [formData, setFormData] = useState({
    nama_promo: initialData?.nama_promo || "",
    id_promo_cluster: initialData?.id_promo_cluster?.toString() || "null",
    id_divisi: initialData?.id_divisi?.toString() || "null",
    tanggal_mulai: initialData?.tanggal_mulai ? new Date(initialData.tanggal_mulai) : new Date(),
    tanggal_akhir: initialData?.tanggal_akhir
      ? new Date(initialData.tanggal_akhir)
      : new Date(new Date().setMonth(new Date().getMonth() + 1)),
  });

  // Product entries — each product has its own tier list
  const [productEntries, setProductEntries] = useState<ProductEntry[]>(() => {
    if (initialData?.produk) {
      return [{
        produk: initialData.produk as Produk,
        tiers: [{
          id: "init",
          min_qty: initialData.min_qty?.toString() || "1",
          diskon_persen: initialData.diskon_persen || "",
          harga_spesial: initialData.harga_spesial || "",
          mode: initialData.diskon_persen ? "diskon" : "harga",
        }],
        collapsed: false,
      }];
    }
    return [];
  });

  const [isProdukPopoverOpen, setIsProdukPopoverOpen] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => { fetchDivisis(); }, [fetchDivisis]);
  useEffect(() => { fetchKategoris(); }, [fetchKategoris]);

  // useProductSelect handles fetching automatically when popover is open

  // ─── Product management ─────────────────────────────────────────────────

  const addProduct = (p: Produk) => {
    if (initialData) return; // edit mode: single product
    const alreadyIn = productEntries.some(e => e.produk.id === p.id);
    if (alreadyIn) {
      setProductEntries(prev => prev.filter(e => e.produk.id !== p.id));
      return;
    }
    setProductEntries(prev => [...prev, { produk: p, tiers: [emptyTier()], collapsed: false }]);
  };

  const removeProduct = (produkId: number) =>
    setProductEntries(prev => prev.filter(e => e.produk.id !== produkId));

  const toggleCollapse = (produkId: number) =>
    setProductEntries(prev => prev.map(e =>
      e.produk.id === produkId ? { ...e, collapsed: !e.collapsed } : e
    ));

  // ─── Tier management ────────────────────────────────────────────────────

  const addTier = (produkId: number) =>
    setProductEntries(prev => prev.map(e =>
      e.produk.id === produkId ? { ...e, tiers: [...e.tiers, emptyTier()] } : e
    ));

  const removeTier = (produkId: number, tierId: string) =>
    setProductEntries(prev => prev.map(e => {
      if (e.produk.id !== produkId || e.tiers.length <= 1) return e;
      return { ...e, tiers: e.tiers.filter(t => t.id !== tierId) };
    }));

  const updateTierDiskon = (produkId: number, tierId: string, diskon: string) => {
    setProductEntries(prev => prev.map(e => {
      if (e.produk.id !== produkId) return e;
      const hargaAsli = parseFloat(e.produk.harga_jual);
      return {
        ...e, tiers: e.tiers.map(t => t.id !== tierId ? t : {
          ...t,
          mode: "diskon",
          diskon_persen: diskon,
          harga_spesial: calcHarga(hargaAsli, diskon),
        })
      };
    }));
  };

  const updateTierHarga = (produkId: number, tierId: string, harga: string) => {
    setProductEntries(prev => prev.map(e => {
      if (e.produk.id !== produkId) return e;
      const hargaAsli = parseFloat(e.produk.harga_jual);
      return {
        ...e, tiers: e.tiers.map(t => t.id !== tierId ? t : {
          ...t,
          mode: "harga",
          harga_spesial: harga,
          diskon_persen: calcDiskon(hargaAsli, harga),
        })
      };
    }));
  };

  const updateTierMinQty = (produkId: number, tierId: string, qty: string) =>
    setProductEntries(prev => prev.map(e =>
      e.produk.id !== produkId ? e : {
        ...e, tiers: e.tiers.map(t => t.id !== tierId ? t : { ...t, min_qty: qty })
      }
    ));

  // ─── Copy tiers from first product to all ──────────────────────────────
  const copyTiersToAll = (sourceProdukId: number) => {
    const source = productEntries.find(e => e.produk.id === sourceProdukId);
    if (!source) return;
    setProductEntries(prev => prev.map(e => {
      if (e.produk.id === sourceProdukId) return e;
      // Re-calculate harga for each tier based on target product's harga_jual
      const hargaAsli = parseFloat(e.produk.harga_jual);
      const newTiers = source.tiers.map(t => ({
        ...t,
        id: makeTierId(),
        harga_spesial: t.diskon_persen ? calcHarga(hargaAsli, t.diskon_persen) : t.harga_spesial,
      }));
      return { ...e, tiers: newTiers };
    }));
  };

  // ─── Validation & Submit ────────────────────────────────────────────────

  const validate = (): boolean => {
    const errs: string[] = [];
    if (productEntries.length === 0) errs.push("Tambahkan minimal 1 produk.");
    if (!formData.nama_promo.trim()) errs.push("Nama kampanye wajib diisi.");

    productEntries.forEach((entry, pi) => {
      const qtys = new Set<string>();
      entry.tiers.forEach((t, ti) => {
        if (!t.min_qty || parseInt(t.min_qty) < 1)
          errs.push(`${entry.produk.nama_produk} — Tier ${ti + 1}: Min qty wajib diisi (> 0).`);
        if (!t.harga_spesial && !t.diskon_persen)
          errs.push(`${entry.produk.nama_produk} — Tier ${ti + 1}: Isi Diskon % atau Harga NET.`);
        if (qtys.has(t.min_qty))
          errs.push(`${entry.produk.nama_produk} — Tier ${ti + 1}: Min qty ${t.min_qty} duplikat.`);
        qtys.add(t.min_qty);
      });
      if (pi > 50) errs.push("Maksimal 50 produk per kampanye."); // guard
    });

    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (initialData) {
      // Edit mode: single product single-tier (legacy)
      const entry = productEntries[0];
      const tier = entry.tiers[0];
      onSubmit({
        nama_promo: formData.nama_promo,
        id_produk: entry.produk.id,
        id_promo_cluster: formData.id_promo_cluster === "null" ? null : parseInt(formData.id_promo_cluster),
        id_divisi: formData.id_divisi === "null" ? null : parseInt(formData.id_divisi),
        tanggal_mulai: format(formData.tanggal_mulai, "yyyy-MM-dd"),
        tanggal_akhir: format(formData.tanggal_akhir, "yyyy-MM-dd"),
        min_qty: parseInt(tier.min_qty),
        harga_spesial: tier.harga_spesial ? parseFloat(tier.harga_spesial) : null,
        diskon_persen: tier.diskon_persen ? parseFloat(tier.diskon_persen) : null,
      });
      return;
    }

    // Create mode: per-product tiers
    const products = productEntries.map(entry => ({
      id_produk: entry.produk.id,
      tiers: [...entry.tiers]
        .sort((a, b) => parseInt(a.min_qty) - parseInt(b.min_qty))
        .map(t => ({
          min_qty: parseInt(t.min_qty),
          diskon_persen: t.diskon_persen ? parseFloat(t.diskon_persen) : null,
          harga_spesial: t.harga_spesial ? parseFloat(t.harga_spesial) : null,
        })),
    }));

    onSubmit({
      nama_promo: formData.nama_promo,
      id_promo_cluster: formData.id_promo_cluster === "null" ? null : parseInt(formData.id_promo_cluster),
      id_divisi: formData.id_divisi === "null" ? null : parseInt(formData.id_divisi),
      tanggal_mulai: format(formData.tanggal_mulai, "yyyy-MM-dd"),
      tanggal_akhir: format(formData.tanggal_akhir, "yyyy-MM-dd"),
      products, // new per-product format
    });
  };

  const totalRules = productEntries.reduce((sum, e) => sum + e.tiers.length, 0);
  const selectedIds = productEntries.map(e => e.produk.id);

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-2">
      <div className="space-y-5">

        {/* ── Section 1: Campaign Info ── */}
        <div className="bg-muted/30 p-5 rounded-lg border border-border/50 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg"><Tag className="h-4 w-4 text-primary" /></div>
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Info Kampanye</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormField label="Nama Kampanye Grosir" icon={Tag} required>
                <Input
                  placeholder="Contoh: Grosir Lebaran 2026"
                  value={formData.nama_promo}
                  onChange={e => setFormData({ ...formData, nama_promo: e.target.value })}
                  className="h-9 bg-card border-border/50 text-sm font-semibold"
                  required
                  onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
                />
              </FormField>
            </div>

            <FormField label="Target Cluster" icon={Tag}>
              <Select value={formData.id_promo_cluster}
                onValueChange={val => setFormData({ ...formData, id_promo_cluster: val, id_divisi: val !== "null" ? "null" : formData.id_divisi })}>
                <SelectTrigger className="h-9 bg-card border-border/50 text-sm font-semibold">
                  <SelectValue placeholder="Seluruh Pelanggan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Seluruh Pelanggan</SelectItem>
                  {clusters.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nama_cluster}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormField>

            {isSuperOrCompanyAdmin && (
              <FormField label="Batasi ke Divisi" icon={LayoutGrid}>
                <Select value={formData.id_divisi}
                  onValueChange={val => setFormData({ ...formData, id_divisi: val })}
                  disabled={formData.id_promo_cluster !== "null"}>
                  <SelectTrigger className="h-9 bg-card border-border/50 text-sm font-semibold disabled:opacity-50">
                    <SelectValue placeholder="Global" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Global (Seluruh Divisi)</SelectItem>
                    {divisis.map((d: Divisi) => <SelectItem key={d.id} value={d.id.toString()}>{d.nama_divisi}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
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
        </div>

        {/* ── Section 2: Add Products ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-100 rounded-lg"><Package className="h-4 w-4 text-orange-600" /></div>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Produk &amp; Ketentuan Tier</span>
            </div>
            {/* Add product trigger */}
            <Popover open={isProdukPopoverOpen} onOpenChange={setIsProdukPopoverOpen}>
              <PopoverTrigger asChild>
                <Button type="button" size="sm"
                  className="h-8 px-4 text-[11px] font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-lg gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Tambah Produk
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[560px] p-0 shadow-2xl rounded-lg border-none overflow-hidden" align="end" sideOffset={8}>
                <div className="flex items-center gap-2 p-4 border-b bg-card">
                  <div className="bg-primary/10 p-2 rounded-lg"><Search className="h-4 w-4 text-primary" /></div>
                  <input
                    className="bg-transparent text-sm outline-none w-full font-bold placeholder:text-muted-foreground/50"
                    placeholder="Cari nama produk atau SKU..."
                    value={popoverSearch}
                    onChange={e => setPopoverSearch(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
                    autoFocus
                  />
                  {popoverLoading && <div className="h-4 w-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />}
                </div>

                <div className="px-4 py-2 border-b bg-muted/30">
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

                <div className="max-h-[320px] overflow-y-auto pointer-events-auto" onWheel={e => e.stopPropagation()}>
                  <div className="p-3 space-y-1">
                    {popoverProduks.map(p => {
                      const isSelected = selectedIds.includes(p.id);
                      return (
                        <div key={p.id}
                          className={cn("flex items-center gap-4 p-3.5 rounded-lg cursor-pointer transition-all border border-transparent",
                            isSelected ? "bg-primary/5 border-primary/20" : "hover:bg-muted/50")}
                          onClick={() => addProduct(p)}>
                          <div className={cn("h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0",
                            isSelected ? "bg-primary border-primary" : "border-border/60")}>
                            {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                          </div>
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="font-bold text-[13px] truncate">{p.nama_produk}</span>
                            <div className="flex items-center gap-3 mt-0.5">
                              <Badge variant="outline" className="h-5 text-[9px] font-bold uppercase bg-muted/50">{p.sku}</Badge>
                              <span className="text-[10px] font-bold text-primary">{formatCurrency(parseFloat(p.harga_jual))}</span>
                              <span className="text-[10px] text-muted-foreground">Stok: {p.stok_tersedia}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {popoverProduks.length === 0 && !popoverLoading && (
                      <div className="py-8 text-center text-muted-foreground text-xs font-semibold">Produk tidak ditemukan</div>
                    )}
                  </div>
                </div>

                {hasMore && (
                  <div className="p-3 border-t bg-muted/30 text-center">
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

                <div className="p-3 border-t bg-muted/30 text-[11px] font-semibold text-muted-foreground text-center">
                  {selectedIds.length > 0 && <span className="text-primary">✓ {selectedIds.length} produk dipilih</span>}
                  <span className={selectedIds.length > 0 ? "ml-2" : ""}>Total {popoverProduks.length} produk</span>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* ── Product Cards ── */}
          {productEntries.length === 0 && (
            <div className="border-2 border-dashed border-border/40 rounded-lg p-8 text-center text-muted-foreground text-xs font-semibold flex flex-col items-center gap-2">
              <Package className="h-8 w-8 opacity-20" />
              <span>Klik &ldquo;Tambah Produk&rdquo; untuk mulai konfigurasi</span>
            </div>
          )}

          <div className="space-y-3">
            {productEntries.map((entry, entryIdx) => {
              const hargaAsli = parseFloat(entry.produk.harga_jual);
              return (
                <div key={entry.produk.id} className="border border-orange-200 rounded-lg overflow-hidden shadow-sm">
                  {/* Product Header */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-orange-50/60 cursor-pointer"
                    onClick={() => !initialData && toggleCollapse(entry.produk.id)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground truncate">{entry.produk.nama_produk}</span>
                        <Badge variant="outline" className="h-5 text-[9px] font-bold uppercase bg-white border-orange-200">{entry.produk.sku}</Badge>
                        <span className="text-[11px] font-bold text-orange-600">{formatCurrency(hargaAsli)}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {entry.tiers.length} tier dikonfigurasi
                        {entry.tiers.every(t => t.min_qty && (t.diskon_persen || t.harga_spesial)) && (
                          <span className="ml-2 text-emerald-600 font-bold">✓ Lengkap</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {entryIdx === 0 && productEntries.length > 1 && (
                        <Button type="button" variant="outline" size="sm"
                          className="h-7 px-2.5 text-[10px] font-bold border-orange-200 text-orange-700 hover:bg-orange-100 rounded-lg"
                          onClick={e => { e.stopPropagation(); copyTiersToAll(entry.produk.id); }}>
                          Salin ke Semua
                        </Button>
                      )}
                      {!initialData && (
                        <button type="button" className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          onClick={e => { e.stopPropagation(); removeProduct(entry.produk.id); }}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      {!initialData && (entry.collapsed
                        ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        : <ChevronUp className="h-4 w-4 text-muted-foreground" />)}
                    </div>
                  </div>

                  {/* Tier Builder */}
                  {!entry.collapsed && (
                    <div className="p-4 bg-white space-y-3">
                      {/* Column headers */}
                      <div className="grid grid-cols-[2rem_1fr_1.2fr_1.2fr_1.8fr_1.5rem] gap-2 px-1">
                        <div />
                        <div className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Min. Qty</div>
                        <div className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Diskon %</div>
                        <div className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Harga NET (Rp)</div>
                        <div className="text-[9px] font-bold uppercase text-emerald-700 tracking-widest">Harga Setelah Diskon</div>
                        <div />
                      </div>

                      {entry.tiers.map((tier, ti) => {
                        const hargaResult = tier.harga_spesial ? parseFloat(tier.harga_spesial) : null;
                        const diskonResult = tier.diskon_persen ? parseFloat(tier.diskon_persen) : null;
                        return (
                          <div key={tier.id} className="grid grid-cols-[2rem_1fr_1.2fr_1.2fr_1.8fr_1.5rem] gap-2 items-center">
                            {/* Tier badge */}
                            <div className="bg-orange-100 text-orange-700 text-[10px] font-bold w-7 h-7 rounded-full flex items-center justify-center shrink-0">
                              {ti + 1}
                            </div>

                            {/* Min qty */}
                            <div className="relative">
                              <Input type="number" min="1" placeholder="cth. 10"
                                value={tier.min_qty}
                                onChange={e => updateTierMinQty(entry.produk.id, tier.id, e.target.value)}
                                className="h-9 text-sm font-bold pl-8 border-orange-200 rounded-lg bg-orange-50/50"
                              />
                              <Boxes className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-orange-400" />
                            </div>

                            {/* Diskon % — primary input */}
                            <div className="relative">
                              <Input type="number" min="0" max="99.99" step="0.01" placeholder="cth. 10"
                                value={tier.diskon_persen}
                                onChange={e => updateTierDiskon(entry.produk.id, tier.id, e.target.value)}
                                className={cn("h-9 text-sm font-bold pl-8 rounded-lg",
                                  tier.mode === "diskon" && tier.diskon_persen
                                    ? "border-emerald-300 bg-emerald-50"
                                    : "border-orange-200 bg-orange-50/50")}
                              />
                              <Percent className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-orange-400" />
                            </div>

                            {/* Harga NET — alternative input */}
                            <div className="relative">
                              <Input type="number" min="0" placeholder="cth. 45000"
                                value={tier.harga_spesial}
                                onChange={e => updateTierHarga(entry.produk.id, tier.id, e.target.value)}
                                className={cn("h-9 text-sm font-bold pl-7 rounded-lg",
                                  tier.mode === "harga" && tier.harga_spesial
                                    ? "border-orange-400 bg-orange-50"
                                    : "border-orange-200 bg-orange-50/50")}
                              />
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-orange-400">Rp</span>
                            </div>

                            {/* Result preview */}
                            <div className="bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg px-3 h-9 flex items-center gap-2">
                              {hargaResult && hargaResult > 0 ? (
                                <>
                                  <ArrowRight className="h-3 w-3 text-emerald-500 shrink-0" />
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-emerald-700 text-xs tabular-nums truncate">
                                      {formatCurrency(hargaResult)}
                                    </span>
                                    {diskonResult && diskonResult > 0 && (
                                      <span className="text-[9px] text-muted-foreground line-through tabular-nums truncate">
                                        {formatCurrency(hargaAsli)}
                                      </span>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <span className="text-[10px] text-muted-foreground italic">Isi diskon atau harga</span>
                              )}
                            </div>

                            {/* Remove tier */}
                            {entry.tiers.length > 1 ? (
                              <button type="button" className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                                onClick={() => removeTier(entry.produk.id, tier.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            ) : <div />}
                          </div>
                        );
                      })}

                      {/* Add tier button */}
                      <Button type="button" variant="ghost" size="sm"
                        className="h-7 px-3 text-[11px] font-bold text-orange-600 hover:bg-orange-50 border border-dashed border-orange-200 rounded-lg w-full gap-1"
                        onClick={() => addTier(entry.produk.id)}>
                        <Plus className="h-3.5 w-3.5" /> Tambah Tier
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Info note ── */}
        {productEntries.length > 0 && (
          <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg flex items-start gap-2.5">
            <Info className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
            <p className="text-[10px] font-semibold text-orange-800/80 leading-relaxed">
              Setiap produk bisa punya ketentuan tier yang berbeda. Gunakan <strong>Salin ke Semua</strong> jika tier produk pertama ingin diterapkan ke semua produk (harga akan dihitung ulang per produk).
            </p>
          </div>
        )}

        {/* ── Validation errors ── */}
        {errors.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-destructive font-bold text-xs uppercase">
              <AlertCircle className="h-4 w-4" /> Perhatian
            </div>
            {errors.map((err, i) => <p key={i} className="text-xs text-destructive font-semibold">• {err}</p>)}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t font-semibold">
        <div className="text-[11px] text-muted-foreground font-semibold">
          {productEntries.length > 0 && (
            <span>
              <strong className="text-foreground">{productEntries.length}</strong> produk ·{" "}
              <strong className="text-orange-600">{totalRules}</strong> aturan grosir
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={onCancel}
            className="h-9 px-8 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground rounded-lg">
            Batal
          </Button>
          <Button type="submit"
            className="h-9 px-10 text-[10px] font-bold uppercase tracking-wider shadow-md shadow-orange-500/20 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all"
              disabled={loading || productEntries.length === 0}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  <span>{initialData ? "Simpan" : `Buat ${totalRules} Aturan`}</span>
                </div>
              )}
            </Button>
        </div>
      </div>
    </form>
  );
};

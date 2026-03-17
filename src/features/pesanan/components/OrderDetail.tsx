import React, { useState, useEffect, useMemo, useCallback } from "react";
import { CheckCircle, XCircle, Printer, Edit3, Save, Trash2, Plus, Search, Truck, Tag, X } from "lucide-react";
import { Pesanan, ItemPesanan, UpdatePesananData, AvailablePromos, PromoAppliedPayload, HadiahDitebusPayload } from "../types";
import { ConfirmModal } from "../../../components/ui/Modal";
import { useProduk } from "../../produk/hooks/useProduk";
import { useAvailablePromos } from "../hooks/useAvailablePromos";
import { Produk } from "../../produk/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditItemPromo {
  id_campaign: number;
  nama_promo: string;
  jenis: "aturan_harga" | "grosir";
  diskon_amount: number;
}

interface EditItem extends ItemPesanan {
  _promo?: EditItemPromo | null;
}

interface OrderDetailProps {
  pesanan: Pesanan;
  onStatusChange: (id: number, status: string) => Promise<void>;
  onUpdatePesanan?: (id: number, data: UpdatePesananData) => Promise<{ success: boolean; message?: string }>;
  onClose: () => void;
}

const getStatusColor = (s: string) => {
  switch (s.toLowerCase()) {
    case "sukses": return "bg-green-500/10 text-green-600 border-green-200/50";
    case "pending": return "bg-amber-500/10 text-amber-600 border-amber-200/50";
    case "batal": return "bg-destructive/10 text-destructive border-destructive/20";
    case "proses": return "bg-blue-500/10 text-blue-600 border-blue-200/50";
    default: return "bg-slate-500/10 text-slate-600 border-slate-200/50";
  }
};

const JENIS_LABEL: Record<string, string> = { aturan_harga: "Harga Spesial", grosir: "Grosir", hadiah: "Hadiah", hadiah_nota: "Hadiah Nota" };
const JENIS_COLOR: Record<string, string> = {
  aturan_harga: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50",
  grosir: "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/50",
  hadiah: "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/50",
  hadiah_nota: "bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800/50",
};

const rp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

function calcDiskon(promos: AvailablePromos, idProduk: number, qty: number, harga: number): EditItemPromo | null {
  for (const p of promos.aturan_harga) {
    const rule = p.items.find(i => i.id_produk === idProduk);
    if (!rule) continue;
    const hN = rule.harga_normal > 0 ? rule.harga_normal : harga;
    const hF = rule.harga_manual != null ? rule.harga_manual : rule.diskon_persen != null ? hN * (1 - rule.diskon_persen / 100) : hN;
    const d = (hN - hF) * qty;
    if (d > 0) return { id_campaign: p.id_campaign, nama_promo: p.nama_promo, jenis: "aturan_harga", diskon_amount: d };
  }
  for (const p of promos.grosir) {
    const item = p.items.find(i => i.id_produk === idProduk);
    if (!item?.tiers) continue;
    const tier = item.tiers.filter(t => qty >= t.min_qty).sort((a, b) => b.min_qty - a.min_qty)[0];
    if (!tier) continue;
    const hN = item.harga_normal > 0 ? item.harga_normal : harga;
    const hF = tier.harga_spesial != null ? tier.harga_spesial : tier.diskon_persen != null ? hN * (1 - tier.diskon_persen / 100) : hN;
    const d = (hN - hF) * qty;
    if (d > 0) return { id_campaign: p.id_campaign, nama_promo: p.nama_promo, jenis: "grosir", diskon_amount: d };
  }
  return null;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ pesanan, onStatusChange, onUpdatePesanan, onClose }) => {
  const [statusToConfirm, setStatusToConfirm] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedItems, setEditedItems] = useState<EditItem[]>([]);
  const [catatan, setCatatan] = useState(pesanan.catatan || "");
  const [isSaving, setIsSaving] = useState(false);
  const [removeWarning, setRemoveWarning] = useState<{ id_produk: number; nama: string } | null>(null);
  const [promoSelectorFor, setPromoSelectorFor] = useState<number | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [showProductSearch, setShowProductSearch] = useState(false);

  const { produks, fetchProduks } = useProduk();
  const { promos: availablePromos, loading: promosLoading, fetchPromos } = useAvailablePromos();

  useEffect(() => {
    if (!pesanan.items) return;
    const regular = pesanan.items.filter(i => !i.is_hadiah);
    setEditedItems(regular.map(item => {
      const ep = pesanan.promos?.find(p => p.id_produk === item.id_produk && p.jenis !== "hadiah_nota");
      return {
        ...item,
        _promo: ep ? { id_campaign: ep.id_promo_campaign, nama_promo: ep.nama_promo, jenis: ep.jenis as "aturan_harga" | "grosir", diskon_amount: Number(ep.diskon_amount) } : null,
      };
    }));
    setCatatan(pesanan.catatan || "");
  }, [pesanan]);

  useEffect(() => { if (isEditing && pesanan.id_pelanggan) fetchPromos(pesanan.id_pelanggan); }, [isEditing, pesanan.id_pelanggan, fetchPromos]);
  useEffect(() => { if (showProductSearch) fetchProduks({ search: productSearch }); }, [productSearch, showProductSearch, fetchProduks]);

  const hadiahItems = useMemo(() => pesanan.items?.filter(i => i.is_hadiah) ?? [], [pesanan.items]);
  const hasBackorder = useMemo(() => pesanan.items?.some(i => !i.is_hadiah && (i.jumlah_pesanan ?? i.jumlah) > i.jumlah) ?? false, [pesanan.items]);
  const subtotalEdit = useMemo(() => editedItems.reduce((a, i) => a + i.jumlah * i.harga_satuan, 0), [editedItems]);
  const diskonEdit = useMemo(() => editedItems.reduce((a, i) => a + (i._promo?.diskon_amount ?? 0), 0), [editedItems]);
  const grandTotalEdit = Math.max(0, subtotalEdit - diskonEdit);

  const getPromoOptions = useCallback((idProduk: number, qty: number, harga: number) => {
    if (!availablePromos) return [];
    const opts: { id_campaign: number; nama_promo: string; jenis: "aturan_harga" | "grosir"; diskon_amount: number; label: string }[] = [];
    for (const p of availablePromos.aturan_harga) {
      const rule = p.items.find(i => i.id_produk === idProduk);
      if (!rule) continue;
      const hN = rule.harga_normal > 0 ? rule.harga_normal : harga;
      const hF = rule.harga_manual != null ? rule.harga_manual : rule.diskon_persen != null ? hN * (1 - rule.diskon_persen / 100) : hN;
      const d = Math.max(0, (hN - hF) * qty);
      opts.push({ id_campaign: p.id_campaign, nama_promo: p.nama_promo, jenis: "aturan_harga", diskon_amount: d, label: d > 0 ? `Hemat ${rp(d)}` : "Harga Spesial" });
    }
    for (const p of availablePromos.grosir) {
      const item = p.items.find(i => i.id_produk === idProduk);
      if (!item?.tiers) continue;
      const tier = item.tiers.filter(t => qty >= t.min_qty).sort((a, b) => b.min_qty - a.min_qty)[0];
      if (!tier) { opts.push({ id_campaign: p.id_campaign, nama_promo: p.nama_promo, jenis: "grosir", diskon_amount: 0, label: "Min qty belum tercapai" }); continue; }
      const hN = item.harga_normal > 0 ? item.harga_normal : harga;
      const hF = tier.harga_spesial != null ? tier.harga_spesial : tier.diskon_persen != null ? hN * (1 - tier.diskon_persen / 100) : hN;
      const d = Math.max(0, (hN - hF) * qty);
      opts.push({ id_campaign: p.id_campaign, nama_promo: p.nama_promo, jenis: "grosir", diskon_amount: d, label: d > 0 ? `Hemat ${rp(d)}` : "Harga Grosir" });
    }
    return opts;
  }, [availablePromos]);

  const handleUpdateQty = (id_produk: number, newQty: number) => {
    if (newQty < 0) return;
    setEditedItems(items => items.map(item => {
      if (item.id_produk !== id_produk) return item;
      let p = item._promo;
      if (p && availablePromos) { const r = calcDiskon(availablePromos, id_produk, newQty, item.harga_satuan); p = r ? { ...p, diskon_amount: r.diskon_amount } : p; }
      return { ...item, jumlah: newQty, total_harga: newQty * item.harga_satuan, _promo: p };
    }));
  };

  const handleUpdatePrice = (id_produk: number, v: number) => {
    if (v < 0) return;
    setEditedItems(items => items.map(i => i.id_produk !== id_produk ? i : { ...i, harga_satuan: v, total_harga: i.jumlah * v }));
  };

  const handleRemoveItem = (id_produk: number) => {
    if (pesanan.promos?.some(p => p.id_produk === id_produk && p.jenis === "hadiah")) {
      setRemoveWarning({ id_produk, nama: editedItems.find(i => i.id_produk === id_produk)?.produk?.nama_produk ?? "Produk ini" });
      return;
    }
    setEditedItems(items => items.filter(i => i.id_produk !== id_produk));
  };

  const confirmRemoveItem = () => { if (!removeWarning) return; setEditedItems(i => i.filter(x => x.id_produk !== removeWarning.id_produk)); setRemoveWarning(null); };

  const handleAddProduct = (produk: Produk) => {
    if (editedItems.find(i => i.id_produk === produk.id)) { setShowProductSearch(false); return; }
    const autoPromo = availablePromos ? calcDiskon(availablePromos, produk.id, 1, Number(produk.harga_jual)) : null;
    setEditedItems(prev => [...prev, { id: 0, id_produk: produk.id, produk: { nama_produk: produk.nama_produk, satuan: produk.satuan }, jumlah: 1, jumlah_pesanan: 1, harga_satuan: Number(produk.harga_jual), total_harga: Number(produk.harga_jual), _promo: autoPromo }]);
    setShowProductSearch(false); setProductSearch("");
  };

  const handleSelectPromo = (id_produk: number, option: EditItemPromo | null) => {
    setEditedItems(items => items.map(i => i.id_produk !== id_produk ? i : { ...i, _promo: option }));
    setPromoSelectorFor(null);
  };

  const saveOrderAdjustment = async () => {
    if (!onUpdatePesanan) return;
    setIsSaving(true);
    try {
      const promosApplied: PromoAppliedPayload[] = editedItems.filter(i => i._promo).map(i => ({
        id_campaign: i._promo!.id_campaign, nama_promo: i._promo!.nama_promo,
        jenis: i._promo!.jenis, id_produk: i.id_produk, diskon_amount: i._promo!.diskon_amount,
      }));
      pesanan.promos?.filter(p => p.jenis === "hadiah_nota").forEach(h => {
        promosApplied.push({ id_campaign: h.id_promo_campaign, nama_promo: h.nama_promo, jenis: "hadiah_nota", id_produk: null, diskon_amount: 0 });
      });
      const hadiahDitebus: HadiahDitebusPayload[] = [];
      for (const hi of hadiahItems) {
        const rel = pesanan.promos?.find(p => p.id_promo_campaign === hi.id && (p.jenis === "hadiah" || p.jenis === "hadiah_nota"));
        if (!rel) continue;
        const ok = rel.id_produk ? editedItems.some(i => i.id_produk === rel.id_produk) : true;
        if (ok) hadiahDitebus.push({ id_campaign: rel.id_promo_campaign, nama_promo: rel.nama_promo, id_produk_hadiah: hi.id_produk, qty: hi.jumlah, harga_tebus: Number(hi.harga_tebus) || 0 });
      }
      const result = await onUpdatePesanan(pesanan.id, {
        items: editedItems.map(i => ({ id_produk: i.id_produk, jumlah: i.jumlah, jumlah_pesanan: i.jumlah_pesanan ?? i.jumlah, harga_satuan: i.harga_satuan })),
        catatan,
        promos_applied: promosApplied.length > 0 ? promosApplied : undefined,
        hadiah_ditebus: hadiahDitebus.length > 0 ? hadiahDitebus : undefined,
      });
      if (result.success) setIsEditing(false);
    } finally { setIsSaving(false); }
  };

  const confirmStatusChange = () => { if (statusToConfirm) { onStatusChange(pesanan.id, statusToConfirm); setStatusToConfirm(null); } };

  const viewSubtotal = useMemo(() => (pesanan.items?.filter(i => !i.is_hadiah) ?? []).reduce((a, i) => a + Number(i.total_harga), 0), [pesanan.items]);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">

      {/* Info Pesanan */}
      <Card className="border border-border/60 shadow-sm overflow-hidden rounded-xl">
        <div className="h-1 bg-primary/20" />
        <CardContent className="p-4 space-y-4">
          <div className="flex justify-between items-center border-b border-border/40 pb-3">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Informasi Pesanan</h3>
            {!isEditing && pesanan.status === "PENDING" && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-7 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary hover:bg-primary/10 gap-1.5">
                <Edit3 className="h-3 w-3" /> Edit Pesanan
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
            <div>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-0.5">No. Pesanan</p>
              <p className="font-bold text-primary">{pesanan.no_pesanan}</p>
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-0.5">Toko Pelanggan</p>
              <p className="font-semibold">{pesanan.pelanggan?.nama_toko || "N/A"}</p>
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-0.5">Sales</p>
              <p className="font-semibold">{pesanan.karyawan?.nama_lengkap || "Unknown"}</p>
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-0.5">Waktu Transaksi</p>
              <p className="font-medium text-foreground/80">{new Date(pesanan.tanggal_transaksi).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Status</p>
              <Badge variant="outline" className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(pesanan.status || "")}`}>{pesanan.status}</Badge>
            </div>
          </div>
          {(pesanan.waktu_proses || pesanan.waktu_kirim || pesanan.waktu_selesai || pesanan.waktu_batal) && (
            <div className="pt-3 border-t border-border/40">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Jejak Status</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: "Diproses", date: pesanan.waktu_proses },
                  { label: "Dikirim", date: pesanan.waktu_kirim },
                  { label: "Selesai", date: pesanan.waktu_selesai },
                  { label: "Dibatalkan", date: pesanan.waktu_batal, destructive: true },
                ].filter(t => t.date).map((t, i) => (
                  <div key={i} className="bg-muted/30 p-2 rounded-lg border border-border/20">
                    <p className={`text-[8px] font-bold uppercase tracking-tighter mb-0.5 ${t.destructive ? "text-destructive" : "text-muted-foreground"}`}>{t.label}</p>
                    <p className="text-[10px] font-semibold whitespace-nowrap">{new Date(t.date!).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Detail Item */}
      <Card className="border border-border/60 shadow-sm overflow-hidden rounded-xl">
        <CardContent className="p-0">

        {/* Card header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-border/40">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            Detail Item Pesanan
            {!isEditing && ((pesanan.promos && pesanan.promos.length > 0) || Number(pesanan.diskon_total) > 0) && (
              <span className="flex items-center gap-1 text-green-600"><Tag className="h-3 w-3" /> Promo</span>
            )}
          </h4>
          {isEditing && (
            <Button size="sm" onClick={() => setShowProductSearch(true)} className="h-8 text-[10px] font-bold uppercase tracking-wider gap-1.5 rounded-lg">
              <Plus className="h-3 w-3" /> Tambah Produk
            </Button>
          )}
        </div>

        <div className="p-4 space-y-3">

        {isEditing && showProductSearch && (
          <Card className="bg-muted/30 border border-border p-3 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input autoFocus type="text" placeholder="Ketik nama produk..."
                  className="w-full pl-8 pr-4 py-2 text-xs bg-background text-foreground border border-border rounded-lg focus:ring-1 focus:ring-primary outline-none font-medium"
                  value={productSearch} onChange={e => setProductSearch(e.target.value)} />
              </div>
              <button onClick={() => setShowProductSearch(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <ScrollArea className="h-36">
              <div className="space-y-1">
                {produks.map(p => (
                  <button key={p.id} onClick={() => handleAddProduct(p)} className="w-full text-left px-3 py-2 text-xs hover:bg-background hover:shadow-sm flex justify-between rounded-lg transition-all">
                    <span className="font-semibold">{p.nama_produk}</span>
                    <span className="font-bold text-indigo-600">{rp(Number(p.harga_jual))}</span>
                  </button>
                ))}
                {produks.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Tidak ada produk ditemukan</p>}
              </div>
            </ScrollArea>
          </Card>
        )}

        {isEditing && promoSelectorFor !== null && (() => {
          const selItem = editedItems.find(i => i.id_produk === promoSelectorFor);
          if (!selItem) return null;
          const opts = getPromoOptions(selItem.id_produk, selItem.jumlah, selItem.harga_satuan);
          return (
            <Card className="bg-muted/20 border border-border p-3 rounded-xl">
              <div className="flex justify-between items-center mb-3">
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Pilih Promo &mdash; {selItem.produk?.nama_produk}</p>
                <button onClick={() => setPromoSelectorFor(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              {promosLoading ? <p className="text-xs text-muted-foreground text-center py-3">Memuat promo...</p> : (
                <div className="space-y-1.5">
                  <button onClick={() => handleSelectPromo(promoSelectorFor, null)}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg border transition-all ${!selItem._promo ? 'bg-background border-primary text-primary font-bold' : 'bg-background border-border hover:border-primary/50'}`}>
                    Tanpa Promo
                  </button>
                  {opts.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">Tidak ada promo untuk produk ini</p>}
                  {opts.map(opt => (
                    <button key={opt.id_campaign}
                      onClick={() => opt.diskon_amount > 0 && handleSelectPromo(promoSelectorFor, opt)}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg border transition-all ${selItem._promo?.id_campaign === opt.id_campaign ? 'bg-background border-primary font-bold' : opt.diskon_amount === 0 ? 'bg-muted/30 border-border text-muted-foreground cursor-not-allowed' : 'bg-background border-border hover:border-primary/50'}`}>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{opt.nama_promo}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${JENIS_COLOR[opt.jenis]}`}>{JENIS_LABEL[opt.jenis]}</span>
                      </div>
                      <p className={`text-[10px] mt-0.5 ${opt.diskon_amount > 0 ? 'text-green-600 font-semibold' : 'text-muted-foreground'}`}>{opt.label}</p>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          );
        })()}

        <div className="rounded-xl border border-border/60 shadow-sm overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-4">Produk</TableHead>
                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-4 text-right">Harga Satuan</TableHead>
                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-4 text-center">Dipesan</TableHead>
                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-4 text-center text-primary">Dikirim</TableHead>
                {hasBackorder && !isEditing && <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-4 text-center text-amber-600">Backorder</TableHead>}
                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-4 text-right">Subtotal</TableHead>
                {isEditing && <TableHead className="w-8" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Regular items */}
              {(isEditing ? editedItems : (pesanan.items?.filter(i => !i.is_hadiah) ?? [])).map(item => {
                const ei = item as EditItem;
                const viewPromo = !isEditing ? pesanan.promos?.find(p => p.id_produk === item.id_produk && p.jenis !== 'hadiah_nota') : null;
                const bo = (item.jumlah_pesanan ?? item.jumlah) - item.jumlah;
                return (
                  <TableRow key={item.id_produk} className="hover:bg-muted/20 border-border/40">
                    <TableCell className="px-4 py-2.5">
                      <p className="text-[11px] font-bold leading-tight">{item.produk?.nama_produk || item.nama_barang || 'N/A'}</p>
                      <p className="text-[8px] text-muted-foreground font-bold uppercase opacity-60">SKU: {item.produk?.sku || '-'} &bull; {item.produk?.satuan || 'pcs'}</p>
                      {(isEditing ? ei._promo : viewPromo) && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${JENIS_COLOR[isEditing ? (ei._promo?.jenis ?? '') : (viewPromo?.jenis ?? '')] ?? 'bg-muted border-border text-muted-foreground'}`}>
                            {JENIS_LABEL[isEditing ? (ei._promo?.jenis ?? '') : (viewPromo?.jenis ?? '')] ?? ''}
                          </span>
                          <span className="text-[8px] text-green-600 font-semibold">
                            {isEditing && ei._promo && ei._promo.diskon_amount > 0 ? `- ${rp(ei._promo.diskon_amount)}` : ''}
                            {!isEditing && viewPromo && Number(viewPromo.diskon_amount) > 0 ? `- ${rp(Number(viewPromo.diskon_amount))}` : ''}
                          </span>
                          {isEditing && <button onClick={() => setPromoSelectorFor(item.id_produk)} className="text-[8px] text-primary underline">Ganti</button>}
                        </div>
                      )}
                      {isEditing && !ei._promo && (
                        <button onClick={() => setPromoSelectorFor(item.id_produk)} className="text-[8px] text-primary underline mt-1 block">+ Pilih Promo</button>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-right">
                      {isEditing ? (
                        <input type="number" className="w-24 text-right px-2 py-1 text-[11px] border border-border rounded-md focus:ring-1 focus:ring-primary outline-none font-bold bg-background text-foreground"
                          value={Number(item.harga_satuan)} onChange={e => handleUpdatePrice(item.id_produk, Number(e.target.value))} />
                      ) : <span className="text-xs font-semibold text-foreground/70">{rp(Number(item.harga_satuan))}</span>}
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-center text-[11px] text-muted-foreground/60">{item.jumlah_pesanan ?? item.jumlah}</TableCell>
                    <TableCell className="px-4 py-2.5 text-center bg-primary/5">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => handleUpdateQty(item.id_produk, item.jumlah - 1)} className="h-6 w-6 rounded-md border border-primary/20 bg-background flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-primary font-bold">-</button>
                          <span className="w-6 text-[11px] font-bold text-primary text-center">{item.jumlah}</span>
                          <button onClick={() => handleUpdateQty(item.id_produk, item.jumlah + 1)} className="h-6 w-6 rounded-md border border-primary/20 bg-background flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-primary font-bold">+</button>
                        </div>
                      ) : <span className="text-[11px] font-bold text-primary">{item.jumlah}</span>}
                    </TableCell>
                    {hasBackorder && !isEditing && <TableCell className="px-4 py-2.5 text-center"><Badge variant="secondary" className="h-5 text-[10px] font-bold text-amber-600 bg-amber-50 rounded-md">{bo > 0 ? bo : 0}</Badge></TableCell>}
                    <TableCell className="px-4 py-2.5 text-right font-bold text-[11px]">{rp(Number(item.total_harga))}</TableCell>
                    {isEditing && (
                      <TableCell className="px-2">
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id_produk)} className="h-7 w-7 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
              {/* Hadiah / Bonus rows — view mode only */}
              {!isEditing && hadiahItems.map(item => {
                const isTebus = Number(item.harga_tebus) > 0;
                return (
                  <TableRow key={`hadiah-${item.id}`} className="bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50/60 dark:hover:bg-amber-950/30 border-border/40">
                    <TableCell className="px-4 py-2.5">
                      <p className="text-[11px] font-bold leading-tight">{item.produk?.nama_produk || item.nama_barang || 'N/A'}</p>
                      <p className="text-[8px] text-muted-foreground font-bold uppercase opacity-60">{item.produk?.satuan || 'pcs'}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${isTebus ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {isTebus ? 'Tebus Murah' : 'Bonus'}
                        </span>
                        {item.keterangan && <span className="text-[8px] text-muted-foreground">{item.keterangan}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-right">
                      <span className="text-xs font-semibold text-amber-600">{isTebus ? rp(Number(item.harga_tebus)) : 'Rp 0'}</span>
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-center text-[11px] text-muted-foreground/60">{item.jumlah}</TableCell>
                    <TableCell className="px-4 py-2.5 text-center bg-amber-50/60 dark:bg-amber-950/20">
                      <span className="text-[11px] font-bold text-amber-600">{item.jumlah}</span>
                    </TableCell>
                    {hasBackorder && <TableCell />}
                    <TableCell className="px-4 py-2.5 text-right font-bold text-[11px] text-amber-600">
                      {isTebus ? rp(Number(item.harga_tebus) * item.jumlah) : 'Gratis'}
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                {isEditing ? (
                  <>
                    <TableCell colSpan={3} className="text-right px-4 py-2 text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Subtotal</TableCell>
                    <TableCell colSpan={isEditing ? 2 : 1} className="text-right px-4 py-2 text-xs font-bold">{rp(subtotalEdit)}</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell colSpan={hasBackorder ? 4 : 3} className="text-right px-4 py-2 text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Subtotal</TableCell>
                    <TableCell className="text-right px-4 py-2 text-xs font-bold">{rp(viewSubtotal)}</TableCell>
                  </>
                )}
                {isEditing && <TableCell />}
              </TableRow>
              {isEditing && diskonEdit > 0 && (
                <TableRow className="bg-green-50/50 dark:bg-green-950/20 hover:bg-green-50/60 dark:hover:bg-green-950/30">
                  <TableCell colSpan={3} className="text-right px-4 py-2 text-[10px] font-bold uppercase text-green-700 dark:text-green-400 tracking-widest">Total Diskon Promo</TableCell>
                  <TableCell colSpan={2} className="text-right px-4 py-2 text-xs font-bold text-green-600">- {rp(diskonEdit)}</TableCell>
                  <TableCell />
                </TableRow>
              )}
              {!isEditing && Number(pesanan.diskon_total) > 0 && (
                <TableRow className="bg-green-50/50 dark:bg-green-950/20 hover:bg-green-50/60 dark:hover:bg-green-950/30">
                  <TableCell colSpan={hasBackorder ? 4 : 3} className="text-right px-4 py-2 text-[10px] font-bold uppercase text-green-700 dark:text-green-400 tracking-widest">Total Diskon</TableCell>
                  <TableCell className="text-right px-4 py-2 text-xs font-bold text-green-600">- {rp(Number(pesanan.diskon_total))}</TableCell>
                </TableRow>
              )}
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                {isEditing ? (
                  <>
                    <TableCell colSpan={3} className="text-right px-4 py-3 text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Grand Total</TableCell>
                    <TableCell colSpan={2} className="text-right px-4 py-3 text-sm font-bold text-primary">{rp(grandTotalEdit)}</TableCell>
                    <TableCell />
                  </>
                ) : (
                  <>
                    <TableCell colSpan={hasBackorder ? 4 : 3} className="text-right px-4 py-3 text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Total Tagihan</TableCell>
                    <TableCell className="text-right px-4 py-3 text-sm font-bold text-primary">{rp(Number(pesanan.total_tagihan))}</TableCell>
                  </>
                )}
                {isEditing && <TableCell />}
              </TableRow>
            </TableBody>
          </Table>
        </div>

        </div>
        </CardContent>
      </Card>

      {/* Catatan */}
      <div className="space-y-1.5 px-1">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Catatan Pesanan</label>
        {isEditing ? (
          <textarea className="w-full text-xs font-semibold bg-background text-foreground border border-border rounded-xl p-3 h-16 focus:ring-1 focus:ring-primary outline-none shadow-sm"
            value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Instruksi khusus..." />
        ) : (
          <div className="bg-muted/20 dark:bg-muted/10 p-3 rounded-xl border border-border/50 min-h-10">
            <p className="text-[11px] text-foreground/70 font-medium italic">{pesanan.catatan || 'Tidak ada catatan.'}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-2.5 pt-4 border-t border-border">
        {isEditing ? (
          <>
            <Button variant="ghost" onClick={() => setIsEditing(false)} className="h-9 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground rounded-lg" disabled={isSaving}>Batalkan</Button>
            <Button onClick={saveOrderAdjustment} className="h-9 px-8 text-[10px] font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-lg gap-2" disabled={isSaving || editedItems.length === 0}>
              {isSaving ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save className="h-3.5 w-3.5" />}
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </>
        ) : (
          <>
            <div className="flex gap-2 mr-auto">
              {pesanan.status === 'SUKSES' && (
                <Button variant="outline" size="sm" className="h-9 px-4 text-[10px] font-bold uppercase tracking-wider gap-2 rounded-lg" onClick={() => window.print()}>
                  <Printer className="h-3.5 w-3.5" /> Cetak PO
                </Button>
              )}
            </div>
            {(pesanan.status === 'PENDING' || pesanan.status === 'PROSES') && (
              <Button variant="outline" onClick={() => setStatusToConfirm('BATAL')} className="h-9 px-5 text-[10px] font-bold uppercase tracking-wider text-destructive border-destructive/20 hover:bg-destructive/5 gap-2 rounded-lg">
                <XCircle className="h-3.5 w-3.5" /> {pesanan.status === 'PENDING' ? 'Tolak' : 'Batalkan'}
              </Button>
            )}
            {(pesanan.status === 'PENDING' || pesanan.status === 'PROSES') && (
              <Button onClick={() => setStatusToConfirm(pesanan.status === 'PENDING' ? 'PROSES' : 'DIKIRIM')} className="h-9 px-6 text-[10px] font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2 rounded-lg">
                {pesanan.status === 'PENDING' ? <CheckCircle className="h-3.5 w-3.5" /> : <Truck className="h-3.5 w-3.5" />}
                {pesanan.status === 'PENDING' ? 'Proses Pesanan' : 'Kirim Sekarang'}
              </Button>
            )}
            {pesanan.status === 'DIKIRIM' && (
              <Button onClick={() => setStatusToConfirm('SUKSES')} className="h-9 px-10 text-[10px] font-bold uppercase tracking-wider bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20 gap-2 rounded-lg">
                <CheckCircle className="h-3.5 w-3.5" /> Selesaikan Pengiriman
              </Button>
            )}
            <Button variant="ghost" onClick={onClose} className="h-9 px-8 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted/50 rounded-lg">Tutup</Button>
          </>
        )}
      </div>

      <ConfirmModal isOpen={!!removeWarning} onClose={() => setRemoveWarning(null)} onConfirm={confirmRemoveItem}
        title="Hapus Item Pemicu Hadiah?"
        message={`${removeWarning?.nama} adalah pemicu promo hadiah. Menghapus produk ini akan menghilangkan hadiah terkait dari pesanan.`}
        confirmText="Ya, Hapus" type="danger" />
      <ConfirmModal isOpen={!!statusToConfirm} onClose={() => setStatusToConfirm(null)} onConfirm={confirmStatusChange}
        title="Konfirmasi Perubahan Status"
        message={`Yakin ubah status menjadi ${statusToConfirm}?${statusToConfirm === 'SUKSES' ? ' Sistem akan membuat backorder untuk barang belum terpenuhi.' : ''}`}
        confirmText="Ya, Update" type={statusToConfirm === 'BATAL' ? 'danger' : 'info'} />
    </div>
  );
};

export default OrderDetail;

import React, { useState, useEffect, useMemo } from "react";
import {
  CheckCircle,
  XCircle,
  Printer,
  Edit3,
  Save,
  Trash2,
  Plus,
  Search,
  Truck,
} from "lucide-react";
import { Pesanan, ItemPesanan, UpdatePesananData } from "../types";
import { ConfirmModal } from "../../../components/ui/Modal";
import { useProduk } from "../../produk/hooks/useProduk";
import { Produk } from "../../produk/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OrderDetailProps {
  pesanan: Pesanan;
  onStatusChange: (id: number, status: string) => Promise<void>;
  onUpdatePesanan?: (
    id: number,
    data: UpdatePesananData,
  ) => Promise<{ success: boolean; message?: string }>;
  onClose: () => void;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "sukses":
      return "bg-green-500/10 text-green-600 border-green-200/50";
    case "pending":
      return "bg-amber-500/10 text-amber-600 border-amber-200/50";
    case "batal":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "proses":
      return "bg-blue-500/10 text-blue-600 border-blue-200/50";
    default:
      return "bg-slate-500/10 text-slate-600 border-slate-200/50";
  }
};

const OrderDetail: React.FC<OrderDetailProps> = ({
  pesanan,
  onStatusChange,
  onUpdatePesanan,
  onClose,
}) => {
  const [statusToConfirm, setStatusToConfirm] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedItems, setEditedItems] = useState<ItemPesanan[]>([]);
  const [catatan, setCatatan] = useState(pesanan.catatan || "");
  const [isSaving, setIsSaving] = useState(false);

  // Product Search for adding items
  const { produks, fetchProduks } = useProduk();
  const [productSearch, setProductSearch] = useState("");
  const [showProductSearch, setShowProductSearch] = useState(false);

  useEffect(() => {
    if (pesanan.items) {
      setEditedItems([...pesanan.items]);
    }
    setCatatan(pesanan.catatan || "");
  }, [pesanan]);

  useEffect(() => {
    if (showProductSearch) {
      fetchProduks({ search: productSearch });
    }
  }, [productSearch, showProductSearch, fetchProduks]);

  const totalTagihan = useMemo(() => {
    return editedItems.reduce(
      (acc, item) => acc + item.jumlah * item.harga_satuan,
      0,
    );
  }, [editedItems]);

  const handleUpdateItemQty = (id_produk: number, newQty: number) => {
    if (newQty < 0) return;
    setEditedItems((items) =>
      items.map((item) =>
        item.id_produk === id_produk
          ? { ...item, jumlah: newQty, total_harga: newQty * item.harga_satuan }
          : item,
      ),
    );
  };

  const handleUpdateItemPrice = (id_produk: number, newPrice: number) => {
    if (newPrice < 0) return;
    setEditedItems((items) =>
      items.map((item) =>
        item.id_produk === id_produk
          ? {
              ...item,
              harga_satuan: newPrice,
              total_harga: item.jumlah * newPrice,
            }
          : item,
      ),
    );
  };

  const handleRemoveItem = (id_produk: number) => {
    setEditedItems((items) =>
      items.filter((item) => item.id_produk !== id_produk),
    );
  };

  const handleAddProduct = (produk: Produk) => {
    if (editedItems.find((item) => item.id_produk === produk.id)) {
      setShowProductSearch(false);
      return;
    }
    const newItem: ItemPesanan = {
      id: 0, // Temp ID
      id_produk: produk.id,
      produk: {
        nama_produk: produk.nama_produk,
        satuan: produk.satuan,
      },
      jumlah: 1,
      jumlah_pesanan: 1,
      harga_satuan: Number(produk.harga_jual),
      total_harga: Number(produk.harga_jual),
    };
    setEditedItems([...editedItems, newItem]);
    setShowProductSearch(false);
    setProductSearch("");
  };

  const saveOrderAdjustment = async () => {
    if (!onUpdatePesanan) return;
    setIsSaving(true);
    try {
      const result = await onUpdatePesanan(pesanan.id, {
        items: editedItems.map((item) => ({
          id_produk: item.id_produk,
          jumlah: item.jumlah,
          jumlah_pesanan: item.jumlah_pesanan || item.jumlah,
          harga_satuan: item.harga_satuan,
        })),
        catatan,
      });
      if (result.success) {
        setIsEditing(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const confirmStatusChange = () => {
    if (statusToConfirm) {
      onStatusChange(pesanan.id, statusToConfirm);
      setStatusToConfirm(null);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <Card className="border border-border/60 shadow-sm overflow-hidden rounded-xl">
        <div className="h-1 bg-primary/20" />
        <CardContent className="p-4 space-y-4">
          <div className="flex justify-between items-center border-b border-border/40 pb-3 mb-1">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Informasi Pesanan
            </h3>
            {!isEditing && pesanan.status === "PENDING" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-7 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary hover:bg-primary/10 gap-1.5"
              >
                <Edit3 className="h-3 w-3" /> Edit Pesanan
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
            <div>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-0.5">No. PO / Pesanan</p>
              <p className="font-bold text-primary tracking-tight">{pesanan.no_pesanan}</p>
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-0.5">Nama Pelanggan / Toko</p>
              <p className="font-semibold text-foreground">{pesanan.pelanggan?.nama_toko || "N/A"}</p>
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-0.5">Sales Representative</p>
              <p className="font-semibold text-foreground">{pesanan.karyawan?.nama_lengkap || "Unknown"}</p>
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-0.5">Waktu Transaksi</p>
              <p className="font-medium text-foreground/80">
                {new Date(pesanan.tanggal_transaksi).toLocaleString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Status Transaksi</p>
              <Badge variant="outline" className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(pesanan.status || "")}`}>
                {pesanan.status}
              </Badge>
            </div>
          </div>

          {/* Timeline / History */}
          <div className="mt-4 pt-4 border-t border-border/40">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Jejak Waktu Status</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Diproses", date: pesanan.waktu_proses },
                { label: "Dikirim", date: pesanan.waktu_kirim },
                { label: "Selesai", date: pesanan.waktu_selesai },
                { label: "Batal", date: pesanan.waktu_batal, isDestructive: true }
              ].filter(t => t.date).map((entry, idx) => (
                <div key={idx} className="bg-muted/30 p-2 rounded-lg border border-border/20">
                  <p className={`text-[8px] font-bold uppercase tracking-tighter mb-0.5 ${entry.isDestructive ? 'text-destructive' : 'text-muted-foreground'}`}>{entry.label}</p>
                  <p className="text-[10px] font-semibold text-foreground/90 whitespace-nowrap">
                    {new Date(entry.date!).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
                  </p>
                </div>
              ))}
              {(!pesanan.waktu_proses && !pesanan.waktu_kirim && !pesanan.waktu_selesai && !pesanan.waktu_batal) && (
                <p className="col-span-4 text-[10px] text-muted-foreground italic text-center py-1 opacity-60 uppercase tracking-widest font-bold">Menunggu Proses Selanjutnya</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
            Detail Item Pesanan
          </h4>
          {isEditing && (
            <Button
              size="sm"
              onClick={() => setShowProductSearch(true)}
              className="h-8 text-[10px] font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 rounded-lg"
            >
              <Plus className="h-3 w-3" /> Tambah Produk
            </Button>
          )}
        </div>

        {/* Product search for editing */}
        {isEditing && showProductSearch && (
          <Card className="bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/50 p-3 rounded-xl animate-in fade-in slide-in-from-top-2">
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-indigo-400" />
              <input
                autoFocus
                type="text"
                placeholder="Ketik nama produk untuk mencari..."
                className="w-full pl-8 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-700 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>
            <ScrollArea className="h-32">
              <div className="space-y-1">
                {produks.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleAddProduct(p)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-white hover:shadow-sm flex justify-between rounded-lg transition-all"
                  >
                    <span className="font-semibold text-foreground/80">{p.nama_produk}</span>
                    <span className="font-bold text-indigo-600">
                      Rp {Number(p.harga_jual).toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                    </span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </Card>
        )}

        <div className="rounded-xl border border-border shadow-sm overflow-hidden bg-white dark:bg-slate-950">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-4">Nama Produk</TableHead>
                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-4 text-right">Harga</TableHead>
                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-4 text-center">Req Qty</TableHead>
                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-4 text-center text-primary">Acc Qty</TableHead>
                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-4 text-center text-amber-600">BO</TableHead>
                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-4 text-right">Subtotal</TableHead>
                {isEditing && <TableHead className="w-10"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(isEditing ? editedItems : pesanan.items)?.map((item) => (
                <TableRow key={item.id_produk} className="hover:bg-muted/20 border-border/40">
                  <TableCell className="px-4 py-2.5">
                    <p className="text-[11px] font-bold leading-tight text-foreground/90">
                      {item.produk?.nama_produk || item.nama_barang || "Produk N/A"}
                    </p>
                    <p className="text-[8px] text-muted-foreground font-bold uppercase opacity-60">
                      SKU: {item.produk?.sku || "-"} • {item.produk?.satuan || "pcs"}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-right font-semibold text-xs text-foreground/70">
                    {isEditing ? (
                      <input
                        type="number"
                        className="w-20 text-right px-2 py-1 text-[11px] border border-border rounded-md focus:ring-1 focus:ring-primary outline-none font-bold"
                        value={Number(item.harga_satuan)}
                        onChange={(e) => handleUpdateItemPrice(item.id_produk, Number(e.target.value))}
                      />
                    ) : (
                      `Rp ${(Number(item.harga_satuan) || 0).toLocaleString("id-ID")}`
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-center text-[11px] font-medium text-muted-foreground/60">
                    {item.jumlah_pesanan || item.jumlah}
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-center bg-primary/5">
                      {isEditing ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleUpdateItemQty(item.id_produk, item.jumlah - 1)}
                          className="h-6 w-6 rounded-md border border-primary/20 bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-primary font-bold text-base"
                        > - </button>
                        <span className="w-6 text-[11px] font-bold text-primary">{item.jumlah}</span>
                        <button
                          onClick={() => handleUpdateItemQty(item.id_produk, item.jumlah + 1)}
                          className="h-6 w-6 rounded-md border border-primary/20 bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-primary font-bold text-base"
                        > + </button>
                      </div>
                    ) : (
                      <span className="text-[11px] font-bold text-primary">{item.jumlah}</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-center">
                    <Badge variant="secondary" className="h-5 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 rounded-md">
                      {(item.jumlah_pesanan || item.jumlah) - item.jumlah}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-right font-bold text-[11px] text-foreground">
                    Rp {(Number(item.total_harga) || 0).toLocaleString("id-ID")}
                  </TableCell>
                  {isEditing && (
                    <TableCell className="px-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id_produk)}
                        className="h-7 w-7 text-destructive hover:bg-destructive/10 rounded-lg"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              <TableRow className="bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-50/80 dark:hover:bg-slate-900/50">
                <TableCell colSpan={5} className="text-right px-4 py-3 text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                  Total Tagihan Disetujui
                </TableCell>
                <TableCell className="text-right px-4 py-3 text-sm font-bold text-primary tracking-tight">
                  Rp {(Number(isEditing ? totalTagihan : pesanan.total_tagihan) || 0).toLocaleString("id-ID")}
                </TableCell>
                {isEditing && <TableCell></TableCell>}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="space-y-1.5 px-1">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Catatan Pesanan
        </label>
        {isEditing ? (
          <textarea
            className="w-full text-xs font-semibold bg-white dark:bg-slate-900 border border-border rounded-xl p-3 h-16 focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Tambahkan instruksi khusus untuk gudang atau pengiriman..."
          />
        ) : (
          <div className="bg-muted/20 p-3 rounded-xl border border-border/50 min-h-[40px]">
            <p className="text-[11px] text-foreground/70 font-medium italic">
              {pesanan.catatan || "Tidak ada catatan internal."}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2.5 pt-4 border-t border-border">
        {isEditing ? (
          <>
            <Button
              variant="ghost"
              onClick={() => setIsEditing(false)}
              className="h-9 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground rounded-lg"
              disabled={isSaving}
            >
              Batalkan
            </Button>
            <Button
              onClick={saveOrderAdjustment}
              className="h-9 px-8 text-[10px] font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-lg gap-2"
              disabled={isSaving || editedItems.length === 0}
            >
              {isSaving ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </>
        ) : (
          <>
            <div className="flex gap-2 mr-auto">
              {pesanan.status === "SUKSES" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 text-[10px] font-bold uppercase tracking-wider border-border gap-2 rounded-lg"
                  onClick={() => window.print()}
                >
                  <Printer className="h-3.5 w-3.5" /> Cetak PO
                </Button>
              )}
            </div>
            
            {(pesanan.status === "PENDING" || pesanan.status === "PROSES") && (
              <Button
                variant="outline"
                onClick={() => setStatusToConfirm("BATAL")}
                className="h-9 px-5 text-[10px] font-bold uppercase tracking-wider text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive gap-2 rounded-lg"
              >
                <XCircle className="h-3.5 w-3.5" /> {pesanan.status === "PENDING" ? "Tolak" : "Batalkan"}
              </Button>
            )}

            {(pesanan.status === "PENDING" || pesanan.status === "PROSES") && (
              <Button
                onClick={() => setStatusToConfirm(pesanan.status === "PENDING" ? "PROSES" : "DIKIRIM")}
                className="h-9 px-6 text-[10px] font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2 rounded-lg"
              >
                {pesanan.status === "PENDING" ? <CheckCircle className="h-3.5 w-3.5" /> : <Truck className="h-3.5 w-3.5" />}
                {pesanan.status === "PENDING" ? "Proses Pesanan" : "Kirim Sekarang"}
              </Button>
            )}

            {pesanan.status === "DIKIRIM" && (
              <Button
                onClick={() => setStatusToConfirm("SUKSES")}
                className="h-9 px-10 text-[10px] font-bold uppercase tracking-wider bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20 gap-2 rounded-lg"
              >
                <CheckCircle className="h-3.5 w-3.5" /> Selesaikan Pengiriman
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={onClose}
              className="h-9 px-8 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted/50 rounded-lg"
            >
              Tutup
            </Button>
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={!!statusToConfirm}
        onClose={() => setStatusToConfirm(null)}
        onConfirm={confirmStatusChange}
        title="Konfirmasi Perubahan Status"
        message={`Apakah Anda yakin ingin mengubah status pesanan menjadi ${statusToConfirm}? ${statusToConfirm === "SUKSES" ? "Sistem akan otomatis membuat backorder untuk barang yang belum terpenuhi." : ""}`}
        confirmText="Ya, Update Status"
        type={statusToConfirm === "BATAL" ? "danger" : "info"}
      />
    </div>
  );
};

export default OrderDetail;

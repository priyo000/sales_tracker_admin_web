import React, { useCallback, useEffect, useRef, useState } from "react";
import { Truck, Plus, Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";
import { useKiriman } from "../features/kiriman/hooks/useKiriman";
import KirimanTable from "../features/kiriman/components/KirimanTable";
import KirimanBuilder from "../features/kiriman/components/KirimanBuilder";
import { ConfirmModal } from "../components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/FormField";
import { DatePicker } from "@/components/ui/date-picker";
import type {
  Kiriman,
  KirimanDetail,
  KirimanPelanggan,
} from "../features/kiriman/types";
import { format } from "date-fns";

const KirimanPage: React.FC = () => {
  const {
    kirimans,
    loading,
    fetchKirimans,
    getKiriman,
    createKiriman,
    updateKiriman,
    deleteKiriman,
    addRute,
    addPelanggan,
    removeDetail,
    setUrutan,
    pagination,
  } = useKiriman();

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  // Mode: list | buat | edit
  const [mode, setMode] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<Kiriman | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // State form
  const [tanggal, setTanggal] = useState<Date>(new Date());
  const [keterangan, setKeterangan] = useState("");
  const [details, setDetails] = useState<KirimanDetail[]>([]);
  const [saving, setSaving] = useState(false);
  /**
   * Entri belum-disimpan untuk kiriman BARU: pratinjau pelanggan dari rute
   * yang diimpor + pelanggan manual. Ditampilkan langsung di list & peta.
   * Saat Simpan, id_rute dikirim ke backend dan backend yang memetakan
   * rute → pelanggan (sumber kebenaran tetap server).
   */
  const [pendingDetails, setPendingDetails] = useState<KirimanDetail[]>([]);
  const [pendingRuteIds, setPendingRuteIds] = useState<number[]>([]);
  const clientKeyRef = useRef(-1);

  const tambahPendingRute = useCallback(
    (ruteId: number, ruteNama: string, customers: KirimanPelanggan[]) => {
      setPendingRuteIds((prev) =>
        prev.includes(ruteId) ? prev : [...prev, ruteId],
      );
      setPendingDetails((prev) => {
        const ada = new Set<number>([
          ...prev.map((d) => d.id_pelanggan),
        ]);
        const baru: KirimanDetail[] = [];
        for (const p of customers) {
          if (ada.has(p.id)) continue;
          ada.add(p.id);
          baru.push({
            id: clientKeyRef.current--, // id sementara (negatif) untuk key & X
            id_kiriman: 0,
            id_pelanggan: p.id,
            id_rute_asal: ruteId,
            rute_asal: { id: ruteId, nama_rute: ruteNama },
            pelanggan: p,
          });
        }
        if (baru.length === 0) {
          toast.success("Semua pelanggan rute ini sudah ada di daftar");
        } else {
          toast.success(`${baru.length} pelanggan dari ${ruteNama} ditambahkan`);
        }
        return [...prev, ...baru];
      });
    },
    [],
  );

  const tambahPendingPelanggan = useCallback((p: KirimanPelanggan) => {
    setPendingDetails((prev) => {
      if (prev.some((d) => d.id_pelanggan === p.id)) {
        toast("Pelanggan sudah ada di daftar", { icon: "ℹ️" });
        return prev;
      }
      toast.success(`${p.nama_toko} ditambahkan`);
      return [
        ...prev,
        {
          id: clientKeyRef.current--,
          id_kiriman: 0,
          id_pelanggan: p.id,
          id_rute_asal: null,
          rute_asal: null,
          pelanggan: p,
        },
      ];
    });
  }, []);

  /** Tambah pelanggan dari sumber pesanan sales — list sudah terurut jam pesan. */
  const tambahPendingPesanan = useCallback((customers: KirimanPelanggan[]) => {
    setPendingDetails((prev) => {
      const ada = new Set([
        ...prev.map((d) => d.id_pelanggan),
      ]);
      const baru: KirimanDetail[] = [];
      for (const p of customers) {
        if (ada.has(p.id)) continue; // duplikat antar sumber dilewati
        ada.add(p.id);
        baru.push({
          id: clientKeyRef.current--,
          id_kiriman: 0,
          id_pelanggan: p.id,
          id_rute_asal: null,
          rute_asal: null,
          pelanggan: p,
        });
      }
      if (baru.length === 0) {
        toast("Semua toko dari pesanan itu sudah ada di daftar", { icon: "ℹ️" });
      } else {
        toast.success(`${baru.length} toko dari pesanan ditambahkan (urut jam pesan)`);
      }
      return [...prev, ...baru];
    });
  }, []);

  const hapusPending = useCallback((clientKey: number) => {
    setPendingDetails((prev) => prev.filter((d) => d.id !== clientKey));
  }, []);

  /** Susun ulang urutan gabungan (tersimpan + pending) hasil drag-drop. */
  const reorderGabungan = useCallback(
    async (urutanId: number[]) => {
      const semua = [...details, ...pendingDetails];
      const peta = new Map(semua.map((d) => [d.id, d]));
      const tersimpan = urutanId
        .map((id) => peta.get(id))
        .filter((d): d is KirimanDetail => !!d && d.id_kiriman !== 0);
      const pending = urutanId
        .map((id) => peta.get(id))
        .filter((d): d is KirimanDetail => !!d && d.id_kiriman === 0);

      if (!editing) {
        // Mode buat: cukup susun ulang state lokal.
        setPendingDetails(pending);
        return;
      }

      // Optimistik: urutkan tampilan dulu, lalu simpan ke backend.
      setDetails(tersimpan);
      setPendingDetails(pending);
      const res = await setUrutan(
        editing.id,
        tersimpan.map((d) => d.id),
      );
      if (res.success && res.data) {
        setDetails(res.data.details ?? []);
      } else {
        toast.error(res.message || "Gagal menyimpan urutan");
        // Kembalikan urutan lama bila gagal
        setDetails(details);
        setPendingDetails(pendingDetails);
      }
    },
    [details, pendingDetails, editing, setUrutan],
  );

  useEffect(() => {
    const t = setTimeout(() => {
      fetchKirimans({ search: searchTerm, page, per_page: perPage });
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm, page, perPage, fetchKirimans]);

  const resetForm = useCallback(() => {
    setTanggal(new Date());
    setKeterangan("");
    setDetails([]);
    setPendingDetails([]);
    setPendingRuteIds([]);
    setEditing(null);
  }, []);

  const openBuat = () => {
    resetForm();
    setMode("form");
  };

  const openEdit = async (kiriman: Kiriman) => {
    resetForm();
    const full = await getKiriman(kiriman.id);
    if (!full) {
      toast.error("Gagal memuat kiriman");
      return;
    }
    setEditing(full);
    setTanggal(new Date(full.tanggal));
    setKeterangan(full.keterangan ?? "");
    setDetails(full.details ?? []);
    setMode("form");
  };

  /** Tambah isi rute: kiriman baru → pratinjau pending; tersimpan → langsung POST. */
  const handleAddRute = useCallback(
    async (idRute: number) => {
      if (!editing) return; // mode buat ditangani onAddPendingRute di builder
      const res = await addRute(editing.id, idRute);
      if (res.success && res.data) {
        setDetails(res.data.details ?? []);
        toast.success("Rute ditambahkan");
      } else {
        toast.error(res.message || "Gagal menambahkan rute");
      }
    },
    [editing, addRute],
  );

  const handleAddPelanggan = useCallback(
    async (ids: number[]) => {
      if (!editing) return; // mode buat ditangani onAddPendingPelanggan di builder
      const res = await addPelanggan(editing.id, ids);
      if (res.success && res.data) {
        setDetails(res.data.details ?? []);
        toast.success("Pelanggan ditambahkan");
      } else {
        toast.error(res.message || "Gagal menambahkan pelanggan");
      }
    },
    [editing, addPelanggan],
  );

  const handleRemoveDetail = useCallback(
    async (detailId: number) => {
      if (!editing) return;
      const res = await removeDetail(editing.id, detailId);
      if (res.success && res.data) {
        setDetails(res.data.details ?? []);
        toast.success("Pelanggan dikeluarkan dari kiriman");
      } else {
        toast.error(res.message || "Gagal menghapus pelanggan");
      }
    },
    [editing, removeDetail],
  );

  const handleSimpan = async () => {
    setSaving(true);
    try {
      if (editing) {
        const res = await updateKiriman(editing.id, {
          tanggal: format(tanggal, "yyyy-MM-dd"),
          keterangan: keterangan || null,
        });
        if (res.success) {
          toast.success("Kiriman diperbarui");
          setMode("list");
          fetchKirimans({ search: searchTerm, page, per_page: perPage });
        } else {
          toast.error(res.message || "Gagal memperbarui kiriman");
        }
      } else {
        const res = await createKiriman({
          tanggal: format(tanggal, "yyyy-MM-dd"),
          keterangan: keterangan || null,
          rute_ids: pendingRuteIds,
          // Pastikan pelanggan manual yang dicentang tapi rute-nya diimpor
          // tetap terkirim; backend melewati yang sudah ada dari rute.
          pelanggan_ids: pendingDetails
            .filter((d) => d.id_rute_asal == null)
            .map((d) => d.id_pelanggan),
        });
        if (res.success) {
          toast.success("Kiriman dibuat");
          setMode("list");
          fetchKirimans({ search: searchTerm, page: 1, per_page: perPage });
          setPage(1);
        } else {
          toast.error(res.message || "Gagal membuat kiriman");
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    const res = await deleteKiriman(deletingId);
    if (res.success) {
      toast.success("Kiriman dihapus");
      setDeletingId(null);
      fetchKirimans({ search: searchTerm, page, per_page: perPage });
    } else {
      toast.error(res.message || "Gagal menghapus kiriman");
    }
  };

  if (mode === "form") {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary text-white rounded-lg shadow-lg shadow-primary/30">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {editing ? "Edit Kiriman" : "Buat Kiriman"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Susun daftar pelanggan yang dikirimi barang, lalu export ke
                Google My Maps untuk supir.
              </p>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <div className="space-y-1">
              <FormField label="Tanggal" required>
                <DatePicker
                  date={tanggal}
                  onChange={(d) => d && setTanggal(d)}
                />
              </FormField>
            </div>
            <div className="space-y-1">
              <FormField label="Keterangan">
                <Input
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="mis. Supir Budi — mobil pickup"
                  className="h-9 w-56"
                />
              </FormField>
            </div>
            <Button
              onClick={handleSimpan}
              disabled={saving}
              className="gap-2 h-9"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Simpan
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setMode("list");
                resetForm();
              }}
              className="h-9"
            >
              Batal
            </Button>
          </div>
        </div>

        <KirimanBuilder
          details={details}
          pendingDetails={pendingDetails}
          loading={saving}
          isSaved={!!editing}
          onReorder={reorderGabungan}
          onReorderPending={reorderGabungan}
          onAddPendingPesanan={tambahPendingPesanan}
          onAddPendingRute={tambahPendingRute}
          onAddPendingPelanggan={tambahPendingPelanggan}
          onRemovePending={hapusPending}
          onAddRute={handleAddRute}
          onAddPelanggan={handleAddPelanggan}
          onRemoveDetail={handleRemoveDetail}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary text-white rounded-lg shadow-lg shadow-primary/30">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Rute Kiriman
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Daftar pelanggan kiriman harian untuk supir — susun dari rute
              master, export ke Google My Maps.
            </p>
          </div>
        </div>
      </div>

      <KirimanTable
        data={kirimans}
        loading={loading}
        onOpen={openEdit}
        onDelete={(id) => setDeletingId(id)}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        pagination={pagination}
        onPageChange={setPage}
        onPerPageChange={(p) => {
          setPerPage(p);
          setPage(1);
        }}
        toolbar={
          <Button onClick={openBuat} className="gap-2 shadow-md h-9">
            <Plus className="h-4 w-4" /> Buat Kiriman
          </Button>
        }
      />

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Hapus Kiriman"
        message="Hapus sesi kiriman ini beserta seluruh daftar pelanggannya?"
        type="danger"
        confirmText="Hapus"
      />
    </div>
  );
};

export default KirimanPage;

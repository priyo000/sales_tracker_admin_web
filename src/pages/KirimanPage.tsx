import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import type { Kiriman, KirimanDetail } from "../features/kiriman/types";
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
  // Untuk kiriman BARU: pilihan rute/pelanggan menunggu disimpan
  const [pendingRuteIds, setPendingRuteIds] = useState<number[]>([]);
  const [pendingPelangganIds, setPendingPelangganIds] = useState<number[]>([]);

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
    setPendingRuteIds([]);
    setPendingPelangganIds([]);
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

  const usedRuteIds = useMemo(
    () =>
      Array.from(
        new Set(
          details
            .map((d) => d.id_rute_asal)
            .filter((id): id is number => id != null),
        ),
      ),
    [details],
  );

  /** Tambah isi rute: kiriman baru → pending; yang tersimpan → langsung POST. */
  const handleAddRute = useCallback(
    async (idRute: number) => {
      if (!editing) {
        setPendingRuteIds((prev) =>
          prev.includes(idRute) ? prev : [...prev, idRute],
        );
        toast.success("Rute ditandai (tersimpan saat Simpan)");
        return;
      }
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
      if (!editing) {
        setPendingPelangganIds((prev) =>
          Array.from(new Set([...prev, ...ids])),
        );
        toast.success("Pelanggan ditandai (tersimpan saat Simpan)");
        return;
      }
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
          pelanggan_ids: pendingPelangganIds,
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
          usedRuteIds={usedRuteIds}
          loading={saving}
          pendingRuteIds={pendingRuteIds}
          pendingPelangganIds={pendingPelangganIds}
          onTogglePendingRute={(id) =>
            setPendingRuteIds((prev) =>
              prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
            )
          }
          onTogglePendingPelanggan={(id) =>
            setPendingPelangganIds((prev) =>
              prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
            )
          }
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

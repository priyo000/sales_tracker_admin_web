import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Search, MapPin, X, Loader2, Truck } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { KirimanDetail, KirimanPelanggan } from "../types";
import KirimanMap from "./KirimanMap";

interface RuteOption {
  id: number;
  nama_rute: string;
  details_count?: number;
}

interface PelangganOption {
  id: number;
  kode_pelanggan?: string | null;
  nama_toko: string;
  alamat_usaha?: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface KirimanBuilderProps {
  /** Detail tersimpan di backend (kiriman yang sudah ada). */
  details: KirimanDetail[];
  /** Entri belum-disimpan: dari rute yang diimpor / pelanggan manual. */
  pendingDetails: KirimanDetail[];
  loading?: boolean;
  /** Mode buat-baru: kumpulkan entri pending (ditampilkan langsung di list+peta). */
  onAddPendingRute: (ruteId: number, ruteNama: string, customers: KirimanPelanggan[]) => void;
  onAddPendingPelanggan: (p: KirimanPelanggan) => void;
  onRemovePending: (clientKey: number) => void;
  /** Mode edit (kiriman tersimpan): aksi langsung ke backend. */
  onAddRute?: (idRute: number) => Promise<void>;
  onAddPelanggan?: (ids: number[]) => Promise<void>;
  onRemoveDetail?: (detailId: number) => Promise<void>;
}

/**
 * Layar susun kiriman: peta di kanan, panel kiri untuk menambah rute
 * dan pelanggan manual, panel bawah untuk daftar + tombol X.
 */
const KirimanBuilder: React.FC<KirimanBuilderProps> = ({
  details,
  pendingDetails,
  loading,
  onAddPendingRute,
  onAddPendingPelanggan,
  onRemovePending,
  onAddRute,
  onAddPelanggan,
  onRemoveDetail,
}) => {
  const [ruteOptions, setRuteOptions] = useState<RuteOption[]>([]);
  const [pelangganOptions, setPelangganOptions] = useState<PelangganOption[]>([]);
  const [selectedRute, setSelectedRute] = useState<string>("");
  const [pelangganSearch, setPelangganSearch] = useState("");
  const [focusDetailId, setFocusDetailId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [memuatRute, setMemuatRute] = useState(false);

  useEffect(() => {
    let active = true;
    // ?all=true → seluruh rute divisi (bentuk { data: [...] })
    api
      .get("/rute", { params: { all: true } })
      .then((res) => {
        if (active) setRuteOptions(res.data?.data ?? []);
      })
      .catch(() => toast.error("Gagal memuat daftar rute"));
    return () => {
      active = false;
    };
  }, []);

  // Muat semua pelanggan (per_page=-1, pola RouteForm) untuk tambah manual.
  useEffect(() => {
    let active = true;
    api
      .get("/pelanggan", { params: { per_page: -1, status: "active,pending" } })
      .then((res) => {
        if (active) setPelangganOptions(res.data?.data ?? []);
      })
      .catch(() => toast.error("Gagal memuat daftar pelanggan"));
    return () => {
      active = false;
    };
  }, []);

  const filteredPelanggan = useMemo(() => {
    const q = pelangganSearch.trim().toLowerCase();
    const base = q
      ? pelangganOptions.filter(
          (p) =>
            p.nama_toko.toLowerCase().includes(q) ||
            (p.kode_pelanggan ?? "").toLowerCase().includes(q) ||
            (p.alamat_usaha ?? "").toLowerCase().includes(q),
        )
      : pelangganOptions;
    // Batasi list agar ringan; pencarian tetap mencari di seluruh data.
    return base.slice(0, 60);
  }, [pelangganOptions, pelangganSearch]);

  const sudahAdaIds = useMemo(
    () =>
      new Set<number>([
        ...details.map((d) => d.id_pelanggan),
        ...pendingDetails.map((d) => d.id_pelanggan),
      ]),
    [details, pendingDetails],
  );

  const ruteDipakaiIds = useMemo(
    () =>
      new Set<number>([
        ...details
          .map((d) => d.id_rute_asal)
          .filter((id): id is number => id != null),
        ...pendingDetails
          .map((d) => d.id_rute_asal)
          .filter((id): id is number => id != null),
      ]),
    [details, pendingDetails],
  );

  const handleTambahRute = useCallback(async () => {
    if (!selectedRute) {
      toast.error("Pilih rute dulu");
      return;
    }
    const idRute = Number(selectedRute);
    setBusy(true);
    try {
      // Kiriman baru: ambil isi rute untuk pratinjau langsung di list+peta.
      if (!onAddRute) {
        setMemuatRute(true);
        const res = await api.get(`/rute/${idRute}`);
        const isiRute = res.data?.details ?? [];
        const pelangganList: KirimanPelanggan[] = isiRute
          .map((d: { pelanggan?: KirimanPelanggan | null }) => d.pelanggan)
          .filter((p: KirimanPelanggan | null | undefined): p is KirimanPelanggan => !!p);
        setMemuatRute(false);
        if (pelangganList.length === 0) {
          toast.error("Rute ini belum berisi pelanggan");
          return;
        }
        const namaRute =
          ruteOptions.find((r) => r.id === idRute)?.nama_rute ?? `Rute ${idRute}`;
        onAddPendingRute(idRute, namaRute, pelangganList);
        setSelectedRute("");
        return;
      }
      await onAddRute(idRute);
      setSelectedRute("");
    } catch {
      setMemuatRute(false);
      toast.error("Gagal mengambil isi rute");
    } finally {
      setBusy(false);
    }
  }, [selectedRute, onAddRute, onAddPendingRute, ruteOptions]);

  const handleTambahPelanggan = useCallback(
    async (pelanggan: PelangganOption) => {
      setBusy(true);
      try {
        if (!onAddPelanggan) {
          onAddPendingPelanggan({
            id: pelanggan.id,
            kode_pelanggan: pelanggan.kode_pelanggan ?? null,
            nama_toko: pelanggan.nama_toko,
            nama_pemilik: null,
            alamat_usaha: pelanggan.alamat_usaha ?? null,
            kecamatan_usaha: null,
            kota_usaha: null,
            latitude: pelanggan.latitude,
            longitude: pelanggan.longitude,
            no_hp_pribadi: null,
          });
          return;
        }
        await onAddPelanggan([pelanggan.id]);
      } finally {
        setBusy(false);
      }
    },
    [onAddPelanggan, onAddPendingPelanggan],
  );

  const sudahAda = (idPelanggan: number) => sudahAdaIds.has(idPelanggan);

  return (
    <div className="flex flex-col h-[75vh] border rounded-lg overflow-hidden bg-background">
      {/* Toolbar: pilih rute + info */}
      <div className="p-3 border-b border-border space-y-2">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
            <Select value={selectedRute} onValueChange={setSelectedRute}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Pilih rute master untuk diimpor…" />
              </SelectTrigger>
              <SelectContent>
                {ruteOptions.length === 0 && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Belum ada rute
                  </div>
                )}
                {ruteOptions.map((r) => {
                  const dipakai = ruteDipakaiIds.has(r.id);
                  return (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.nama_rute} ({r.details_count ?? 0} toko)
                      {dipakai ? " ✓" : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Button
              type="button"
              onClick={handleTambahRute}
              disabled={!selectedRute || busy || loading}
              className="gap-2 h-9"
            >
              {busy || memuatRute ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Tambah Rute
            </Button>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Bisa tambah lebih dari satu rute — pelanggan dari tiap rute masuk ke
          daftar (yang sudah ada dilewati).
        </p>
      </div>

      {/* Body: daftar kiri, peta kanan */}
      <div className="flex flex-1 min-h-0">
        {/* Panel kiri: tambah manual + daftar */}
        <div className="w-[340px] shrink-0 flex flex-col border-r border-border">
          {/* Tambah manual */}
          <div className="p-2 border-b border-border">
            <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">
              Tambah Pelanggan Manual
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari nama toko / kode…"
                className="h-8 text-xs pl-7"
                value={pelangganSearch}
                onChange={(e) => setPelangganSearch(e.target.value)}
              />
            </div>
            <div className="mt-1.5 max-h-44 overflow-y-auto space-y-0.5">
              {pelangganSearch.trim() === "" ? (
                <p className="text-[11px] text-muted-foreground px-1 py-2">
                  Ketik untuk mencari pelanggan di luar rute.
                </p>
              ) : (
                filteredPelanggan.map((p) => {
                  const ada = sudahAda(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={ada || busy}
                      onClick={() => handleTambahPelanggan(p)}
                      className={cn(
                        "w-full text-left px-2 py-1.5 rounded-md text-xs hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                      )}
                    >
                      <span className="font-medium">{p.nama_toko}</span>
                      {p.kode_pelanggan && (
                        <span className="ml-1 text-[10px] text-muted-foreground">
                          {p.kode_pelanggan}
                        </span>
                      )}
                      {ada && (
                        <span className="ml-1 text-[10px] text-green-600">
                          ✓ sudah ada
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Daftar pelanggan kiriman */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1.5">
              Daftar Kiriman ({details.length + pendingDetails.length})
            </div>
            {details.length === 0 && pendingDetails.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <MapPin className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">
                  Masih kosong. Tambah dari rute master atau cari pelanggan
                  manual — pin akan muncul di peta.
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {details.map((d, i) => (
                  <div
                    key={d.id}
                    onClick={() => setFocusDetailId(d.id)}
                    className={cn(
                      "group flex items-start gap-2 px-2 py-1.5 rounded-md text-xs cursor-pointer hover:bg-muted transition-colors",
                      focusDetailId === d.id && "bg-muted",
                    )}
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {d.pelanggan?.nama_toko ?? `Pelanggan #${d.id_pelanggan}`}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {d.pelanggan?.alamat_usaha ?? "—"}
                      </div>
                      {(d.pelanggan?.latitude == null ||
                        d.pelanggan?.longitude == null) && (
                        <span className="inline-block mt-0.5 px-1 rounded bg-gray-200 text-gray-600 text-[9px] font-semibold">
                          tanpa koordinat
                        </span>
                      )}
                    </div>
                    {onRemoveDetail && (
                      <button
                        type="button"
                        disabled={busy || loading}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveDetail(d.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity disabled:cursor-not-allowed"
                        title="Keluarkan dari kiriman"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {/* Entri belum-disimpan: rute yang diimpor / pelanggan manual */}
                {pendingDetails.map((d, i) => (
                  <div
                    key={d.id}
                    onClick={() => setFocusDetailId(d.id)}
                    className={cn(
                      "group flex items-start gap-2 px-2 py-1.5 rounded-md text-xs cursor-pointer hover:bg-muted transition-colors",
                      focusDetailId === d.id && "bg-muted",
                    )}
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/70 text-white text-[10px] font-bold">
                      {details.length + i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {d.pelanggan?.nama_toko ?? `Pelanggan #${d.id_pelanggan}`}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {d.rute_asal
                          ? `dari rute: ${d.rute_asal.nama_rute}`
                          : (d.pelanggan?.alamat_usaha ?? "tambahan manual")}
                      </div>
                      {(d.pelanggan?.latitude == null ||
                        d.pelanggan?.longitude == null) && (
                        <span className="inline-block mt-0.5 px-1 rounded bg-gray-200 text-gray-600 text-[9px] font-semibold">
                          tanpa koordinat
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemovePending(d.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity disabled:cursor-not-allowed"
                      title="Keluarkan dari kiriman"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Peta */}
        <div className="flex-1 min-w-0">
          <KirimanMap
            details={[...details, ...pendingDetails]}
            focusDetailId={focusDetailId}
            onMarkerClick={(id) => setFocusDetailId(id)}
          />
        </div>
      </div>
    </div>
  );
};

export default KirimanBuilder;

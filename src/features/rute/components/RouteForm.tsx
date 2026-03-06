import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Pelanggan } from "../../pelanggan/types";
import { Rute, RuteFormData } from "../types";
import { usePelanggan } from "../../pelanggan/hooks/usePelanggan";
import { useDivisi } from "../../divisi/hooks/useDivisi";
import { useAuth } from "../../../hooks/useAuth";
import RouteCustomerMap from "./RouteCustomerMap";
import {
  Search,
  Info,
  CheckCircle2,
  User as UserIcon,
  LayoutGrid,
  X,
  Type,
  FileText,
  Save,
} from "lucide-react";
import api from "../../../services/api";
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
import { FormField } from "@/components/ui/FormField";

interface RouteFormProps {
  initialData?: Rute | null;
  onSubmit: (data: RuteFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

interface SalesFilterOption {
  id: number;
  nama_lengkap: string;
  jabatan: string;
  has_account: boolean;
  has_data: boolean;
}

const RouteForm: React.FC<RouteFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading,
}) => {
  const { user } = useAuth();
  const {
    pelanggans,
    fetchPelanggans,
    fetchFilterOptions,
    loading: pelanggansLoading,
  } = usePelanggan();
  const { divisis, fetchDivisis } = useDivisi();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOptions, setFilterOptions] = useState<SalesFilterOption[]>([]);
  const [selectedKaryawanId, setSelectedKaryawanId] = useState<number | "all">(
    "all",
  );
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [focusLocation, setFocusLocation] = useState<{
    lat: number;
    lng: number;
    timestamp: number;
  } | null>(null);

  const [formData, setFormData] = useState<RuteFormData>({
    nama_rute: initialData?.nama_rute || "",
    deskripsi: initialData?.deskripsi || "",
    customer_ids: [],
    id_divisi: initialData?.id_divisi || undefined,
  });
  const [namaRute, setNamaRute] = useState(initialData?.nama_rute || "");
  const [deskripsi, setDeskripsi] = useState(initialData?.deskripsi || "");
  const [idDivisi, setIdDivisi] = useState<string>(
    initialData?.id_divisi?.toString() || "",
  );

  // Fetch sales filter options and divisis
  useEffect(() => {
    const loadOptions = async () => {
      const options = await fetchFilterOptions({ only_with_data: true });
      setFilterOptions(options);
    };
    loadOptions();

    if (user?.peran === "super_admin" || user?.peran === "admin_perusahaan") {
      fetchDivisis();
    }
  }, [fetchFilterOptions, fetchDivisis, user]);

  // Fetch customers (active & pending)
  useEffect(() => {
    fetchPelanggans({
      status: "active,pending",
      per_page: -1,
      id_karyawan:
        selectedKaryawanId === "all" ? undefined : selectedKaryawanId,
    });
  }, [fetchPelanggans, selectedKaryawanId]);

  // Fetch existing route details if editing
  useEffect(() => {
    const fetchDetails = async () => {
      if (initialData?.id) {
        setDetailsLoading(true);
        try {
          if (initialData.details && initialData.details.length > 0) {
            const ids = initialData.details.map(
              (d) => d.pelanggan?.id || d.id_pelanggan,
            );
            setFormData((prev) => ({ ...prev, customer_ids: ids }));
          } else {
            const response = await api.get(`/rute/${initialData.id}`);
            const details = response.data.details || [];
            const ids = details.map(
              (d: { id_pelanggan: number; pelanggan?: { id: number } }) =>
                d.pelanggan?.id || d.id_pelanggan,
            );
            setFormData((prev) => ({ ...prev, customer_ids: ids }));
          }
        } catch (error) {
          console.error("Failed to fetch route details:", error);
        } finally {
          setDetailsLoading(false);
        }
      }
    };

    if (initialData) {
      fetchDetails();
    }
  }, [initialData]);

  const toggleCustomer = useCallback(
    (id: number) => {
      setFormData((prev) => {
        const currentIds = prev.customer_ids || [];
        if (currentIds.includes(id)) {
          return {
            ...prev,
            customer_ids: currentIds.filter((cid) => cid !== id),
          };
        } else {
          return { ...prev, customer_ids: [...currentIds, id] };
        }
      });

      // Focus map on this customer
      const customer = pelanggans.find((p) => p.id === id);
      if (customer?.latitude && customer?.longitude) {
        setFocusLocation({
          lat: customer.latitude,
          lng: customer.longitude,
          timestamp: Date.now(),
        });
      }

      // Auto-scroll list and focus
      setTimeout(() => {
        const element = document.getElementById(`customer-item-${id}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add(
            "ring-4",
            "ring-primary/40",
            "ring-offset-2",
            "z-30",
          );
          setTimeout(() => {
            element.classList.remove(
              "ring-4",
              "ring-primary/40",
              "ring-offset-2",
              "z-30",
            );
          }, 1500);
        }
      }, 100);
    },
    [pelanggans],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      nama_rute: namaRute,
      deskripsi: deskripsi,
      id_divisi: idDivisi ? Number(idDivisi) : undefined,
    });
  };

  const filteredCustomers = useMemo(() => {
    return pelanggans.filter(
      (p) =>
        p.nama_toko.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.alamat_usaha &&
          p.alamat_usaha.toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [pelanggans, searchQuery]);

  const selectedIdsSet = useMemo(
    () => new Set(formData.customer_ids),
    [formData.customer_ids],
  );

  const isLoading = loading || detailsLoading;
  const selectedCount = formData.customer_ids?.length || 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-[80vh] w-full bg-background overflow-hidden"
    >
      {/* LEFT SIDEBAR - CONTROL PANEL */}
      <div className="w-[400px] flex flex-col border-r border-border bg-card z-10 shrink-0">
        {/* Header Section */}
        <div className="p-6 border-b border-border bg-background space-y-6">
          <div className="space-y-4">
            {(user?.peran === "super_admin" ||
              user?.peran === "admin_perusahaan") && (
              <FormField label="Divisi Rute" icon={LayoutGrid} required>
                <Select value={idDivisi} onValueChange={setIdDivisi} required>
                  <SelectTrigger className="h-11 bg-card border-border/50">
                    <SelectValue placeholder="Pilih Divisi..." />
                  </SelectTrigger>
                  <SelectContent>
                    {divisis.map((div) => (
                      <SelectItem key={div.id} value={div.id.toString()}>
                        {div.nama_divisi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            )}

            <FormField label="Nama Rute" icon={Type} required>
              <Input
                name="nama_rute"
                type="text"
                required
                className="h-11 bg-card border-border/50 font-bold"
                value={namaRute}
                onChange={(e) => setNamaRute(e.target.value)}
                placeholder="Ex: Rute Senin Barat"
              />
            </FormField>

            <FormField label="Keterangan Rute" icon={FileText}>
              <Input
                name="deskripsi"
                className="h-11 bg-card border-border/50"
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Contoh: Fokus toko besar"
              />
            </FormField>
          </div>
        </div>

        {/* Search & List Header */}
        <div className="px-4 py-4 bg-muted/30 border-b border-border space-y-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Cari Toko atau Alamat..."
              className="w-full pl-10 pr-3 h-11 bg-card border-border/50 focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <FormField label="Filter Berdasarkan Sales" icon={UserIcon} className="space-y-1">
            <Select
              value={selectedKaryawanId.toString()}
              onValueChange={(val) =>
                setSelectedKaryawanId(val === "all" ? "all" : Number(val))
              }
            >
              <SelectTrigger className="w-full bg-card border-border/50 h-10 text-xs">
                <SelectValue placeholder="Semua Sales (Karyawan)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Sales (Karyawan)</SelectItem>
                {filterOptions.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id.toString()}>
                    {opt.nama_lengkap} {!opt.has_account ? "(Belum Ada Akun)" : ""}{" "}
                    {opt.has_data ? "✓" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
            <span>{filteredCustomers.length} Pelanggan</span>
            <span
              className={cn(
                "transition-colors",
                selectedCount > 0 ? "text-primary" : "",
              )}
            >
              {selectedCount} Terpilih
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-muted/10">
          {pelanggansLoading ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground space-y-3">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-widest">Memuat database...</span>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground space-y-2 opacity-50">
              <Info className="h-8 w-8" />
              <span className="text-[10px] font-black uppercase tracking-widest">Tidak ada data</span>
            </div>
          ) : (
            <CustomerListItems
              customers={filteredCustomers}
              selectedIds={selectedIdsSet}
              onToggle={toggleCustomer}
            />
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 border-t border-border bg-background shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20 space-y-4 font-bold">
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-muted-foreground">
            <span>Total Rute:</span>
            <span className="text-foreground">
              {selectedCount} Stop Points
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading}
              className="h-11 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              <X className="mr-2 h-4 w-4" /> Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" /> Simpan
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* RIGHT MAIN - MAP */}
      <div className="flex-1 relative bg-muted/20">
        <RouteCustomerMap
          customers={pelanggans}
          selectedIds={selectedIdsSet}
          onToggle={toggleCustomer}
          focusLocation={focusLocation || null}
          height="h-full"
        />

        {/* Floating Map Hint */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-max">
          <div className="bg-background/90 backdrop-blur shadow-2xl border border-border/50 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground flex items-center gap-3 animate-in slide-in-from-top-4 duration-700">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>Klik marker di peta untuk pilih pelanggan</span>
          </div>
        </div>
      </div>
    </form>
  );
};

export default RouteForm;

// MEMOIZED COMPONENTS FOR PERFORMANCE
const CustomerListItems = memo(
  ({
    customers,
    selectedIds,
    onToggle,
  }: {
    customers: Pelanggan[];
    selectedIds: Set<number> | number[];
    onToggle: (id: number) => void;
  }) => {
    return (
      <>
        {customers.map((customer) => {
          const isSelected =
            selectedIds instanceof Set
              ? selectedIds.has(customer.id)
              : selectedIds.includes(customer.id);
          return (
            <CustomerItem
              key={customer.id}
              customer={customer}
              isSelected={isSelected}
              onToggle={onToggle}
            />
          );
        })}
      </>
    );
  },
);

const CustomerItem = memo(
  ({
    customer,
    isSelected,
    onToggle,
  }: {
    customer: Pelanggan;
    isSelected: boolean;
    onToggle: (id: number) => void;
  }) => {
    return (
      <div
        id={`customer-item-${customer.id}`}
        onClick={() => onToggle(customer.id)}
        className={cn(
          "relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer group mb-2 last:mb-0",
          isSelected
            ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20"
            : "bg-card border-border/50 hover:border-primary/30 hover:shadow-md",
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all",
              isSelected
                ? "bg-primary text-white shadow-lg scale-110"
                : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
            )}
          >
            {isSelected ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <div className="w-2.5 h-2.5 rounded-full bg-current opacity-30" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4
              className={cn(
                "text-xs font-black uppercase tracking-tight truncate pr-2",
                isSelected ? "text-primary" : "text-foreground",
              )}
            >
              {customer.nama_toko}
            </h4>
            <p className="text-[10px] text-muted-foreground font-medium line-clamp-2 mt-1 leading-relaxed italic pr-4">
              {customer.alamat_usaha}
            </p>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {customer.details_rute && customer.details_rute.length > 0 && (
                <div className="w-full flex flex-wrap gap-1.5 mb-1.5">
                  {customer.details_rute.map((dr) => (
                    <span
                      key={dr.id}
                      className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black uppercase bg-amber-100/50 text-amber-700 border border-amber-200/50"
                    >
                      Rute: {dr.rute?.nama_rute || "N/A"}
                    </span>
                  ))}
                </div>
              )}
              {customer.divisi && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase bg-muted text-muted-foreground border border-border/50">
                  {customer.divisi.nama_divisi}
                </span>
              )}
              <span className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase border",
                customer.status === "active" ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"
              )}>
                {customer.status}
              </span>
            </div>
          </div>
        </div>
        {isSelected && (
          <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-primary rounded-r-2xl" />
        )}
      </div>
    );
  },
);

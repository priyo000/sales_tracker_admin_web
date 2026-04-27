import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Pelanggan } from "../../pelanggan/types";
import { Rute, RuteFormData } from "../types";
import { usePelanggan } from "../../pelanggan/hooks/usePelanggan";
import { useDivisi } from "../../divisi/hooks/useDivisi";
import { useAuth } from "../../../hooks/useAuth";
import RouteCustomerMap from "./RouteCustomerMap";
import {
  Info,
  CheckCircle2,
  LayoutGrid,
  Type,
  FileText,
} from "lucide-react";
import api from "../../../services/api";
import toast from "react-hot-toast";
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

type RuteFilterStatus = "all" | "in_this_route";

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
  const [ruteFilterStatus, setRuteFilterStatus] = useState<RuteFilterStatus>("all");
  const isMounted = React.useRef(false);

  const [formData, setFormData] = useState<RuteFormData>({
    nama_rute: initialData?.nama_rute || "",
    deskripsi: initialData?.deskripsi || "",
    customer_ids: [],
    id_divisi: initialData?.id_divisi || undefined,
  });
  const [namaRute, setNamaRute] = useState(initialData?.nama_rute || "");
  const [deskripsi, setDeskripsi] = useState(initialData?.deskripsi || "");
  const [idDivisi, setIdDivisi] = useState<string>(
    initialData?.id_divisi?.toString() ||
    (user?.peran === 'admin_divisi' ? user.karyawan?.id_divisi?.toString() ?? "" : "")
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

  // Fetch customers based on filter - get ALL for map, list will be paginated
  const loadCustomers = useCallback(() => {
    const params: {
      status: string;
      per_page: number;
      page?: number;
      id_karyawan?: number;
      id_rute?: number;
    } = {
      status: "active,pending",
      per_page: -1, // Get all for map
      id_karyawan:
        selectedKaryawanId === "all" ? undefined : selectedKaryawanId,
    };

    // If filter "Di Rute Ini" - use backend filter
    if (ruteFilterStatus === "in_this_route" && initialData?.id) {
      params.id_rute = initialData.id;
    }

    fetchPelanggans(params);
  }, [fetchPelanggans, selectedKaryawanId, ruteFilterStatus, initialData?.id]);

  // Auto-load customers when filters change
  useEffect(() => {
    if (isMounted.current) {
      loadCustomers();
    } else {
      isMounted.current = true;
    }
  }, [ruteFilterStatus, selectedKaryawanId, loadCustomers]);

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
          // silently fail
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
    (id: number, fromList: boolean = false) => {
      const currentIds = formData.customer_ids || [];
      const isCurrentlySelected = currentIds.includes(id);

      // Show warning if selecting customer that already has another route
      const customer = pelanggans.find((p) => p.id === id);
      const existingRutes = customer?.details_rute?.map(dr => dr.rute?.nama_rute).filter(Boolean) || [];
      const hasExistingRute = existingRutes.length > 0;

      if (!isCurrentlySelected && hasExistingRute) {
        toast(`${customer?.nama_toko} sudah ada di rute: ${existingRutes.join(', ')}`, { icon: '⚠️' });
      }

      setFormData((prev) => {
        const ids = prev.customer_ids || [];
        if (isCurrentlySelected) {
          return {
            ...prev,
            customer_ids: ids.filter((cid) => cid !== id),
          };
        } else {
          return { ...prev, customer_ids: [...ids, id] };
        }
      });

      // Only focus map if clicked from list
      if (fromList && customer?.latitude && customer?.longitude) {
        setFocusLocation({
          lat: customer.latitude,
          lng: customer.longitude,
          timestamp: Date.now(),
        });
      }

      // Always scroll to list item
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
    [pelanggans, formData.customer_ids],
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
    let filtered = pelanggans.filter(
      (p) =>
        p.nama_toko.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.alamat_usaha &&
          p.alamat_usaha.toLowerCase().includes(searchQuery.toLowerCase())),
    );

    // Filter by route status
    // Note: "unassigned" filter was removed - pelanggan boleh di banyak rute

    return filtered;
  }, [pelanggans, searchQuery, ruteFilterStatus]);

  // Paginated customers for list (show all for now to fix scroll issue)
  const paginatedCustomers = filteredCustomers;

  const selectedIdsSet = useMemo(
    () => new Set(formData.customer_ids),
    [formData.customer_ids],
  );

  const isLoading = loading || detailsLoading;
  const selectedCount = formData.customer_ids?.length || 0;

  // Map shows ALL filtered customers (not paginated)
  const mapCustomers = filteredCustomers;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-[80vh] w-full bg-background overflow-hidden"
    >
      {/* LEFT SIDE - Search/Filters + Customer List */}
      <div className="w-[320px] flex flex-col border-r border-border bg-card z-10 shrink-0">
        {/* Search & Filters */}
        <div className="p-2 border-b border-border space-y-2">
          {/* Label */}
          <div className="text-[10px] font-bold uppercase text-muted-foreground">
            Pencarian & Filter
          </div>
          
          {/* Search */}
          <Input
            type="text"
            placeholder="Cari nama toko atau alamat..."
            className="h-8 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Filters Row */}
          <div className="flex gap-1.5">
            <div className="flex-1">
              <div className="text-[9px] text-muted-foreground mb-1">Sales</div>
              <Select
                value={selectedKaryawanId.toString()}
                onValueChange={(val) =>
                  setSelectedKaryawanId(val === "all" ? "all" : Number(val))
                }
              >
                <SelectTrigger className="h-8 text-[10px]">
                  <SelectValue placeholder="Semua Sales" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Sales</SelectItem>
                  {filterOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id.toString()}>
                      {opt.nama_lengkap}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <div className="text-[9px] text-muted-foreground mb-1">Status</div>
              <Select
                value={ruteFilterStatus}
                onValueChange={(val) => setRuteFilterStatus(val as RuteFilterStatus)}
              >
                <SelectTrigger className="h-8 text-[10px]">
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="in_this_route">Sudah Di Rute Ini</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-[9px] text-muted-foreground pt-1">
            {filteredCustomers.length} pelanggan • {selectedCount} dipilih
          </div>
        </div>

        {/* Customer List */}
        <div className="flex-1 overflow-y-auto p-2 bg-muted/5">
          {pelanggansLoading ? (
            <div className="flex flex-col items-center justify-center h-32">
              <div className="animate-spin h-5 w-5 border border-primary/50 border-t-transparent rounded-full" />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground/50">
              <Info className="h-4 w-4" />
            </div>
          ) : (
              <CustomerListItems
                customers={paginatedCustomers}
                selectedIds={selectedIdsSet}
                onToggle={toggleCustomer}
              />
            )}
        </div>
      </div>

      {/* RIGHT SIDE - Map + Floating Form */}
      <div className="flex-1 relative">
        {/* Floating Form - Right Side */}
        <div className="absolute top-4 right-4 z-50 bg-background/95 backdrop-blur shadow-xl border border-border rounded-xl p-4 space-y-3 w-[260px]">
          <div className="text-xs font-bold uppercase tracking-wider">
            {initialData ? "Edit Rute" : "Buat Rute Baru"}
          </div>
          
          {(user?.peran === "super_admin" ||
            user?.peran === "admin_perusahaan") && (
            <FormField label="Divisi" icon={LayoutGrid}>
              <Select value={idDivisi} onValueChange={setIdDivisi}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Pilih..." />
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

          <FormField label="Nama Rute" icon={Type}>
            <Input
              name="nama_rute"
              type="text"
              required
              className="h-8 text-xs"
              value={namaRute}
              onChange={(e) => setNamaRute(e.target.value)}
              placeholder="Ex: Rute Senin Barat"
            />
          </FormField>

          <FormField label="Keterangan" icon={FileText}>
            <Input
              name="deskripsi"
              className="h-8 text-xs"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
            />
          </FormField>

          <div className="text-[10px] font-bold">
            Stop Points: <span className="text-primary">{selectedCount}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isLoading}
              className="h-8 text-[10px]"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="h-8 text-[10px]"
            >
              {isLoading ? "..." : "Simpan"}
            </Button>
          </div>
        </div>

        {/* Map */}
        <RouteCustomerMap
          customers={mapCustomers}
          selectedIds={selectedIdsSet}
          onToggle={toggleCustomer}
          focusLocation={focusLocation || null}
          height="h-full"
        />

        {/* Map Hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="bg-background/90 backdrop-blur px-4 py-1.5 rounded-full text-[9px] font-bold flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Klik marker untuk pilih
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
    onToggle: (id: number, shouldFocus?: boolean) => void;
  }) => {
    return (
      <div
        id={`customer-item-${customer.id}`}
        onClick={() => onToggle(customer.id, true)}
        className={cn(
          "relative p-3 rounded-xl border transition-all duration-300 cursor-pointer group mb-2 last:mb-0",
          isSelected
            ? "bg-primary/5 border-primary shadow-sm"
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
                "text-[11px] font-bold uppercase tracking-tight truncate pr-2",
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
                      className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase bg-amber-100/50 text-amber-700 border border-amber-200/50"
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
      </div>
    );
  },
);

import React, { useState } from "react";
import {
  Save,
  Calendar,
  MapPin,
  LayoutList,
  CheckCircle2,
  X,
} from "lucide-react";
import { RuteOption, GroupRuteMingguan } from "../types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/ui/FormField";

interface GroupRuteFormProps {
  ruteOptions: RuteOption[];
  onSave: (data: Partial<GroupRuteMingguan>) => void;
  loading?: boolean;
  initialData?: GroupRuteMingguan;
  onCancel: () => void;
}

const DAYS = [
  { id: 1, label: "Senin" },
  { id: 2, label: "Selasa" },
  { id: 3, label: "Rabu" },
  { id: 4, label: "Kamis" },
  { id: 5, label: "Jumat" },
  { id: 6, label: "Sabtu" },
  { id: 7, label: "Minggu" },
];

const GroupRuteForm: React.FC<GroupRuteFormProps> = ({
  ruteOptions,
  onSave,
  loading,
  initialData,
  onCancel,
}) => {
  const [namaGroup, setNamaGroup] = useState(initialData?.nama_group || "");

  const initialDetails =
    initialData?.details.reduce(
      (acc, curr) => {
        acc[curr.hari] = curr.id_rute;
        return acc;
      },
      {} as Record<number, number | "">,
    ) || {};

  const [details, setDetails] =
    useState<Record<number, number | "">>(initialDetails);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedDetails = Object.entries(details)
      .filter(([, ruteId]) => ruteId !== "")
      .map(([hari, ruteId]) => ({
        hari: Number(hari),
        id_rute: Number(ruteId),
      }));

    if (!namaGroup) return;

    onSave({
      nama_group: namaGroup,
      // @ts-expect-error backend expects this structure
      details: formattedDetails,
    });
  };

  const isDaySelected = (dayId: number) =>
    details[dayId] !== "" && details[dayId] !== undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-2">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-primary/5 p-5 rounded-xl border border-primary/10 shadow-inner">
          <FormField label="Nama Template / Paket Rute" icon={LayoutList} required>
            <Input
              type="text"
              className="h-9 bg-card border-border/50 text-xs font-semibold uppercase tracking-tight focus:ring-primary/20 transition-all rounded-lg"
              placeholder="Ex: Area Utara - Minggu 1"
              value={namaGroup}
              onChange={(e) => setNamaGroup(e.target.value)}
              required
            />
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight mt-1.5 opacity-60">
              Gunakan nama rute mingguan yang deskriptif.
            </p>
          </FormField>
        </div>

        {/* Days Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="flex items-center gap-2 text-[10px] font-bold text-foreground uppercase tracking-widest">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              Konfigurasi Hari
            </h4>
            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-50">
              {Object.values(details).filter((v) => v !== "").length} Hari Set
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {DAYS.map((day) => (
              <div
                key={day.id}
                className={cn(
                  "relative group flex flex-col gap-2.5 p-3 rounded-xl border-2 transition-all duration-300",
                  isDaySelected(day.id)
                    ? "bg-primary/5 border-primary shadow-sm"
                    : "bg-card border-border/50 hover:border-primary/30 hover:shadow-md",
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-[9px] font-bold uppercase tracking-widest flex items-center gap-2",
                      isDaySelected(day.id)
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isDaySelected(day.id)
                          ? "bg-primary animate-pulse"
                          : "bg-muted-foreground/30",
                      )}
                    />
                    {day.label}
                  </span>
                  {isDaySelected(day.id) && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  )}
                </div>

                <div className="relative">
                  <Select
                    value={details[day.id]?.toString() || "empty"}
                    onValueChange={(val) => 
                      setDetails({
                        ...details,
                        [day.id]: val === "empty" ? "" : Number(val)
                      })
                    }
                  >
                    <SelectTrigger className={cn(
                      "h-9 pl-10 bg-card border-border/50 font-semibold uppercase tracking-tight text-[10px]",
                      isDaySelected(day.id) && "border-primary text-primary"
                    )}>
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground opacity-50" />
                      <SelectValue placeholder="-- Kosong --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="empty">-- Kosong --</SelectItem>
                      {ruteOptions.map((r) => (
                        <SelectItem key={r.id} value={r.id.toString()}>
                          {r.nama_rute}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 font-semibold">
        <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-amber-500" />
          Hari Kosong tidak menimpa jadwal aktif.
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="flex-1 sm:flex-none h-9 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground rounded-lg"
          >
            <X className="mr-2 h-3.5 w-3.5" /> Batal
          </Button>
          <Button
            type="submit"
            disabled={loading || !namaGroup}
            className="flex-1 sm:flex-none h-9 px-10 text-[10px] font-bold uppercase tracking-wider shadow-md shadow-primary/20 bg-primary hover:bg-primary/90 text-white rounded-lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" />{" "}
                {initialData ? "Update" : "Simpan Paket"}
              </span>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default GroupRuteForm;

import React, { useState } from "react";
import { Jadwal, JadwalFormData, KaryawanOption, RuteOption } from "../types";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, User, Navigation, Save, X } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { parse, format } from "date-fns";
import { FormField } from "@/components/ui/FormField";

interface JadwalFormProps {
  onSubmit: (data: JadwalFormData) => void;
  karyawanOptions: KaryawanOption[];
  ruteOptions: RuteOption[];
  initialDate?: string;
  onCancel: () => void;
  loading?: boolean;
  initialData?: Jadwal;
  existingJadwals?: Jadwal[];
}

const JadwalForm: React.FC<JadwalFormProps> = ({
  onSubmit,
  karyawanOptions,
  ruteOptions,
  initialDate,
  onCancel,
  loading,
  initialData,
  existingJadwals = [],
}) => {
  const [formData, setFormData] = useState<JadwalFormData>({
    id_karyawan: initialData?.id_karyawan.toString() || "",
    id_rute: initialData?.id_rute.toString() || "",
    tanggal:
      initialData?.tanggal ||
      initialDate ||
      new Date().toISOString().slice(0, 10),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.id_karyawan || !formData.id_rute || !formData.tanggal) {
      toast.error("Mohon lengkapi semua field required");
      return;
    }

    const isDuplicate = existingJadwals.some(
      (j) =>
        j.id_karyawan === Number(formData.id_karyawan) &&
        j.tanggal === formData.tanggal &&
        j.id !== initialData?.id,
    );

    if (isDuplicate) {
      toast.error("Sales ini sudah memiliki jadwal pada tanggal tersebut.");
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 py-2">
      <div className="space-y-6">
        <FormField label="Tanggal Kunjungan" icon={CalendarIcon} required>
          <DatePicker
            date={formData.tanggal ? parse(formData.tanggal, "yyyy-MM-dd", new Date()) : undefined}
            onChange={(date) => 
              setFormData({ 
                ...formData, 
                tanggal: date ? format(date, "yyyy-MM-dd") : "" 
              })
            }
            className="w-full h-12 bg-card border-border/50 text-sm font-bold"
          />
        </FormField>

        <FormField label="Pilih Sales Representative" icon={User} required>
          <Select
            value={formData.id_karyawan}
            onValueChange={(val) =>
              setFormData({ ...formData, id_karyawan: val })
            }
            required
          >
            <SelectTrigger
              id="sales"
              className="h-12 bg-card border-border/50 shadow-sm text-sm"
            >
              <SelectValue placeholder="Pilih Sales..." />
            </SelectTrigger>
            <SelectContent>
              {karyawanOptions.map((k) => (
                <SelectItem key={k.id} value={k.id.toString()}>
                  <div className="flex flex-col">
                    <span className="font-bold">{k.nama_lengkap}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">
                      {k.kode_karyawan}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {karyawanOptions.length === 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100 mt-2">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <p className="text-[10px] text-amber-700 font-bold uppercase tracking-tight">
                Opps! Belum ada karyawan dengan role 'Sales'.
              </p>
            </div>
          )}
        </FormField>

        <FormField label="Pilih Rute Tujuan" icon={Navigation} required>
          <Select
            value={formData.id_rute}
            onValueChange={(val) => setFormData({ ...formData, id_rute: val })}
            required
          >
            <SelectTrigger
              id="rute"
              className="h-12 bg-card border-border/50 shadow-sm text-sm"
            >
              <SelectValue placeholder="Pilih Rute..." />
            </SelectTrigger>
            <SelectContent>
              {ruteOptions.map((r) => (
                <SelectItem key={r.id} value={r.id.toString()}>
                  {r.nama_rute}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {ruteOptions.length === 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100 mt-2">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <p className="text-[10px] text-amber-700 font-bold uppercase tracking-tight">
                Opps! Belum ada rute tersedia.
              </p>
            </div>
          )}
        </FormField>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t font-bold">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="h-12 px-8 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
          disabled={loading}
        >
          <X className="mr-2 h-4 w-4" /> Batal
        </Button>
        <Button
          type="submit"
          className="h-12 px-10 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Menyimpan...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {initialData ? "Update Jadwal" : "Simpan Jadwal"}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};
export default JadwalForm;

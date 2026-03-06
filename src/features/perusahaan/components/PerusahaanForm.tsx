import React, { useState } from "react";
import { Perusahaan, PerusahaanFormData } from "../types";
import {
  Building2,
  Mail,
  Phone,
  Activity,
  MapPin,
  Save,
  X,
  Calendar as CalendarIcon,
} from "lucide-react";
import { parse, format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/FormField";

interface PerusahaanFormProps {
  initialData?: Perusahaan | null;
  onSubmit: (data: PerusahaanFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const PerusahaanForm: React.FC<PerusahaanFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<PerusahaanFormData>({
    nama_perusahaan: initialData?.nama_perusahaan || "",
    alamat: initialData?.alamat || "",
    email_kontak: initialData?.email_kontak || "",
    no_telp: initialData?.no_telp || "",
    status_langganan: initialData?.status_langganan || "aktif",
    tanggal_bergabung: initialData?.tanggal_bergabung || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 py-2">
      <div className="space-y-6">
        <FormField label="Nama Perusahaan" icon={Building2} required>
          <Input
            type="text"
            required
            className="h-12 bg-card border-border/50 focus-visible:ring-primary shadow-sm font-bold"
            placeholder="Contoh: PT. Maju Jaya Bersama"
            value={formData.nama_perusahaan}
            onChange={(e) =>
              setFormData({ ...formData, nama_perusahaan: e.target.value })
            }
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Email Kontak" icon={Mail} required>
            <Input
              type="email"
              required
              className="h-12 bg-card border-border/50 focus-visible:ring-primary shadow-sm font-bold"
              placeholder="email@perusahaan.com"
              value={formData.email_kontak}
              onChange={(e) =>
                setFormData({ ...formData, email_kontak: e.target.value })
              }
            />
          </FormField>
          <FormField label="Nomor Telepon Kantor" icon={Phone} required>
            <Input
              type="text"
              required
              className="h-12 bg-card border-border/50 focus-visible:ring-primary shadow-sm font-bold"
              placeholder="021-xxxx"
              value={formData.no_telp}
              onChange={(e) =>
                setFormData({ ...formData, no_telp: e.target.value })
              }
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Status Langganan" icon={Activity} required>
            <div className="grid grid-cols-2 gap-3">
              {["aktif", "non_aktif"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      status_langganan: status as "aktif" | "non_aktif",
                    })
                  }
                  className={`h-12 rounded-xl border-2 transition-all text-[11px] font-black uppercase tracking-widest ${
                    formData.status_langganan === status
                      ? "border-primary bg-primary/5 text-primary shadow-md"
                      : "border-border/50 bg-card text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  {status.replace("_", " ")}
                </button>
              ))}
            </div>
          </FormField>
          <FormField label="Tanggal Bergabung" icon={CalendarIcon}>
            <DatePicker
              date={formData.tanggal_bergabung ? parse(formData.tanggal_bergabung, "yyyy-MM-dd", new Date()) : undefined}
              onChange={(date) => 
                setFormData({ ...formData, tanggal_bergabung: date ? format(date, "yyyy-MM-dd") : "" })
              }
              className="w-full h-12 bg-card border-border/50 shadow-sm font-bold text-left"
              placeholder="Pilih Tanggal"
            />
          </FormField>
        </div>

        <FormField label="Alamat Kantor Pusat" icon={MapPin}>
          <Textarea
            rows={3}
            placeholder="Tulis alamat lengkap kantor..."
            className="bg-card border-border/50 focus-visible:ring-primary shadow-sm font-bold min-h-[100px] resize-none"
            value={formData.alamat}
            onChange={(e) =>
              setFormData({ ...formData, alamat: e.target.value })
            }
          />
        </FormField>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t font-bold">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="h-12 px-8 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
          disabled={isLoading}
        >
          <X className="mr-2 h-4 w-4" /> Batal
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 px-10 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Menyimpan...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {initialData ? "Simpan Perubahan" : "Tambah Perusahaan"}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};

export default PerusahaanForm;

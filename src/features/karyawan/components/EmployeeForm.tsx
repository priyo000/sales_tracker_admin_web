import React, { useState } from "react";
import { Karyawan, KaryawanFormData } from "../types";
import {
  Contact,
  IdCard,
  User,
  Building2,
  Briefcase,
  Phone,
  Mail,
  Calendar,
  Activity,
  MapPin,
  Save,
  X,
} from "lucide-react";
import { parse, format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/ui/FormField";

interface EmployeeFormProps {
  initialData?: Karyawan | null;
  divisiOptions: { id: number; nama_divisi: string }[];
  onSubmit: (data: KaryawanFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  initialData,
  divisiOptions,
  onSubmit,
  onCancel,
  loading,
}) => {
  const [formData, setFormData] = useState<KaryawanFormData>({
    kode_karyawan: initialData?.kode_karyawan || "",
    nik: initialData?.nik || "",
    nama_lengkap: initialData?.nama_lengkap || "",
    id_divisi:
      initialData?.id_divisi?.toString() ||
      divisiOptions[0]?.id.toString() ||
      "",
    jabatan: initialData?.jabatan || "Sales",
    no_hp: initialData?.no_hp || "",
    email: initialData?.email || "",
    alamat_domisili: initialData?.alamat_domisili || "",
    tanggal_bergabung:
      initialData?.tanggal_bergabung || new Date().toISOString().split("T")[0],
    status_karyawan: initialData?.status_karyawan || "aktif",
  });

  const isEdit = !!initialData;

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-1">
      <div className="space-y-4">
        {/* ID & NIK Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <FormField label="Kode Karyawan" icon={Contact}>
            <Input
              name="kode_karyawan"
              type="text"
              placeholder="KYW001"
              className="h-9 bg-card border-border focus-visible:ring-primary shadow-sm font-semibold rounded-lg"
              value={formData.kode_karyawan}
              onChange={(e) => handleChange("kode_karyawan", e.target.value)}
            />
          </FormField>
          <FormField label="NIK (KTP)" icon={IdCard}>
            <Input
              name="nik"
              type="text"
              placeholder="16 digit NIK"
              className="h-9 bg-card border-border focus-visible:ring-primary shadow-sm font-semibold rounded-lg"
              value={formData.nik}
              onChange={(e) => handleChange("nik", e.target.value)}
            />
          </FormField>
        </div>

        {/* Full Name */}
        <FormField label="Nama Lengkap Karyawan" icon={User} required>
          <Input
            name="nama_lengkap"
            type="text"
            required
            className="h-9 bg-card border-border focus-visible:ring-primary shadow-sm font-semibold rounded-lg"
            placeholder="Nama Lengkap Sesuai KTP"
            value={formData.nama_lengkap}
            onChange={(e) => handleChange("nama_lengkap", e.target.value)}
          />
        </FormField>

        {/* Division & Position Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <FormField label="Divisi Kerja" icon={Building2} required>
            <Select
              value={formData.id_divisi}
              onValueChange={(val) => handleChange("id_divisi", val)}
              required
            >
              <SelectTrigger className="h-9 bg-card border-border shadow-sm font-semibold rounded-lg">
                <SelectValue placeholder="Pilih Divisi" />
              </SelectTrigger>
              <SelectContent>
                {divisiOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id.toString()}>
                    {option.nama_divisi}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Jabatan / Role" icon={Briefcase} required>
            <Select
              value={formData.jabatan}
              onValueChange={(val) => handleChange("jabatan", val)}
            >
              <SelectTrigger className="h-9 bg-card border-border shadow-sm font-semibold rounded-lg">
                <SelectValue placeholder="Pilih Jabatan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Driver">Driver</SelectItem>
                <SelectItem value="Gudang">Gudang</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>

        {/* Contact Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <FormField label="WhatsApp / No HP" icon={Phone} required>
            <Input
              name="no_hp"
              type="tel"
              required
              placeholder="0812xxxx"
              className="h-9 bg-card border-border focus-visible:ring-primary shadow-sm font-semibold rounded-lg"
              value={formData.no_hp}
              onChange={(e) => handleChange("no_hp", e.target.value)}
            />
          </FormField>
          <FormField label="Email Perusahaan" icon={Mail}>
            <Input
              name="email"
              type="email"
              placeholder="email@perusahaan.com"
              className="h-9 bg-card border-border focus-visible:ring-primary shadow-sm font-semibold rounded-lg"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </FormField>
        </div>

        {/* Date & Status Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <FormField label="Tanggal Bergabung" icon={Calendar}>
            <DatePicker
              date={formData.tanggal_bergabung ? parse(formData.tanggal_bergabung, "yyyy-MM-dd", new Date()) : undefined}
              onChange={(date) => 
                handleChange("tanggal_bergabung", date ? format(date, "yyyy-MM-dd") : "")
              }
              className="w-full h-9 bg-card border-border shadow-sm font-semibold text-left rounded-lg text-xs"
              placeholder="Pilih Tanggal"
            />
          </FormField>
          <FormField label="Status Kepegawaian" icon={Activity}>
            <div className="grid grid-cols-2 gap-2">
              {["aktif", "non_aktif"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleChange("status_karyawan", status)}
                  className={`h-9 rounded-lg border transition-all text-[10px] font-bold uppercase tracking-wider ${
                    formData.status_karyawan === status
                      ? "border-primary bg-primary/5 text-primary shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  {status.replace("_", " ")}
                </button>
              ))}
            </div>
          </FormField>
        </div>

        {/* Address */}
        <FormField label="Alamat Domisili" icon={MapPin}>
          <Textarea
            name="alamat_domisili"
            className="bg-card border-border focus-visible:ring-primary shadow-sm font-semibold min-h-[70px] resize-none text-xs rounded-lg"
            placeholder="Tulis alamat lengkap domisili..."
            rows={2}
            value={formData.alamat_domisili}
            onChange={(e) => handleChange("alamat_domisili", e.target.value)}
          />
        </FormField>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="h-9 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground rounded-lg"
          disabled={loading}
        >
          <X className="mr-2 h-3.5 w-3.5" /> Batal
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="h-9 px-8 text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all hover:scale-[1.02]"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-3.5 w-3.5" />
              {isEdit ? "Update Karyawan" : "Simpan Data"}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;

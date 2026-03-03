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
  LucideIcon,
  Save,
  X,
} from "lucide-react";
import { parse, format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmployeeFormProps {
  initialData?: Karyawan | null;
  divisiOptions: { id: number; nama_divisi: string }[];
  onSubmit: (data: KaryawanFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const FormField = ({
  label,
  required,
  children,
  icon: Icon,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  icon?: LucideIcon;
}) => (
  <div className="space-y-2">
    <Label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground/80">
      {Icon && <Icon className="h-3 w-3 text-primary" />}
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
    {children}
  </div>
);

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
    <form onSubmit={handleSubmit} className="space-y-8 py-2">
      <div className="space-y-6">
        {/* ID & NIK Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Kode Karyawan" icon={Contact}>
            <Input
              name="kode_karyawan"
              type="text"
              placeholder="Contoh: KYW001"
              className="h-12 bg-card border-border/50 focus-visible:ring-primary shadow-sm font-bold"
              value={formData.kode_karyawan}
              onChange={(e) => handleChange("kode_karyawan", e.target.value)}
            />
          </FormField>
          <FormField label="NIK (KTP)" icon={IdCard}>
            <Input
              name="nik"
              type="text"
              placeholder="16 digit NIK"
              className="h-12 bg-card border-border/50 focus-visible:ring-primary shadow-sm font-bold"
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
            className="h-12 bg-card border-border/50 focus-visible:ring-primary shadow-sm font-bold"
            placeholder="Nama Lengkap Sesuai KTP"
            value={formData.nama_lengkap}
            onChange={(e) => handleChange("nama_lengkap", e.target.value)}
          />
        </FormField>

        {/* Division & Position Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Divisi Kerja" icon={Building2} required>
            <Select
              value={formData.id_divisi}
              onValueChange={(val) => handleChange("id_divisi", val)}
              required
            >
              <SelectTrigger className="h-12 bg-card border-border/50 shadow-sm font-bold">
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
              <SelectTrigger className="h-12 bg-card border-border/50 shadow-sm font-bold">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Nomor WhatsApp / HP" icon={Phone} required>
            <Input
              name="no_hp"
              type="tel"
              required
              placeholder="0812xxxx"
              className="h-12 bg-card border-border/50 focus-visible:ring-primary shadow-sm font-bold"
              value={formData.no_hp}
              onChange={(e) => handleChange("no_hp", e.target.value)}
            />
          </FormField>
          <FormField label="Email Perusahaan / Personal" icon={Mail}>
            <Input
              name="email"
              type="email"
              placeholder="email@perusahaan.com"
              className="h-12 bg-card border-border/50 focus-visible:ring-primary shadow-sm font-bold"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </FormField>
        </div>

        {/* Date & Status Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Tanggal Bergabung" icon={Calendar}>
            <DatePicker
              date={formData.tanggal_bergabung ? parse(formData.tanggal_bergabung, "yyyy-MM-dd", new Date()) : undefined}
              onChange={(date) => 
                handleChange("tanggal_bergabung", date ? format(date, "yyyy-MM-dd") : "")
              }
              className="w-full h-12 bg-card border-border/50 shadow-sm font-bold"
              placeholder="Pilih Tanggal Bergabung"
            />
          </FormField>
          <FormField label="Status Kepegawaian" icon={Activity}>
            <div className="grid grid-cols-2 gap-3">
              {["aktif", "non_aktif"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleChange("status_karyawan", status)}
                  className={`h-12 rounded-xl border-2 transition-all text-[11px] font-black uppercase tracking-widest ${
                    formData.status_karyawan === status
                      ? "border-primary bg-primary/5 text-primary shadow-md"
                      : "border-border/50 bg-card text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  {status.replace("_", "-")}
                </button>
              ))}
            </div>
          </FormField>
        </div>

        {/* Address */}
        <FormField label="Alamat Domisili" icon={MapPin}>
          <Textarea
            name="alamat_domisili"
            className="bg-card border-border/50 focus-visible:ring-primary shadow-sm font-bold min-h-[100px] resize-none"
            placeholder="Tulis alamat lengkap domisili saat ini..."
            rows={3}
            value={formData.alamat_domisili}
            onChange={(e) => handleChange("alamat_domisili", e.target.value)}
          />
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
          disabled={loading}
          className="h-12 px-10 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Menyimpan...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {isEdit ? "Simpan Perubahan" : "Tambah Karyawan Baru"}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;

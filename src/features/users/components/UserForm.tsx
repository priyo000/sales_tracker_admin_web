import React, { useState } from "react";
import { User, UserFormData } from "../types";
import { Karyawan } from "../../karyawan/types";
import {
  Key,
  Shield,
  User as UserIcon,
  UserCheck,
  LucideIcon,
  Save,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserFormProps {
  initialData?: User | null;
  availableEmployees: Karyawan[];
  onSubmit: (data: UserFormData) => void;
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

const UserForm: React.FC<UserFormProps> = ({
  initialData,
  availableEmployees,
  onSubmit,
  onCancel,
  loading,
}) => {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState<UserFormData>({
    id_karyawan: initialData?.id_karyawan || 0,
    username: initialData?.username || "",
    password: "",
    peran: initialData?.peran || "sales",
  });

  const isEdit = !!initialData;

  const handleEmployeeChange = (value: string) => {
    const id = parseInt(value);
    setFormData((prev) => {
      const newState = { ...prev, id_karyawan: id };

      if (!isEdit && id !== 0 && prev.username === "") {
        const emp = availableEmployees.find((emp) => emp.id === id);
        if (emp) {
          const suggestedUsername = emp.nama_lengkap
            .toLowerCase()
            .replace(/\s+/g, ".")
            .replace(/[^a-z0-0.]/g, "");
          newState.username = suggestedUsername;
        }
      }
      return newState;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 py-2">
      <div className="space-y-6">
        {!isEdit ? (
          <FormField label="Pilih Karyawan" icon={UserIcon} required>
            <Select
              value={
                formData.id_karyawan === 0
                  ? ""
                  : formData.id_karyawan.toString()
              }
              onValueChange={handleEmployeeChange}
              required
            >
              <SelectTrigger
                id="id_karyawan"
                className="h-12 bg-card border-border/50 shadow-sm"
              >
                <SelectValue placeholder="Pilih Karyawan yang belum punya akun..." />
              </SelectTrigger>
              <SelectContent>
                {availableEmployees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-bold">{emp.nama_lengkap}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">
                        {emp.kode_karyawan || emp.jabatan}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] font-bold text-amber-600/70 uppercase tracking-tight italic mt-1">
              * Hanya karyawan aktif yang belum memiliki akun yang muncul di
              sini.
            </p>
          </FormField>
        ) : (
          <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10 flex items-center gap-4 shadow-inner">
            <div className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none">
                Akses Karyawan
              </Label>
              <div className="text-base font-black text-foreground uppercase tracking-tight mt-1">
                {initialData.karyawan?.nama_lengkap}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Username" icon={UserIcon} required>
            <Input
              id="username"
              name="username"
              type="text"
              required
              className="h-12 bg-card border-border/50 focus-visible:ring-primary shadow-sm font-bold"
              value={formData.username}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, username: e.target.value }))
              }
              placeholder="contoh: john.doe"
            />
          </FormField>

          <FormField label="Role / Peran Utama" icon={Shield} required>
            <Select
              value={formData.peran}
              onValueChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  peran: val as User["peran"],
                }))
              }
              required
            >
              <SelectTrigger
                id="peran"
                className="h-12 bg-card border-border/50 shadow-sm font-bold"
              >
                <SelectValue placeholder="Pilih Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales (Mobile App)</SelectItem>
                <SelectItem value="admin_perusahaan">
                  Admin Perusahaan
                </SelectItem>
                <SelectItem value="admin_divisi">Admin Divisi</SelectItem>
                {currentUser?.peran === "super_admin" && (
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                )}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <FormField label="Password Akses" icon={Key} required={!isEdit}>
          <div className="relative group">
            <Input
              id="password"
              name="password"
              type="password"
              required={!isEdit}
              className="h-12 bg-card border-border/50 focus-visible:ring-primary shadow-sm pr-10"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder={isEdit ? "••••••••" : "Pilih password aman"}
            />
          </div>
          {isEdit && (
            <p className="text-[10px] text-muted-foreground font-bold uppercase italic mt-1">
              * Kosongkan jika tidak ingin mengubah password lama.
            </p>
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
              {isEdit ? "Update Akses" : "Buat Akun Sekarang"}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;

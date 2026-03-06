import React, { useState } from "react";
import { User, UserFormData } from "../types";
import { Karyawan } from "../../karyawan/types";
import {
  Key,
  Shield,
  User as UserIcon,
  UserCheck,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/FormField";
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

const UserForm: React.FC<UserFormProps> = ({
  initialData,
  availableEmployees,
  onSubmit,
  onCancel,
  loading,
}) => {
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
    <form onSubmit={handleSubmit} className="space-y-6 py-2">
      <div className="space-y-4">
        {!isEdit ? (
          <FormField 
            label="Pilih Karyawan" 
            icon={UserIcon} 
            required
            description="* Hanya karyawan aktif yang belum memiliki akun."
          >
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
                className="h-10 bg-card border-border/50 shadow-sm font-semibold"
              >
                <SelectValue placeholder="Pilih Karyawan..." />
              </SelectTrigger>
              <SelectContent>
                {availableEmployees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-semibold">{emp.nama_lengkap}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">
                        {emp.kode_karyawan || emp.jabatan}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        ) : (
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-center gap-4 shadow-inner">
            <div className="p-2.5 bg-primary text-white rounded-lg shadow-md shadow-primary/20">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest leading-none">
                Akses Karyawan
              </div>
              <div className="text-sm font-bold text-foreground uppercase tracking-tight mt-1">
                {initialData.karyawan?.nama_lengkap}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Username" icon={UserIcon} required>
            <Input
              id="username"
              name="username"
              type="text"
              required
              className="h-10 bg-card border-border/50 focus-visible:ring-primary shadow-sm font-semibold"
              value={formData.username}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, username: e.target.value }))
              }
              placeholder="Username"
            />
          </FormField>

          <FormField label="Role / Peran Utama" icon={Shield} required>
            <Select
              value={formData.peran}
              onValueChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  peran: val as "sales" | "admin_perusahaan" | "admin_divisi" | "manager",
                }))
              }
              required
            >
              <SelectTrigger
                id="peran"
                className="h-10 bg-card border-border/50 shadow-sm font-semibold"
              >
                <SelectValue placeholder="Pilih Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales (Mobile App)</SelectItem>
                <SelectItem value="admin_perusahaan">
                   Admin Perusahaan
                </SelectItem>
                <SelectItem value="admin_divisi">Admin Divisi</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <FormField 
          label="Password Akses" 
          icon={Key} 
          required={!isEdit}
          description={isEdit ? "* Kosongkan jika tidak ingin mengubah password." : undefined}
        >
          <div className="relative group">
            <Input
              id="password"
              name="password"
              type="password"
              required={!isEdit}
              className="h-10 bg-card border-border/50 focus-visible:ring-primary shadow-sm pr-10"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder={isEdit ? "••••••••" : "Password"}
            />
          </div>
        </FormField>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t font-semibold">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="h-10 px-8 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground rounded-lg"
          disabled={loading}
        >
          <X className="mr-2 h-3.5 w-3.5" /> Batal
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="h-10 px-10 text-[10px] font-bold uppercase tracking-wider shadow-md shadow-primary/20 bg-primary hover:bg-primary/90 text-white rounded-lg"
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

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
  currentUserRole?: string;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

// Roles yang bisa di-assign oleh masing-masing role admin
const ASSIGNABLE_ROLES: Record<string, { value: string; label: string }[]> = {
  super_admin: [
    { value: 'admin_perusahaan', label: 'Admin Perusahaan' },
    { value: 'admin_divisi', label: 'Admin Divisi' },
    { value: 'sales', label: 'Sales (App)' },
  ],
  admin_perusahaan: [
    { value: 'admin_divisi', label: 'Admin Divisi' },
    { value: 'sales', label: 'Sales (App)' },
  ],
  admin_divisi: [
    { value: 'sales', label: 'Sales (App)' },
  ],
};

const UserForm: React.FC<UserFormProps> = ({
  initialData,
  availableEmployees,
  currentUserRole,
  onSubmit,
  onCancel,
  loading,
}) => {
  const roleOptions = ASSIGNABLE_ROLES[currentUserRole ?? ''] ?? [
    { value: 'sales', label: 'Sales (App)' },
  ];

  const defaultRole = (roleOptions[0]?.value ?? 'sales') as UserFormData['peran'];

  const [formData, setFormData] = useState<UserFormData>({
    id_karyawan: initialData?.id_karyawan || 0,
    username: initialData?.username || "",
    password: "",
    peran: initialData?.peran || defaultRole,
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
            description="Tampilkan hanya karyawan aktif yang belum memiliki akun akses."
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
                className="h-9 bg-muted/20 border-border shadow-sm font-semibold rounded-lg"
              >
                <SelectValue placeholder="Pilih Karyawan..." />
              </SelectTrigger>
              <SelectContent>
                {availableEmployees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-semibold text-xs">{emp.nama_lengkap}</span>
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
          <div className="bg-primary/5 p-3 rounded-xl border border-primary/10 flex items-center gap-3 shadow-inner">
            <div className="p-2 bg-primary text-white rounded-lg shadow-md shadow-primary/20">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[9px] font-bold uppercase text-muted-foreground/70 tracking-widest leading-none">
                Akses Karyawan
              </div>
              <div className="text-sm font-bold text-foreground/90 uppercase tracking-tight mt-1">
                {initialData.karyawan?.nama_lengkap}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8">
            <FormField label="Username Akun" icon={UserIcon} required>
              <Input
                id="username"
                name="username"
                type="text"
                required
                className="h-9 bg-card border-border focus-visible:ring-primary shadow-sm font-semibold rounded-lg"
                value={formData.username}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, username: e.target.value }))
                }
                placeholder="Username"
              />
            </FormField>
          </div>
          <div className="md:col-span-4">
            <FormField label="Role / Peran" icon={Shield} required>
              <Select
                value={formData.peran}
                onValueChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    peran: val as UserFormData['peran'],
                  }))
                }
                required
              >
                <SelectTrigger
                  id="peran"
                  className="h-9 bg-card border-border shadow-sm font-semibold rounded-lg"
                >
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </div>

        <FormField 
          label="Password Akses Keamanan" 
          icon={Key} 
          required={!isEdit}
          description={isEdit ? "Kosongkan jika tidak ingin mengubah password lama." : undefined}
        >
          <div className="relative group">
            <Input
              id="password"
              name="password"
              type="password"
              required={!isEdit}
              className="h-9 bg-card border-border focus-visible:ring-primary shadow-sm rounded-lg pr-10 font-semibold"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder={isEdit ? "••••••••" : "Masukkan Password"}
            />
          </div>
        </FormField>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-9 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted/50 rounded-lg border-border/60"
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
              Menyimpan...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-3.5 w-3.5" />
              {isEdit ? "Update Akses" : "Buat Akun Sekarang"}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;

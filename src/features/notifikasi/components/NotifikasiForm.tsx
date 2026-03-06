import React, { useState, useEffect } from "react";
import {
  Users,
  User,
  Building2,
  Send,
  Type,
  MessageSquare,
  AlertCircle,
  Trophy,
  Info,
  CheckCircle2,
} from "lucide-react";
import { NotifikasiFormData } from "../types";
import { useKaryawan } from "@/features/karyawan/hooks/useKaryawan";
import { useDivisi } from "@/features/divisi/hooks/useDivisi";
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

interface NotifikasiFormProps {
  onSubmit: (data: NotifikasiFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const NotifikasiForm: React.FC<NotifikasiFormProps> = ({
  onSubmit,
  onCancel,
  loading,
}) => {
  const { karyawans, fetchKaryawans } = useKaryawan();
  const { divisis, fetchDivisis } = useDivisi();

  const [targetType, setTargetType] = useState<"specific" | "all" | "division">(
    "all",
  );
  const [idKaryawan, setIdKaryawan] = useState<number | undefined>(undefined);
  const [idDivisi, setIdDivisi] = useState<number | undefined>(undefined);
  const [judul, setJudul] = useState("");
  const [pesan, setPesan] = useState("");
  const [jenis, setJenis] = useState("info");

  useEffect(() => {
    fetchKaryawans();
    fetchDivisis();
  }, [fetchKaryawans, fetchDivisis]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      target_type: targetType,
      id_karyawan: targetType === "specific" ? idKaryawan : undefined,
      id_divisi: targetType === "division" ? idDivisi : undefined,
      judul,
      pesan,
      jenis,
    });
  };

  const getJenisIcon = (type: string) => {
    switch (type) {
      case "order":
        return CheckCircle2;
      case "gamifikasi":
        return Trophy;
      case "reminder":
        return AlertCircle;
      case "broadcast":
        return Send;
      default:
        return Info;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 py-4">
      <div className="space-y-6">
        <FormField label="Siapa Target Penerima?" icon={Users}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: "all", label: "Semua", icon: Users },
              { id: "division", label: "Divisi", icon: Building2 },
              { id: "specific", label: "Karyawan", icon: User },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  setTargetType(option.id as "all" | "division" | "specific")
                }
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                  targetType === option.id
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border/50 bg-card hover:bg-muted/50"
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${targetType === option.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
                >
                  <option.icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-tight">
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </FormField>

        {targetType === "division" && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <FormField label="Pilih Divisi" icon={Building2} required>
              <Select
                value={idDivisi?.toString() || ""}
                onValueChange={(val) => setIdDivisi(Number(val))}
                required
              >
                <SelectTrigger className="h-11 bg-card border-border/50">
                  <SelectValue placeholder="Pilih Divisi Penerima..." />
                </SelectTrigger>
                <SelectContent>
                  {divisis.map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>
                      {d.nama_divisi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
        )}

        {targetType === "specific" && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <FormField label="Pilih Karyawan" icon={User} required>
              <Select
                value={idKaryawan?.toString() || ""}
                onValueChange={(val) => setIdKaryawan(Number(val))}
                required
              >
                <SelectTrigger className="h-11 bg-card border-border/50">
                  <SelectValue placeholder="Pilih Karyawan Penerima..." />
                </SelectTrigger>
                <SelectContent>
                  {karyawans.map((k) => (
                    <SelectItem key={k.id} value={k.id.toString()}>
                      {k.nama_lengkap} ({k.kode_karyawan})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4">
            <FormField label="Tipe Notifikasi" icon={getJenisIcon(jenis)}>
              <Select value={jenis} onValueChange={(val) => setJenis(val)}>
                <SelectTrigger className="h-11 bg-card border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Informasi Umum</SelectItem>
                  <SelectItem value="broadcast">
                    Pengumuman (Broadcast)
                  </SelectItem>
                  <SelectItem value="reminder">Pengingat (Reminder)</SelectItem>
                  <SelectItem value="gamifikasi">
                    Reward / Gamifikasi
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="md:col-span-8">
            <FormField label="Judul Notifikasi" icon={Type} required>
              <Input
                required
                maxLength={255}
                placeholder="Contoh: Pengumuman Rapat Mingguan"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                className="h-11 bg-card border-border/50 focus-visible:ring-primary shadow-sm"
              />
            </FormField>
          </div>
        </div>

        <FormField label="Isi Pesan Notifikasi" icon={MessageSquare} required>
          <Textarea
            required
            rows={5}
            placeholder="Tulis detail pesan di sini. Usahakan singkat dan jelas agar mudah dibaca di notifikasi HP."
            value={pesan}
            onChange={(e) => setPesan(e.target.value)}
            className="bg-card border-border/50 focus-visible:ring-primary shadow-sm resize-none"
          />
        </FormField>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
          className="h-11 px-6 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="h-11 px-10 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Mengirim...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send className="h-4 w-4" /> Kirim Sekarang
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};

export default NotifikasiForm;

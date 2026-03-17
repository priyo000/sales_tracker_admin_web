import React, { useState } from "react";
import {
  X,
  User,
  CreditCard,
  Briefcase,
  Info,
  Shield,
  Clock,
  Landmark,
  Image as LucideImage,
  Lock,
  Unlock,
  Hash,
} from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/FormField";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PelangganFormData } from "../types";

interface FilterOption {
  id: number;
  nama_lengkap: string;
  jabatan: string;
  id_divisi?: number;
}

interface CustomerAdministrationTabProps {
  formData: PelangganFormData;
  onChange: (name: string, value: string | number) => void;
  previews: { foto_toko: string | null; foto_ktp: string | null };
  onFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "foto_toko" | "foto_ktp",
  ) => void;
  onClearFile: (type: "foto_toko" | "foto_ktp") => void;
  filterOptions: FilterOption[];
  onSalesChange: (val: string) => void;
  isEdit?: boolean;
}

export const CustomerAdministrationTab: React.FC<
  CustomerAdministrationTabProps
> = ({
  formData,
  onChange,
  previews,
  onFileChange,
  onClearFile,
  filterOptions,
  onSalesChange,
  isEdit = false,
}) => {
  const [isKodeLocked, setIsKodeLocked] = useState(isEdit);

  return (
  <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
    <div className="space-y-10">
      {/* Payment Settings Card */}
      <Card className="border border-border/50 shadow-sm bg-card">
        <CardContent className="p-6 space-y-4">
          <SectionHeader
            icon={CreditCard}
            title="Kebijakan Pembayaran"
            description="Termin & limit transaksi"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <FormField label="Metode Transaksi" icon={Briefcase}>
              <Select
                value={formData.cara_pembayaran}
                onValueChange={(val) => onChange("cara_pembayaran", val)}
              >
                <SelectTrigger className="h-9 bg-muted/30 border-border/50 shadow-sm font-semibold">
                  <SelectValue placeholder="Pilih Cara" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tunai">Cash / Tunai</SelectItem>
                  <SelectItem value="Transfer">Transfer Bank</SelectItem>
                  <SelectItem value="Giro">Giro / Cek</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Tipe Pembayaran" icon={Shield}>
              <Select
                value={formData.sistem_pembayaran}
                onValueChange={(val) => onChange("sistem_pembayaran", val)}
              >
                <SelectTrigger className="h-9 bg-muted/30 border-border/50 shadow-sm font-semibold">
                  <SelectValue placeholder="Pilih Sistem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash (Lunas Langsung)</SelectItem>
                  <SelectItem value="Kredit">Kredit (Tempo)</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {formData.sistem_pembayaran === "Kredit" && (
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-primary/5 rounded-xl border border-primary/20 animate-in zoom-in-95 duration-500 shadow-inner">
                <FormField label="Limit Kredit Awal" icon={CreditCard}>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase">
                      Rp
                    </span>
                    <Input
                      type="number"
                      value={formData.limit_kredit_awal}
                      onChange={(e) =>
                        onChange(
                          "limit_kredit_awal",
                          parseFloat(e.target.value),
                        )
                      }
                      className="h-9 pl-10 bg-card border-border/50 text-sm font-semibold"
                    />
                  </div>
                </FormField>

                <FormField label="Durasi Jatuh Tempo" icon={Clock}>
                  <div className="relative">
                    <Input
                      type="number"
                      value={formData.top_hari}
                      onChange={(e) =>
                        onChange("top_hari", parseInt(e.target.value))
                      }
                      className="h-9 pr-12 bg-card border-border/50 text-sm font-semibold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase">
                      Hari
                    </span>
                  </div>
                </FormField>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bank Account Info Card */}
      {(formData.cara_pembayaran === "Transfer" ||
        formData.cara_pembayaran === "Giro") && (
        <Card className="border border-border/50 shadow-sm bg-card animate-in slide-in-from-left-4 duration-500">
          <CardContent className="p-6 space-y-4">
            <SectionHeader
              icon={Landmark}
              title="Rekening Bank"
              description="Info transfer"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <FormField label="Nama Bank">
                <Input
                  placeholder="Misal: BCA, Mandiri, BRI"
                  value={formData.nama_bank}
                  onChange={(e) => onChange("nama_bank", e.target.value)}
                  className="h-9 bg-muted/30 border-border/50 text-sm font-semibold"
                />
              </FormField>
              <FormField label="Kantor Cabang">
                <Input
                  placeholder="Nama Cabang"
                  value={formData.cabang_bank}
                  onChange={(e) => onChange("cabang_bank", e.target.value)}
                  className="h-9 bg-muted/30 border-border/50 text-sm font-semibold"
                />
              </FormField>
              <FormField label="Nomor Rekening">
                <Input
                  placeholder="XXXXXXXXXXXX"
                  value={formData.no_rekening}
                  onChange={(e) => onChange("no_rekening", e.target.value)}
                  className="h-9 bg-muted/30 border-border/50 font-mono text-sm font-semibold tracking-wider"
                />
              </FormField>
              <FormField label="Atas Nama Pemilik">
                <Input
                  placeholder="Nama sesuai buku tabungan"
                  value={formData.atas_nama_rekening}
                  onChange={(e) =>
                    onChange("atas_nama_rekening", e.target.value)
                  }
                  className="h-9 bg-muted/30 border-border/50 text-sm font-semibold"
                />
              </FormField>
            </div>
          </CardContent>
        </Card>
      )}
    </div>

    <div className="space-y-10">
      {/* Sales Assignment Card */}
      <Card className="border border-border/50 shadow-sm bg-card">
        <CardContent className="p-6 space-y-4">
          <SectionHeader
            icon={User}
            title="Penanggung Jawab"
            description="Tentukan sales person utama"
          />

          <div className="pt-1 space-y-4">
            <FormField label="Kode Pelanggan" icon={Hash}>
              <div className="flex gap-2">
                <Input
                  placeholder={isEdit ? "(Auto-generate)" : "Isi manual atau kosongkan untuk auto-generate"}
                  value={formData.kode_pelanggan || ""}
                  onChange={(e) => onChange("kode_pelanggan", e.target.value)}
                  disabled={isKodeLocked}
                  className={`h-9 flex-1 text-sm font-mono font-semibold shadow-sm transition-colors ${
                    isKodeLocked
                      ? "bg-muted/50 border-border/30 text-muted-foreground cursor-not-allowed"
                      : "bg-muted/30 border-primary/40 focus-visible:ring-primary"
                  }`}
                />
                {isEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setIsKodeLocked((prev) => !prev)}
                    className={`h-9 w-9 shrink-0 transition-colors ${
                      isKodeLocked
                        ? "border-border/50 text-muted-foreground hover:text-foreground"
                        : "border-primary/40 text-primary bg-primary/5 hover:bg-primary/10"
                    }`}
                    title={isKodeLocked ? "Buka kunci untuk edit" : "Kunci kode pelanggan"}
                  >
                    {isKodeLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  </Button>
                )}
              </div>
              {!isEdit && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  Kosongkan untuk generate otomatis.
                </p>
              )}
              {isEdit && isKodeLocked && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  Klik ikon kunci untuk mengubah kode pelanggan.
                </p>
              )}
            </FormField>

            <FormField
              label="Penanggung Jawab (Sales)"
              icon={User}
              required
            >
              <Select
                value={formData.id_sales_pembuat?.toString() || "none"}
                onValueChange={onSalesChange}
                required
              >
                <SelectTrigger className="h-9 bg-muted/30 border-border/50 shadow-sm font-semibold text-primary">
                  <SelectValue placeholder="Pilih Sales Person" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="none"
                    className="font-bold text-amber-600"
                  >
                    🏢 MILIK PERUSAHAAN (NON-TO)
                  </SelectItem>
                  {filterOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id.toString()}>
                      {opt.nama_lengkap} ({opt.jabatan || "Sales"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* KTP Card */}
      <Card className="border border-border/50 shadow-sm bg-card">
        <CardContent className="p-6 space-y-4">
          <SectionHeader
            icon={LucideImage}
            title="Identitas"
            description="Foto KTP pemilik"
          />

          <div className="pt-1">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group w-full max-w-sm aspect-[1.6/1] rounded-2xl overflow-hidden border-2 border-dashed border-primary/30 bg-muted/10 shadow-lg transition-all hover:bg-muted/20 hover:border-primary/50">
                {previews.foto_ktp ? (
                  <>
                    <img
                      src={previews.foto_ktp}
                      alt="Preview KTP"
                      className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                      <div className="flex gap-2">
                        <label className="h-9 w-9 bg-white text-primary hover:bg-white/90 rounded-full flex items-center justify-center cursor-pointer shadow-xl transition-transform hover:scale-110 active:scale-95">
                          <LucideImage className="h-4 w-4" />
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => onFileChange(e, "foto_ktp")}
                          />
                        </label>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => onClearFile("foto_ktp")}
                          className="h-9 w-9 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-transform"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer group">
                    <div className="p-4 bg-primary/10 rounded-full mb-2 group-hover:bg-primary/20 transition-colors">
                      <LucideImage className="h-8 w-8 text-primary opacity-60" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60 text-center px-4">
                      Unggah Foto KTP (Landscape)
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => onFileChange(e, "foto_ktp")}
                    />
                  </label>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter opacity-60 italic bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                <Info className="h-3 w-3" /> JPG, PNG (Maks 2MB). Pastikan
                Teks Terbaca Jelas.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Field */}
      <FormField label="Catatan Internal / Khusus" icon={Info}>
        <Textarea
          placeholder="Catatan tambahan..."
          value={formData.catatan_lain}
          onChange={(e) => onChange("catatan_lain", e.target.value)}
          rows={4}
          className="bg-muted/30 border-border/50 focus-visible:ring-primary shadow-sm resize-none text-xs font-semibold"
        />
      </FormField>
    </div>
  </div>
  );
};

export default CustomerAdministrationTab;

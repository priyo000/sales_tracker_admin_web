import React, { useState, useEffect } from "react";
import {
  Store,
  MapPin,
  User,
  CreditCard,
  Landmark,
  Phone,
  LucideIcon,
  Upload,
  Image,
  X,
  Shield,
  Briefcase,
  Calendar,
  Info,
  Map as MapIcon,
} from "lucide-react";
import { Pelanggan, PelangganFormData } from "../types";
import MapPicker from "./MapPicker";
import { getImageUrl } from "@/lib/utils";
import { usePelanggan } from "../hooks/usePelanggan";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

interface FilterOption {
  id: string | number;
  nama_lengkap: string;
  jabatan?: string;
  kode_karyawan?: string;
}

interface CustomerFormProps {
  initialData?: Pelanggan | null;
  onSubmit: (data: PelangganFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const SectionHeader = ({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) => (
  <div className="flex items-start gap-4 mb-6 group">
    <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors shadow-sm">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <div className="space-y-1">
      <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
        {title}
      </h3>
      {description && (
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight italic">
          {description}
        </p>
      )}
    </div>
  </div>
);

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

const CustomerForm: React.FC<CustomerFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.foto_toko_url ? getImageUrl(initialData.foto_toko_url) : null,
  );
  const [ktpPreview, setKtpPreview] = useState<string | null>(
    initialData?.foto_ktp_url ? getImageUrl(initialData.foto_ktp_url) : null,
  );

  const [formData, setFormData] = useState<PelangganFormData>({
    nama_toko: initialData?.nama_toko || "",
    kode_pelanggan: initialData?.kode_pelanggan || "",
    nama_pemilik: initialData?.nama_pemilik || "",
    no_hp_pribadi: initialData?.no_hp_pribadi || "",
    alamat_usaha: initialData?.alamat_usaha || "",
    id_divisi: initialData?.id_divisi || 0,
    latitude: initialData?.latitude ? Number(initialData.latitude) : -6.2,
    longitude: initialData?.longitude
      ? Number(initialData.longitude)
      : 106.816666,
    status: initialData?.status || "active",
    no_ktp_pemilik: initialData?.no_ktp_pemilik || "",
    no_npwp_pribadi: initialData?.no_npwp_pribadi || "",
    alamat_rumah_pemilik: initialData?.alamat_rumah_pemilik || "",
    tempat_lahir_pemilik: initialData?.tempat_lahir_pemilik || "",
    tanggal_lahir_pemilik: initialData?.tanggal_lahir_pemilik || "",
    kode_pos_rumah: initialData?.kode_pos_rumah || "",
    kota_rumah: initialData?.kota_rumah || "",
    provinsi_usaha: initialData?.provinsi_usaha || "",
    kota_usaha: initialData?.kota_usaha || "",
    kecamatan_usaha: initialData?.kecamatan_usaha || "",
    nama_kontak_person: initialData?.nama_kontak_person || "",
    no_hp_kontak: initialData?.no_hp_kontak || "",
    cara_pembayaran: initialData?.cara_pembayaran || "Tunai",
    nama_bank: initialData?.nama_bank || "",
    cabang_bank: initialData?.cabang_bank || "",
    no_rekening: initialData?.no_rekening || "",
    atas_nama_rekening: initialData?.atas_nama_rekening || "",
    top_hari: initialData?.top_hari || 0,
    limit_kredit_awal: initialData?.limit_kredit_awal || 0,
    no_npwp_usaha: initialData?.no_npwp_usaha || "",
    nama_npwp_usaha: initialData?.nama_npwp_usaha || "",
    klasifikasi_outlet: initialData?.klasifikasi_outlet || "",
    jenis_produk_industri: initialData?.jenis_produk_industri || "",
    tahun_berdiri: initialData?.tahun_berdiri || undefined,
    alamat_gudang: initialData?.alamat_gudang || "",
    kota_gudang: initialData?.kota_gudang || "",
    no_telp_gudang: initialData?.no_telp_gudang || "",
    sistem_pembayaran: initialData?.sistem_pembayaran || "",
    catatan_lain: initialData?.catatan_lain || "",
    id_sales_pembuat: initialData?.id_sales_pembuat || undefined,
    foto_toko: null,
    foto_ktp: null,
  });

  const { fetchFilterOptions } = usePelanggan();
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]); // filterOptions comes from fetchFilterOptions which returns an array of sales/users
  const isEdit = !!initialData;

  useEffect(() => {
    const loadOptions = async () => {
      const options = await fetchFilterOptions();
      setFilterOptions(options);
    };
    loadOptions();
  }, [fetchFilterOptions]);

  const handleChange = (
    name: keyof PelangganFormData | string,
    value: string | number | File | null,
  ) => {
    setFormData((prev: PelangganFormData) => ({
      ...prev,
      [name]:
        name === "id_divisi" ||
        name === "top_hari" ||
        name === "limit_kredit_awal" ||
        name === "tahun_berdiri"
          ? (typeof value === "string"
              ? parseFloat(value)
              : (value as number)) || 0
          : value,
    }));
  };

  const handleImageChange = (
    e:
      | React.ChangeEventHandler<HTMLInputElement>
      | React.ChangeEvent<HTMLInputElement>,
    field: "foto_toko" | "foto_ktp",
  ) => {
    const file = (e as React.ChangeEvent<HTMLInputElement>).target.files?.[0];
    if (file) {
      setFormData((prev: PelangganFormData) => ({ ...prev, [field]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === "foto_toko") setImagePreview(reader.result as string);
        else setKtpPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationChange = (
    lat: number,
    lng: number,
    address?: string,
    city?: string,
    district?: string,
    state?: string,
  ) => {
    setFormData((prev: PelangganFormData) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      alamat_usaha: address || prev.alamat_usaha,
      kota_usaha: city || prev.kota_usaha,
      kecamatan_usaha: district || prev.kecamatan_usaha,
      provinsi_usaha: state || prev.provinsi_usaha,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-[85vh] bg-background"
    >
      <Tabs
        defaultValue="pemilik"
        className="flex flex-col flex-1 overflow-hidden"
      >
        <div className="px-6 pt-4 bg-muted/30 border-b border-border/50 shrink-0">
          <TabsList className="h-12 bg-transparent gap-6 p-0">
            <TabsTrigger
              value="pemilik"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-2 text-xs font-black uppercase tracking-widest gap-2"
            >
              <User className="h-4 w-4" /> Informasi Pemilik
            </TabsTrigger>
            <TabsTrigger
              value="usaha"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-2 text-xs font-black uppercase tracking-widest gap-2"
            >
              <Store className="h-4 w-4" /> Informasi Usaha
            </TabsTrigger>
            <TabsTrigger
              value="pembayaran"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-2 text-xs font-black uppercase tracking-widest gap-2"
            >
              <CreditCard className="h-4 w-4" /> Pembayaran
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-8 space-y-12">
              <TabsContent
                value="pemilik"
                className="mt-0 space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-8 space-y-10">
                    <div className="space-y-6">
                      <SectionHeader
                        icon={User}
                        title="Identitas Pemilik"
                        description="Informasi personal penanggung jawab toko"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <FormField
                            label="Nama Lengkap Sesuai KTP"
                            required
                            icon={User}
                          >
                            <Input
                              name="nama_pemilik"
                              required
                              value={formData.nama_pemilik}
                              onChange={(e) =>
                                handleChange("nama_pemilik", e.target.value)
                              }
                              className="h-11 bg-card border-border/50 focus-visible:ring-primary shadow-sm"
                              placeholder="Contoh: Budi Santoso"
                            />
                          </FormField>
                        </div>

                        <FormField
                          label="No. Handphone / WA"
                          required
                          icon={Phone}
                        >
                          <Input
                            name="no_hp_pribadi"
                            required
                            value={formData.no_hp_pribadi}
                            onChange={(e) =>
                              handleChange("no_hp_pribadi", e.target.value)
                            }
                            className="h-11 bg-card border-border/50 focus-visible:ring-primary shadow-sm"
                            placeholder="0812XXXXXXXX"
                          />
                        </FormField>

                        <FormField label="Nomor KTP (NIK)" icon={Shield}>
                          <Input
                            name="no_ktp_pemilik"
                            value={formData.no_ktp_pemilik}
                            onChange={(e) =>
                              handleChange("no_ktp_pemilik", e.target.value)
                            }
                            className="h-11 bg-card border-border/50 focus-visible:ring-primary shadow-sm"
                            placeholder="320XXXXXXXXXXXXX"
                          />
                        </FormField>

                        <FormField label="Tempat Lahir" icon={MapPin}>
                          <Input
                            name="tempat_lahir_pemilik"
                            value={formData.tempat_lahir_pemilik}
                            onChange={(e) =>
                              handleChange(
                                "tempat_lahir_pemilik",
                                e.target.value,
                              )
                            }
                            className="h-11 bg-card border-border/50 focus-visible:ring-primary shadow-sm"
                            placeholder="Jakarta"
                          />
                        </FormField>

                        <FormField label="Tanggal Lahir" icon={Calendar}>
                          <Input
                            type="date"
                            name="tanggal_lahir_pemilik"
                            value={formData.tanggal_lahir_pemilik}
                            onChange={(e) =>
                              handleChange(
                                "tanggal_lahir_pemilik",
                                e.target.value,
                              )
                            }
                            className="h-11 bg-card border-border/50 focus-visible:ring-primary shadow-sm"
                          />
                        </FormField>

                        <div className="md:col-span-2">
                          <FormField label="NPWP Pribadi" icon={Landmark}>
                            <Input
                              name="no_npwp_pribadi"
                              value={formData.no_npwp_pribadi}
                              onChange={(e) =>
                                handleChange("no_npwp_pribadi", e.target.value)
                              }
                              className="h-11 bg-card border-border/50 focus-visible:ring-primary shadow-sm"
                              placeholder="00.000.000.0-000.000"
                            />
                          </FormField>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <SectionHeader
                        icon={Info}
                        title="Kontak Person (PIC)"
                        description="Orang yang bisa dihubungi di lapangan"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Nama PIC" icon={User}>
                          <Input
                            name="nama_kontak_person"
                            value={formData.nama_kontak_person}
                            onChange={(e) =>
                              handleChange("nama_kontak_person", e.target.value)
                            }
                            className="h-11 bg-card border-border/50 focus-visible:ring-primary shadow-sm"
                            placeholder="Contoh: Andi (Staff Gudang)"
                          />
                        </FormField>
                        <FormField label="No. HP PIC" icon={Phone}>
                          <Input
                            name="no_hp_kontak"
                            value={formData.no_hp_kontak}
                            onChange={(e) =>
                              handleChange("no_hp_kontak", e.target.value)
                            }
                            className="h-11 bg-card border-border/50 focus-visible:ring-primary shadow-sm"
                            placeholder="0813XXXXXXXX"
                          />
                        </FormField>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-4 space-y-8">
                    <div className="space-y-6">
                      <SectionHeader icon={MapPin} title="Domisili Pemilik" />
                      <div className="space-y-4">
                        <FormField label="Alamat Lengkap Rumah" icon={MapPin}>
                          <Textarea
                            name="alamat_rumah_pemilik"
                            rows={3}
                            value={formData.alamat_rumah_pemilik}
                            onChange={(e) =>
                              handleChange(
                                "alamat_rumah_pemilik",
                                e.target.value,
                              )
                            }
                            className="bg-card border-border/50 focus-visible:ring-primary shadow-sm resize-none"
                            placeholder="Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan"
                          />
                        </FormField>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField label="Kota">
                            <Input
                              name="kota_rumah"
                              value={formData.kota_rumah}
                              onChange={(e) =>
                                handleChange("kota_rumah", e.target.value)
                              }
                              className="h-11 bg-card border-border/50"
                              placeholder="Kota"
                            />
                          </FormField>
                          <FormField label="Kode Pos">
                            <Input
                              name="kode_pos_rumah"
                              value={formData.kode_pos_rumah}
                              onChange={(e) =>
                                handleChange("kode_pos_rumah", e.target.value)
                              }
                              className="h-11 bg-card border-border/50"
                              placeholder="XXXXX"
                            />
                          </FormField>
                        </div>
                      </div>
                    </div>

                    <Card className="bg-muted/30 border-dashed border-2 border-border/50 overflow-hidden group">
                      <CardContent className="p-6">
                        <Label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground/80 mb-4">
                          <Image className="h-3 w-3 text-primary" /> Foto KTP
                          Pemilik
                        </Label>

                        <div className="relative aspect-video w-full bg-background rounded-xl border border-border/50 overflow-hidden group/img">
                          {ktpPreview ? (
                            <>
                              <img
                                src={ktpPreview}
                                alt="KTP Preview"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="rounded-full h-9 w-9 shadow-lg"
                                  onClick={() => {
                                    setKtpPreview(null);
                                    setFormData((prev) => ({
                                      ...prev,
                                      foto_ktp: null,
                                    }));
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-muted/50 transition-colors">
                              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                              <span className="text-[10px] font-black uppercase text-primary tracking-widest">
                                Upload KTP
                              </span>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) =>
                                  handleImageChange(e, "foto_ktp")
                                }
                              />
                            </label>
                          )}
                        </div>
                        <p className="mt-4 text-[10px] text-muted-foreground font-medium text-center italic">
                          Format JPG/PNG, Maksimal 5MB
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="usaha"
                className="mt-0 space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="bg-muted/30 border-border/50 shadow-sm overflow-hidden">
                    <CardContent className="p-8 space-y-8">
                      <SectionHeader
                        icon={Store}
                        title="Data Toko / Usaha"
                        description="Informasi operasional bisnis pelanggan"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <FormField
                            label="Nama Toko / Outlet"
                            required
                            icon={Store}
                          >
                            <Input
                              name="nama_toko"
                              required
                              value={formData.nama_toko}
                              onChange={(e) =>
                                handleChange("nama_toko", e.target.value)
                              }
                              className="h-11 bg-card border-border/50"
                              placeholder="Nama Toko"
                            />
                          </FormField>
                        </div>
                        <FormField
                          label="Kode Pelanggan (Internal)"
                          icon={Info}
                        >
                          <Input
                            name="kode_pelanggan"
                            value={formData.kode_pelanggan}
                            onChange={(e) =>
                              handleChange("kode_pelanggan", e.target.value)
                            }
                            className="h-11 bg-muted/50 border-border/50 font-mono text-xs"
                            placeholder="Auto-generated"
                          />
                        </FormField>
                        <FormField label="Tahun Berdiri" icon={Calendar}>
                          <Input
                            type="number"
                            name="tahun_berdiri"
                            value={formData.tahun_berdiri || ""}
                            onChange={(e) =>
                              handleChange("tahun_berdiri", e.target.value)
                            }
                            className="h-11 bg-card border-border/50"
                            placeholder="2020"
                          />
                        </FormField>
                        <FormField label="Status" icon={Shield}>
                          <Select
                            value={formData.status}
                            onValueChange={(val) => handleChange("status", val)}
                          >
                            <SelectTrigger className="h-11 bg-card border-border/50">
                              <SelectValue placeholder="Pilih Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Aktif</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="prospect">Prospek</SelectItem>
                              <SelectItem value="nonactive">
                                Non-Aktif
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormField>
                        <FormField label="Klasifikasi Outlet" icon={Info}>
                          <Select
                            value={formData.klasifikasi_outlet}
                            onValueChange={(val) =>
                              handleChange("klasifikasi_outlet", val)
                            }
                          >
                            <SelectTrigger className="h-11 bg-card border-border/50 text-xs">
                              <SelectValue placeholder="Pilih Klasifikasi" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Modern Bakery">
                                Modern Bakery
                              </SelectItem>
                              <SelectItem value="Home Industry">
                                Home Industry
                              </SelectItem>
                              <SelectItem value="Restoran">Restoran</SelectItem>
                              <SelectItem value="Hotel">Hotel</SelectItem>
                              <SelectItem value="Lain-lain">
                                Lain-lain
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormField>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/30 border-dashed border-2 border-border/50 overflow-hidden group">
                    <CardContent className="p-8 space-y-6 text-center">
                      <SectionHeader
                        icon={Image}
                        title="Dokumentasi Toko"
                        description="Foto tampak depan outlet pelanggan"
                      />
                      <div className="relative aspect-video w-full bg-background rounded-2xl border border-border/50 overflow-hidden group/img">
                        {imagePreview ? (
                          <>
                            <img
                              src={imagePreview}
                              alt="Toko Preview"
                              className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="rounded-full shadow-xl"
                                onClick={() => {
                                  setImagePreview(null);
                                  setFormData((prev) => ({
                                    ...prev,
                                    foto_toko: null,
                                  }));
                                }}
                              >
                                <X className="h-5 w-5" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-muted/50 transition-all">
                            <Upload className="h-12 w-12 text-primary/40 mb-3" />
                            <span className="text-xs font-black uppercase text-primary tracking-widest">
                              Ambil / Upload Foto Toko
                            </span>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) =>
                                handleImageChange(e, "foto_toko")
                              }
                            />
                          </label>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight italic">
                        * Pastikan foto jelas dan memperlihatkan papan nama toko
                        jika ada.
                      </p>
                    </CardContent>
                  </Card>

                  <div className="lg:col-span-2 space-y-6">
                    <SectionHeader
                      icon={MapIcon}
                      title="Lokasi & Alamat Operasional"
                      description="Gunakan map untuk menentukan titik koordinat presisi"
                    />
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                      <div className="lg:col-span-7 h-[450px] rounded-xl overflow-hidden border border-border/50">
                        <MapPicker
                          lat={formData.latitude}
                          lng={formData.longitude}
                          onChange={handleLocationChange}
                          height="h-full"
                        />
                      </div>
                      <div className="lg:col-span-5 space-y-6">
                        <div className="p-4 bg-muted/30 rounded-xl border border-border/50 space-y-3">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                            <span>Koordinat GPS Terdeteksi</span>
                            <MapPin className="h-3 w-3" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label className="text-[9px] uppercase font-bold text-muted-foreground">
                                Latitude
                              </Label>
                              <code className="block p-2 bg-background rounded text-xs font-bold text-foreground border border-border/50">
                                {formData.latitude.toFixed(6)}
                              </code>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[9px] uppercase font-bold text-muted-foreground">
                                Longitude
                              </Label>
                              <code className="block p-2 bg-background rounded text-xs font-bold text-foreground border border-border/50">
                                {formData.longitude.toFixed(6)}
                              </code>
                            </div>
                          </div>
                        </div>

                        <FormField
                          label="Alamat Lengkap Operasional"
                          required
                          icon={MapPin}
                        >
                          <Textarea
                            name="alamat_usaha"
                            required
                            rows={3}
                            value={formData.alamat_usaha}
                            onChange={(e) =>
                              handleChange("alamat_usaha", e.target.value)
                            }
                            className="bg-background border-border/50 focus-visible:ring-primary shadow-sm resize-none"
                            placeholder="Jalan, RT/RW, Kelurahan, Kecamatan..."
                          />
                        </FormField>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField label="Kecamatan">
                            <Input
                              name="kecamatan_usaha"
                              value={formData.kecamatan_usaha}
                              onChange={(e) =>
                                handleChange("kecamatan_usaha", e.target.value)
                              }
                              className="h-11 bg-background border-border/50"
                              placeholder="Kecamatan"
                            />
                          </FormField>
                          <FormField label="Kota / Kabupaten">
                            <Input
                              name="kota_usaha"
                              value={formData.kota_usaha}
                              onChange={(e) =>
                                handleChange("kota_usaha", e.target.value)
                              }
                              className="h-11 bg-background border-border/50"
                              placeholder="Kota"
                            />
                          </FormField>
                        </div>

                        <FormField label="Alamat Gudang (Opsional)" icon={Info}>
                          <Input
                            name="alamat_gudang"
                            value={formData.alamat_gudang}
                            onChange={(e) =>
                              handleChange("alamat_gudang", e.target.value)
                            }
                            className="h-11 bg-background border-border/50"
                            placeholder="Kosongkan jika sama dengan alamat toko"
                          />
                        </FormField>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="pembayaran"
                className="mt-0 space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-10">
                    <Card className="bg-muted/30 border-border/50 shadow-sm overflow-hidden">
                      <CardContent className="p-8 space-y-8">
                        <SectionHeader
                          icon={Landmark}
                          title="Ketentuan Pembayaran"
                          description="Pengaturan metode dan sistem pembayaran"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField label="Cara Pembayaran" icon={Landmark}>
                            <Select
                              value={formData.cara_pembayaran}
                              onValueChange={(val) =>
                                handleChange("cara_pembayaran", val)
                              }
                            >
                              <SelectTrigger className="h-11 bg-card border-border/50">
                                <SelectValue placeholder="Pilih Cara" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Tunai">
                                  Tunai / Cash
                                </SelectItem>
                                <SelectItem value="Transfer">
                                  Transfer Bank
                                </SelectItem>
                                <SelectItem value="Giro">Giro</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormField>

                          <FormField label="Sistem Pembayaran" icon={Shield}>
                            <Select
                              value={formData.sistem_pembayaran}
                              onValueChange={(val) =>
                                handleChange("sistem_pembayaran", val)
                              }
                            >
                              <SelectTrigger className="h-11 bg-card border-border/50">
                                <SelectValue placeholder="Pilih Sistem" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Cash">
                                  Cash (Maks. 3 Hari)
                                </SelectItem>
                                <SelectItem value="Kredit">
                                  Kredit (Tempo)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormField>

                          {formData.sistem_pembayaran === "Kredit" && (
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-primary/5 rounded-2xl border border-primary/10 animate-in zoom-in-95 duration-300">
                              <FormField
                                label="Limit Kredit Awal (Rp)"
                                icon={CreditCard}
                              >
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                    Rp
                                  </span>
                                  <Input
                                    type="number"
                                    name="limit_kredit_awal"
                                    value={formData.limit_kredit_awal}
                                    onChange={(e) =>
                                      handleChange(
                                        "limit_kredit_awal",
                                        e.target.value,
                                      )
                                    }
                                    className="h-11 pl-12 bg-card border-border/50 font-bold"
                                  />
                                </div>
                              </FormField>
                              <FormField
                                label="Term of Payment (TOP)"
                                icon={Calendar}
                              >
                                <div className="relative">
                                  <Input
                                    type="number"
                                    name="top_hari"
                                    value={formData.top_hari}
                                    onChange={(e) =>
                                      handleChange("top_hari", e.target.value)
                                    }
                                    className="h-11 pr-14 bg-card border-border/50 font-bold"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                    Hari
                                  </span>
                                </div>
                              </FormField>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {(formData.cara_pembayaran === "Transfer" ||
                      formData.cara_pembayaran === "Giro") && (
                      <Card className="bg-primary/5 border-primary/20 shadow-md animate-in slide-in-from-top-4 duration-500">
                        <CardContent className="p-8 space-y-6">
                          <SectionHeader
                            icon={Landmark}
                            title="Detail Rekening Bank"
                            description="Informasi bank untuk keperluan transaksi"
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Nama Bank">
                              <Input
                                name="nama_bank"
                                value={formData.nama_bank}
                                onChange={(e) =>
                                  handleChange("nama_bank", e.target.value)
                                }
                                className="h-11 bg-card border-border/50"
                                placeholder="Contoh: BCA / Mandiri"
                              />
                            </FormField>
                            <FormField label="Kantor Cabang">
                              <Input
                                name="cabang_bank"
                                value={formData.cabang_bank}
                                onChange={(e) =>
                                  handleChange("cabang_bank", e.target.value)
                                }
                                className="h-11 bg-card border-border/50"
                                placeholder="Nama Cabang"
                              />
                            </FormField>
                            <FormField label="Nomor Rekening">
                              <Input
                                name="no_rekening"
                                value={formData.no_rekening}
                                onChange={(e) =>
                                  handleChange("no_rekening", e.target.value)
                                }
                                className="h-11 bg-card border-border/50 font-mono"
                                placeholder="XXXXXXXXXX"
                              />
                            </FormField>
                            <FormField label="Atas Nama Rekening">
                              <Input
                                name="atas_nama_rekening"
                                value={formData.atas_nama_rekening}
                                onChange={(e) =>
                                  handleChange(
                                    "atas_nama_rekening",
                                    e.target.value,
                                  )
                                }
                                className="h-11 bg-card border-border/50"
                                placeholder="Nama Pemilik Rekening"
                              />
                            </FormField>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <div className="space-y-10">
                    <Card className="bg-indigo-50/50 dark:bg-primary/5 border-primary/10 shadow-sm">
                      <CardContent className="p-8 space-y-6">
                        <SectionHeader
                          icon={Briefcase}
                          title="Penugasan Sales"
                          description="Sales person yang bertanggung jawab atas outlet ini"
                        />
                        <FormField
                          label="Pilih Sales Representative"
                          icon={User}
                        >
                          <Select
                            value={formData.id_sales_pembuat?.toString() || ""}
                            onValueChange={(val) =>
                              handleChange("id_sales_pembuat", val)
                            }
                          >
                            <SelectTrigger className="h-11 bg-card border-border/50">
                              <SelectValue placeholder="Pilih Sales" />
                            </SelectTrigger>
                            <SelectContent>
                              {(filterOptions as FilterOption[]).map((opt) => (
                                <SelectItem
                                  key={opt.id.toString()}
                                  value={opt.id.toString()}
                                >
                                  {opt.nama_lengkap}{" "}
                                  {opt.jabatan ? `(${opt.jabatan})` : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormField>
                      </CardContent>
                    </Card>

                    <FormField label="Catatan Tambahan" icon={Info}>
                      <Textarea
                        name="catatan_lain"
                        rows={6}
                        value={formData.catatan_lain}
                        onChange={(e) =>
                          handleChange("catatan_lain", e.target.value)
                        }
                        className="bg-card border-border/50 focus-visible:ring-primary shadow-sm resize-none"
                        placeholder="Berikan detail tambahan jika diperlukan (contoh: preferensi jam pengiriman, catatan khusus owner, dll)"
                      />
                    </FormField>
                  </div>
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </div>

        <div className="p-6 bg-muted/30 border-t border-border/50 flex items-center justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
            className="h-11 px-8 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="h-11 px-10 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Menyimpan...
              </span>
            ) : isEdit ? (
              "Update Pelanggan"
            ) : (
              "Simpan Pelanggan"
            )}
          </Button>
        </div>
      </Tabs>
    </form>
  );
};

export default CustomerForm;

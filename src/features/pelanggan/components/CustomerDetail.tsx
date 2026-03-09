import React from "react";
import {
  Store,
  User,
  Phone,
  MapPin,
  Layers,
  CreditCard,
  Briefcase,
  Smartphone,
  Info,
  Building2,
  Landmark,
  Image as LucideImage,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { Pelanggan } from "../types";
import { getImageUrl } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface CustomerDetailProps {
  data: Pelanggan;
}

const InfoRow = ({
  label,
  value,
  icon: Icon,
  className = "",
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
  className?: string;
}) => (
  <div className={`space-y-1.5 ${className}`}>
    <div className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider text-[10px] font-bold">
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </div>
    <div className="text-sm font-semibold text-foreground/90">
      {value || <span className="text-muted-foreground italic">—</span>}
    </div>
  </div>
);

const CustomerDetail: React.FC<CustomerDetailProps> = ({ data }) => {
  const STATUS_VARIANT: Record<
    string,
    "success" | "destructive" | "secondary" | "warning" | "info"
  > = {
    active: "success",
    rejected: "destructive",
    nonactive: "secondary",
    pending: "warning",
    prospect: "info",
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="relative group shrink-0 w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden border-2 border-primary/20 bg-muted shadow-xl shadow-primary/5">
          {data.foto_toko_url ? (
            <img
              src={getImageUrl(data.foto_toko_url)}
              alt={data.nama_toko}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
              <Store className="h-16 w-16" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant={STATUS_VARIANT[data.status] || "secondary"}>
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full inline-block bg-current opacity-70" />
              {data.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="flex-1 space-y-4 py-2 w-full">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h2 className="text-3xl font-black tracking-tight text-foreground uppercase">
                {data.nama_toko}
              </h2>
              {data.kode_pelanggan && (
                <Badge variant="outline" className="text-xs font-mono py-1">
                  {data.kode_pelanggan}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              <User className="h-4 w-4" /> {data.nama_pemilik}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            <InfoRow
              label="Kategori Outlet"
              icon={Layers}
              value={data.klasifikasi_outlet}
            />
            <InfoRow
              label="Divisi Terkait"
              icon={Building2}
              value={data.divisi?.nama_divisi}
            />
            <InfoRow
              label="Kontak Utama"
              icon={Smartphone}
              value={
                <div className="flex items-center gap-2">
                  {data.no_hp_pribadi}
                  <a
                    href={`https://wa.me/${data.no_hp_pribadi?.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-500 hover:text-green-600 p-1 bg-green-50 rounded"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              }
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Alamat Section */}
          <Card className="border-none shadow-lg bg-card/60 backdrop-blur-sm overflow-hidden group">
             <div className="h-1 bg-primary/20 group-hover:bg-primary transition-colors" />
            <CardContent className="p-6 space-y-6">
              <SectionHeader
                icon={MapPin}
                title="Lokasi & Alamat"
                description="Detail alamat operasional"
              />
              <div className="space-y-4">
                <InfoRow
                  label="Alamat Lengkap"
                  value={data.alamat_usaha}
                  className="bg-muted/30 p-4 rounded-xl"
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <InfoRow label="Provinsi" value={data.provinsi_usaha} />
                  <InfoRow label="Kota / Kab" value={data.kota_usaha} />
                  <InfoRow label="Kecamatan" value={data.kecamatan_usaha} />
                </div>
                
                <div className="pt-4">
                   <div className="h-48 rounded-xl bg-muted border-2 border-dashed border-border flex items-center justify-center relative overflow-hidden shadow-inner group-hover/card:border-primary/30 transition-all">
                      {data.latitude && data.longitude ? (
                         <div className="absolute inset-0 bg-primary/5 flex items-center justify-center flex-col gap-2">
                            <MapPin className="h-10 w-10 text-primary opacity-50" />
                            <a 
                              href={`https://www.google.com/maps?q=${data.latitude},${data.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
                            >
                              Buka di Google Maps <ExternalLink className="h-3 w-3" />
                            </a>
                            <div className="absolute bottom-4 left-4 text-[9px] font-mono opacity-40">
                              LAT: {data.latitude} | LNG: {data.longitude}
                            </div>
                         </div>
                      ) : (
                        <div className="text-muted-foreground/30 text-[10px] uppercase font-bold tracking-widest">Maps Tidak Tersedia</div>
                      )}
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Administrasi Section */}
          <Card className="border-none shadow-lg bg-card/60 backdrop-blur-sm overflow-hidden group">
            <div className="h-1 bg-primary/20 group-hover:bg-primary transition-colors" />
            <CardContent className="p-6 space-y-6">
              <SectionHeader
                icon={CreditCard}
                title="Sistem Pembayaran"
                description="Ketentuan transaksi & perbankan"
              />
              <div className="grid grid-cols-2 gap-6 pb-2">
                <InfoRow label="Metode Transaksi" icon={Briefcase} value={data.cara_pembayaran} />
                <InfoRow label="Tipe Pembayaran" icon={ShieldAlert} value={data.sistem_pembayaran} />
              </div>

              {data.sistem_pembayaran === "Kredit" && (
                <div className="grid grid-cols-2 gap-6 p-4 bg-primary/5 rounded-xl border border-primary/10 shadow-inner">
                  <InfoRow 
                    label="Limit Kredit Awal" 
                    value={`Rp ${new Intl.NumberFormat('id-ID').format(data.limit_kredit_awal || 0)}`} 
                  />
                  <InfoRow label="Durasi TOP" value={`${data.top_hari || 0} Hari`} />
                </div>
              )}

              {data.cara_pembayaran !== "Cash" && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground/60 tracking-tighter">
                       <Landmark className="h-3 w-3" /> Rekening Bank Terdaftar
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <InfoRow label="Bank" value={data.nama_bank} />
                       <InfoRow label="Cabang" value={data.cabang_bank} />
                       <InfoRow label="Nomor Rekening" className="col-span-2" value={<span className="font-mono text-base">{data.no_rekening}</span>} />
                       <InfoRow label="Atas Nama" className="col-span-2" value={data.atas_nama_rekening} />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
           {/* Identitas Section */}
           <Card className="border-none shadow-lg bg-card/60 backdrop-blur-sm overflow-hidden group">
             <div className="h-1 bg-primary/20 group-hover:bg-primary transition-colors" />
             <CardContent className="p-6 space-y-6">
                <SectionHeader icon={LucideImage} title="Dokumen Pendukung" description="Identitas & legalitas" />
                <div className="aspect-[1.6/1] bg-muted rounded-2xl overflow-hidden border-2 border-dashed border-border group-hover:border-primary/30 transition-all flex items-center justify-center shadow-inner relative group/ktp">
                   {data.foto_ktp_url ? (
                      <img 
                        src={getImageUrl(data.foto_ktp_url)} 
                        alt="KTP Owners" 
                        className="w-full h-full object-contain p-2 transition-all group-hover/ktp:scale-105"
                      />
                   ) : (
                     <div className="flex flex-col items-center gap-2 text-muted-foreground/30 opacity-50">
                        <LucideImage className="h-12 w-12" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">KTP Belum Diunggah</span>
                     </div>
                   )}
                </div>
             </CardContent>
           </Card>

           {/* Kontak Section */}
           <Card className="border-none shadow-lg bg-card/60 backdrop-blur-sm overflow-hidden group">
             <div className="h-1 bg-primary/20 group-hover:bg-primary transition-colors" />
             <CardContent className="p-6 space-y-6">
                <SectionHeader icon={Phone} title="Kontak Tambahan" description="Personel operasional" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <InfoRow label="Kontak Person" icon={User} value={data.nama_kontak_person} />
                   <InfoRow label="No HP Kontak" icon={Phone} value={data.no_hp_kontak} />
                </div>
             </CardContent>
           </Card>

           {/* System Logs / Info */}
           <Card className="border-none shadow-lg bg-card/60 backdrop-blur-sm overflow-hidden group">
             <div className="h-1 bg-primary/20 group-hover:bg-primary transition-colors" />
             <CardContent className="p-6 space-y-4">
                <div className="flex flex-col gap-3">
                   <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border border-border/50">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                         <Calendar className="h-3.5 w-3.5" /> Terdaftar Pada
                      </div>
                      <div className="text-xs font-black">
                         {data.created_at ? new Date(data.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'long', year: 'numeric'
                         }) : "—"}
                      </div>
                   </div>
                   <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border border-border/50">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                         <User className="h-3.5 w-3.5" /> Dibuat Oleh
                      </div>
                      <div className="text-xs font-black text-primary">
                         {data.creator?.nama_lengkap || "System"}
                      </div>
                   </div>
                </div>
                
                {data.catatan_lain && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground/60 tracking-tighter">
                       <Info className="h-3 w-3" /> Catatan Tambahan
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed bg-amber-50/50 p-4 rounded-xl border border-amber-100/50 italic font-medium">
                      "{data.catatan_lain}"
                    </p>
                  </div>
                )}
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;

const ShieldAlert = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </svg>
);

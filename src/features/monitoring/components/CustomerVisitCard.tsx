import { VisitPoint } from "../types";
import {
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  BadgeCheck,
} from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { getImageUrl, cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CustomerVisitCardProps {
  point: VisitPoint;
  onClick?: () => void;
}

export const CustomerVisitCard = ({
  point,
  onClick,
}: CustomerVisitCardProps) => {
  const { pelanggan, visit, status, type } = point;
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const formatTime = (isoString?: string) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const images = [
    getImageUrl(visit?.foto_1_url),
    getImageUrl(visit?.foto_2_url),
    getImageUrl(visit?.foto_3_url),
    getImageUrl(visit?.foto_4_url),
  ].filter(Boolean);

  let statusBadge = (
    <Badge variant="secondary" className="gap-1 opacity-60">
      <Clock className="h-3 w-3" /> BELUM
    </Badge>
  );

  if (status === "visited") {
    if (type === "unplanned") {
      statusBadge = (
        <Badge variant="warning" className="gap-1">
          <AlertTriangle className="h-3 w-3" /> UNPLANNED
        </Badge>
      );
    } else {
      statusBadge = (
        <Badge variant="success" className="gap-1">
          <CheckCircle className="h-3 w-3" /> DIKUNJUNGI
        </Badge>
      );
    }
  }

  const isOutOfRange = visit
    ? visit.is_valid_distance === false ||
      (visit.is_valid_distance === undefined &&
        (visit.jarak_validasi || 0) > (visit.batas_jarak || 100))
    : false;

  return (
    <div
      id={`visit-card-${pelanggan.id}`}
      onClick={onClick}
      className="group bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all mb-3 last:mb-0 cursor-pointer ring-offset-2 hover:ring-2 hover:ring-primary/20"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded border border-border font-mono tracking-tight font-bold">
              {pelanggan.kode_pelanggan || "-"}
            </span>
            <h4 className="font-bold text-foreground text-sm truncate group-hover:text-primary transition-colors">
              {pelanggan.nama_toko}
            </h4>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1 leading-normal italic">
            {pelanggan.alamat}
          </p>
        </div>
      </div>
      <div className="mb-3">{statusBadge}</div>

      <div className="space-y-4 mt-3 pt-3 border-t border-border/50">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex flex-col gap-1 p-2 rounded-lg bg-muted/30 border border-border/30">
              <span className="text-muted-foreground text-[10px] block font-bold uppercase tracking-wider">
                Check-in
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock className="h-3 w-3 text-primary" />
                <span className="font-bold text-foreground">
                  {visit ? formatTime(visit.waktu_check_in) : "—"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1 p-2 rounded-lg bg-muted/30 border border-border/30 opacity-80">
              <span className="text-muted-foreground text-[10px] block font-bold uppercase tracking-wider">
                Check-out
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="font-bold text-foreground/70">
                  {visit?.waktu_check_out
                    ? formatTime(visit.waktu_check_out)
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "flex items-center justify-between p-2 rounded-lg border border-border/30",
              isOutOfRange ? "bg-destructive/5" : "bg-muted/30",
            )}
          >
            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
              Jarak Validasi
            </span>
            <div className="flex items-center gap-2">
              <MapPin
                className={cn(
                  "h-3 w-3",
                  isOutOfRange ? "text-destructive" : "text-green-500",
                )}
              />
              <span
                className={cn(
                  "font-bold text-xs tabular-nums",
                  isOutOfRange ? "text-destructive" : "text-foreground",
                )}
              >
                {visit?.jarak_validasi
                  ? `${Math.round(visit.jarak_validasi)}m`
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        {visit && (
        <div className="space-y-3">
        {images.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
        {images.map((img, idx) => (
        <div
        key={idx}
        onClick={(e) => {
        e.stopPropagation();
        setSelectedImage(img as string);
        setIsImageModalOpen(true);
        }}
        className="relative h-12 w-12 rounded-md overflow-hidden border border-border hover:border-primary transition-all cursor-zoom-in"
        >
        <img
        src={img as string}
        alt={`Bukti ${idx + 1}`}
        className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
        </div>
        ))}
        </div>
        )}

        {/* Tampilkan pesanan_summary (multiple orders) jika ada */}
        {visit.pesanan_summary ? (
        <div className="bg-green-500/5 text-green-700 dark:text-green-400 p-3 rounded-xl text-xs border border-green-500/10 shadow-sm">
        <div className="flex items-center gap-2 mb-2 font-bold border-b border-green-500/10 pb-2 uppercase tracking-tight text-[10px]">
        <BadgeCheck className="h-4 w-4" />
          <span>Detail Transaksi</span>
          {visit.pesanan_summary.count > 1 && (
          <span className="ml-auto bg-green-500/20 text-green-700 px-1.5 py-0.5 rounded text-[9px] font-bold">
          {visit.pesanan_summary.count} ORDER
        </span>
        )}
        </div>
        {/* Jika hanya 1 pesanan, tampilkan ringkas */}
        {visit.pesanan_summary.count === 1 ? (
        <div className="flex justify-between items-end">
          <div>
          <span className="text-[10px] text-muted-foreground block uppercase tracking-wider mb-0.5">
            Total Order
            </span>
          <span className="font-bold text-sm text-green-600 dark:text-green-500 tabular-nums leading-none">
              {formatCurrency(visit.pesanan_summary.total_tagihan)}
              </span>
              </div>
                <Badge variant="success" className="h-5 text-[10px] py-0 px-1.5 font-bold">
                {visit.pesanan_summary.items_count} ITEMS
            </Badge>
        </div>
        ) : (
        /* Jika 2+ pesanan, tampilkan list per pesanan */
        <div className="space-y-1.5">
            {visit.pesanan_summary.list.map((p, idx) => (
                <div key={p.id} className="flex justify-between items-center py-1 border-b border-green-500/10 last:border-0">
                    <span className="text-[10px] text-muted-foreground font-mono">
                          #{idx + 1} {p.no_pesanan}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-green-700 font-bold tabular-nums">
                            {formatCurrency(p.total_tagihan)}
                          </span>
                          <Badge variant="success" className="h-4 text-[9px] py-0 px-1 font-bold">
                            {p.items_count} item
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-green-800">
                        Total
                      </span>
                      <span className="font-bold text-sm text-green-700 tabular-nums">
                        {formatCurrency(visit.pesanan_summary.total_tagihan)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : visit.pesanan ? (
              // Fallback: legacy single pesanan
              <div className="bg-green-500/5 text-green-700 dark:text-green-400 p-3 rounded-xl text-xs border border-green-500/10 shadow-sm">
                <div className="flex items-center gap-2 mb-2 font-bold border-b border-green-500/10 pb-2 uppercase tracking-tight text-[10px]">
                  <BadgeCheck className="h-4 w-4" />
                  <span>Detail Transaksi</span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase tracking-wider mb-0.5">
                      Total Order
                    </span>
                    <span className="font-bold text-sm text-green-600 dark:text-green-500 tabular-nums leading-none">
                      {formatCurrency(visit.pesanan.total_tagihan || 0)}
                    </span>
                  </div>
                  <Badge variant="success" className="h-5 text-[10px] py-0 px-1.5 font-bold">
                    {visit.pesanan.items_count || 0} ITEMS
                  </Badge>
                </div>
              </div>
            ) : (
              visit.status_transaksi && (
                <div className="bg-green-500/5 text-green-700 dark:text-green-400 px-3 py-2 rounded-lg text-xs flex items-center gap-2 border border-green-500/10">
                  <BadgeCheck className="h-4 w-4 shrink-0" />
                  <span className="font-bold text-[10px] uppercase tracking-tight">
                    Ada Transaksi
                  </span>
                </div>
              )
            )}

            {isOutOfRange && (
              <div className="flex items-start gap-2 text-destructive text-[10px] bg-destructive/5 p-2 rounded-lg border border-destructive/10 font-medium">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Check-in diluar toleransi (&gt;{visit?.batas_jarak || 100}m).
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          setSelectedImage(null);
        }}
        title="Bukti Foto Kunjungan"
        size="lg"
      >
        <div className="space-y-4">
          <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden flex items-center justify-center border border-border shadow-inner">
            <img
              src={selectedImage || (images[0] as string)}
              alt="Preview Zoom"
              className="max-w-full max-h-full object-contain"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img as string)}
                className={cn(
                  "relative h-16 w-16 rounded-lg overflow-hidden border-2 transition-all shrink-0",
                  selectedImage === img || (!selectedImage && idx === 0)
                    ? "border-primary scale-105"
                    : "border-transparent opacity-50 hover:opacity-100",
                )}
              >
                <img
                  src={img as string}
                  alt={`Bukti ${idx + 1}`}
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              onClick={() => {
                setIsImageModalOpen(false);
                setSelectedImage(null);
              }}
              className="px-8"
            >
              Tutup
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KirimanDetail } from "../types";

interface SortableDetailRowProps {
  detail: KirimanDetail;
  nomor: number;
  pending?: boolean;
  isFocused: boolean;
  onFocus: () => void;
  onRemove?: () => void;
}

/** Satu baris daftar kiriman yang bisa di-drag (grip kiri) untuk mengubah urutan. */
const SortableDetailRow: React.FC<SortableDetailRowProps> = ({
  detail,
  nomor,
  pending,
  isFocused,
  onFocus,
  onRemove,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: detail.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={onFocus}
      className={cn(
        "group flex items-start gap-1.5 px-1.5 py-1.5 rounded-md text-xs cursor-pointer hover:bg-muted transition-colors",
        isFocused && "bg-muted",
        isDragging && "shadow-lg ring-2 ring-primary/40 bg-card z-50",
      )}
    >
      {/* Grip drag */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground touch-none"
        title="Tarik untuk ubah urutan"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white text-[10px] font-bold",
          pending ? "bg-primary/70" : "bg-primary",
        )}
      >
        {nomor}
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">
          {detail.pelanggan?.nama_toko ?? `Pelanggan #${detail.id_pelanggan}`}
        </div>
        <div className="text-[10px] text-muted-foreground truncate">
          {detail.rute_asal
            ? `dari rute: ${detail.rute_asal.nama_rute}`
            : (detail.pelanggan?.alamat_usaha ?? "tambahan manual")}
        </div>
        {(detail.pelanggan?.latitude == null ||
          detail.pelanggan?.longitude == null) && (
          <span className="inline-block mt-0.5 px-1 rounded bg-gray-200 text-gray-600 text-[9px] font-semibold">
            tanpa koordinat
          </span>
        )}
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
          title="Keluarkan dari kiriman"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

export default SortableDetailRow;

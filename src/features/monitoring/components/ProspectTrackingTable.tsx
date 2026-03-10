import React, { useState } from "react";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { ProspectSummary, ProspectDetail } from "../types/Prospect";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, Loader2 } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";

interface ProspectTrackingTableProps {
  data: ProspectSummary[];
  loading: boolean;
  page: number;
  perPage: number;
  pagination: {
    currentPage: number;
    lastPage: number;
    total: number;
    perPage: number;
  };
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  toolbar?: React.ReactNode;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  // Detail props
  details: ProspectDetail[];
  loadingDetails: boolean;
  onViewDetails: (id_karyawan: number, date: string) => void;
}

const formatTime = (dateString: string) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date) + " WIB";
  } catch {
    return dateString;
  }
};

const ProspectTrackingTable: React.FC<ProspectTrackingTableProps> = ({
  data,
  loading,
  page,
  perPage,
  pagination,
  onPageChange,
  onPerPageChange,
  toolbar,
  onSearchChange,
  searchPlaceholder,
  details,
  loadingDetails,
  onViewDetails,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<ProspectSummary | null>(null);

  const handleOpenDetails = (row: ProspectSummary) => {
    setSelectedSummary(row);
    onViewDetails(row.id_karyawan, row.raw_tanggal);
    setIsModalOpen(true);
  };

  const columns: ColumnDef<ProspectSummary>[] = [
    {
      key: "no",
      header: "NO",
      cell: (_row, index) => (
        <span className="text-sm font-medium text-muted-foreground w-6 text-center inline-block">
          {(page - 1) * perPage + index + 1}
        </span>
      ),
    },
    {
      key: "tanggal",
      header: "TANGGAL",
      sortable: true,
      cell: (row) => <span className="font-semibold text-sm">{row.tanggal}</span>,
    },
    {
      key: "nama",
      header: "NAMA SALES",
      cell: (row) => (
        <span className="text-sm font-semibold text-primary">
          {row.nama !== "-" ? row.nama.toUpperCase() : row.nama}
        </span>
      ),
    },
    {
      key: "total_prospect",
      header: "TOTAL PROSPECT",
      className: "text-center",
      cell: (row) => (
        <span className="text-sm font-bold bg-orange-500/10 text-orange-600 px-4 py-0.5 rounded-md">
          {row.total_prospect} Toko
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleOpenDetails(row)}
          className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        rowKey={(r) => `${r.tanggal}-${r.id_karyawan}`}
        emptyMessage="Belum ada data prospek ditemukan"
        toolbar={toolbar}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        serverPagination={{
          ...pagination,
          onPageChange,
          onPerPageChange,
        }}
      />

      {/* Detail Modal - List of prospects in Table format */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Daftar Prospect - ${selectedSummary?.nama} (${selectedSummary?.tanggal})`}
        size="4xl"
      >
        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
          {loadingDetails ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : details.length > 0 ? (
            <div className="border rounded-lg overflow-hidden border-border/60 shadow-sm">
              <table className="w-full text-sm text-left border-collapse bg-card">
                <thead className="bg-muted/50 border-b border-border/60">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-12 text-center">No</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Toko</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lokasi</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dikunjungi</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Alasan/Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {details.map((prospect, idx) => (
                    <tr key={prospect.id} className="hover:bg-primary/5 transition-colors group">
                      <td className="px-4 py-3 text-center text-muted-foreground font-medium">{idx + 1}</td>
                      <td className="px-4 py-3 font-bold text-primary group-hover:text-primary transition-colors">
                        {prospect.nama_toko.toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {prospect.kecamatan_usaha || "-"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {prospect.kota_usaha || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                        {formatTime(prospect.created_at)}
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="text-xs italic text-slate-500 line-clamp-2" title={prospect.catatan_lain}>
                          {prospect.catatan_lain || "Tidak ada keterangan."}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
              <Calendar className="mb-2 h-10 w-10 opacity-10" />
              <p className="text-sm font-medium">Data prospek tidak ditemukan</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ProspectTrackingTable;

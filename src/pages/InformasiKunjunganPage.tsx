import React, { useEffect, useState, useMemo } from "react";
import {
  FileText,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { format as formatFile } from "date-fns";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import toast from "react-hot-toast";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";

interface InformasiKunjungan {
  tanggal: string;
  nama: string;
  visited: number;
  waktu_mulai: string;
  waktu_akhir: string;
  total_penjualan: number;
}

const InformasiKunjunganPage: React.FC = () => {
  const [data, setData] = useState<InformasiKunjungan[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 20,
  });

  const startDate = useMemo(() => 
    dateRange?.from ? formatFile(dateRange.from, "yyyy-MM-dd") : "", 
    [dateRange?.from]
  );
  
  const endDate = useMemo(() => 
    dateRange?.to ? formatFile(dateRange.to, "yyyy-MM-dd") : "", 
    [dateRange?.to]
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/monitoring/informasi-kunjungan", {
        params: {
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          page: page,
          per_page: perPage,
        },
      });
      const resData = response.data;
      setData(resData.data);
      setPagination({
        currentPage: resData.current_page,
        lastPage: resData.last_page,
        total: resData.total,
        perPage: resData.per_page,
      });
    } catch {
      toast.error("Gagal mengambil data informasi kunjungan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, page, perPage]);

  const columns: ColumnDef<InformasiKunjungan>[] = [
    {
      key: "no",
      header: "NO",
      cell: (row) => {
        const index = data.indexOf(row);
        return <span className="text-sm font-medium text-muted-foreground w-6 text-center inline-block">{(page - 1) * perPage + index + 1}</span>;
      },
    },
    {
      key: "tanggal",
      header: "TANGGAL",
      sortable: true,
      cell: (row) => (
        <span className="font-semibold text-sm">{row.tanggal}</span>
      ),
    },
    {
      key: "nama",
      header: "NAMA",
      sortable: true,
      cell: (row) => (
        <span className="text-sm font-semibold tracking-tight text-red-500/90 drop-shadow-sm">{row.nama !== '-' ? row.nama.toUpperCase() : row.nama}</span>
      ),
    },
    {
      key: "visited",
      header: "VISITED",
      sortable: true,
      className: "text-center",
      cell: (row) => (
        <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{row.visited}</span>
      ),
    },
    {
      key: "waktu_mulai",
      header: "WAKTU MULAI",
      sortable: true,
      className: "text-center",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">{row.waktu_mulai}</span>
      ),
    },
    {
      key: "waktu_akhir",
      header: "WAKTU AKHIR",
      sortable: true,
      className: "text-center",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">{row.waktu_akhir}</span>
      ),
    },
    {
      key: "total_penjualan",
      header: "TOTAL QTY PRODUK",
      sortable: true,
      className: "text-right",
      cell: (row) => (
        <span className="text-sm font-bold text-right block tabular-nums text-foreground/80">
          {Number(row.total_penjualan || 0).toLocaleString("id-ID")}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary text-white rounded-lg shadow-lg shadow-primary/30">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Informasi Kunjungan
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Data rekap harian kunjungan dan pencapaian sales.
            </p>
          </div>
        </div>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        rowKey={(r) => `${r.tanggal}-${r.nama}`}
        emptyMessage="Belum ada data informasi kunjungan"
        toolbar={
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 min-w-[260px]">
              <DatePickerWithRange
                date={dateRange}
                onChange={(range) => {
                  setDateRange(range);
                  setPage(1);
                }}
              />
            </div>

            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive h-9 px-3 hover:bg-destructive/10 text-xs font-medium"
                onClick={() => {
                  setDateRange(undefined);
                  setPage(1);
                }}
              >
                Reset Filter
              </Button>
            )}
          </div>
        }
        serverPagination={{
          ...pagination,
          onPageChange: setPage,
          onPerPageChange: (newPerPage) => {
            setPerPage(newPerPage);
            setPage(1);
          },
        }}
      />
    </div>
  );
};

export default InformasiKunjunganPage;

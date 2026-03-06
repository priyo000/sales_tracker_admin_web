import { useState, useEffect } from "react";
import { useNotifikasi } from "@/features/notifikasi/hooks/useNotifikasi";
import NotifikasiForm from "@/features/notifikasi/components/NotifikasiForm";
import {
  Bell,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
  Trophy,
  User as UserIcon,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Notifikasi } from "@/features/notifikasi/types";

const NotifikasiPage = () => {
  const {
    notifikasies,
    isLoading,
    pagination,
    fetchNotifikasies,
    sendNotifikasi,
    deleteNotifikasi,
  } = useNotifikasi();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotifikasies(1, search, perPage);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, perPage, fetchNotifikasies]);

  const handlePageChange = (p: number) => {
    fetchNotifikasies(p, search, perPage);
  };

  const handlePerPageChange = (p: number) => {
    setPerPage(p);
  };

  const getIcon = (jenis: string) => {
    switch (jenis) {
      case "order":
        return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
      case "gamifikasi":
        return <Trophy className="h-3.5 w-3.5 text-yellow-500" />;
      case "reminder":
        return <AlertCircle className="h-3.5 w-3.5 text-orange-500" />;
      case "broadcast":
        return <AlertCircle className="h-3.5 w-3.5 text-purple-500" />;
      default:
        return <Info className="h-3.5 w-3.5 text-blue-500" />;
    }
  };

  const columns: ColumnDef<Notifikasi>[] = [
    {
      key: "karyawan.nama_lengkap",
      header: "Karyawan",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
            <UserIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground truncate">
              {row.karyawan?.nama_lengkap || "Unknown"}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
              {row.karyawan?.kode_karyawan || "-"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "judul",
      header: "Detail Pesan",
      sortable: true,
      cell: (row) => (
        <div className="max-w-md">
          <div className="flex items-center gap-1.5">
            {getIcon(row.jenis)}
            <span className="text-sm font-bold text-foreground">
              {row.judul}
            </span>
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground line-clamp-1 italic">
            {row.pesan}
          </div>
        </div>
      ),
    },
    {
      key: "is_read",
      header: "Status",
      sortable: true,
      cell: (row) => (
        <Badge variant={row.is_read ? "success" : "secondary"}>
          {row.is_read ? "Sudah Dibaca" : "Terkirim"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Waktu",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center text-xs text-muted-foreground tabular-nums">
          <Clock className="mr-1.5 h-3.5 w-3.5" />
          {new Date(row.created_at).toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      ),
    },
    {
      key: "id",
      header: "",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => deleteNotifikasi(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary text-white rounded-lg shadow-lg shadow-primary/30">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Notifikasi Mobile
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Kelola notifikasi yang dikirim ke aplikasi mobile sales.
            </p>
          </div>
        </div>
      </div>

      <DataTable
        data={notifikasies}
        columns={columns}
        loading={isLoading}
        emptyMessage="Tidak ada notifikasi ditemukan"
        rowKey={(r) => r.id}
        onSearchChange={setSearch}
        toolbar={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsFormOpen(true)}
              size="sm"
              className="gap-2 shadow-md h-9"
            >
              <Plus className="h-4 w-4" /> Kirim Notifikasi
            </Button>
          </div>
        }
        serverPagination={{
          currentPage: pagination.current_page,
          lastPage: pagination.last_page,
          total: pagination.total,
          perPage: perPage,
          onPageChange: handlePageChange,
          onPerPageChange: handlePerPageChange,
        }}
      />

      {/* Modal Form */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Kirim Notifikasi Baru"
        size="2xl"
      >
        <div className="flex items-center space-x-3 mb-6 bg-primary/5 p-4 rounded-xl border border-primary/10">
          <div className="bg-primary text-white p-2 rounded-lg">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Push Notification
            </h3>
            <p className="text-xs text-muted-foreground italic">
              Pesan akan langsung muncul di HP sales secara realtime.
            </p>
          </div>
        </div>
        <NotifikasiForm
          onSubmit={async (data) => {
            const success = await sendNotifikasi(data);
            if (success) setIsFormOpen(false);
          }}
          onCancel={() => setIsFormOpen(false)}
          loading={isLoading}
        />
      </Modal>
    </div>
  );
};

export default NotifikasiPage;

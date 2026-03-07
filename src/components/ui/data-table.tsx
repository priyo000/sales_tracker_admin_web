import React, { useState, useMemo } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  cell?: (row: T, index: number) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  searchPlaceholder?: string;
  globalSearch?: boolean;
  rowKey?: (row: T) => string | number;
  emptyMessage?: string;
  toolbar?: React.ReactNode;
  onSearchChange?: (value: string) => void;
  onSortChange?: (key: string, direction: SortDirection) => void;
  // Server-side pagination (optional)
  serverPagination?: {
    total: number;
    currentPage: number;
    lastPage: number;
    perPage: number;
    onPageChange: (page: number) => void;
    onPerPageChange?: (perPage: number) => void;
  };
}

type SortDirection = "asc" | "desc" | null;

function getValue<T>(row: T, key: string): unknown {
  return key.split(".").reduce((obj: unknown, k) => {
    if (obj && typeof obj === "object")
      return (obj as Record<string, unknown>)[k];
    return undefined;
  }, row);
}

export function DataTable<T>({
  data = [],
  columns,
  loading = false,
  searchPlaceholder = "Cari...",
  globalSearch = true,
  rowKey,
  emptyMessage = "Tidak ada data",
  toolbar,
  onSearchChange,
  onSortChange,
  serverPagination,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(
    serverPagination ? serverPagination.perPage : 10,
  );

  const handleSort = (key: string) => {
    let newDir: SortDirection = "asc";
    let newKey: string | null = key;

    if (sortKey === key) {
      if (sortDir === "asc") newDir = "desc";
      else if (sortDir === "desc") {
        newDir = null;
        newKey = null;
      }
    }

    setSortKey(newKey);
    setSortDir(newDir);

    if (onSortChange) {
      onSortChange(newKey || "", newDir);
    }
  };

  // Client-side filter + sort + paginate
  const processed = useMemo(() => {
    let result = [...data];

    // Global search (ONLY if NOT handled by server)
    if (!onSearchChange && globalSearch && search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          const val = getValue(row, col.key as string);
          return String(val ?? "")
            .toLowerCase()
            .includes(q);
        }),
      );
    }

    // Sort (Always apply locally as a fallback)
    if (sortKey && sortDir) {
      result.sort((a, b) => {
        const va = getValue(a, sortKey);
        const vb = getValue(b, sortKey);

        // Numeric sort if both are numbers or numeric strings
        if (
          !isNaN(Number(va)) &&
          !isNaN(Number(vb)) &&
          va !== "" &&
          vb !== "" &&
          va !== null &&
          vb !== null
        ) {
          return sortDir === "asc"
            ? Number(va) - Number(vb)
            : Number(vb) - Number(va);
        }

        const cmp = String(va ?? "").localeCompare(String(vb ?? ""), "id", {
          numeric: true,
          sensitivity: "base",
        });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [
    data,
    search,
    sortKey,
    sortDir,
    columns,
    globalSearch,
    onSearchChange,
  ]);

  // Client-side pagination
  const totalClient = processed.length;
  const totalPages = serverPagination
    ? serverPagination.lastPage
    : Math.max(1, Math.ceil(totalClient / perPage));
  const currentPage = serverPagination ? serverPagination.currentPage : page;
  const visible = serverPagination
    ? processed
    : processed.slice((page - 1) * perPage, page * perPage);

  const handlePageChange = (p: number) => {
    if (serverPagination) {
      serverPagination.onPageChange(p);
    } else {
      setPage(p);
    }
  };

  const handlePerPageChange = (v: string) => {
    const n = Number(v);
    setPerPage(n);
    setPage(1);
    if (serverPagination?.onPerPageChange) {
      serverPagination.onPerPageChange(n);
    }
  };

  const SortIcon = ({ col }: { col: ColumnDef<T> }) => {
    if (!col.sortable) return null;
    const key = col.key as string;
    if (sortKey !== key)
      return <ChevronsUpDown className="ml-1 size-3.5 opacity-40 inline" />;
    if (sortDir === "asc")
      return <ChevronUp className="ml-1 size-3.5 text-primary inline" />;
    if (sortDir === "desc")
      return <ChevronDown className="ml-1 size-3.5 text-primary inline" />;
    return <ChevronsUpDown className="ml-1 size-3.5 opacity-40 inline" />;
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col">
      {/* Toolbar / Header Area */}
      {(globalSearch || toolbar) && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b bg-muted/20">
          <div className="flex-1 min-w-[240px] max-w-sm">
            {globalSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearch(value);
                    setPage(1);
                    if (onSearchChange) onSearchChange(value);
                  }}
                  className="pl-9 h-10 bg-background shadow-sm border-muted-foreground/20 focus-visible:ring-primary"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">{toolbar}</div>
        </div>
      )}

      {/* Table Area */}
      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => (
                <TableHead
                  key={col.key as string}
                  className={cn(
                    "h-12 bg-muted/40",
                    col.sortable &&
                      "cursor-pointer select-none hover:bg-muted/60 transition-colors",
                    col.className,
                  )}
                  onClick={() => col.sortable && handleSort(col.key as string)}
                >
                  <div className={cn(
                    "flex items-center gap-1",
                    col.className?.includes("text-center") && "justify-center",
                    col.className?.includes("text-right") && "justify-end"
                  )}>
                    {col.header}
                    <SortIcon col={col} />
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.key as string}>
                      <div className="h-5 rounded bg-muted/60 animate-pulse w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : visible.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-40 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search className="size-8 opacity-20" />
                    <span>{emptyMessage}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              visible.map((row, i) => (
                <TableRow
                  key={rowKey ? rowKey(row) : i}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key as string}
                      className={cn("py-3", col.className)}
                    >
                      {col.cell
                        ? col.cell(row, i)
                        : String(getValue(row, col.key as string) ?? "-")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer / Pagination Area */}
      <div className="px-4 py-3 border-t bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Baris per halaman:</span>
            <Select value={String(perPage)} onValueChange={handlePerPageChange}>
              <SelectTrigger className="h-8 w-20 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <span>
            {serverPagination
              ? `Halaman ${currentPage} dari ${totalPages}`
              : `Menampilkan ${visible.length > 0 ? (page - 1) * perPage + 1 : 0}-${Math.min(page * perPage, totalClient)} dari ${totalClient} data`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 bg-background shadow-xs"
            disabled={currentPage <= 1 || loading}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <ChevronLeft className="size-4 mr-1" />
            Sebelumnya
          </Button>
          <div className="flex items-center justify-center min-w-[32px] h-8 rounded-md bg-primary text-primary-foreground text-xs font-bold shadow-sm">
            {currentPage}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 bg-background shadow-xs text-foreground"
            disabled={currentPage >= totalPages || loading}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Selanjutnya
            <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

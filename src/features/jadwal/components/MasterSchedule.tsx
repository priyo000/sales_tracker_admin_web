import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Grid as GridIcon,
  List,
  Plus,
  Settings,
  Trash2,
  Edit,
  FileUp,
} from "lucide-react";
import {
  KaryawanOption,
  RuteOption,
  JadwalRecurring,
  GroupRuteMingguan,
} from "../types";
import { useJadwalRecurring } from "../hooks/useJadwalRecurring";
import { useGroupRute } from "../hooks/useGroupRute";
import GroupRuteForm from "./GroupRuteForm";
import ImportJadwalMasterModal from "./ImportJadwalMasterModal";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

interface MasterScheduleProps {
  karyawanOptions: KaryawanOption[];
  ruteOptions: RuteOption[];
}

const DAYS = [
  { id: 1, label: "Senin" },
  { id: 2, label: "Selasa" },
  { id: 3, label: "Rabu" },
  { id: 4, label: "Kamis" },
  { id: 5, label: "Jumat" },
  { id: 6, label: "Sabtu" },
  { id: 7, label: "Minggu" },
];

const WEEKS = [1, 2, 3, 4];

const MasterSchedule: React.FC<MasterScheduleProps> = ({
  karyawanOptions,
  ruteOptions,
}) => {
  const {
    loading: loadingPatterns,
    fetchPatterns,
    updatePatterns,
    setGroup,
    assignedGroups,
    setAssignedGroups,
    importMasterJadwal,
  } = useJadwalRecurring();
  const {
    groups,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    loading: loadingGroups,
  } = useGroupRute();

  const [localPatterns, setLocalPatterns] = useState<
    Partial<JadwalRecurring>[]
  >([]);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<
    GroupRuteMingguan | undefined
  >(undefined);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Initial load
  useEffect(() => {
    const load = async () => {
      const res = await fetchPatterns();
      if (res && res.patterns) setLocalPatterns(res.patterns);
    };
    load();
    fetchGroups();
  }, [fetchPatterns, fetchGroups]);

  // Construct grid from localPatterns and karyawanOptions
  const grid = useMemo(() => {
    const newGrid: Record<
      number,
      Record<number, Record<number, number | null>>
    > = {};

    // Initialize for all employees
    karyawanOptions.forEach((k) => {
      newGrid[k.id] = {};
      WEEKS.forEach((w) => {
        newGrid[k.id][w] = {};
        DAYS.forEach((d) => {
          newGrid[k.id][w][d.id] = null;
        });
      });
    });

    // Map existing patterns
    localPatterns.forEach((p) => {
      if (
        p.id_karyawan &&
        p.minggu_ke &&
        p.hari &&
        newGrid[p.id_karyawan] &&
        newGrid[p.id_karyawan][p.minggu_ke]
      ) {
        newGrid[p.id_karyawan][p.minggu_ke][p.hari] = p.id_rute ?? null;
      }
    });

    // Overlay Group Assignments (Lock & Override)
    assignedGroups.forEach((ag) => {
      if (
        newGrid[ag.id_karyawan] &&
        newGrid[ag.id_karyawan][ag.minggu_ke] &&
        ag.group_rute
      ) {
        ag.group_rute.details.forEach((d) => {
          if (newGrid[ag.id_karyawan][ag.minggu_ke][d.hari] !== undefined) {
            newGrid[ag.id_karyawan][ag.minggu_ke][d.hari] = d.id_rute;
          }
        });
      }
    });

    return newGrid;
  }, [localPatterns, karyawanOptions, assignedGroups]);

  const filteredKaryawan = useMemo(() => {
    return karyawanOptions.filter(
      (k) =>
        k.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.kode_karyawan?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [karyawanOptions, searchTerm]);

  const saveChanges = async (
    karyawanId: number,
    currentPatterns: Partial<JadwalRecurring>[],
  ) => {
    const rowPatterns = currentPatterns.filter(
      (p) => p.id_karyawan === karyawanId,
    );

    // Prepare data for backend: We need all 4 weeks for this employee in the updatePatterns
    const flatPatterns: {
      minggu_ke: number;
      hari: number;
      id_rute: number | null;
    }[] = [];
    WEEKS.forEach((w) => {
      DAYS.forEach((d) => {
        const found = rowPatterns.find(
          (p) => p.minggu_ke === w && p.hari === d.id,
        );
        flatPatterns.push({
          minggu_ke: w,
          hari: d.id,
          id_rute: found?.id_rute ?? null,
        });
      });
    });

    const result = await updatePatterns({
      id_karyawan: karyawanId,
      patterns: flatPatterns,
    });

    if (result.success) {
      toast.success("Jadwal tersimpan otomatis", {
        duration: 2000,
        position: "bottom-right",
      });
    } else {
      toast.error(result.message || "Gagal menyimpan otomatis");
    }
  };

  const handleCellChange = (
    karyawanId: number,
    week: number,
    day: number,
    routeId: string,
  ) => {
    const newPatterns = [...localPatterns];
    const existingIdx = newPatterns.findIndex(
      (p) =>
        p.id_karyawan === karyawanId && p.minggu_ke === week && p.hari === day,
    );

    if (existingIdx > -1) {
      if (routeId) {
        newPatterns[existingIdx] = {
          ...newPatterns[existingIdx],
          id_rute: Number(routeId),
        };
      } else {
        newPatterns.splice(existingIdx, 1);
      }
    } else if (routeId) {
      newPatterns.push({
        id_karyawan: karyawanId,
        minggu_ke: week,
        hari: day,
        id_rute: Number(routeId),
      });
    }
    setLocalPatterns(newPatterns);
    saveChanges(karyawanId, newPatterns);
  };

  const handleApplyGroup = async (
    karyawanId: number,
    week: number,
    groupId: string,
  ) => {
    const idGroup = groupId ? Number(groupId) : null;

    // Optimistic Update
    const previousGroups = [...assignedGroups];

    if (idGroup) {
      const selectedGroup = groups.find((g) => g.id === idGroup);
      if (selectedGroup) {
        // Remove existing assignment for this week if any
        const newAssignments = previousGroups.filter(
          (ag) => !(ag.id_karyawan === karyawanId && ag.minggu_ke === week),
        );
        // Add new assignment
        newAssignments.push({
          id: -(karyawanId * 100 + week), // Temporary deterministic ID
          id_karyawan: karyawanId,
          minggu_ke: week,
          id_group_rute: idGroup,
          group_rute: selectedGroup,
        });
        setAssignedGroups(newAssignments);
      }
    } else {
      // Remove assignment
      const newAssignments = previousGroups.filter(
        (ag) => !(ag.id_karyawan === karyawanId && ag.minggu_ke === week),
      );
      setAssignedGroups(newAssignments);
    }

    const res = await setGroup(karyawanId, week, idGroup);

    if (res.success) {
      toast.success(idGroup ? "Template rute diterapkan" : "Template dilepas", {
        position: "bottom-center",
        duration: 2000,
      });
      // We do NOT refetch here to avoid table flicker. The optimistic state is sufficient.
    } else {
      // Revert on failure
      setAssignedGroups(previousGroups);
      toast.error(res.message || "Gagal menerapkan template");
    }
  };

  const onCreateOrUpdateGroup = async (data: Partial<GroupRuteMingguan>) => {
    let res;
    if (editingGroup) {
      res = await updateGroup(editingGroup.id, data);
    } else {
      res = await createGroup(data);
    }

    if (res.success) {
      toast.success(
        editingGroup
          ? "Template berhasil diperbarui"
          : "Template berhasil dibuat",
      );
      setShowGroupForm(false);
      setEditingGroup(undefined);
      fetchGroups();
    } else {
      toast.error(res.message || "Gagal menyimpan template");
    }
  };

  const handleEditGroup = (group: GroupRuteMingguan) => {
    setEditingGroup(group);
    setShowGroupForm(true);
  };

  const handleDeleteGroup = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus template ini?")) return;

    const res = await deleteGroup(id);
    if (res.success) {
      toast.success("Template berhasil dihapus");
      fetchGroups();
    } else {
      toast.error(res.message || "Gagal menghapus template");
    }
  };

  const openCreateForm = () => {
    setEditingGroup(undefined);
    setShowGroupForm(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-white p-2 rounded-xl shadow-lg shadow-primary/20">
            <GridIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Master Jadwal Mingguan
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Atur pola rute berulang (recurring) untuk setiap sales.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsGroupModalOpen(true);
              setShowGroupForm(false);
              setEditingGroup(undefined);
            }}
            className="h-9 gap-2 font-bold border-dashed"
          >
            <List className="h-3.5 w-3.5" /> Template Mingguan
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            className="h-9 gap-2 shadow-md shadow-primary/20"
          >
            <FileUp className="h-3.5 w-3.5" /> Import Excel
          </Button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Tab-like Week Selection */}
            <div className="flex items-center p-1 bg-muted/50 rounded-xl border border-border/50 w-fit">
              {WEEKS.map((w) => (
                <button
                  key={w}
                  onClick={() => setSelectedWeek(w)}
                  className={cn(
                    "px-5 py-2 text-xs font-black transition-all rounded-lg whitespace-nowrap",
                    selectedWeek === w
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  MINGGU {w}
                </button>
              ))}
            </div>

            {/* Search & Meta */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="text"
                  placeholder="Cari sales..."
                  className="pl-10 h-10 w-64 bg-background border-border/50 focus-visible:ring-primary rounded-xl text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-muted-foreground hover:text-foreground transition-all"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border/50 bg-card shadow-xl shadow-black/5 overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full border-collapse text-left text-[11px]">
            <thead>
              <tr className="bg-muted/30 border-b border-border/50">
                <th className="px-6 py-4 font-black uppercase tracking-widest text-muted-foreground/70 sticky left-0 z-10 bg-muted/80 backdrop-blur-md">
                  Sales
                </th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-muted-foreground/70 min-w-[200px]">
                  Template Rute
                </th>
                {DAYS.map((d) => (
                  <th
                    key={d.id}
                    className="px-4 py-4 font-black uppercase tracking-widest text-muted-foreground/70 min-w-[150px] text-center"
                  >
                    {d.label.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loadingPatterns ? (
                <tr>
                  <td colSpan={10} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-2 w-24 bg-muted animate-pulse rounded-full" />
                      <p className="text-muted-foreground font-medium animate-pulse">
                        Menyiapkan data master...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredKaryawan.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="py-20 text-center text-muted-foreground"
                  >
                    Data sales tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredKaryawan.map((k) => (
                  <tr
                    key={k.id}
                    className="hover:bg-muted/20 transition-colors group"
                  >
                    <td className="px-6 py-4 sticky left-0 z-10 bg-card group-hover:bg-muted/50 transition-colors shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-[10px] shrink-0">
                          {k.nama_lengkap.charAt(0)}
                        </div>
                        <div>
                          <div className="font-black text-foreground uppercase tracking-tight leading-none mb-1 group-hover:text-primary transition-colors">
                            {k.nama_lengkap}
                          </div>
                          <div className="text-[9px] text-muted-foreground font-bold tracking-tighter uppercase opacity-60">
                            {k.kode_karyawan || `#${k.id}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Select
                        onValueChange={(val) =>
                          handleApplyGroup(k.id, selectedWeek, val)
                        }
                        value={String(
                          assignedGroups.find(
                            (ag) =>
                              ag.id_karyawan === k.id &&
                              ag.minggu_ke === selectedWeek,
                          )?.id_group_rute || "manual",
                        )}
                      >
                        <SelectTrigger className="h-9 w-full bg-background border-border/50 text-[11px] font-bold rounded-lg shadow-sm">
                          <SelectValue placeholder="Manual (Custom)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value="manual"
                            className="text-[11px] font-bold"
                          >
                            Manual (Custom)
                          </SelectItem>
                          {groups.map((g) => (
                            <SelectItem
                              key={g.id}
                              value={String(g.id)}
                              className="text-[11px] font-bold"
                            >
                              {g.nama_group}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    {DAYS.map((d) => {
                      const isLocked = !!assignedGroups.find(
                        (ag) =>
                          ag.id_karyawan === k.id &&
                          ag.minggu_ke === selectedWeek,
                      );
                      const routeId = grid[k.id]?.[selectedWeek]?.[d.id];
                      return (
                        <td key={d.id} className="px-2 py-4">
                          {isLocked ? (
                            <div className="w-full bg-muted/40 text-muted-foreground text-[10px] py-2 px-3 rounded-lg border border-border/20 text-center font-bold truncate opacity-70">
                              {ruteOptions.find((r) => r.id === routeId)
                                ?.nama_rute || "-"}
                            </div>
                          ) : (
                            <Select
                              value={routeId ? String(routeId) : "none"}
                              onValueChange={(val) =>
                                handleCellChange(
                                  k.id,
                                  selectedWeek,
                                  d.id,
                                  val === "none" ? "" : val,
                                )
                              }
                            >
                              <SelectTrigger
                                className={cn(
                                  "h-9 w-full text-[10px] text-center font-bold rounded-lg transition-all",
                                  routeId
                                    ? "bg-primary/10 border-primary/30 text-primary shadow-sm"
                                    : "bg-background border-border/50 text-muted-foreground/60",
                                )}
                              >
                                <SelectValue placeholder="-" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem
                                  value="none"
                                  className="text-[10px] font-bold"
                                >
                                  -
                                </SelectItem>
                                {ruteOptions.map((r) => (
                                  <SelectItem
                                    key={r.id}
                                    value={String(r.id)}
                                    className="text-[10px] font-bold"
                                  >
                                    {r.nama_rute}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Group/Template Management */}
      <Modal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        title={
          showGroupForm
            ? "Buat Template Rute Baru"
            : "Daftar Template Rute Mingguan"
        }
        size="4xl"
      >
        {showGroupForm ? (
          <GroupRuteForm
            ruteOptions={ruteOptions}
            onSave={onCreateOrUpdateGroup}
            loading={loadingGroups}
            initialData={editingGroup}
            onCancel={() => setShowGroupForm(false)}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-medium">
                Daftar paket rute Senin-Minggu yang tersedia.
              </p>
              <Button
                onClick={openCreateForm}
                className="h-9 gap-2 font-bold shadow-md shadow-primary/20"
              >
                <Plus className="h-4 w-4" /> Buat Template Baru
              </Button>
            </div>

            {groups.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed rounded-2xl bg-muted/20 border-border/50">
                <List className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-bold text-sm tracking-tight">
                  BELUM ADA TEMPLATE
                </p>
                <p className="text-[11px] text-muted-foreground/60 mt-1 uppercase tracking-tighter">
                  Buat satu untuk mempercepat pengisian jadwal!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                {groups.map((g, idx) => (
                  <div
                    key={g.id}
                    className="bg-card border border-border/50 rounded-2xl p-5 hover:border-primary/50 transition-all flex items-center justify-between group shadow-sm hover:shadow-xl hover:shadow-primary/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 text-primary h-12 w-12 rounded-xl flex items-center justify-center font-black text-xl shadow-inner border border-primary/5">
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-foreground uppercase tracking-tight">
                          {g.nama_group}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5">
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-bold py-0 h-5 px-2 bg-primary/5 text-primary border-primary/10"
                          >
                            {g.details.length} HARI
                          </Badge>
                          <Separator
                            orientation="vertical"
                            className="h-3 bg-border"
                          />
                          <span className="text-[10px] text-muted-foreground italic font-medium">
                            Auto-fill enabled
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditGroup(g)}
                        className="h-8 gap-1.5 text-[11px] font-bold border-border/50 hover:bg-primary/5 hover:text-primary transition-all"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteGroup(g.id)}
                        className="h-8 gap-1.5 text-[11px] font-bold border-border/50 text-destructive hover:bg-destructive/5 hover:border-destructive/30 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Import Modal */}
      <ImportJadwalMasterModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={importMasterJadwal}
      />
    </div>
  );
};

export default MasterSchedule;

import React, { useEffect, useState, useMemo } from "react";
import { format as formatFile, parseISO } from "date-fns";
import { Plus, Trash2, CalendarIcon, CheckCircle2, Loader2 } from "lucide-react";
import { DateRange } from "react-day-picker";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { useKalenderKerja, type KalenderKerjaWeek, type KalenderKerja } from "../hooks/useKalenderKerja";

interface MonthCardProps {
  tahun: number;
  bulan: number;
  kumpulanWeek: KalenderKerja[];
  onSave: (tahun: number, bulan: number, weeks: KalenderKerjaWeek[]) => void;
  isSaving: boolean;
}

const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const MonthCard: React.FC<MonthCardProps> = ({ tahun, bulan, kumpulanWeek, onSave, isSaving }) => {
  // Translate initial API text to DateRange structures for the UI
  const initialWeeks = useMemo(() => {
    return kumpulanWeek.map((kw, index) => {
      const from = kw.tanggal_mulai ? parseISO(kw.tanggal_mulai) : undefined;
      const to = kw.tanggal_akhir ? parseISO(kw.tanggal_akhir) : undefined;
      return {
        id: `remote-${kw.minggu_ke}-${index}`, // stable identity
        minggu_ke: kw.minggu_ke,
        date: { from, to } as DateRange | undefined,
      };
    });
  }, [kumpulanWeek]);

  const [prevInitialWeeks, setPrevInitialWeeks] = useState(initialWeeks);
  const [weeks, setWeeks] = useState(
    initialWeeks.length > 0
      ? initialWeeks
      : [
          {
            id: "initial-default-1",
            minggu_ke: 1,
            date: undefined,
          },
        ]
  );

  // Pattern: Derived state to sync remote props dynamically without cascading renders
  if (initialWeeks !== prevInitialWeeks) {
    setPrevInitialWeeks(initialWeeks);
    setWeeks(
      initialWeeks.length > 0
        ? initialWeeks
        : [
            {
              id: "initial-default-1",
              minggu_ke: 1,
              date: undefined,
            },
          ]
    );
  }

  const handleAddWeek = () => {
    const nextMinggu = weeks.length > 0 ? (Math.max(...weeks.map(w => w.minggu_ke)) || weeks.length) + 1 : 1;
    setWeeks([
      ...weeks,
      {
        id: Math.random().toString(),
        minggu_ke: nextMinggu,
        date: undefined,
      },
    ]);
  };

  const handleRemoveWeek = (idToRemove: string) => {
    setWeeks(weeks.filter((w) => w.id !== idToRemove).map((w, index) => ({ ...w, minggu_ke: index + 1 })));
  };

  const handleChangeDate = (idToUpdate: string, newDate: DateRange | undefined) => {
    setWeeks(
      weeks.map((w) =>
        w.id === idToUpdate ? { ...w, date: newDate } : w
      )
    );
  };

  const handleSave = () => {
    // Format required before sending to API
    const validWeeks: KalenderKerjaWeek[] = weeks
      .filter((w) => w.date?.from && w.date?.to)
      .map((w, i) => ({
        minggu_ke: i + 1, // Fix order based on array
        tanggal_mulai: formatFile(w.date!.from!, "yyyy-MM-dd"),
        tanggal_akhir: formatFile(w.date!.to!, "yyyy-MM-dd"),
      }));

    onSave(tahun, bulan, validWeeks);
  };

  const isComplete = kumpulanWeek.length > 0;

  return (
    <Card className="flex flex-col h-full border hover:border-primary/20 transition-colors shadow-sm bg-card/60 backdrop-blur-sm relative overflow-hidden">
      {isComplete ? (
         <div className="absolute top-0 right-0 p-3" title="Sudah Diset">
             <CheckCircle2 className="h-5 w-5 text-emerald-500 opacity-80" />
         </div>
      ): null}
      
      <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground/80">
          <CalendarIcon className="h-5 w-5 text-primary" />
          {NAMA_BULAN[bulan - 1]} {tahun}
        </CardTitle>
        <CardDescription className="text-xs">
          Tentukan rentang tanggal per minggu di bulan ini.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col flex-1 pt-4 pb-4">
        <div className="flex-1 space-y-3">
          {weeks.map((week, idx) => (
            <div key={week.id} className="flex flex-col gap-1 w-full bg-background border p-2 rounded-lg relative group">
              <div className="flex justify-between items-center mb-1">
                 <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Minggu ke-{idx + 1}</span>
                 {weeks.length > 1 && (
                    <button
                        onClick={() => handleRemoveWeek(week.id)}
                        className="text-destructive/50 hover:text-destructive hover:bg-destructive/10 p-1 rounded-sm transition-colors"
                        title="Hapus Minggu"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                 )}
              </div>
              <DatePickerWithRange
                date={week.date}
                onChange={(range) => handleChangeDate(week.id, range)}
                className="w-full text-xs"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddWeek}
            disabled={isSaving}
            className="flex-1 h-8 text-xs font-medium border-dashed border-muted-foreground/30 hover:border-primary/50 hover:text-primary transition-colors bg-transparent border-[1.5px]"
          >
            <Plus className="h-3 w-3 mr-1" /> Tambah 
          </Button>

          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={isSaving || weeks.length === 0}
            className="flex-1 h-8 text-xs font-semibold"
          >
            {isSaving ? (
                <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Saving
                </>
            ) : (
                "Simpan"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const KalenderKerjaTab: React.FC = () => {
  const [tahun, setTahun] = useState(() => new Date().getFullYear());
  const { data, loading, fetchKalender, saveMonth, saving } = useKalenderKerja();

  useEffect(() => {
    fetchKalender(tahun);
  }, [tahun, fetchKalender]);

  // Group data by bulan
  const groupedData = useMemo(() => {
    const bulans = Array.from({ length: 12 }, (_, i) => i + 1);
    return bulans.map((bulan) => ({
      bulan,
      weeks: data.filter((d) => Number(d.bulan) === bulan),
    }));
  }, [data]);

  const TAHUN_OPTIONS = [
    tahun - 1,
    tahun,
    tahun + 1,
    tahun + 2,
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
        
      {/* Header / Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/20 p-4 rounded-xl border border-border/50">
        <div>
           <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
             Konfigurasi Kalender & Hari Kerja
           </h2>
           <p className="text-sm text-muted-foreground">
             Pilih tahun dan atur jangkauan setiap minggunya per bulan, ini akan mempengaruhi tracking kunjungan di menu lain.
           </p>
        </div>
        
        <div className="flex items-center gap-2 bg-background border px-2 py-1.5 rounded-lg shadow-sm">
           <span className="text-sm font-medium text-muted-foreground pl-1">Tahun:</span>
           <select 
              value={tahun} 
              onChange={(e) => setTahun(Number(e.target.value))}
              className="px-2 py-1 text-sm font-semibold text-primary outline-none bg-transparent cursor-pointer rounded hover:bg-muted focus:bg-muted"
           >
              {TAHUN_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
              ))}
           </select>
        </div>
      </div>

      {/* Grid Bulanan */}
      {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {Array.from({length: 12}).map((_, i) => (
                 <div key={i} className="h-64 rounded-xl bg-muted/40 animate-pulse border border-border/30"></div>
             ))}
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {groupedData.map((d) => (
            <MonthCard
                key={`${tahun}-${d.bulan}`}
                tahun={tahun}
                bulan={d.bulan}
                kumpulanWeek={d.weeks}
                onSave={saveMonth}
                isSaving={saving === d.bulan}
            />
            ))}
          </div>
      )}

    </div>
  );
};

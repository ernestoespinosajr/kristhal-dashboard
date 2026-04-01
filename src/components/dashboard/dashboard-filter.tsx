"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Filter } from "lucide-react";
import { TareaHeader } from "@/types/api";

export interface MonthFilterValue {
  year: number | null;  // e.g. 2024, 2025, 2026 or null for all
  month: number | null; // 1-12 or null for all months in the year
}

interface DashboardFilterProps {
  data: TareaHeader[];
  filter: MonthFilterValue;
  onChange: (filter: MonthFilterValue) => void;
}

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function DashboardFilter({ data, filter, onChange }: DashboardFilterProps) {
  // Extract unique years and months-per-year from data
  const { years, monthsForYear } = useMemo(() => {
    const yearSet = new Set<number>();
    const ymSet = new Set<string>();

    for (const r of data) {
      if (!r.FechaInicio || !r.FechaFin) continue;

      const start = new Date(r.FechaInicio);
      const end = new Date(r.FechaFin);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;

      const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
      const limit = new Date(end.getFullYear(), end.getMonth(), 1);

      while (cursor <= limit) {
        const y = cursor.getFullYear();
        const m = cursor.getMonth() + 1;
        yearSet.add(y);
        ymSet.add(`${y}-${m}`);
        cursor.setMonth(cursor.getMonth() + 1);
      }
    }

    // Build months available per year
    const monthsMap = new Map<number, number[]>();
    for (const ym of ymSet) {
      const [y, m] = ym.split("-").map(Number);
      if (!monthsMap.has(y)) monthsMap.set(y, []);
      monthsMap.get(y)!.push(m);
    }
    for (const arr of monthsMap.values()) arr.sort((a, b) => a - b);

    return {
      years: Array.from(yearSet).sort(),
      monthsForYear: monthsMap,
    };
  }, [data]);

  // Months available for the currently selected year
  const availableMonths = filter.year != null
    ? (monthsForYear.get(filter.year) ?? [])
    : [];

  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardContent className="py-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Filtro de Dashboard
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:max-w-lg">
          {/* Año */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Año
            </label>
            <select
              value={filter.year ?? ""}
              onChange={(e) => {
                const newYear = e.target.value === "" ? null : parseInt(e.target.value, 10);
                onChange({ year: newYear, month: null });
              }}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50 transition-colors"
            >
              <option value="">Todos los años</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Mes */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Mes
            </label>
            <select
              value={filter.month ?? ""}
              disabled={filter.year == null}
              onChange={(e) =>
                onChange({ ...filter, month: e.target.value === "" ? null : parseInt(e.target.value, 10) })
              }
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50 transition-colors disabled:opacity-50"
            >
              <option value="">Todos los meses</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>{MONTH_NAMES[m - 1]}</option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

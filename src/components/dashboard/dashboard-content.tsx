"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TareaHeader } from "@/types/api";
import { computeDashboardStats } from "@/lib/api";
import { filterDataByDate, buildFilterQuery } from "@/lib/filter-utils";
import { DashboardFilter, MonthFilterValue } from "./dashboard-filter";
import { KpiCards } from "./kpi-cards";
import { StatusBattery } from "./status-battery";
import { GerenciaTable } from "./gerencia-table";
import { DelayRiskPanel } from "./delay-risk-panel";
import { ActivityHeatmap } from "./activity-heatmap";
import { ProductLeaderboard } from "./product-leaderboard";

interface DashboardContentProps {
  data: TareaHeader[];
}

export function DashboardContent({ data }: DashboardContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filter, setFilter] = useState<MonthFilterValue>(() => {
    const y = searchParams.get("year");
    const m = searchParams.get("month");
    return {
      year: y ? parseInt(y, 10) : null,
      month: m ? parseInt(m, 10) : null,
    };
  });

  const handleFilterChange = useCallback(
    (newFilter: MonthFilterValue) => {
      setFilter(newFilter);
      const params = new URLSearchParams();
      if (newFilter.year != null) params.set("year", String(newFilter.year));
      if (newFilter.month != null) params.set("month", String(newFilter.month));
      const qs = params.toString();
      router.replace(qs ? `/?${qs}` : "/", { scroll: false });
    },
    [router]
  );

  const filteredData = useMemo(
    () => filterDataByDate(data, filter),
    [data, filter]
  );

  const stats = useMemo(
    () => computeDashboardStats(filteredData),
    [filteredData]
  );

  const filterKey = `${filter.year ?? "all"}-${filter.month ?? "all"}`;
  const filterQuery = buildFilterQuery(filter);

  return (
    <div className="space-y-8">
      <DashboardFilter data={data} filter={filter} onChange={handleFilterChange} />
      <KpiCards stats={stats} key={`kpi-${filterKey}`} />
      <StatusBattery
        completed={stats.completed}
        inProgress={stats.inProgress}
        pending={stats.pending}
        total={stats.totalTasks}
        key={`battery-${filterKey}`}
      />
      <GerenciaTable gerencias={stats.gerencias} filterQuery={filterQuery} />
      <DelayRiskPanel riskyTasks={stats.riskyTasks} />
      <ActivityHeatmap heatmapCells={stats.heatmapCells} />
      <ProductLeaderboard products={stats.products} />
    </div>
  );
}

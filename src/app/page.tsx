import Image from "next/image";
import Link from "next/link";
import { fetchTareasHeader, computeDashboardStats } from "@/lib/api";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { StatusBattery } from "@/components/dashboard/status-battery";
import { GerenciaTable } from "@/components/dashboard/gerencia-table";
import { DelayRiskPanel } from "@/components/dashboard/delay-risk-panel";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { ProductLeaderboard } from "@/components/dashboard/product-leaderboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await fetchTareasHeader();
  const stats = computeDashboardStats(data);

  return (
    <div className="min-h-screen pb-12">
      {/* Floating glass header */}
      <div className="sticky top-4 z-50 mx-auto max-w-7xl px-6">
        <header className="flex items-center justify-between rounded-2xl border border-white/40 bg-white/70 px-6 py-3 shadow-lg shadow-black/[0.03] backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/kristhal-isotipo.png"
              alt="KRISTHAL"
              width={36}
              height={36}
              className="rounded-lg"
            />
          </Link>
          <p className="text-sm font-medium text-muted-foreground">
            Juegos Centroamericanos y del Caribe 2026
          </p>
        </header>
      </div>

      {/* Dashboard */}
      <main className="mx-auto max-w-7xl space-y-8 px-6 pt-8">
        {/* Row 1: KPI Cards */}
        <KpiCards stats={stats} />

        {/* Row 2: Status Battery */}
        <StatusBattery
          completed={stats.completed}
          inProgress={stats.inProgress}
          pending={stats.pending}
          total={stats.totalTasks}
        />

        {/* Row 3: Gerencia Table */}
        <GerenciaTable gerencias={stats.gerencias} />

        {/* Row 4: Delay Risk Panel */}
        <DelayRiskPanel riskyTasks={stats.riskyTasks} />

        {/* Row 5: Activity Heatmap */}
        <ActivityHeatmap heatmapCells={stats.heatmapCells} />

        {/* Row 6: Product Leaderboard */}
        <ProductLeaderboard products={stats.products} />
      </main>
    </div>
  );
}

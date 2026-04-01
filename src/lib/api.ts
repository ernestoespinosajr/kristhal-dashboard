import { TareaHeader, DashboardStats, GerenciaStats, UnidadEjecutoraStats, ProductStats, TaskRisk, HeatmapCell } from "@/types/api";

const API_BASE = "https://squareconnection.azurewebsites.net/api";

export async function fetchTareasHeader(): Promise<TareaHeader[]> {
  const res = await fetch(`${API_BASE}/TareasHeader`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

function getTaskStatus(record: TareaHeader): "completed" | "in_progress" | "pending" {
  const avance = parseInt(record.AvanceTarea ?? "0", 10);
  if (avance >= 100) return "completed";
  if (avance > 0) return "in_progress";
  return "pending";
}

function computeProductStats(data: TareaHeader[]): ProductStats[] {
  const productMap = new Map<number, ProductStats>();

  for (const r of data) {
    if (r.IDProductos == null || r.Producto == null) continue;
    if (!productMap.has(r.IDProductos)) {
      productMap.set(r.IDProductos, {
        id: r.IDProductos,
        name: r.Producto.trim(),
        progress: r.AvanceProducto ?? 0,
        gerenciaId: r.IDUnidadRectora,
        gerenciaName: r.Rectora.trim(),
        taskCount: 0,
      });
    }
    if (r.IDTarea !== null) {
      productMap.get(r.IDProductos)!.taskCount++;
    }
  }

  return Array.from(productMap.values()).sort((a, b) => b.progress - a.progress);
}

function computeTaskRisks(data: TareaHeader[]): TaskRisk[] {
  const now = Date.now();
  const risks: TaskRisk[] = [];

  for (const r of data) {
    if (r.IDTarea == null || r.FechaInicio == null || r.FechaFin == null) continue;

    const start = new Date(r.FechaInicio).getTime();
    const end = new Date(r.FechaFin).getTime();
    const duration = end - start;
    if (duration <= 0) continue;

    const elapsed = Math.min(now - start, duration);
    if (elapsed <= 0) continue;

    const expectedProgress = Math.round((elapsed / duration) * 100);
    const actualProgress = parseInt(r.AvanceTarea ?? "0", 10);
    const riskScore = expectedProgress - actualProgress;

    if (riskScore > 10) {
      risks.push({
        taskId: r.IDTarea,
        taskName: (r.Tarea ?? "").trim(),
        gerenciaId: r.IDUnidadRectora,
        gerenciaName: r.Rectora.trim(),
        actualProgress,
        expectedProgress,
        riskScore,
      });
    }
  }

  return risks.sort((a, b) => b.riskScore - a.riskScore).slice(0, 10);
}

function computeHeatmapCells(data: TareaHeader[]): HeatmapCell[] {
  const seen = new Set<string>();
  const cells: HeatmapCell[] = [];

  for (const r of data) {
    if (r.IDProductos == null || r.Producto == null) continue;
    const key = `${r.IDUnidadRectora}-${r.IDProductos}`;
    if (seen.has(key)) continue;
    seen.add(key);

    cells.push({
      gerenciaId: r.IDUnidadRectora,
      gerenciaName: r.Rectora.trim(),
      productId: r.IDProductos,
      productName: r.Producto.trim(),
      progress: r.AvanceProducto ?? 0,
    });
  }

  return cells;
}

export function computeDashboardStats(data: TareaHeader[]): DashboardStats {
  const tasks = data.filter((r) => r.IDTarea !== null);

  // Count unique products (actividades)
  const uniqueProducts = new Set<number>();
  for (const r of data) {
    if (r.IDProductos != null) uniqueProducts.add(r.IDProductos);
  }
  const totalActivities = uniqueProducts.size;

  let completed = 0;
  let inProgress = 0;
  let pending = 0;

  for (const t of tasks) {
    const status = getTaskStatus(t);
    if (status === "completed") completed++;
    else if (status === "in_progress") inProgress++;
    else pending++;
  }

  // Avance Global = average of each gerencia's AvanceRectora
  const gerenciaAvances = new Map<number, number>();
  for (const r of data) {
    if (!gerenciaAvances.has(r.IDUnidadRectora)) {
      gerenciaAvances.set(r.IDUnidadRectora, r.AvanceRectora);
    }
  }
  const avanceValues = Array.from(gerenciaAvances.values());
  const overallProgress = avanceValues.length > 0
    ? Math.round(avanceValues.reduce((sum, v) => sum + v, 0) / avanceValues.length)
    : 0;

  // Group by Gerencia (Rectora) and UnidadEjecutora
  const gerenciaMap = new Map<number, GerenciaStats>();
  const unitMap = new Map<number, UnidadEjecutoraStats>();

  for (const r of data) {
    if (!gerenciaMap.has(r.IDUnidadRectora)) {
      gerenciaMap.set(r.IDUnidadRectora, {
        id: r.IDUnidadRectora,
        name: r.Rectora.trim(),
        progress: r.AvanceRectora,
        totalTasks: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        units: [],
      });
    }

    if (!unitMap.has(r.IDUnidadEjecutora)) {
      unitMap.set(r.IDUnidadEjecutora, {
        id: r.IDUnidadEjecutora,
        name: r.UnidadEjecutora.trim(),
        progress: r.AvanceEjecutora,
        gerenciaId: r.IDUnidadRectora,
        gerenciaName: r.Rectora.trim(),
        totalTasks: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
      });
    }

    if (r.IDTarea !== null) {
      const g = gerenciaMap.get(r.IDUnidadRectora)!;
      g.totalTasks++;
      const status = getTaskStatus(r);
      if (status === "completed") g.completed++;
      else if (status === "in_progress") g.inProgress++;
      else g.pending++;

      const u = unitMap.get(r.IDUnidadEjecutora)!;
      u.totalTasks++;
      if (status === "completed") u.completed++;
      else if (status === "in_progress") u.inProgress++;
      else u.pending++;
    }
  }

  // Attach units to their gerencia
  for (const unit of unitMap.values()) {
    const g = gerenciaMap.get(unit.gerenciaId);
    if (g) g.units.push(unit);
  }

  // Sort units within each gerencia by progress desc
  for (const g of gerenciaMap.values()) {
    g.units.sort((a, b) => b.progress - a.progress);
  }

  const gerencias = Array.from(gerenciaMap.values()).sort(
    (a, b) => b.progress - a.progress
  );

  return {
    totalActivities,
    totalTasks: tasks.length,
    completed,
    inProgress,
    pending,
    overallProgress,
    gerencias,
    products: computeProductStats(data),
    riskyTasks: computeTaskRisks(data),
    heatmapCells: computeHeatmapCells(data),
  };
}

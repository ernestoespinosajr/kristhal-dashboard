export interface TareaHeader {
  IDUnidadRectora: number;
  Rectora: string;
  AvanceRectora: number;
  IDUnidadEjecutora: number;
  UnidadEjecutora: string;
  AvanceEjecutora: number;
  IDProductos: number | null;
  Producto: string | null;
  AvanceProducto: number | null;
  IDTarea: number | null;
  Tarea: string | null;
  FechaInicio: string | null;
  FechaFin: string | null;
  AvanceTarea: string | null;
  Proceso: string | null;
  IDPlanOperativo: number | null;
  ComentarioEjecucion: string | null;
  fechaFinejecucion: string | null;
}

export interface UnidadEjecutoraStats {
  id: number;
  name: string;
  progress: number;
  gerenciaId: number;
  gerenciaName: string;
  totalTasks: number;
  completed: number;
  inProgress: number;
  pending: number;
}

export interface GerenciaStats {
  id: number;
  name: string;
  progress: number;
  totalTasks: number;
  completed: number;
  inProgress: number;
  pending: number;
  units: UnidadEjecutoraStats[];
}

export interface ProductStats {
  id: number;
  name: string;
  progress: number;
  gerenciaId: number;
  gerenciaName: string;
  taskCount: number;
}

export interface TaskRisk {
  taskId: number;
  taskName: string;
  gerenciaId: number;
  gerenciaName: string;
  actualProgress: number;
  expectedProgress: number;
  riskScore: number;
}

export interface HeatmapCell {
  gerenciaId: number;
  gerenciaName: string;
  productId: number;
  productName: string;
  progress: number;
}

export interface DashboardStats {
  totalActivities: number;
  totalTasks: number;
  completed: number;
  inProgress: number;
  pending: number;
  overallProgress: number;
  gerencias: GerenciaStats[];
  products: ProductStats[];
  riskyTasks: TaskRisk[];
  heatmapCells: HeatmapCell[];
}

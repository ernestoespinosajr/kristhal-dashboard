import { TareaHeader } from "@/types/api";

export const PAGE_SIZE = 8;

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function getDelayDays(task: TareaHeader): number {
  if (!task.FechaFin) return 0;
  const avance = parseInt(task.AvanceTarea ?? "0", 10);
  if (avance >= 100) return 0;
  const end = new Date(task.FechaFin);
  const now = new Date();
  const diff = Math.floor(
    (now.getTime() - end.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(0, diff);
}

export function getStatus(task: TareaHeader): "completed" | "in_progress" | "pending" {
  const avance = parseInt(task.AvanceTarea ?? "0", 10);
  if (avance >= 100) return "completed";
  if (avance > 0) return "in_progress";
  return "pending";
}

export const statusConfig = {
  completed: { label: "Completado", variant: "default" as const, className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" },
  in_progress: { label: "En Proceso", variant: "default" as const, className: "bg-amber-100 text-amber-700 hover:bg-amber-100" },
  pending: { label: "Pendiente", variant: "default" as const, className: "bg-rose-100 text-rose-600 hover:bg-rose-100" },
};

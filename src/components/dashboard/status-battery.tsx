"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useScrollVisible } from "@/lib/use-scroll-visible";

interface StatusBatteryProps {
  completed: number;
  inProgress: number;
  pending: number;
  total: number;
}

export function StatusBattery({ completed, inProgress, pending, total }: StatusBatteryProps) {
  const { ref, visible } = useScrollVisible();

  if (total === 0) return null;

  const pctCompleted = (completed / total) * 100;
  const pctInProgress = (inProgress / total) * 100;
  const pctPending = (pending / total) * 100;

  const segments = [
    { label: "Completadas", count: completed, pct: pctCompleted, bg: "bg-emerald-500", text: "text-white" },
    { label: "En Proceso", count: inProgress, pct: pctInProgress, bg: "bg-amber-400", text: "text-amber-950" },
    { label: "Pendientes", count: pending, pct: pctPending, bg: "bg-rose-400", text: "text-white" },
  ];

  return (
    <div
      ref={ref}
      className="transition-all duration-500 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
      }}
    >
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="space-y-3 py-5">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Distribución de Tareas
          </p>
          <div className="flex h-10 w-full overflow-hidden rounded-xl">
            {segments.map((seg, i) =>
              seg.count > 0 ? (
                <div
                  key={seg.label}
                  className={`${seg.bg} ${seg.text} flex items-center justify-center gap-1.5 text-sm font-medium overflow-hidden`}
                  style={{
                    width: visible ? `${seg.pct}%` : "0%",
                    transition: `width 800ms cubic-bezier(0.22, 1, 0.36, 1) ${i * 200}ms`,
                  }}
                >
                  {seg.pct >= 12 && (
                    <span
                      className="flex items-center gap-1.5 whitespace-nowrap"
                      style={{
                        opacity: visible ? 1 : 0,
                        transition: `opacity 300ms ease ${i * 200 + 500}ms`,
                      }}
                    >
                      <span className="font-semibold">{seg.count}</span>
                      <span className="hidden sm:inline">({Math.round(seg.pct)}%)</span>
                    </span>
                  )}
                </div>
              ) : null
            )}
          </div>
          <div className="flex gap-5 text-sm text-muted-foreground">
            {segments.map((seg) => (
              <div key={seg.label} className="flex items-center gap-1.5">
                <span className={`inline-block h-2.5 w-2.5 rounded-full ${seg.bg}`} />
                {seg.label}: {seg.count}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

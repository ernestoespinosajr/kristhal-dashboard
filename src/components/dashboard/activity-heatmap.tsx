"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HeatmapCell } from "@/types/api";
import { useScrollVisible } from "@/lib/use-scroll-visible";

interface ActivityHeatmapProps {
  heatmapCells: HeatmapCell[];
}

function cellColor(progress: number): string {
  if (progress >= 80) return "bg-emerald-500";
  if (progress >= 60) return "bg-emerald-400";
  if (progress >= 40) return "bg-emerald-300";
  if (progress >= 20) return "bg-emerald-200";
  if (progress > 0) return "bg-emerald-100";
  return "bg-gray-100";
}

export function ActivityHeatmap({ heatmapCells }: ActivityHeatmapProps) {
  const { ref, visible } = useScrollVisible();

  // Build unique rows (gerencias) and columns (products)
  const gerenciaOrder = new Map<number, string>();
  const productOrder = new Map<number, string>();

  for (const c of heatmapCells) {
    if (!gerenciaOrder.has(c.gerenciaId)) {
      gerenciaOrder.set(c.gerenciaId, c.gerenciaName);
    }
    if (!productOrder.has(c.productId)) {
      productOrder.set(c.productId, c.productName);
    }
  }

  const gerencias = Array.from(gerenciaOrder.entries());
  const products = Array.from(productOrder.entries());

  // Cell lookup
  const cellMap = new Map<string, number>();
  for (const c of heatmapCells) {
    cellMap.set(`${c.gerenciaId}-${c.productId}`, c.progress);
  }

  // Track a flat cell index for staggered animation
  let cellIndex = 0;

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
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Mapa de Actividad
            </p>
            <p className="text-xs text-muted-foreground">
              Cada fila es una gerencia y cada celda un producto. El color indica el % de avance: mientras más oscuro el verde, mayor progreso. Pase el cursor sobre una celda para ver el detalle.
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="inline-flex flex-col gap-1">
              {gerencias.map(([gId, gName]) => (
                <div key={gId} className="flex items-center gap-2">
                  <span className="w-32 shrink-0 truncate text-right text-xs text-muted-foreground">
                    {gName.replace(/Gerencia\s+/i, "")}
                  </span>
                  <div className="flex gap-1">
                    {products.map(([pId, pName]) => {
                      const progress = cellMap.get(`${gId}-${pId}`);
                      if (progress === undefined) {
                        return (
                          <div
                            key={pId}
                            className="h-5 w-5 rounded-sm bg-transparent"
                          />
                        );
                      }
                      const idx = cellIndex++;
                      return (
                        <Tooltip key={pId}>
                          <TooltipTrigger
                            className={`h-5 w-5 rounded-sm ${cellColor(progress)} cursor-default`}
                            style={{
                              opacity: visible ? 1 : 0,
                              transform: visible ? "scale(1)" : "scale(0)",
                              transition: `opacity 300ms ease ${idx * 15}ms, transform 300ms cubic-bezier(0.22, 1, 0.36, 1) ${idx * 15}ms`,
                            }}
                          />
                          <TooltipContent side="top" className="text-xs">
                            <p className="font-medium">{pName}</p>
                            <p className="text-muted-foreground">{progress}%</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>0%</span>
            <div className="flex gap-0.5">
              <div className="h-3 w-3 rounded-sm bg-gray-100" />
              <div className="h-3 w-3 rounded-sm bg-emerald-100" />
              <div className="h-3 w-3 rounded-sm bg-emerald-200" />
              <div className="h-3 w-3 rounded-sm bg-emerald-300" />
              <div className="h-3 w-3 rounded-sm bg-emerald-400" />
              <div className="h-3 w-3 rounded-sm bg-emerald-500" />
            </div>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

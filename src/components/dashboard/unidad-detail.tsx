"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { TareaHeader, UnidadEjecutoraStats } from "@/types/api";
import { useScrollVisible } from "@/lib/use-scroll-visible";
import { formatDate, getDelayDays, getStatus, statusConfig } from "@/lib/task-utils";

interface UnidadDetailProps {
  unit: UnidadEjecutoraStats;
  records: TareaHeader[];
}

const kpis = [
  { key: "totalTasks" as const, label: "Total Tareas", icon: ClipboardList, color: "text-primary", bg: "bg-primary/10" },
  { key: "completed" as const, label: "Completadas", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "inProgress" as const, label: "En Proceso", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { key: "pending" as const, label: "Pendientes", icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50" },
];

function useCountUp(target: number, duration: number) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const frameRef = useRef<number>(0);
  const progress = target > 0 ? count / target : 1;

  const start = useCallback(() => setStarted(true), []);

  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    let cancelled = false;

    function tick(now: number) {
      if (cancelled) return;
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * target));
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => { cancelled = true; cancelAnimationFrame(frameRef.current); };
  }, [started, target, duration]);

  return { count, progress, start };
}

function progressColor(pct: number): string {
  if (pct >= 75) return "bg-emerald-500";
  if (pct >= 40) return "bg-amber-400";
  return "bg-rose-400";
}

interface GroupedProduct {
  id: number;
  name: string;
  progress: number;
  tasks: TareaHeader[];
}

function groupByProduct(records: TareaHeader[]): GroupedProduct[] {
  const map = new Map<number, GroupedProduct>();

  for (const r of records) {
    if (r.IDProductos == null || r.Producto == null) continue;
    if (!map.has(r.IDProductos)) {
      map.set(r.IDProductos, {
        id: r.IDProductos,
        name: r.Producto.trim(),
        progress: r.AvanceProducto ?? 0,
        tasks: [],
      });
    }
    // Only add actual tasks
    if (r.IDTarea !== null) {
      map.get(r.IDProductos)!.tasks.push(r);
    }
  }

  return Array.from(map.values()).sort((a, b) => b.progress - a.progress);
}

export function UnidadDetail({ unit, records }: UnidadDetailProps) {
  const { ref: kpiRef, visible: kpiVisible } = useScrollVisible();
  const { ref: contentRef, visible: contentVisible } = useScrollVisible(0.01);

  const products = useMemo(() => groupByProduct(records), [records]);
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());

  // Expand all by default
  useEffect(() => {
    setExpandedProducts(new Set(products.map((p) => p.id)));
  }, [products]);

  const counters = [
    useCountUp(unit.totalTasks, 700),
    useCountUp(unit.completed, 700),
    useCountUp(unit.inProgress, 700),
    useCountUp(unit.pending, 700),
  ];

  useEffect(() => {
    if (kpiVisible) counters[0].start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiVisible]);

  useEffect(() => {
    for (let i = 1; i < counters.length; i++) {
      if (counters[i - 1].progress >= 0.9) counters[i].start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counters[0].progress, counters[1].progress, counters[2].progress]);

  function toggleProduct(id: number) {
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-8">
      {/* KPI cards */}
      <div ref={kpiRef} className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {kpis.map(({ key, label, icon: Icon, color, bg }, i) => (
          <Card
            key={key}
            className="rounded-2xl border-0 shadow-sm transition-all duration-500 ease-out"
            style={{
              opacity: kpiVisible ? 1 : 0,
              transform: kpiVisible ? "translateY(0)" : "translateY(12px)",
              transitionDelay: `${i * 80}ms`,
            }}
          >
            <CardContent className="flex items-center gap-3">
              <div className={`rounded-xl p-2.5 ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight tabular-nums">
                  {counters[i].count}
                </p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card
          className="rounded-2xl border-0 shadow-sm transition-all duration-500 ease-out"
          style={{
            opacity: kpiVisible ? 1 : 0,
            transform: kpiVisible ? "translateY(0)" : "translateY(12px)",
            transitionDelay: `${4 * 80}ms`,
          }}
        >
          <CardContent className="flex flex-col justify-center gap-2">
            <div className="flex items-baseline justify-between">
              <p className="text-sm text-muted-foreground">Avance</p>
              <p className="text-2xl font-semibold tracking-tight">
                {unit.progress}%
              </p>
            </div>
            <Progress value={kpiVisible ? unit.progress : 0} className="transition-all duration-700" />
          </CardContent>
        </Card>
      </div>

      {/* Products → Tasks */}
      <div
        ref={contentRef}
        className="space-y-4 transition-all duration-500 ease-out"
        style={{
          opacity: contentVisible ? 1 : 0,
          transform: contentVisible ? "translateY(0)" : "translateY(12px)",
        }}
      >
        <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
          <table className="w-full" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "35%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "12%" }} />
            </colgroup>
            <tbody>
              {products.map((product) => (
                <React.Fragment key={product.id}>
                  {/* Product header row */}
                  <tr
                    className="border-b cursor-pointer transition-colors hover:bg-muted/50"
                    onClick={() => toggleProduct(product.id)}
                  >
                    <td colSpan={6} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          {expandedProducts.has(product.id) ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-base font-semibold truncate" title={product.name}>
                              {product.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {product.tasks.length} tareas
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 w-32 shrink-0">
                          <div className="h-2 flex-1 rounded-full bg-muted">
                            <div
                              className={`h-2 rounded-full ${progressColor(product.progress)}`}
                              style={{ width: `${Math.min(product.progress, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium tabular-nums">{product.progress}%</span>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Task rows */}
                  {expandedProducts.has(product.id) && product.tasks.map((task) => {
                    const status = getStatus(task);
                    const delay = getDelayDays(task);
                    const avance = parseInt(task.AvanceTarea ?? "0", 10);
                    const cfg = statusConfig[status];

                    return (
                      <tr key={task.IDTarea} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                        <td className="pl-14 pr-4 py-3 font-medium text-sm">
                          <span className="block truncate" title={task.Tarea ?? ""}>
                            {task.Tarea}
                          </span>
                        </td>
                        <td className="px-4 py-3 tabular-nums text-muted-foreground text-sm">
                          {formatDate(task.FechaInicio)}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-muted-foreground text-sm">
                          {formatDate(task.FechaFin)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={cfg.variant} className={cfg.className}>
                            {cfg.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 flex-1 rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${Math.min(avance, 100)}%` }}
                              />
                            </div>
                            <span className="w-10 text-right text-sm tabular-nums font-medium shrink-0">
                              {avance}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 pr-6 text-center">
                          {delay > 0 ? (
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-600">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              {delay}d
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">0d</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

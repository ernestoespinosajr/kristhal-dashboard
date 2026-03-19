"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { GerenciaStats, TareaHeader } from "@/types/api";
import { useScrollVisible } from "@/lib/use-scroll-visible";

interface GerenciaDetailProps {
  gerencia: GerenciaStats;
  tasks: TareaHeader[];
}

const PAGE_SIZE = 8;

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getDelayDays(task: TareaHeader): number {
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

function getStatus(task: TareaHeader): "completed" | "in_progress" | "pending" {
  const avance = parseInt(task.AvanceTarea ?? "0", 10);
  if (avance >= 100) return "completed";
  if (avance > 0) return "in_progress";
  return "pending";
}

const statusConfig = {
  completed: { label: "Completado", variant: "default" as const, className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" },
  in_progress: { label: "En Proceso", variant: "default" as const, className: "bg-amber-100 text-amber-700 hover:bg-amber-100" },
  pending: { label: "Pendiente", variant: "default" as const, className: "bg-rose-100 text-rose-600 hover:bg-rose-100" },
};

const kpis = [
  { key: "totalTasks" as const, label: "Total Tareas", icon: ClipboardList, color: "text-primary", bg: "bg-primary/10" },
  { key: "completed" as const, label: "Completadas", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "inProgress" as const, label: "En Proceso", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { key: "pending" as const, label: "Pendientes", icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50" },
];

// --- Count-up hook (reused from KPI cards logic) ---
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

export function GerenciaDetail({ gerencia, tasks }: GerenciaDetailProps) {
  const [page, setPage] = useState(0);
  const { ref: kpiRef, visible: kpiVisible } = useScrollVisible();
  const { ref: tableRef, visible: tableVisible } = useScrollVisible();

  // Animated counters for the 4 KPI cards
  const counters = [
    useCountUp(gerencia.totalTasks, 700),
    useCountUp(gerencia.completed, 700),
    useCountUp(gerencia.inProgress, 700),
    useCountUp(gerencia.pending, 700),
  ];

  // Cascade: start first on visible, chain the rest at 90%
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

  const totalPages = Math.ceil(tasks.length / PAGE_SIZE);
  const paginated = useMemo(
    () => tasks.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [tasks, page]
  );

  // Reset row animations on page change
  const [rowsReady, setRowsReady] = useState(false);
  useEffect(() => {
    setRowsReady(false);
    const id = requestAnimationFrame(() => setRowsReady(true));
    return () => cancelAnimationFrame(id);
  }, [page]);

  // Also trigger rows on initial table visible
  useEffect(() => {
    if (tableVisible) setRowsReady(true);
  }, [tableVisible]);

  return (
    <div className="space-y-8">
      {/* KPI row + progress */}
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

        {/* Avance card */}
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
                {gerencia.progress}%
              </p>
            </div>
            <Progress value={kpiVisible ? gerencia.progress : 0} className="transition-all duration-700" />
          </CardContent>
        </Card>
      </div>

      {/* Task table */}
      <div
        ref={tableRef}
        className="transition-all duration-500 ease-out"
        style={{
          opacity: tableVisible ? 1 : 0,
          transform: tableVisible ? "translateY(0)" : "translateY(12px)",
        }}
      >
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="px-6 py-4">
              <h2 className="text-lg font-semibold">Lista de Tareas</h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 w-[30%]">Tarea</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Fin</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-center">% Avance</TableHead>
                  <TableHead className="pr-6 text-center">Retardo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((task, i) => {
                  const status = getStatus(task);
                  const delay = getDelayDays(task);
                  const avance = parseInt(task.AvanceTarea ?? "0", 10);
                  const cfg = statusConfig[status];
                  const show = tableVisible && rowsReady;

                  return (
                    <TableRow
                      key={task.IDTarea}
                      style={{
                        opacity: show ? 1 : 0,
                        transform: show ? "translateY(0)" : "translateY(8px)",
                        transition: `opacity 400ms ease ${i * 40}ms, transform 400ms ease ${i * 40}ms`,
                      }}
                    >
                      <TableCell className="pl-6 font-medium max-w-xs">
                        <span className="line-clamp-2">{task.Tarea}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[160px]">
                        <span className="line-clamp-1">{task.Producto ?? "—"}</span>
                      </TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">
                        {formatDate(task.FechaInicio)}
                      </TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">
                        {formatDate(task.FechaFin)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={cfg.variant} className={cfg.className}>
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{
                                width: show ? `${Math.min(avance, 100)}%` : "0%",
                                transition: `width 600ms cubic-bezier(0.22, 1, 0.36, 1) ${i * 40 + 200}ms`,
                              }}
                            />
                          </div>
                          <span className="w-10 text-right text-sm tabular-nums font-medium">
                            {avance}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="pr-6 text-center">
                        {delay > 0 ? (
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-600">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {delay}d
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">0d</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  Mostrando {page * PAGE_SIZE + 1}–
                  {Math.min((page + 1) * PAGE_SIZE, tasks.length)} de{" "}
                  {tasks.length} tareas
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="rounded-lg p-2 transition-colors hover:bg-muted disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                        i === page
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page === totalPages - 1}
                    className="rounded-lg p-2 transition-colors hover:bg-muted disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

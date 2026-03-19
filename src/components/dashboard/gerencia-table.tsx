"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GerenciaStats } from "@/types/api";
import { useScrollVisible } from "@/lib/use-scroll-visible";

interface GerenciaTableProps {
  gerencias: GerenciaStats[];
}

function progressColor(pct: number): string {
  if (pct >= 75) return "bg-emerald-500";
  if (pct >= 40) return "bg-amber-400";
  return "bg-rose-400";
}

export function GerenciaTable({ gerencias }: GerenciaTableProps) {
  const { ref, visible } = useScrollVisible();

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
            Avance por Gerencia
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gerencia</TableHead>
                <TableHead className="w-[140px]">Avance</TableHead>
                <TableHead className="text-right w-[60px]">Tareas</TableHead>
                <TableHead className="text-right w-[130px]">Estado</TableHead>
                <TableHead className="w-[32px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {gerencias.map((g, i) => (
                <TableRow
                  key={g.id}
                  className="group"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(8px)",
                    transition: `opacity 400ms ease ${i * 40}ms, transform 400ms ease ${i * 40}ms`,
                  }}
                >
                  <TableCell>
                    <Link
                      href={`/gerencia/${g.id}`}
                      className="font-medium hover:underline"
                    >
                      {g.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className={`h-2 rounded-full ${progressColor(g.progress)}`}
                          style={{
                            width: visible ? `${Math.min(g.progress, 100)}%` : "0%",
                            transition: `width 700ms cubic-bezier(0.22, 1, 0.36, 1) ${i * 40 + 200}ms`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium tabular-nums w-[40px] text-right">
                        {g.progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{g.totalTasks}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 text-xs">
                      <span className="text-emerald-600">{g.completed}</span>
                      <span className="text-amber-600">{g.inProgress}</span>
                      <span className="text-rose-500">{g.pending}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/gerencia/${g.id}`}>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

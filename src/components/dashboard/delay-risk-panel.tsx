"use client";

import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskRisk } from "@/types/api";
import { useScrollVisible } from "@/lib/use-scroll-visible";

interface DelayRiskPanelProps {
  riskyTasks: TaskRisk[];
}

function severityColor(riskScore: number): string {
  if (riskScore >= 50) return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700";
}

export function DelayRiskPanel({ riskyTasks }: DelayRiskPanelProps) {
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
      <Card className="relative overflow-hidden rounded-2xl border-0 shadow-sm">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-rose-100/50 to-transparent" />
        <CardContent className="relative space-y-3 py-5">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Riesgo de Atraso
          </p>

          {riskyTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              <p className="text-sm font-medium">No hay tareas en riesgo</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {riskyTasks.map((t, i) => (
                <li
                  key={t.taskId}
                  className="flex items-start gap-3 rounded-lg border border-border/50 p-3"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateX(0)" : "translateX(16px)",
                    transition: `opacity 400ms ease ${i * 60}ms, transform 400ms ease ${i * 60}ms`,
                  }}
                >
                  <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${t.riskScore >= 50 ? "text-rose-500" : "text-amber-500"}`} />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-medium leading-snug line-clamp-2">
                      {t.taskName}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-xs font-normal">
                        {t.gerenciaName}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Real: {t.actualProgress}% · Esperado: {t.expectedProgress}%
                      </span>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${severityColor(t.riskScore)}`}
                    style={{
                      animation: visible ? `pulse-once 600ms ease ${i * 60 + 300}ms both` : "none",
                    }}
                  >
                    -{t.riskScore}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

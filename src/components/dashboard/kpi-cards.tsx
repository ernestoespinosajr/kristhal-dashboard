"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Layers, ClipboardList, TrendingUp } from "lucide-react";
import { DashboardStats } from "@/types/api";

interface KpiCardsProps {
  stats: DashboardStats;
}

const kpis = [
  {
    key: "totalActivities" as const,
    label: "Total Actividades",
    icon: Layers,
    color: "text-primary",
    bg: "bg-primary/10",
    suffix: "",
  },
  {
    key: "totalTasks" as const,
    label: "Total Tareas",
    icon: ClipboardList,
    color: "text-amber-600",
    bg: "bg-amber-50",
    suffix: "",
  },
  {
    key: "overallProgress" as const,
    label: "Avance Global",
    icon: TrendingUp,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    suffix: "%",
  },
];

function useCountUp(target: number, duration: number, delay: number) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const frameRef = useRef<number>(0);

  const start = useCallback(() => {
    setStarted(true);
  }, []);

  // Expose progress (0–1) so the parent can trigger the next counter at 90%
  const progress = target > 0 ? count / target : 1;

  useEffect(() => {
    if (!started) return;

    const startTime = performance.now() + delay;
    let cancelled = false;

    function tick(now: number) {
      if (cancelled) return;
      const elapsed = now - startTime;
      if (elapsed < 0) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(elapsed / duration, 1);
      // ease-out cubic for a natural deceleration feel
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * target));
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frameRef.current);
    };
  }, [started, target, duration, delay]);

  return { count, progress, start };
}

const COUNT_DURATION = 800; // ms per counter

export function KpiCards({ stats }: KpiCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const counters = [
    useCountUp(stats.totalActivities, COUNT_DURATION, 0),
    useCountUp(stats.totalTasks, COUNT_DURATION, 0),
    useCountUp(stats.overallProgress, COUNT_DURATION, 0),
  ];

  // Intersection observer — start cascade when cards scroll into view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Start first counter when visible
  useEffect(() => {
    if (visible) counters[0].start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Chain: start next counter when the previous reaches 90%
  useEffect(() => {
    for (let i = 1; i < counters.length; i++) {
      if (counters[i - 1].progress >= 0.9) {
        counters[i].start();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counters[0].progress, counters[1].progress]);

  return (
    <div ref={containerRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {kpis.map(({ key, label, icon: Icon, color, bg, suffix }, i) => (
        <Card
          key={key}
          className="rounded-2xl border-0 shadow-sm transition-all duration-500 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(12px)",
            transitionDelay: `${i * 100}ms`,
          }}
        >
          <CardContent className="flex items-center gap-4">
            <div className={`rounded-xl p-3 ${bg}`}>
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <div>
              <p className="text-3xl font-semibold tracking-tight tabular-nums">
                {counters[i].count}{suffix}
              </p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

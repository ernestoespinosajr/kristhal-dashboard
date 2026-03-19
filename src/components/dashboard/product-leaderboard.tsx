"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, AlertCircle } from "lucide-react";
import { ProductStats } from "@/types/api";
import { useScrollVisible } from "@/lib/use-scroll-visible";

interface ProductLeaderboardProps {
  products: ProductStats[];
}

function ProductItem({
  product,
  rank,
  variant,
  visible,
  index,
}: {
  product: ProductStats;
  rank: number;
  variant: "top" | "bottom";
  visible: boolean;
  index: number;
}) {
  const barColor = variant === "top" ? "bg-emerald-500" : "bg-rose-400";
  const slideFrom = variant === "top" ? "-16px" : "16px";

  return (
    <div
      className="flex items-center gap-3 py-1.5"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : `translateX(${slideFrom})`,
        transition: `opacity 400ms ease ${index * 60}ms, transform 400ms ease ${index * 60}ms`,
      }}
    >
      <span className="w-5 text-right text-xs font-semibold text-muted-foreground tabular-nums">
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{product.name}</p>
        <p className="truncate text-xs text-muted-foreground">{product.gerenciaName}</p>
      </div>
      <div className="h-1.5 w-16 rounded-full bg-muted">
        <div
          className={`h-1.5 rounded-full ${barColor}`}
          style={{
            width: visible ? `${Math.min(product.progress, 100)}%` : "0%",
            transition: `width 600ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 60 + 200}ms`,
          }}
        />
      </div>
      <span className="w-10 text-right text-sm font-semibold tabular-nums">
        {product.progress}%
      </span>
    </div>
  );
}

export function ProductLeaderboard({ products }: ProductLeaderboardProps) {
  const { ref, visible } = useScrollVisible();
  const top5 = products.slice(0, 5);
  const bottom5 = [...products].sort((a, b) => a.progress - b.progress).slice(0, 5);

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
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-emerald-100/50 to-transparent" />
        <CardContent className="relative space-y-4 py-5">
          {/* Top */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Productos Destacados
              </p>
            </div>
            <div>
              {top5.map((p, i) => (
                <ProductItem key={p.id} product={p} rank={i + 1} variant="top" visible={visible} index={i} />
              ))}
            </div>
          </div>

          <div className="border-t" />

          {/* Bottom */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400" />
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Requieren Atención
              </p>
            </div>
            <div>
              {bottom5.map((p, i) => (
                <ProductItem key={p.id} product={p} rank={i + 1} variant="bottom" visible={visible} index={i + 5} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { fetchTareasHeader, computeDashboardStats } from "@/lib/api";
import { parseFilterParams, filterDataByDate, buildFilterQuery } from "@/lib/filter-utils";
import { UnidadDetail } from "@/components/dashboard/unidad-detail";

interface Props {
  params: Promise<{ gerenciaId: string; id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function UnidadPage({ params, searchParams }: Props) {
  const { gerenciaId: gIdStr, id } = await params;
  const sp = await searchParams;
  const gerenciaId = parseInt(gIdStr, 10);
  const unitId = parseInt(id, 10);

  const filter = parseFilterParams(sp);
  const filterQuery = buildFilterQuery(filter);

  const rawData = await fetchTareasHeader();
  const data = filterDataByDate(rawData, filter);
  const stats = computeDashboardStats(data);

  const gerencia = stats.gerencias.find((g) => g.id === gerenciaId);
  if (!gerencia) notFound();

  const unit = gerencia.units.find((u) => u.id === unitId);
  if (!unit) notFound();

  const records = data.filter(
    (r) => r.IDUnidadEjecutora === unitId
  );

  return (
    <div className="min-h-screen pb-12">
      {/* Floating glass header */}
      <div className="sticky top-4 z-50 mx-auto max-w-7xl px-6">
        <header className="flex items-center justify-between rounded-2xl border border-white/40 bg-white/70 px-6 py-3 shadow-lg shadow-black/[0.03] backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/kristhal-isotipo.png"
              alt="KRISTHAL"
              width={36}
              height={36}
              className="rounded-lg"
            />
          </Link>
          <p className="text-sm font-medium text-muted-foreground">
            Juegos Centroamericanos y del Caribe 2026
          </p>
        </header>
      </div>

      <main className="mx-auto max-w-7xl space-y-8 px-6 pt-8">
        {/* Breadcrumb + title */}
        <div className="space-y-1">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link
              href={`/${filterQuery}`}
              className="font-medium transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <span>/</span>
            <Link
              href={`/gerencia/${gerenciaId}${filterQuery}`}
              className="font-medium transition-colors hover:text-foreground"
            >
              {gerencia.name}
            </Link>
            <span>/</span>
            <span className="text-foreground">{unit.name}</span>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href={`/gerencia/${gerenciaId}${filterQuery}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">
              {unit.name}
            </h1>
          </div>
        </div>

        <UnidadDetail unit={unit} records={records} />
      </main>
    </div>
  );
}

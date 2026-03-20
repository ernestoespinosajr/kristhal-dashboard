import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { fetchTareasHeader, computeDashboardStats } from "@/lib/api";
import { GerenciaDetail } from "@/components/dashboard/gerencia-detail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GerenciaPage({ params }: Props) {
  const { id } = await params;
  const gerenciaId = parseInt(id, 10);

  const data = await fetchTareasHeader();
  const stats = computeDashboardStats(data);

  const gerencia = stats.gerencias.find((g) => g.id === gerenciaId);
  if (!gerencia) notFound();

  const allRecords = data.filter(
    (r) => r.IDUnidadRectora === gerenciaId
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
        {/* Back link + title */}
        <div className="space-y-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {gerencia.name}
          </h1>
        </div>

        <GerenciaDetail gerencia={gerencia} records={allRecords} />
      </main>
    </div>
  );
}

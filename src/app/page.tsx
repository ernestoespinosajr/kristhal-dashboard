import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchTareasHeader } from "@/lib/api";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await fetchTareasHeader();

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

      {/* Dashboard */}
      <main className="mx-auto max-w-7xl space-y-8 px-6 pt-8">
        <Suspense>
          <DashboardContent data={data} />
        </Suspense>
      </main>
    </div>
  );
}

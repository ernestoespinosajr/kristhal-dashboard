import { TareaHeader } from "@/types/api";

export interface FilterParams {
  year: number | null;
  month: number | null;
}

/** Build a query string like "?year=2025&month=3" (empty string if no filter) */
export function buildFilterQuery(filter: FilterParams): string {
  const params = new URLSearchParams();
  if (filter.year != null) params.set("year", String(filter.year));
  if (filter.month != null) params.set("month", String(filter.month));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/** Parse year/month from a searchParams-like object */
export function parseFilterParams(
  searchParams: Record<string, string | string[] | undefined>
): FilterParams {
  const y = typeof searchParams.year === "string" ? parseInt(searchParams.year, 10) : null;
  const m = typeof searchParams.month === "string" ? parseInt(searchParams.month, 10) : null;
  return {
    year: y != null && !isNaN(y) ? y : null,
    month: m != null && !isNaN(m) ? m : null,
  };
}

/** Filter TareaHeader[] by year/month range overlap */
export function filterDataByDate(data: TareaHeader[], filter: FilterParams): TareaHeader[] {
  if (filter.year == null) return data;

  let rangeStart: number;
  let rangeEnd: number;

  if (filter.month != null) {
    rangeStart = new Date(filter.year, filter.month - 1, 1).getTime();
    rangeEnd = new Date(filter.year, filter.month, 0, 23, 59, 59, 999).getTime();
  } else {
    rangeStart = new Date(filter.year, 0, 1).getTime();
    rangeEnd = new Date(filter.year, 11, 31, 23, 59, 59, 999).getTime();
  }

  return data.filter((r) => {
    if (!r.FechaInicio || !r.FechaFin) return false;
    const taskStart = new Date(r.FechaInicio).getTime();
    const taskEnd = new Date(r.FechaFin).getTime();
    return taskStart <= rangeEnd && taskEnd >= rangeStart;
  });
}

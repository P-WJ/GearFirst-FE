export function createRNG(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export const pad = (n: number, len = 2) => String(n).padStart(len, "0");

export const formatDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${y}. ${m}. ${day}. ${hh}:${mm}:${ss}`;
};

export const dateAdd = (base: Date, days: number): string => {
  const copy = new Date(base);
  copy.setDate(copy.getDate() + days);
  return formatDate(copy);
};

export function parseDateValue(value?: string | null): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  const dotted = trimmed.match(
    /(\d{4})\.\s*(\d{2})\.\s*(\d{2})\.\s*(\d{2}):(\d{2}):(\d{2})/
  );
  if (dotted) {
    const [, y, m, d, hh, mm, ss] = dotted;
    return new Date(`${y}-${m}-${d}T${hh}:${mm}:${ss}`);
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return new Date(trimmed);
  }
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function paginate<T>(arr: T[], page: number, pageSize: number) {
  const total = arr.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    data: arr.slice(start, end),
    meta: { total, page, pageSize, totalPages },
  };
}

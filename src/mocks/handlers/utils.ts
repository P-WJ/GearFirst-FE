import type { ApiPage, ApiResponse } from "../../api";

export function toApiResponse<T>(data: T, message = "ok"): ApiResponse<T> {
  return {
    status: 200,
    success: true,
    message,
    data,
  };
}

export function toPaged<T>(
  items: T[],
  page: number,
  size: number
): ApiPage<T> {
  const safeSize = Math.max(1, size);
  const safePage = Math.max(0, page);
  const totalElements = items.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / safeSize));
  const start = safePage * safeSize;
  return {
    content: items.slice(start, start + safeSize),
    page: safePage,
    size: safeSize,
    totalElements,
    totalPages,
  };
}

export function parseNumber(value: string | null | undefined, fallback: number) {
  if (value === null || value === undefined) return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function normalizeQueryString(url: URL, key: string) {
  const value = url.searchParams.get(key);
  return value ? value.trim() : "";
}

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

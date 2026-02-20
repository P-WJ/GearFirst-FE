import { dateAdd, formatDate } from "../shared/utils";

export const BASE_DATE = new Date("2026-01-27T09:00:00Z");

export function isoDate(daysOffset: number, hour = 9): string {
  const d = new Date(BASE_DATE.getTime() + daysOffset * 86400000);
  d.setHours(hour, 0, 0, 0);
  return formatDate(d);
}

export function dateOnly(daysOffset: number): string {
  const d = new Date(BASE_DATE.getTime() + daysOffset * 86400000);
  d.setHours(9, 0, 0, 0);
  return formatDate(d);
}

export function pick<T>(arr: T[], index: number): T {
  return arr[Math.abs(index) % arr.length];
}

export function range(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i);
}

export function makeCode(prefix: string, n: number, width = 4): string {
  return `${prefix}-${String(n).padStart(width, "0")}`;
}

export function makeName(prefix: string, n: number): string {
  return `${prefix} ${n}`;
}

export function withDateRange(startOffset: number, endOffset: number) {
  return {
    startDate: dateAdd(BASE_DATE, startOffset),
    endDate: dateAdd(BASE_DATE, endOffset),
  };
}

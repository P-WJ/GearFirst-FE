/**
 * 간단한 Linear Congruential Generator (LCG) 기반 난수 생성기
 * - 시드를 고정하면 항상 같은 난수 시퀀스를 얻을 수 있음 (mock 데이터 안정성 보장)
 */
export function createRNG(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

/** 숫자를 0패딩하여 문자열로 반환 (예: pad(3, 2) → "03") */
export const pad = (n: number, len = 2) => String(n).padStart(len, "0");

/** 날짜 → "YYYY-MM-DD" 문자열로 변환 */
export const formatDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${y}. ${m}. ${day}. ${hh}:${mm}:${ss}`;
};

/** 기준 날짜 + n일 → "YYYY-MM-DD" 문자열 반환 */
export const dateAdd = (base: Date, days: number): string => {
  const copy = new Date(base);
  copy.setDate(copy.getDate() + days);
  return formatDate(copy);
};

/** 다양한 날짜 문자열을 Date로 파싱 (YYYY-MM-DD 또는 YYYY. MM. DD. HH:mm:ss) */
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

/**
 * 간단한 배열 페이지네이션 함수
 * - 서버/목데이터 둘 다 동일하게 사용할 수 있음
 */
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

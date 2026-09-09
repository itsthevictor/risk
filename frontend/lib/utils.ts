import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUsd(value: number, maximumFractionDigits = 0): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits,
  }).format(value);
}

export function formatRon(value: number, maximumFractionDigits = 0): string {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    maximumFractionDigits,
  }).format(value);
}

// Expects an ISO date string ("YYYY-MM-DD"); split rather than parsed via `Date` so
// there's no timezone shift to worry about for a plain calendar date.
export function formatDateRo(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}.${month}.${year}`;
}

export function formatPercent(value: number, digits = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export interface HistogramBin {
  start: number;
  end: number;
  mid: number;
  count: number;
}

// Buckets `values` into `binCount` equal-width bins across their range.
export function buildHistogram(
  values: number[],
  binCount = 24,
): HistogramBin[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = (max - min) / binCount || 1;

  const bins: HistogramBin[] = Array.from({ length: binCount }, (_, i) => {
    const start = min + i * width;
    const end = start + width;
    return { start, end, mid: (start + end) / 2, count: 0 };
  });

  for (const value of values) {
    const index = Math.min(
      binCount - 1,
      Math.max(0, Math.floor((value - min) / width)),
    );
    bins[index].count += 1;
  }

  return bins;
}

// Finds the bin whose midpoint is closest to `target` — used to snap a
// reference line (e.g. a VaR level) onto the histogram's category axis.
export function nearestBinMid(bins: HistogramBin[], target: number): number {
  return bins.reduce(
    (closest, bin) =>
      Math.abs(bin.mid - target) < Math.abs(closest - target)
        ? bin.mid
        : closest,
    bins[0]?.mid ?? target,
  );
}

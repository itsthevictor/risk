import type { EveScenarios } from '@/lib/definitions';

export const EVE_SCENARIO_ORDER = [
  'base',
  'parallel_up',
  'parallel_down',
  'steepener',
  'flattener',
  'short_up',
  'short_down',
] as const satisfies readonly (keyof EveScenarios)[];

export const EVE_SCENARIO_LABELS: Record<keyof EveScenarios, string> = {
  base: 'Bază',
  parallel_up: 'Paralel sus (+200bps)',
  parallel_down: 'Paralel jos (-200bps)',
  steepener: 'Steepener',
  flattener: 'Flattener',
  short_up: 'Short-end sus',
  short_down: 'Short-end jos',
};

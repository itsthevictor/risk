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

// Display labels: dict.interestRate.scenarios

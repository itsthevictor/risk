// hooks/use-calculate-lcr.ts
import { useMutation } from '@tanstack/react-query';
import { calculateLCR } from '@/lib/api/liquidity-risk';

export function useCalculateLCR() {
  return useMutation({
    mutationFn: calculateLCR,
  });
}

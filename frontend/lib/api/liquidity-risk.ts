import {
  LCRCalculationRequest,
  LCRResult,
  LCRResultSchema,
} from '@/lib/definitions';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function calculateLCR(
  payload: LCRCalculationRequest,
): Promise<LCRResult> {
  const response = await fetch(`${API_BASE_URL}/liquidity-risk/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`LCR calculation failed: ${response.statusText}`);
  }

  const data = await response.json();
  return LCRResultSchema.parse(data);
}

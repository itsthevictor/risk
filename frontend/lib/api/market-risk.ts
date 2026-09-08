import {
  MarketRiskAnalyzeRequest,
  MarketRiskAnalyzeResponse,
  MarketRiskAnalyzeResponseSchema,
  StressTestRequest,
  StressTestResult,
  StressTestResultSchema,
  TickerListResponse,
  TickerListResponseSchema,
  ErrorResponseSchema,
} from '@/lib/definitions';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Unlike a plain `throw new Error(response.statusText)`, this carries the
// backend's structured {code, message, details} through to the caller —
// e.g. code === 'insufficient_history' can drive a specific UI message
// instead of a generic "422 Unprocessable Entity".
export class MarketRiskApiError extends Error {
  code?: string;
  details?: Record<string, unknown> | null;

  constructor(
    message: string,
    code?: string,
    details?: Record<string, unknown> | null,
  ) {
    super(message);
    this.name = 'MarketRiskApiError';
    this.code = code;
    this.details = details;
  }
}

async function toApiError(response: Response): Promise<MarketRiskApiError> {
  try {
    const body = await response.json();
    const parsed = ErrorResponseSchema.safeParse(body);
    if (parsed.success) {
      return new MarketRiskApiError(
        parsed.data.message,
        parsed.data.code,
        parsed.data.details,
      );
    }
  } catch {
    // response body wasn't JSON, or didn't match ErrorResponse — fall through
  }
  return new MarketRiskApiError(`Cerere eșuată: ${response.statusText}`);
}

export async function analyzeMarketRisk(
  payload: MarketRiskAnalyzeRequest,
): Promise<MarketRiskAnalyzeResponse> {
  const response = await fetch(`${API_BASE_URL}/market-risk/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await toApiError(response);
  }

  const data = await response.json();
  return MarketRiskAnalyzeResponseSchema.parse(data);
}

export async function runStressTest(
  payload: StressTestRequest,
): Promise<StressTestResult> {
  const response = await fetch(`${API_BASE_URL}/market-risk/stress-test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await toApiError(response);
  }

  const data = await response.json();
  return StressTestResultSchema.parse(data);
}

export async function fetchTickers(): Promise<TickerListResponse> {
  const response = await fetch(`${API_BASE_URL}/market-risk/tickers`);

  if (!response.ok) {
    throw await toApiError(response);
  }

  const data = await response.json();
  return TickerListResponseSchema.parse(data);
}

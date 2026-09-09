import {
  EveAnalysisResponse,
  EveAnalysisResponseSchema,
  NIIAnalysisResponse,
  NIIAnalysisResponseSchema,
  ErrorResponseSchema,
} from '@/lib/definitions';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class InterestRateRiskApiError extends Error {
  code?: string;
  details?: Record<string, unknown> | null;

  constructor(
    message: string,
    code?: string,
    details?: Record<string, unknown> | null,
  ) {
    super(message);
    this.name = 'InterestRateRiskApiError';
    this.code = code;
    this.details = details;
  }
}

async function toApiError(response: Response): Promise<InterestRateRiskApiError> {
  try {
    const body = await response.json();
    const parsed = ErrorResponseSchema.safeParse(body);
    if (parsed.success) {
      return new InterestRateRiskApiError(
        parsed.data.message,
        parsed.data.code,
        parsed.data.details,
      );
    }
  } catch {
    // response body wasn't JSON, or didn't match ErrorResponse — fall through
  }
  return new InterestRateRiskApiError(`Cerere eșuată: ${response.statusText}`);
}

export async function fetchNiiAnalysis(
  shockBp: number,
): Promise<NIIAnalysisResponse> {
  const response = await fetch(
    `${API_BASE_URL}/interest-rate-risk/nii-analysis?shock_bp=${shockBp}`,
  );

  if (!response.ok) {
    throw await toApiError(response);
  }

  const data = await response.json();
  return NIIAnalysisResponseSchema.parse(data);
}

export async function fetchEveAnalysis(): Promise<EveAnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/interest-rate-risk/eve-analysis`);

  if (!response.ok) {
    throw await toApiError(response);
  }

  const data = await response.json();
  return EveAnalysisResponseSchema.parse(data);
}

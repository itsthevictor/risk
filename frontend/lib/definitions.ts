import { z } from 'zod';

export enum ISSUER_TYPE {
  SOVEREIGN_OWN_COUNTRY = 'sovereign_own_country',
  CENTRAL_BANK_CASH = 'central_bank_cash',
  SOVEREIGN_FOREIGN = 'sovereign_foreign',
  MULTILATERAL_DEV_BANK = 'multilateral_dev_bank',
  COVERED_BOND = 'covered_bond',
  CORPORATE_BOND = 'corporate_bond',
  EQUITY_INDEX_LISTED = 'equity_index_listed',
  EQUITY_OTHER = 'equity_other',
  RMBS = 'rmbs',
  OTHER = 'other',
}

// # rating bands for HQLA items
export enum RATING_BAND {
  AAA_AA = 'AAA_AA',
  A = 'A',
  BBB = 'BBB',
  BELOW_BBB_MINUS = 'below_BBB_minus',
  NOT_RATED = 'not_rated',
}

export const HQLAItemSchema = z
  .object({
    description: z.string(),
    amount: z.number().gt(0),
    issuer_type: z.enum(ISSUER_TYPE),
    rating_band: z.enum(RATING_BAND).nullable().optional(),
  })
  .refine(
    (data) =>
      RATING_EXEMPT_ISSUER_TYPES_SET.has(data.issuer_type) ||
      data.rating_band !== undefined,
    {
      message: 'rating_band is required for this issuer_type',
      path: ['rating_band'],
    },
  );

export type HQLAItem = z.infer<typeof HQLAItemSchema>;

export enum RETAIL_DEPOSIT_CATEGORY {
  STABLE_RETAIL = 'stable_retail',
  LESS_STABLE_RETAIL = 'less_stable_retail',
  SME = 'sme',
}

export const RetailDepositItemSchema = z.object({
  description: z.string(),
  amount: z.number().gt(0),
  category: z.enum(RETAIL_DEPOSIT_CATEGORY),
});

export type RetailDepositItem = z.infer<typeof RetailDepositItemSchema>;

export enum WHOLESALE_DEPOSIT_CATEGORY {
  OPERATIONAL_DEPOSIT = 'operational_deposit',
  NON_OPERATIONAL_CORPORATE = 'non_operational_corporate',
  NON_OPERATIONAL_FINANCIAL_INSTITUTION = 'non_operational_financial_institution',
}

export const WholesaleDepositItemSchema = z.object({
  description: z.string(),
  amount: z.number().gt(0),
  category: z.enum(WHOLESALE_DEPOSIT_CATEGORY),
});

export type WholesaleDepositItem = z.infer<typeof WholesaleDepositItemSchema>;

export enum OFF_BALANCE_SHEET_CATEGORY {
  RETAIL_SME_FACILITY = 'retail_sme_facility',
  CORPORATE_FACILITY = 'corporate_facility',
  BANK_FI_FACILITY = 'bank_fi_facility',
}

export const OffBalanceSheetItemSchema = z.object({
  description: z.string(),
  amount: z.number().gt(0),
  category: z.enum(OFF_BALANCE_SHEET_CATEGORY),
});

export type OffBalanceSheetItem = z.infer<typeof OffBalanceSheetItemSchema>;

export enum INFLOW_ITEM_CATEGORY {
  SECURED_LENDING_L1_COLLATERAL = 'secured_lending_l1_collateral',
  SECURED_LENDING_L2A_COLLATERAL = 'secured_lending_l2a_collateral',
  RETAIL_SME_LOAN_REPAYMENT = 'retail_sme_loan_repayment',
  CORPORATE_LOAN_REPAYMENT = 'corporate_loan_repayment',
  BANK_FI_LOAN_REPAYMENT = 'bank_fi_loan_repayment',
}

export const InflowItemSchema = z.object({
  description: z.string(),
  amount: z.number().gt(0),
  category: z.enum(INFLOW_ITEM_CATEGORY),
});

export type InflowItem = z.infer<typeof InflowItemSchema>;

export const LCRResultSchema = z.object({
  hqla_l1: z.number(),
  hqla_l2a: z.number(),
  hqla_l2b: z.number(),
  hqla_total: z.number(),
  total_outflows: z.number(),
  outflow_breakdown: z.record(z.string(), z.number()),
  total_inflows_uncapped: z.number(),
  total_inflows_capped: z.number(),
  inflow_breakdown: z.record(z.string(), z.number()),
  net_outflows: z.number(),
  lcr_ratio: z.number(),
});

export type LCRResult = z.infer<typeof LCRResultSchema>;

export const LCRCalculationRequestSchema = z.object({
  hqla_items: z.array(HQLAItemSchema),
  retail_deposits: z.array(RetailDepositItemSchema),
  wholesale_deposits: z.array(WholesaleDepositItemSchema),
  off_balance_sheet: z.array(OffBalanceSheetItemSchema),
  inflow_items: z.array(InflowItemSchema),
});

export type LCRCalculationRequest = z.infer<typeof LCRCalculationRequestSchema>;

export enum RATING_EXEMPT_ISSUER_TYPES {
  SOVEREIGN_OWN_COUNTRY = 'sovereign_own_country',
  CENTRAL_BANK_CASH = 'central_bank_cash',
  MULTILATERAL_DEV_BANK = 'multilateral_dev_bank',
  EQUITY_INDEX_LISTED = 'equity_index_listed',
  EQUITY_OTHER = 'equity_other',
  OTHER = 'other',
}

const RATING_EXEMPT_ISSUER_TYPES_SET = new Set([
  ISSUER_TYPE.SOVEREIGN_OWN_COUNTRY,
  ISSUER_TYPE.CENTRAL_BANK_CASH,
  ISSUER_TYPE.MULTILATERAL_DEV_BANK,
  ISSUER_TYPE.EQUITY_INDEX_LISTED,
  ISSUER_TYPE.EQUITY_OTHER,
  ISSUER_TYPE.OTHER,
]);

export const HQLA_ALLOWED_RATING_BANDS: Partial<
  Record<ISSUER_TYPE, RATING_BAND[]>
> = {
  [ISSUER_TYPE.SOVEREIGN_FOREIGN]: [
    RATING_BAND.AAA_AA,
    RATING_BAND.A,
    RATING_BAND.BBB,
  ],
  [ISSUER_TYPE.COVERED_BOND]: [RATING_BAND.AAA_AA, RATING_BAND.A],
  [ISSUER_TYPE.CORPORATE_BOND]: [
    RATING_BAND.AAA_AA,
    RATING_BAND.A,
    RATING_BAND.BBB,
    RATING_BAND.BELOW_BBB_MINUS,
  ],
  [ISSUER_TYPE.RMBS]: [RATING_BAND.AAA_AA],
};

export const RiskMethodSchema = z.enum([
  'historical',
  'parametric',
  'ewma',
  'garch',
  'monte_carlo',
]);
export type RiskMethod = z.infer<typeof RiskMethodSchema>;

export const CrisisWindowPresetSchema = z.enum(['2020', '2022', 'custom']);
export type CrisisWindowPreset = z.infer<typeof CrisisWindowPresetSchema>;

export const TrafficLightSchema = z.enum(['green', 'yellow', 'red']);
export type TrafficLight = z.infer<typeof TrafficLightSchema>;

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected date as YYYY-MM-DD');

// ---------------------------------------------------------------------------
// request
// ---------------------------------------------------------------------------

export const CustomWindowSchema = z
  .object({
    start: isoDateSchema,
    end: isoDateSchema,
  })
  .refine((d) => d.start < d.end, {
    message: 'start must be before end',
    path: ['start'],
  });
export type CustomWindow = z.infer<typeof CustomWindowSchema>;

const tickerSchema = z
  .string()
  .trim()
  .min(1, 'Ticker cannot be empty')
  .regex(/^[A-Za-z0-9.^=-]+$/, 'Invalid ticker format')
  .transform((t) => t.toUpperCase());

const confidenceLevelSchema = z
  .number()
  .gt(0.5, 'Confidence level must be greater than 0.5')
  .lt(1.0, 'Confidence level must be less than 1.0');

export const MarketRiskAnalyzeRequestSchema = z
  .object({
    tickers: z
      .array(tickerSchema)
      .min(2, 'Select at least 2 tickers')
      .max(10, 'Select at most 10 tickers')
      .refine((tickers) => new Set(tickers).size === tickers.length, {
        message: 'Duplicate tickers in portfolio',
      }),
    portfolio_value: z.number().positive().default(1_000_000),
    crisis_window: CrisisWindowPresetSchema.nullable().optional(),
    custom_window: CustomWindowSchema.nullable().optional(),
    estimation_window_days: z.number().int().min(30).max(756).default(252),
    confidence_levels: z
      .array(confidenceLevelSchema)
      .min(1, 'At least one confidence level is required')
      .default([0.9, 0.95, 0.99])
      .transform((levels) => [...levels].sort((a, b) => a - b)),
  })
  .refine(
    (data) => data.crisis_window !== 'custom' || data.custom_window != null,
    {
      message: "custom_window is required when crisis_window is 'custom'",
      path: ['custom_window'],
    },
  );
// Input = what a form provides before defaults are applied.
// Output = what actually gets sent to the API.
export type MarketRiskAnalyzeRequest = z.input<
  typeof MarketRiskAnalyzeRequestSchema
>;
export type MarketRiskAnalyzeRequestParsed = z.output<
  typeof MarketRiskAnalyzeRequestSchema
>;

// ---------------------------------------------------------------------------
// response
// ---------------------------------------------------------------------------

export const VarEsPairSchema = z.object({
  var: z.number(),
  es: z.number(),
  var_pct: z.number(),
  es_pct: z.number(),
});
export type VarEsPair = z.infer<typeof VarEsPairSchema>;

export const MethodResultsSchema = z.object({
  historical: VarEsPairSchema,
  parametric: VarEsPairSchema,
  ewma: VarEsPairSchema,
  garch: VarEsPairSchema,
  monte_carlo: VarEsPairSchema,
});
export type MethodResults = z.infer<typeof MethodResultsSchema>;

export const ConfidenceLevelResultSchema = z.object({
  confidence_level: z.number(),
  methods: MethodResultsSchema,
});
export type ConfidenceLevelResult = z.infer<typeof ConfidenceLevelResultSchema>;

export const TimeSeriesSchema = z
  .object({
    dates: z.array(isoDateSchema),
    values: z.array(z.number()),
  })
  .refine((d) => d.dates.length === d.values.length, {
    message: 'dates and values must be the same length',
  });
export type TimeSeries = z.infer<typeof TimeSeriesSchema>;

export const VolatilityForecastSchema = z.object({
  dates: z.array(isoDateSchema),
  ewma: z.array(z.number()),
  garch: z.array(z.number()),
});
export type VolatilityForecast = z.infer<typeof VolatilityForecastSchema>;

export const BacktestStatsSchema = z.object({
  hits: z.number().int(),
  total_observations: z.number().int(),
  kupiec_lr: z.number(),
  kupiec_p_value: z.number(),
  christoffersen_lr: z.number(),
  christoffersen_p_value: z.number(),
  conditional_coverage_lr: z.number(),
  conditional_coverage_p_value: z.number(),
  traffic_light: TrafficLightSchema,
  breach_dates: z.array(isoDateSchema),
  var_series: TimeSeriesSchema,
});
export type BacktestStats = z.infer<typeof BacktestStatsSchema>;

export const MethodBacktestSchema = z.object({
  historical: BacktestStatsSchema,
  parametric: BacktestStatsSchema,
  ewma: BacktestStatsSchema,
  garch: BacktestStatsSchema,
  monte_carlo: BacktestStatsSchema,
});
export type MethodBacktest = z.infer<typeof MethodBacktestSchema>;

export const DrawdownResultSchema = z.object({
  dates: z.array(isoDateSchema),
  values: z.array(z.number()),
  max_drawdown: z.number(),
});
export type DrawdownResult = z.infer<typeof DrawdownResultSchema>;

export const DiversificationResultSchema = z.object({
  // keyed by ticker symbol, e.g. { AAPL: 12000 } — data, not schema fields
  standalone_vars: z.record(z.string(), z.number()),
  portfolio_var: z.number(),
  diversification_benefit: z.number(),
  diversification_benefit_pct: z.number(),
});
export type DiversificationResult = z.infer<typeof DiversificationResultSchema>;

export const CorrelationMatrixSchema = z
  .object({
    tickers: z.array(z.string()),
    matrix: z.array(z.array(z.number())),
  })
  .refine(
    (d) =>
      d.matrix.length === d.tickers.length &&
      d.matrix.every((row) => row.length === d.tickers.length),
    { message: 'matrix must be square and match tickers length' },
  );
export type CorrelationMatrix = z.infer<typeof CorrelationMatrixSchema>;

export const PortfolioSummarySchema = z.object({
  tickers: z.array(z.string()),
  weights: z.array(z.number()),
  value: z.number(),
  start_date: isoDateSchema,
  end_date: isoDateSchema,
});
export type PortfolioSummary = z.infer<typeof PortfolioSummarySchema>;

export const MarketRiskAnalyzeResponseSchema = z.object({
  portfolio: PortfolioSummarySchema,
  var_comparison: z.array(ConfidenceLevelResultSchema),
  actual_pnl: TimeSeriesSchema,
  volatility_forecast: VolatilityForecastSchema,
  backtest: MethodBacktestSchema,
  drawdown: DrawdownResultSchema,
  diversification: DiversificationResultSchema,
  correlation_matrix: CorrelationMatrixSchema,
});
export type MarketRiskAnalyzeResponse = z.infer<
  typeof MarketRiskAnalyzeResponseSchema
>;

// ---------------------------------------------------------------------------
// tickers endpoint
// ---------------------------------------------------------------------------

export const TickerInfoSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  asset_class: z.enum(['equity', 'fx', 'bond', 'crypto', 'commodity']),
});
export type TickerInfo = z.infer<typeof TickerInfoSchema>;

export const TickerListResponseSchema = z.object({
  tickers: z.array(TickerInfoSchema),
});
export type TickerListResponse = z.infer<typeof TickerListResponseSchema>;

// ---------------------------------------------------------------------------
// stress testing (POST /market-risk/stress-test) — separate from /analyze:
// replays real historical returns, or a hypothetical per-asset-class shock, onto
// today's portfolio value. Not a slice of the backtest above.
// ---------------------------------------------------------------------------

export const StressScenarioModeSchema = z.enum(['historical', 'hypothetical']);
export type StressScenarioMode = z.infer<typeof StressScenarioModeSchema>;

export const StressStatusSchema = z.enum(['ok', 'warning', 'critical']);
export type StressStatus = z.infer<typeof StressStatusSchema>;

export const StressTestRequestSchema = z
  .object({
    tickers: z.array(tickerSchema).min(2).max(10),
    portfolio_value: z.number().positive().default(1_000_000),
    mode: StressScenarioModeSchema,
    window: CrisisWindowPresetSchema.nullable().optional(),
    custom_window: CustomWindowSchema.nullable().optional(),
    shocks: z.record(z.string(), z.number()).nullable().optional(),
  })
  .refine(
    (data) =>
      data.mode !== 'historical' ||
      (data.window != null &&
        (data.window !== 'custom' || data.custom_window != null)),
    {
      message:
        "window is required for mode 'historical' (and custom_window when window is 'custom')",
      path: ['window'],
    },
  )
  .refine((data) => data.mode !== 'hypothetical' || !!data.shocks, {
    message: "shocks is required for mode 'hypothetical'",
    path: ['shocks'],
  });
export type StressTestRequest = z.input<typeof StressTestRequestSchema>;
export type StressTestRequestParsed = z.output<typeof StressTestRequestSchema>;

export const StressTestResultSchema = z.object({
  mode: StressScenarioModeSchema,
  label: z.string(),
  start_date: isoDateSchema.nullable().optional(),
  end_date: isoDateSchema.nullable().optional(),
  total_return_factor: z.number(),
  ending_value: z.number(),
  pnl: z.number(),
  pnl_pct: z.number(),
  status: StressStatusSchema,
  shocks_applied: z.record(z.string(), z.number()).nullable().optional(),
});
export type StressTestResult = z.infer<typeof StressTestResultSchema>;

// ---------------------------------------------------------------------------
// errors
// ---------------------------------------------------------------------------

export const ErrorCodeSchema = z.enum([
  'ticker_not_found',
  'insufficient_history',
  'garch_did_not_converge',
  'validation_error',
]);
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

export const ErrorResponseSchema = z.object({
  code: ErrorCodeSchema,
  message: z.string(),
  details: z.record(z.string(), z.unknown()).nullable().optional(),
});
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

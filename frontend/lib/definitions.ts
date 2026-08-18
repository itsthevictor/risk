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
  [ISSUER_TYPE.COVERED_BOND]: [
    RATING_BAND.AAA_AA,
    RATING_BAND.A, // maps to "ineligible" — see note below
  ],
  [ISSUER_TYPE.CORPORATE_BOND]: [
    RATING_BAND.AAA_AA,
    RATING_BAND.A,
    RATING_BAND.BBB,
    RATING_BAND.BELOW_BBB_MINUS, // maps to "ineligible"
  ],
  [ISSUER_TYPE.RMBS]: [RATING_BAND.AAA_AA],
  // Exempt issuer types (SOVEREIGN_OWN_COUNTRY, CENTRAL_BANK_CASH,
  // MULTILATERAL_DEV_BANK, EQUITY_INDEX_LISTED, EQUITY_OTHER, OTHER)
  // are intentionally omitted — no rating_band select is shown for them.
};

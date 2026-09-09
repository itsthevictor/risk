// review-step.tsx
'use client';

import { useWatch, UseFormReturn } from 'react-hook-form';
import {
  LCRCalculationRequest,
  HQLAItem,
  RetailDepositItem,
  WholesaleDepositItem,
  OffBalanceSheetItem,
  InflowItem,
} from '@/lib/definitions';

export function formatAmount(amount: number) {
  return `${new Intl.NumberFormat('ro-RO', {
    maximumFractionDigits: 2,
  }).format(amount)} mil. RON`;
}

// Maps the raw enum values used across issuer_type/rating_band/category
// fields to their Romanian display labels shown elsewhere in the wizard.
const RO_LABELS: Record<string, string> = {
  // issuer types
  sovereign_own_country: 'Suveran (țara proprie)',
  central_bank_cash: 'Numerar bancă centrală',
  sovereign_foreign: 'Suveran (străin)',
  multilateral_dev_bank: 'Bancă multilaterală de dezvoltare',
  covered_bond: 'Obligațiune garantată',
  corporate_bond: 'Obligațiune corporativă',
  equity_index_listed: 'Acțiuni (index listat)',
  equity_other: 'Acțiuni (altele)',
  rmbs: 'RMBS',
  other: 'Altele',
  // rating bands
  AAA_AA: 'AAA până la AA-',
  A: 'A+ până la A-',
  BBB: 'BBB+ până la BBB-',
  below_BBB_minus: 'Sub BBB-',
  not_rated: 'Fără rating',
  // retail deposit categories
  stable_retail: 'Retail stabil',
  less_stable_retail: 'Retail mai puțin stabil',
  sme: 'IMM',
  // wholesale deposit categories
  operational_deposit: 'Depozit operațional',
  non_operational_corporate: 'Neoperațional (corporativ)',
  non_operational_financial_institution:
    'Neoperațional (instituție financiară)',
  // off-balance-sheet categories
  retail_sme_facility: 'Facilitate retail / IMM',
  corporate_facility: 'Facilitate corporativă',
  bank_fi_facility: 'Facilitate bancă / instituție financiară',
  // inflow categories
  secured_lending_l1_collateral: 'Împrumut garantat (garanție L1)',
  secured_lending_l2a_collateral: 'Împrumut garantat (garanție L2A)',
  retail_sme_loan_repayment: 'Rambursare împrumut retail / IMM',
  corporate_loan_repayment: 'Rambursare împrumut corporativ',
  bank_fi_loan_repayment: 'Rambursare împrumut bancă / instituție financiară',
};

function labelize(value: string) {
  return (
    RO_LABELS[value] ??
    value
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  );
}

function SectionShell({
  title,
  itemCount,
  total,
  children,
}: {
  title: string;
  itemCount: number;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <div className='space-y-3'>
      <div className='flex items-baseline justify-between'>
        <h3 className='text-base font-semibold'>{title}</h3>
        <span className='text-muted-foreground text-sm'>
          {itemCount} {itemCount === 1 ? 'element' : 'elemente'} ·{' '}
          {formatAmount(total)}
        </span>
      </div>
      {itemCount === 0 ? (
        <p className='text-muted-foreground text-sm italic'>
          Niciun element adăugat.
        </p>
      ) : (
        <div className='overflow-hidden rounded-lg border'>
          <table className='w-full text-sm'>{children}</table>
        </div>
      )}
    </div>
  );
}

/**
 * Handles the four item types that share the same shape:
 * { description, amount, category: <enum> }
 */
function CategoryItemsSummary<
  TItem extends { description: string; amount: number; category: string },
>({ title, items }: { title: string; items: TItem[] }): React.ReactNode {
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <SectionShell title={title} itemCount={items.length} total={total}>
      <thead className='bg-muted/40 text-muted-foreground'>
        <tr>
          <th className='px-3 py-2 text-left font-medium'>Descriere</th>
          <th className='px-3 py-2 text-left font-medium'>Categorie</th>
          <th className='px-3 py-2 text-right font-medium'>Sumă</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i} className='border-t'>
            <td className='px-3 py-2'>
              {item.description || (
                <span className='text-muted-foreground italic'>
                  (fără descriere)
                </span>
              )}
            </td>
            <td className='px-3 py-2'>{labelize(item.category)}</td>
            <td className='px-3 py-2 text-right'>
              {formatAmount(item.amount)}
            </td>
          </tr>
        ))}
      </tbody>
    </SectionShell>
  );
}

/**
 * HQLA items have a different, non-uniform shape (issuer_type +
 * optional rating_band instead of a single category), so it gets
 * its own component rather than being forced through the generic one.
 */
function HqlaItemsSummary({ items }: { items: HQLAItem[] }) {
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <SectionShell title='Active HQLA' itemCount={items.length} total={total}>
      <thead className='bg-muted/40 text-muted-foreground'>
        <tr>
          <th className='px-3 py-2 text-left font-medium'>Descriere</th>
          <th className='px-3 py-2 text-left font-medium'>Tip emitent</th>
          <th className='px-3 py-2 text-left font-medium'>Bandă de rating</th>
          <th className='px-3 py-2 text-right font-medium'>Sumă</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i} className='border-t'>
            <td className='px-3 py-2'>
              {item.description || (
                <span className='text-muted-foreground italic'>
                  (fără descriere)
                </span>
              )}
            </td>
            <td className='px-3 py-2'>{labelize(item.issuer_type)}</td>
            <td className='px-3 py-2'>
              {item.rating_band ? labelize(item.rating_band) : '—'}
            </td>
            <td className='px-3 py-2 text-right'>
              {formatAmount(item.amount)}
            </td>
          </tr>
        ))}
      </tbody>
    </SectionShell>
  );
}

export function ReviewStep({
  form,
}: {
  form: UseFormReturn<LCRCalculationRequest>;
}) {
  // Watching each array by its field path (rather than the whole form)
  // gives back the real typed array — HQLAItem[], RetailDepositItem[], etc.
  // — instead of a DeepPartial<LCRCalculationRequest>, so no casts are needed.
  const hqlaItems = useWatch({ control: form.control, name: 'hqla_items' });
  const retailDeposits = useWatch({
    control: form.control,
    name: 'retail_deposits',
  });
  const wholesaleDeposits = useWatch({
    control: form.control,
    name: 'wholesale_deposits',
  });
  const offBalanceSheet = useWatch({
    control: form.control,
    name: 'off_balance_sheet',
  });
  const inflowItems = useWatch({
    control: form.control,
    name: 'inflow_items',
  });

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-lg font-semibold'>Rezultat LCR</h2>
        <p className='text-muted-foreground text-sm'>
          Mai jos regăsiți tabelele cu datele agregate introduse la pașii
          anteriori, rezultatul LCR apare într-un card sub aceste tabele.
        </p>
      </div>

      <HqlaItemsSummary items={hqlaItems} />
      <CategoryItemsSummary<RetailDepositItem>
        title='Depozite retail'
        items={retailDeposits}
      />
      <CategoryItemsSummary<WholesaleDepositItem>
        title='Depozite en-gros'
        items={wholesaleDeposits}
      />
      <CategoryItemsSummary<OffBalanceSheetItem>
        title='Elemente extrabilanțiere'
        items={offBalanceSheet}
      />
      <CategoryItemsSummary<InflowItem>
        title='Intrări de numerar'
        items={inflowItems}
      />
    </div>
  );
}

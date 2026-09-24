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
import { useDictionary, useIntlLocale } from '@/providers/i18n-provider';

// e.g. "1.250,5 mil. RON" (ro) / "1,250.5 RON m" (en)
export function useFormatAmount() {
  const intlLocale = useIntlLocale();
  const { amountUnit } = useDictionary().liquidity;
  return (amount: number) =>
    `${new Intl.NumberFormat(intlLocale, {
      maximumFractionDigits: 2,
    }).format(amount)} ${amountUnit}`;
}

// Display label for a raw issuer_type/rating_band/category enum value.
function useLabelize() {
  const { labels } = useDictionary().liquidity;
  return (value: string) =>
    labels[value] ??
    value
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
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
  const { review } = useDictionary().liquidity;
  const formatAmount = useFormatAmount();

  return (
    <div className='space-y-3'>
      <div className='flex items-baseline justify-between'>
        <h3 className='text-base font-semibold'>{title}</h3>
        <span className='text-muted-foreground text-sm'>
          {itemCount} {itemCount === 1 ? review.itemOne : review.itemMany} ·{' '}
          {formatAmount(total)}
        </span>
      </div>
      {itemCount === 0 ? (
        <p className='text-muted-foreground text-sm italic'>{review.noItems}</p>
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
  const { fields, review } = useDictionary().liquidity;
  const formatAmount = useFormatAmount();
  const labelize = useLabelize();
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <SectionShell title={title} itemCount={items.length} total={total}>
      <thead className='bg-muted/40 text-muted-foreground'>
        <tr>
          <th className='px-3 py-2 text-left font-medium'>
            {fields.description}
          </th>
          <th className='px-3 py-2 text-left font-medium'>{fields.category}</th>
          <th className='px-3 py-2 text-right font-medium'>{fields.amount}</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i} className='border-t'>
            <td className='px-3 py-2'>
              {item.description || (
                <span className='text-muted-foreground italic'>
                  {review.noDescription}
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
  const { fields, review } = useDictionary().liquidity;
  const formatAmount = useFormatAmount();
  const labelize = useLabelize();
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <SectionShell
      title={review.hqlaAssets}
      itemCount={items.length}
      total={total}
    >
      <thead className='bg-muted/40 text-muted-foreground'>
        <tr>
          <th className='px-3 py-2 text-left font-medium'>
            {fields.description}
          </th>
          <th className='px-3 py-2 text-left font-medium'>
            {fields.issuerType}
          </th>
          <th className='px-3 py-2 text-left font-medium'>
            {fields.ratingBand}
          </th>
          <th className='px-3 py-2 text-right font-medium'>{fields.amount}</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i} className='border-t'>
            <td className='px-3 py-2'>
              {item.description || (
                <span className='text-muted-foreground italic'>
                  {review.noDescription}
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
  const { review, steps } = useDictionary().liquidity;

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-lg font-semibold'>{review.title}</h2>
        <p className='text-muted-foreground text-sm'>{review.description}</p>
      </div>

      <HqlaItemsSummary items={hqlaItems} />
      <CategoryItemsSummary<RetailDepositItem>
        title={steps.retail.title}
        items={retailDeposits}
      />
      <CategoryItemsSummary<WholesaleDepositItem>
        title={steps.wholesale.title}
        items={wholesaleDeposits}
      />
      <CategoryItemsSummary<OffBalanceSheetItem>
        title={review.offBalanceSheetItems}
        items={offBalanceSheet}
      />
      <CategoryItemsSummary<InflowItem>
        title={steps.inflows.title}
        items={inflowItems}
      />
    </div>
  );
}

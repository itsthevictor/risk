// off-balance-sheet-step.tsx
'use client';

import { useFieldArray, Control, UseFormReturn } from 'react-hook-form';
import {
  LCRCalculationRequest,
  OFF_BALANCE_SHEET_CATEGORY,
} from '@/lib/definitions';
import {
  CustomFormField,
  CustomNumberField,
  CustomFormSelectLabel,
} from '@/components/forms/form-components';

import { Button } from '@/components/ui/button';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import { useDictionary } from '@/providers/i18n-provider';
import { fmt } from '@/lib/i18n/config';

const OFF_BALANCE_SHEET_CATEGORIES = [
  OFF_BALANCE_SHEET_CATEGORY.RETAIL_SME_FACILITY,
  OFF_BALANCE_SHEET_CATEGORY.CORPORATE_FACILITY,
  OFF_BALANCE_SHEET_CATEGORY.BANK_FI_FACILITY,
];

const emptyOffBalanceSheetItem: LCRCalculationRequest['off_balance_sheet'][number] =
  {
    description: '',
    amount: 0,
    category: OFF_BALANCE_SHEET_CATEGORY.RETAIL_SME_FACILITY,
  };

function OffBalanceSheetRow({
  control,
  index,
  onRemove,
}: {
  control: Control<LCRCalculationRequest>;
  index: number;
  onRemove: () => void;
}) {
  const { fields, labels } = useDictionary().liquidity;
  const categoryOptions = OFF_BALANCE_SHEET_CATEGORIES.map((value) => ({
    value,
    label: labels[value],
  }));
  return (
    <div className='bg-sidebar/40 relative grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-2 lg:grid-cols-3'>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='absolute top-2 right-2 h-7 w-7'
        onClick={onRemove}
        aria-label={fmt(fields.removeItem, { n: index + 1 })}
      >
        <IconTrash className='h-4 w-4' />
      </Button>

      <div className='md:col-span-2 lg:col-span-1'>
        <CustomFormField
          control={control}
          name={`off_balance_sheet.${index}.description`}
          labelText={fields.description}
        />
      </div>

      <CustomNumberField
        control={control}
        name={`off_balance_sheet.${index}.amount`}
        labelText={fields.amount}
      />

      <CustomFormSelectLabel
        control={control}
        name={`off_balance_sheet.${index}.category`}
        labelText={fields.category}
        items={categoryOptions}
      />
    </div>
  );
}

export function OffBalanceSheetStep({
  form,
}: {
  form: UseFormReturn<LCRCalculationRequest>;
}) {
  const { fields: t, steps } = useDictionary().liquidity;
  const { control } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'off_balance_sheet',
  });

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-lg font-semibold'>{steps.offBalanceSheet.title}</h2>
        <p className='text-muted-foreground text-sm'>
          {steps.offBalanceSheet.description}
        </p>
      </div>

      {fields.length === 0 && (
        <p className='text-muted-foreground text-sm italic'>
          {steps.offBalanceSheet.empty}
        </p>
      )}

      <div className='space-y-4'>
        {fields.map((field, index) => (
          <OffBalanceSheetRow
            key={field.id}
            control={control}
            index={index}
            onRemove={() => remove(index)}
          />
        ))}
      </div>

      <Button
        type='button'
        variant='outline'
        onClick={() => append(emptyOffBalanceSheetItem)}
        className='gap-1'
      >
        <IconPlus className='h-4 w-4' />
        {t.addItem}
      </Button>
    </div>
  );
}

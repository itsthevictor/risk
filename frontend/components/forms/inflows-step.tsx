// inflows-step.tsx
'use client';

import { useFieldArray, Control, UseFormReturn } from 'react-hook-form';
import { LCRCalculationRequest, INFLOW_ITEM_CATEGORY } from '@/lib/definitions';
import {
  CustomFormField,
  CustomNumberField,
  CustomFormSelectLabel,
  SelectOption,
} from '@/components/forms/form-components';
import { Button } from '@/components/ui/button';
import { IconTrash, IconPlus } from '@tabler/icons-react';

const INFLOW_CATEGORY_OPTIONS: SelectOption[] = [
  {
    value: INFLOW_ITEM_CATEGORY.SECURED_LENDING_L1_COLLATERAL,
    label: 'Secured lending (L1 collateral)',
  },
  {
    value: INFLOW_ITEM_CATEGORY.SECURED_LENDING_L2A_COLLATERAL,
    label: 'Secured lending (L2A collateral)',
  },
  {
    value: INFLOW_ITEM_CATEGORY.RETAIL_SME_LOAN_REPAYMENT,
    label: 'Retail / SME loan repayment',
  },
  {
    value: INFLOW_ITEM_CATEGORY.CORPORATE_LOAN_REPAYMENT,
    label: 'Corporate loan repayment',
  },
  {
    value: INFLOW_ITEM_CATEGORY.BANK_FI_LOAN_REPAYMENT,
    label: 'Bank / financial institution loan repayment',
  },
];

const emptyInflowItem: LCRCalculationRequest['inflow_items'][number] = {
  description: '',
  amount: 0,
  category: INFLOW_ITEM_CATEGORY.RETAIL_SME_LOAN_REPAYMENT,
};

function InflowItemRow({
  control,
  index,
  onRemove,
}: {
  control: Control<LCRCalculationRequest>;
  index: number;
  onRemove: () => void;
}) {
  return (
    <div className='bg-sidebar/40 relative grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-2 lg:grid-cols-3'>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='absolute top-2 right-2 h-7 w-7'
        onClick={onRemove}
        aria-label={`Remove item ${index + 1}`}
      >
        <IconTrash className='h-4 w-4' />
      </Button>

      <div className='md:col-span-2 lg:col-span-1'>
        <CustomFormField
          control={control}
          name={`inflow_items.${index}.description`}
          labelText='Description'
        />
      </div>

      <CustomNumberField
        control={control}
        name={`inflow_items.${index}.amount`}
        labelText='Amount'
      />

      <CustomFormSelectLabel
        control={control}
        name={`inflow_items.${index}.category`}
        labelText='Category'
        items={INFLOW_CATEGORY_OPTIONS}
      />
    </div>
  );
}

export function InflowsStep({
  form,
}: {
  form: UseFormReturn<LCRCalculationRequest>;
}) {
  const { control } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'inflow_items',
  });

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-lg font-semibold'>Inflow items</h2>
        <p className='text-muted-foreground text-sm'>
          Add each contractual inflow item and its category.
        </p>
      </div>

      {fields.length === 0 && (
        <p className='text-muted-foreground text-sm italic'>
          No inflow items yet. Add one to get started.
        </p>
      )}

      <div className='space-y-4'>
        {fields.map((field, index) => (
          <InflowItemRow
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
        onClick={() => append(emptyInflowItem)}
        className='gap-1'
      >
        <IconPlus className='h-4 w-4' />
        Add item
      </Button>
    </div>
  );
}

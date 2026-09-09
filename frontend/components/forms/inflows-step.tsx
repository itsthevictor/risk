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
    label: 'Împrumut garantat (garanție L1)',
  },
  {
    value: INFLOW_ITEM_CATEGORY.SECURED_LENDING_L2A_COLLATERAL,
    label: 'Împrumut garantat (garanție L2A)',
  },
  {
    value: INFLOW_ITEM_CATEGORY.RETAIL_SME_LOAN_REPAYMENT,
    label: 'Rambursare împrumut retail / IMM',
  },
  {
    value: INFLOW_ITEM_CATEGORY.CORPORATE_LOAN_REPAYMENT,
    label: 'Rambursare împrumut corporativ',
  },
  {
    value: INFLOW_ITEM_CATEGORY.BANK_FI_LOAN_REPAYMENT,
    label: 'Rambursare împrumut bancă / instituție financiară',
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
        aria-label={`Elimină elementul ${index + 1}`}
      >
        <IconTrash className='h-4 w-4' />
      </Button>

      <div className='md:col-span-2 lg:col-span-1'>
        <CustomFormField
          control={control}
          name={`inflow_items.${index}.description`}
          labelText='Descriere'
        />
      </div>

      <CustomNumberField
        control={control}
        name={`inflow_items.${index}.amount`}
        labelText='Sumă'
      />

      <CustomFormSelectLabel
        control={control}
        name={`inflow_items.${index}.category`}
        labelText='Categorie'
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
        <h2 className='text-lg font-semibold'>Intrări de numerar</h2>
        <p className='text-muted-foreground text-sm'>
          Adăugați fiecare intrare contractuală de numerar și categoria
          acesteia.
        </p>
      </div>

      {fields.length === 0 && (
        <p className='text-muted-foreground text-sm italic'>
          Nicio intrare de numerar adăugată încă. Adăugați una pentru a
          începe.
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
        Adaugă element
      </Button>
    </div>
  );
}

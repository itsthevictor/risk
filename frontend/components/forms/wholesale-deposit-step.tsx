// wholesale-deposits-step.tsx
'use client';

import { useFieldArray, Control, UseFormReturn } from 'react-hook-form';
import {
  LCRCalculationRequest,
  WHOLESALE_DEPOSIT_CATEGORY,
} from '@/lib/definitions';
import {
  CustomFormField,
  CustomNumberField,
  CustomFormSelectLabel,
  SelectOption,
} from '@/components/forms/form-components';
import { Button } from '@/components/ui/button';
import { IconTrash, IconPlus } from '@tabler/icons-react';

const WHOLESALE_CATEGORY_OPTIONS: SelectOption[] = [
  {
    value: WHOLESALE_DEPOSIT_CATEGORY.OPERATIONAL_DEPOSIT,
    label: 'Depozit operațional',
  },
  {
    value: WHOLESALE_DEPOSIT_CATEGORY.NON_OPERATIONAL_CORPORATE,
    label: 'Neoperațional (corporativ)',
  },
  {
    value: WHOLESALE_DEPOSIT_CATEGORY.NON_OPERATIONAL_FINANCIAL_INSTITUTION,
    label: 'Neoperațional (instituție financiară)',
  },
];

const emptyWholesaleItem: LCRCalculationRequest['wholesale_deposits'][number] =
  {
    description: '',
    amount: 0,
    category: WHOLESALE_DEPOSIT_CATEGORY.OPERATIONAL_DEPOSIT,
  };

function WholesaleDepositRow({
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
          name={`wholesale_deposits.${index}.description`}
          labelText='Descriere'
        />
      </div>

      <CustomNumberField
        control={control}
        name={`wholesale_deposits.${index}.amount`}
        labelText='Sumă'
      />

      <CustomFormSelectLabel
        control={control}
        name={`wholesale_deposits.${index}.category`}
        labelText='Categorie'
        items={WHOLESALE_CATEGORY_OPTIONS}
      />
    </div>
  );
}

export function WholesaleDepositsStep({
  form,
}: {
  form: UseFormReturn<LCRCalculationRequest>;
}) {
  const { control } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'wholesale_deposits',
  });

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-lg font-semibold'>Depozite en-gros</h2>
        <p className='text-muted-foreground text-sm'>
          Adăugați fiecare depozit en-gros și categoria acestuia.
        </p>
      </div>

      {fields.length === 0 && (
        <p className='text-muted-foreground text-sm italic'>
          Niciun depozit en-gros adăugat încă. Adăugați unul pentru a începe.
        </p>
      )}

      <div className='space-y-4'>
        {fields.map((field, index) => (
          <WholesaleDepositRow
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
        onClick={() => append(emptyWholesaleItem)}
        className='gap-1'
      >
        <IconPlus className='h-4 w-4' />
        Adaugă element
      </Button>
    </div>
  );
}

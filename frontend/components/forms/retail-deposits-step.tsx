'use client';

import { useFieldArray, Control, UseFormReturn } from 'react-hook-form';
import {
  LCRCalculationRequest,
  RETAIL_DEPOSIT_CATEGORY,
} from '@/lib/definitions';
import {
  CustomFormField,
  CustomNumberField,
  CustomFormSelectLabel,
  SelectOption,
} from '@/components/forms/form-components';
import { Button } from '@/components/ui/button';
import { IconTrash, IconPlus } from '@tabler/icons-react';

const RETAIL_CATEGORY_OPTIONS: SelectOption[] = [
  { value: RETAIL_DEPOSIT_CATEGORY.STABLE_RETAIL, label: 'Retail stabil' },
  {
    value: RETAIL_DEPOSIT_CATEGORY.LESS_STABLE_RETAIL,
    label: 'Retail mai puțin stabil',
  },
  { value: RETAIL_DEPOSIT_CATEGORY.SME, label: 'IMM' },
];

const emptyRetailItem: LCRCalculationRequest['retail_deposits'][number] = {
  description: '',
  amount: 0,
  category: RETAIL_DEPOSIT_CATEGORY.STABLE_RETAIL,
};

function RetailDepositRow({
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
          name={`retail_deposits.${index}.description`}
          labelText='Descriere'
        />
      </div>

      <CustomNumberField
        control={control}
        name={`retail_deposits.${index}.amount`}
        labelText='Sumă'
      />

      <CustomFormSelectLabel
        control={control}
        name={`retail_deposits.${index}.category`}
        labelText='Categorie'
        items={RETAIL_CATEGORY_OPTIONS}
      />
    </div>
  );
}

export function RetailDepositsStep({
  form,
}: {
  form: UseFormReturn<LCRCalculationRequest>;
}) {
  const { control } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'retail_deposits',
  });

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-lg font-semibold'>Depozite retail</h2>
        <p className='text-muted-foreground text-sm'>
          Adăugați fiecare depozit retail sau IMM și categoria acestuia.
        </p>
      </div>

      {fields.length === 0 && (
        <p className='text-muted-foreground text-sm italic'>
          Niciun depozit retail adăugat încă. Adăugați unul pentru a începe.
        </p>
      )}

      <div className='space-y-4'>
        {fields.map((field, index) => (
          <RetailDepositRow
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
        onClick={() => append(emptyRetailItem)}
        className='gap-1'
      >
        <IconPlus className='h-4 w-4' />
        Adaugă element
      </Button>
    </div>
  );
}

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
  SelectOption,
} from '@/components/forms/form-components';

import { Button } from '@/components/ui/button';
import { IconTrash, IconPlus } from '@tabler/icons-react';

const OFF_BALANCE_SHEET_CATEGORY_OPTIONS: SelectOption[] = [
  {
    value: OFF_BALANCE_SHEET_CATEGORY.RETAIL_SME_FACILITY,
    label: 'Facilitate retail / IMM',
  },
  {
    value: OFF_BALANCE_SHEET_CATEGORY.CORPORATE_FACILITY,
    label: 'Facilitate corporativă',
  },
  {
    value: OFF_BALANCE_SHEET_CATEGORY.BANK_FI_FACILITY,
    label: 'Facilitate bancă / instituție financiară',
  },
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
          name={`off_balance_sheet.${index}.description`}
          labelText='Descriere'
        />
      </div>

      <CustomNumberField
        control={control}
        name={`off_balance_sheet.${index}.amount`}
        labelText='Sumă'
      />

      <CustomFormSelectLabel
        control={control}
        name={`off_balance_sheet.${index}.category`}
        labelText='Categorie'
        items={OFF_BALANCE_SHEET_CATEGORY_OPTIONS}
      />
    </div>
  );
}

export function OffBalanceSheetStep({
  form,
}: {
  form: UseFormReturn<LCRCalculationRequest>;
}) {
  const { control } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'off_balance_sheet',
  });

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-lg font-semibold'>Elemente extrabilanțiere</h2>
        <p className='text-muted-foreground text-sm'>
          Adăugați fiecare angajament sau facilitate extrabilanțieră și
          categoria acesteia.
        </p>
      </div>

      {fields.length === 0 && (
        <p className='text-muted-foreground text-sm italic'>
          Niciun element extrabilanțier adăugat încă. Adăugați unul pentru a
          începe.
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
        Adaugă element
      </Button>
    </div>
  );
}

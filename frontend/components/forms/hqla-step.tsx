'use client';

import { useEffect } from 'react';
import {
  useFieldArray,
  useWatch,
  Control,
  UseFormReturn,
} from 'react-hook-form';
import {
  LCRCalculationRequest,
  ISSUER_TYPE,
  RATING_BAND,
  HQLA_ALLOWED_RATING_BANDS,
} from '@/lib/definitions';
import {
  CustomFormField,
  CustomNumberField,
  CustomFormSelectLabel,
  SelectOption,
} from '@/components/forms/form-components';
import { Button } from '@/components/ui/button';
import { IconTrash, IconPlus } from '@tabler/icons-react';

const RATING_EXEMPT_ISSUER_TYPES = new Set<ISSUER_TYPE>([
  ISSUER_TYPE.SOVEREIGN_OWN_COUNTRY,
  ISSUER_TYPE.CENTRAL_BANK_CASH,
]);

const ISSUER_TYPE_OPTIONS: SelectOption[] = [
  {
    value: ISSUER_TYPE.SOVEREIGN_OWN_COUNTRY,
    label: 'Suveran (țara proprie)',
  },
  { value: ISSUER_TYPE.CENTRAL_BANK_CASH, label: 'Numerar bancă centrală' },
  { value: ISSUER_TYPE.SOVEREIGN_FOREIGN, label: 'Suveran (străin)' },
  {
    value: ISSUER_TYPE.MULTILATERAL_DEV_BANK,
    label: 'Bancă multilaterală de dezvoltare',
  },
  { value: ISSUER_TYPE.COVERED_BOND, label: 'Obligațiune garantată' },
  { value: ISSUER_TYPE.CORPORATE_BOND, label: 'Obligațiune corporativă' },
  { value: ISSUER_TYPE.EQUITY_INDEX_LISTED, label: 'Acțiuni (index listat)' },
  { value: ISSUER_TYPE.EQUITY_OTHER, label: 'Acțiuni (altele)' },
  { value: ISSUER_TYPE.RMBS, label: 'RMBS' },
  { value: ISSUER_TYPE.OTHER, label: 'Altele' },
];

const RATING_BAND_OPTIONS: SelectOption[] = [
  { value: RATING_BAND.AAA_AA, label: 'AAA până la AA-' },
  { value: RATING_BAND.A, label: 'A+ până la A-' },
  { value: RATING_BAND.BBB, label: 'BBB+ până la BBB-' },
  { value: RATING_BAND.BELOW_BBB_MINUS, label: 'Sub BBB-' },
  { value: RATING_BAND.NOT_RATED, label: 'Fără rating' },
];

const emptyHqlaItem: LCRCalculationRequest['hqla_items'][number] = {
  description: '',
  amount: 0,
  issuer_type: ISSUER_TYPE.SOVEREIGN_OWN_COUNTRY,
  rating_band: undefined,
};

function HqlaItemRow({
  control,
  index,
  onRemove,
  trigger,
  setValue,
  getValues,
}: {
  control: Control<LCRCalculationRequest>;
  index: number;
  onRemove: () => void;
  trigger: UseFormReturn<LCRCalculationRequest>['trigger'];
  setValue: UseFormReturn<LCRCalculationRequest>['setValue'];
  getValues: UseFormReturn<LCRCalculationRequest>['getValues'];
}) {
  const issuerType = useWatch({
    control,
    name: `hqla_items.${index}.issuer_type`,
  });
  const ratingExempt = RATING_EXEMPT_ISSUER_TYPES.has(issuerType);

  const allowedRatingBands = HQLA_ALLOWED_RATING_BANDS[issuerType] ?? [];
  const filteredRatingBandOptions = RATING_BAND_OPTIONS.filter((opt) =>
    allowedRatingBands.includes(opt.value as RATING_BAND),
  );

  // Keep rating_band in sync with issuer_type: clear it when the new
  // issuer type is exempt, and re-run validation on it either way so
  // a stale "required" error doesn't linger after switching to exempt,
  // and a missing rating_band is caught immediately after switching away.
  useEffect(() => {
    if (ratingExempt) {
      setValue(`hqla_items.${index}.rating_band`, undefined, {
        shouldValidate: true,
      });
    } else {
      const currentRatingBand = getValues(`hqla_items.${index}.rating_band`);
      const stillValid = allowedRatingBands.includes(
        currentRatingBand as RATING_BAND,
      );
      if (!stillValid) {
        setValue(`hqla_items.${index}.rating_band`, undefined, {
          shouldValidate: true,
        });
      } else {
        trigger(`hqla_items.${index}.rating_band`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratingExempt, issuerType, index]);

  return (
    <div className='bg-sidebar/40 relative grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-2 lg:grid-cols-4'>
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

      <div className='md:col-span-2 lg:col-span-4'>
        <CustomFormField
          control={control}
          name={`hqla_items.${index}.description`}
          labelText='Descriere'
        />
      </div>

      <CustomNumberField
        control={control}
        name={`hqla_items.${index}.amount`}
        labelText='Sumă'
      />

      <CustomFormSelectLabel
        control={control}
        name={`hqla_items.${index}.issuer_type`}
        labelText='Tip emitent'
        items={ISSUER_TYPE_OPTIONS}
      />

      {ratingExempt ? (
        <div className='flex flex-col justify-end pb-2'>
          <p className='text-muted-foreground text-xs'>
            Banda de rating nu este necesară pentru acest tip de emitent.
          </p>
        </div>
      ) : (
        <CustomFormSelectLabel
          control={control}
          name={`hqla_items.${index}.rating_band`}
          labelText='Bandă de rating'
          items={filteredRatingBandOptions}
        />
      )}
    </div>
  );
}

export function HqlaStep({
  form,
}: {
  form: UseFormReturn<LCRCalculationRequest>;
}) {
  const { control, trigger, setValue, getValues } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'hqla_items',
  });

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-lg font-semibold'>
          Active lichide de calitate ridicată (HQLA)
        </h2>
        <p className='text-muted-foreground text-sm'>
          Adăugați fiecare activ lichid de calitate ridicată, tipul
          emitentului și, unde este necesar, banda de rating de credit.
        </p>
      </div>

      {fields.length === 0 && (
        <p className='text-muted-foreground text-sm italic'>
          Niciun activ HQLA adăugat încă. Adăugați unul pentru a începe.
        </p>
      )}

      <div className='space-y-4'>
        {fields.map((field, index) => (
          <HqlaItemRow
            key={field.id}
            control={control}
            index={index}
            onRemove={() => remove(index)}
            trigger={trigger}
            setValue={setValue}
            getValues={getValues}
          />
        ))}
      </div>

      <Button
        type='button'
        variant='outline'
        onClick={() => append(emptyHqlaItem)}
        className='gap-1'
      >
        <IconPlus className='h-4 w-4' />
        Adaugă element
      </Button>
    </div>
  );
}

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
  RATING_EXEMPT_ISSUER_TYPES,
  HQLA_ALLOWED_RATING_BANDS,
} from '@/lib/definitions';
import {
  CustomFormField,
  CustomNumberField,
  CustomFormSelectLabel,
  SelectOption,
} from '@/components/forms/form-components';
import { Button } from '@/components/ui/button';
import InfoDrawer from '@/components/custom/info-drawer';
import { IconTrash, IconPlus } from '@tabler/icons-react';

const RATING_EXEMPT_ISSUER_TYPES_SET = new Set<string>(
  Object.values(RATING_EXEMPT_ISSUER_TYPES),
);

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
  const ratingExempt = RATING_EXEMPT_ISSUER_TYPES_SET.has(issuerType);

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
    <div className='bg-sidebar/40 flex flex-col gap-4 rounded-lg border p-4'>
      <div className='flex items-end gap-2'>
        <div className='flex-1'>
          <CustomFormField
            control={control}
            name={`hqla_items.${index}.description`}
            labelText='Denumire'
          />
        </div>

        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='h-9 w-9 shrink-0 hover:text-destructive text-muted-foreground'
          onClick={onRemove}
          aria-label={`Elimină elementul ${index + 1}`}
        >
          <IconTrash className='h-4 w-4 ' />
        </Button>
      </div>

      <div className='grid grid-cols-1 items-start gap-4 md:grid-cols-3'>
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
          <div className='flex items-start gap-1'>
            <div className='flex-1'>
              <CustomFormSelectLabel
                control={control}
                name={`hqla_items.${index}.rating_band`}
                labelText='Bandă de rating'
                items={filteredRatingBandOptions}
              />
            </div>
            <InfoDrawer
              title='Bandă de rating'
              definition={
                "În practică, banda de rating se derivă din rating-ul emis de agenții precum S&P, Moody's sau Fitch, mapat conform tabelelor ESMA/EBA. Pentru simplitate, acest formular permite selectarea directă a benzii — logica de mapare rating→CQS este un proces separat de clasificare a activelor, nu face parte din calculul LCR propriu-zis."
              }
              implementation={[
                'Nu este implementată preluarea rating-ului brut de la agențiile de rating și maparea sa automată la Credit Quality Steps (CQS).',
                'Complexitatea suplimentară (surse de rating, reguli de agregare, mapări ESMA/EBA) depășește scopul acestui proiect.',
              ]}
              triggerClassName='mb-2'
            />
          </div>
        )}
      </div>
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
          Adăugați fiecare activ lichid de calitate ridicată, tipul emitentului
          și, unde este necesar, banda de rating de credit.
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

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
} from '@/components/forms/form-components';
import { Button } from '@/components/ui/button';
import InfoDrawer from '@/components/custom/info-drawer';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import { useDictionary } from '@/providers/i18n-provider';
import { fmt } from '@/lib/i18n/config';

const RATING_EXEMPT_ISSUER_TYPES_SET = new Set<string>(
  Object.values(RATING_EXEMPT_ISSUER_TYPES),
);

const ISSUER_TYPES = [
  ISSUER_TYPE.SOVEREIGN_OWN_COUNTRY,
  ISSUER_TYPE.CENTRAL_BANK_CASH,
  ISSUER_TYPE.SOVEREIGN_FOREIGN,
  ISSUER_TYPE.MULTILATERAL_DEV_BANK,
  ISSUER_TYPE.COVERED_BOND,
  ISSUER_TYPE.CORPORATE_BOND,
  ISSUER_TYPE.EQUITY_INDEX_LISTED,
  ISSUER_TYPE.EQUITY_OTHER,
  ISSUER_TYPE.RMBS,
  ISSUER_TYPE.OTHER,
];

const RATING_BANDS = [
  RATING_BAND.AAA_AA,
  RATING_BAND.A,
  RATING_BAND.BBB,
  RATING_BAND.BELOW_BBB_MINUS,
  RATING_BAND.NOT_RATED,
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

  const { fields, labels, ratingBand } = useDictionary().liquidity;
  const issuerTypeOptions = ISSUER_TYPES.map((value) => ({
    value,
    label: labels[value],
  }));
  const allowedRatingBands = HQLA_ALLOWED_RATING_BANDS[issuerType] ?? [];
  const filteredRatingBandOptions = RATING_BANDS.filter((value) =>
    allowedRatingBands.includes(value),
  ).map((value) => ({ value, label: labels[value] }));

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
            labelText={fields.name}
          />
        </div>

        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='h-9 w-9 shrink-0 hover:text-destructive text-muted-foreground'
          onClick={onRemove}
          aria-label={fmt(fields.removeItem, { n: index + 1 })}
        >
          <IconTrash className='h-4 w-4 ' />
        </Button>
      </div>

      <div className='grid grid-cols-1 items-start gap-4 md:grid-cols-3'>
        <CustomNumberField
          control={control}
          name={`hqla_items.${index}.amount`}
          labelText={fields.amount}
        />

        <CustomFormSelectLabel
          control={control}
          name={`hqla_items.${index}.issuer_type`}
          labelText={fields.issuerType}
          items={issuerTypeOptions}
        />

        {ratingExempt ? (
          <div className='flex flex-col justify-end pb-2'>
            <p className='text-muted-foreground text-xs'>
              {ratingBand.notRequired}
            </p>
          </div>
        ) : (
          <div className='flex items-start gap-1'>
            <div className='flex-1'>
              <CustomFormSelectLabel
                control={control}
                name={`hqla_items.${index}.rating_band`}
                labelText={fields.ratingBand}
                items={filteredRatingBandOptions}
              />
            </div>
            <InfoDrawer
              title={fields.ratingBand}
              definition={ratingBand.infoDefinition}
              implementation={ratingBand.infoSteps}
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
  const { fields: t, steps } = useDictionary().liquidity;
  const { control, trigger, setValue, getValues } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'hqla_items',
  });

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-lg font-semibold'>{steps.hqla.title}</h2>
        <p className='text-muted-foreground text-sm'>
          {steps.hqla.description}
        </p>
      </div>

      {fields.length === 0 && (
        <p className='text-muted-foreground text-sm italic'>
          {steps.hqla.empty}
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
        {t.addItem}
      </Button>
    </div>
  );
}

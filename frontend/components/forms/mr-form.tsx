'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  CustomIncrementalFormField,
  CustomNumberField,
  CustomMultiSelectField,
  type MultiSelectOption,
} from '@/components/forms/form-components';

import {
  MarketRiskAnalyzeRequestSchema,
  type MarketRiskAnalyzeRequest,
  type MarketRiskAnalyzeRequestParsed,
} from '@/lib/definitions';
import { IconInfoOctagon } from '@tabler/icons-react';

export interface MarketRiskFormProps {
  tickerOptions: MultiSelectOption[];
  isSubmitting?: boolean;
  hasResult?: boolean;
  onSubmit: (values: MarketRiskAnalyzeRequestParsed) => void;
  onReset?: () => void;
}

export function MarketRiskForm({
  tickerOptions,
  isSubmitting,
  hasResult,
  onSubmit,
  onReset,
}: MarketRiskFormProps) {
  const form = useForm<MarketRiskAnalyzeRequest>({
    resolver: zodResolver(MarketRiskAnalyzeRequestSchema),
    defaultValues: {
      tickers: [],
      portfolio_value: 1_000_000,
      estimation_window_days: 252,
    },
  });

  const handleSubmit = form.handleSubmit(
    (values) => {
      onSubmit(values as unknown as MarketRiskAnalyzeRequestParsed);
    },
    (errors) => {
      console.error('[market-risk] form validation failed', errors);
    },
  );

  const handleReset = () => {
    form.reset();
    onReset?.();
  };

  return (
    <Form {...form}>
      <div className='flex flex-col w-full gap-y-4'>
        {!hasResult && !isSubmitting && (
          <div className='text-foreground mb-4 text-sm p-4 bg-accent flex flex-row items-center justify-start gap-4'>
            <IconInfoOctagon />
            <p>
              Pentru a iniția analiza selectează activele, valoarea
              portofoliului și durata ferestrei de estimare. Pentru simplitate,
              portofoliul va fi calculat cu ponderi egale pentru fiecare activ
              selectat.
            </p>
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className='grid grid-cols-2 gap-4 md:grid-cols-4 md:items-start'
        >
          <div className='col-span-2'>
            <CustomMultiSelectField
              name='tickers'
              control={form.control}
              options={tickerOptions}
              labelText='Tickere'
              min={2}
              max={10}
            />
          </div>

          <CustomNumberField
            name='portfolio_value'
            control={form.control}
            labelText='Valoarea portofoliului'
            currency='USD'
          />
          <CustomIncrementalFormField
            name='estimation_window_days'
            control={form.control}
            labelText='Fereastra de estimare (zile)'
            step={21}
            min={30}
            max={756}
          />
          <div className='col-span-2 flex items-end justify-end gap-2 md:col-span-4'>
            {hasResult && (
              <Button
                type='button'
                variant='outline'
                onClick={handleReset}
                data-umami-event='mr-form-reset-click'
              >
                Reia de la început
              </Button>
            )}
            <Button
              type='submit'
              disabled={
                isSubmitting || (hasResult && !form.formState.isDirty)
              }
              data-umami-event='mr-form-click'
              className='w-40'
            >
              {isSubmitting ? 'Se analizează…' : 'Analizează'}
            </Button>
          </div>
        </form>
      </div>
    </Form>
  );
}

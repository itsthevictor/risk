'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  CustomFormSelect,
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

export interface MarketRiskFormProps {
  tickerOptions: MultiSelectOption[];
  isSubmitting?: boolean;
  onSubmit: (values: MarketRiskAnalyzeRequestParsed) => void;
}

export function MarketRiskForm({
  tickerOptions,
  isSubmitting,
  onSubmit,
}: MarketRiskFormProps) {
  const form = useForm<MarketRiskAnalyzeRequest>({
    resolver: zodResolver(MarketRiskAnalyzeRequestSchema),
    defaultValues: {
      tickers: [],
      portfolio_value: 1_000_000,
      crisis_window: '2022',
      estimation_window_days: 252,
    },
  });

  // zodResolver ruleaza mai întâi validarea schema-ului și apoi transformările sale (.transform()), deci valorile runtime aici sunt deja MarketRiskAnalyzeRequestParsed.
  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values as unknown as MarketRiskAnalyzeRequestParsed);
  });

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit}
        className='grid grid-cols-2 gap-4 md:grid-cols-4'
      >
        <div className='col-span-2'>
          <CustomMultiSelectField
            name='tickers'
            control={form.control}
            options={tickerOptions}
            labelText='Tickers'
            min={2}
            max={10}
          />
        </div>
        <CustomFormSelect
          name='crisis_window'
          control={form.control}
          items={['2020', '2022', 'custom']}
          labelText='Crisis window'
        />
        <CustomNumberField
          name='portfolio_value'
          control={form.control}
          labelText='Portfolio value'
          currency='USD'
        />
        <CustomIncrementalFormField
          name='estimation_window_days'
          control={form.control}
          labelText='Estimation window (days)'
          step={21}
          min={30}
          max={756}
        />
        <div className='col-span-2 flex items-end md:col-span-4'>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Analyzing…' : 'Analyze'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

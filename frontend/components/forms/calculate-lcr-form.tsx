'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import {
  LCRCalculationRequestSchema,
  LCRCalculationRequest,
} from '@/lib/definitions';
import { useCalculateLCR } from '@/hooks/use-calculate-lcr';
import { Form } from '@/components/ui/form';
import { HqlaStep } from './hqla-step';
import { RetailDepositsStep } from './retail-deposits-step';
import { OffBalanceSheetStep } from './off-balance-sheet-step';
import { WholesaleDepositsStep } from './wholesale-deposit-step';
import { InflowsStep } from './inflows-step';
import { cn } from '@/lib/utils';
import { ReviewStep } from './review-step';
import { Button } from '@/components/ui/button';
const STEPS = [
  'hqla',
  'retail',
  'wholesale',
  'off-balance-sheet',
  'inflows',
  'review',
] as const;

const emptyDefaults: LCRCalculationRequest = {
  hqla_items: [],
  retail_deposits: [],
  wholesale_deposits: [],
  off_balance_sheet: [],
  inflow_items: [],
};

export default function CalculateLcrForm() {
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<LCRCalculationRequest>({
    resolver: zodResolver(LCRCalculationRequestSchema),
    defaultValues: getInitialValues(), // reads from sessionStorage if present, else the empty defaults
  });

  function getInitialValues(): LCRCalculationRequest {
    if (typeof window === 'undefined') {
      // sessionStorage doesn't exist during server-side rendering
      return emptyDefaults;
    }
    const saved = sessionStorage.getItem('lcr-wizard-draft');
    if (saved) {
      try {
        return LCRCalculationRequestSchema.parse(JSON.parse(saved));
      } catch {
        return emptyDefaults;
      }
    }
    return emptyDefaults;
  }

  const { mutate, data, isPending, error, reset } = useCalculateLCR();

  const onSubmit = (values: LCRCalculationRequest) => {
    mutate(values, {
      onSuccess: () => {
        sessionStorage.removeItem('lcr-wizard-draft');
      },
    });
  };

  const STEP_FIELDS: Record<number, (keyof LCRCalculationRequest)[]> = {
    0: ['hqla_items'],
    1: ['retail_deposits'],
    2: ['wholesale_deposits'],
    3: ['off_balance_sheet'],
    4: ['inflow_items'],
    5: [], // review step, nothing new to validate — everything already validated
  };

  const handleNext = async () => {
    const fieldsToValidate = STEP_FIELDS[currentStep];
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
    // if invalid, RHF has already set the error state on the relevant fields —
    // your step's field array components just need to read form.formState.errors
    // and display them, no extra logic needed here
  };

  useEffect(() => {
    const subscription = form.watch((values) => {
      sessionStorage.setItem('lcr-wizard-draft', JSON.stringify(values));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleStartOver = () => {
    sessionStorage.removeItem('lcr-wizard-draft');
    form.reset(emptyDefaults);
    setCurrentStep(0);
    reset(); // clears data/error from useCalculateLCR(), if you're using the hook version
  };
  const isReviewStep = currentStep === STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* step indicator */}
        <ol className='flex flex-wrap gap-2 text-sm'>
          {STEPS.map((step, i) => (
            <li
              key={step}
              className={cn(
                'rounded-full border px-3 py-1 capitalize',
                i === currentStep
                  ? 'bg-primary text-primary-foreground border-primary'
                  : i < currentStep
                    ? 'bg-muted text-muted-foreground border-transparent'
                    : 'text-muted-foreground border-border',
              )}
            >
              {step.replace(/-/g, ' ')}
            </li>
          ))}
        </ol>

        {currentStep === 0 && <HqlaStep form={form} />}
        {currentStep === 1 && <RetailDepositsStep form={form} />}
        {currentStep === 2 && <WholesaleDepositsStep form={form} />}
        {currentStep === 3 && <OffBalanceSheetStep form={form} />}
        {currentStep === 4 && <InflowsStep form={form} />}
        {isReviewStep && <ReviewStep form={form} />}

        {error && (
          <p className='text-destructive text-sm'>
            {error instanceof Error
              ? error.message
              : 'Calculation failed. Please try again.'}
          </p>
        )}

        {data && (
          <p className='text-sm text-emerald-600'>
            Calculation complete — LCR ratio: {data.lcr_ratio.toFixed(1)}%
          </p>
        )}

        <div className='flex items-center justify-between border-t pt-4'>
          <Button
            type='button'
            variant='ghost'
            onClick={handleStartOver}
            disabled={isPending}
          >
            Start over
          </Button>

          <div className='flex gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={handleBack}
              disabled={isFirstStep || isPending}
            >
              Back
            </Button>

            {isReviewStep ? (
              <Button type='submit' disabled={isPending}>
                {isPending ? 'Calculating…' : 'Calculate'}
              </Button>
            ) : (
              <Button type='button' onClick={handleNext} disabled={isPending}>
                Next
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}

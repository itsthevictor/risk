'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useRef } from 'react';
import {
  LCRCalculationRequestSchema,
  LCRCalculationRequest,
} from '@/lib/definitions';
import { useCalculateLCR } from '@/hooks/use-calculate-lcr';
import { Form } from '@/components/ui/form';
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from '@/components/ui/card';
import { HqlaStep } from './hqla-step';
import { RetailDepositsStep } from './retail-deposits-step';
import { OffBalanceSheetStep } from './off-balance-sheet-step';
import { WholesaleDepositsStep } from './wholesale-deposit-step';
import { InflowsStep } from './inflows-step';
import { cn } from '@/lib/utils';
import { ReviewStep, useFormatAmount } from './review-step';
import { useDictionary, useIntlLocale } from '@/providers/i18n-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import InfoDrawer from '@/components/custom/info-drawer';
import { IconInfoCircle } from '@tabler/icons-react';

// Label/meaning text lives in dict.liquidity.status.
const LCR_STATUS_STYLES = {
  below_minimum: {
    textStyles: 'text-red-600 dark:text-red-400',
    badgeStyles: 'bg-red-500/15 text-red-600 dark:text-red-400',
  },
  marginal: {
    textStyles: 'text-amber-600 dark:text-amber-400',
    badgeStyles: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
  comfortable: {
    textStyles: 'text-emerald-600 dark:text-emerald-400',
    badgeStyles: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
} as const;

function getLcrStatus(lcrRatio: number): keyof typeof LCR_STATUS_STYLES {
  if (lcrRatio < 100) return 'below_minimum';
  if (lcrRatio < 120) return 'marginal';
  return 'comfortable';
}
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
  const { liquidity: t, common } = useDictionary();
  const intlLocale = useIntlLocale();
  const formatAmount = useFormatAmount();
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<LCRCalculationRequest>({
    resolver: zodResolver(LCRCalculationRequestSchema),
    mode: 'onChange', // trigger() on step navigation sets errors before the form is ever submitted;
    // without this, RHF keeps using onSubmit semantics until isSubmitted is true, so those errors
    // never re-validate on change and linger after the user fixes the field
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
  const resultCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data) {
      resultCardRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [data]);

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
    // eslint-disable-next-line react-hooks/incompatible-library -- RHF's watch() isn't memoizable; not passed to other memoized hooks/components
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
    reset(); // going back to edit invalidates any previous result, so clear it and re-enable "Calculează"
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex min-h-screen flex-col justify-between'
      >
        <div className='flex items-center gap-1 mb-4'>
          <h1 className='text-2xl font-bold'>{t.title}</h1>
          <InfoDrawer
            title={t.methodology.title}
            definition={t.methodology.definition}
            equation={t.methodology.equation}
            implementation={t.methodology.steps}
          />
        </div>

        <div className='text-foreground bg-accent mx-auto mb-6 flex w-full flex-row items-start gap-3 rounded-lg p-4 text-sm'>
          <IconInfoCircle className='shrink-0 mt-0.5' />
          <p>{t.intro}</p>
        </div>

        {/* step indicator — stays pinned to the top as the form scrolls */}
        <div className='bg-background sticky top-0 z-10 -mx-4 border-b px-4 py-3 sm:mx-0 sm:px-0 w-full'>
          <ol className='flex flex-wrap gap-2 text-sm w-full justify-between'>
            {STEPS.map((step, i) => (
              <li
                key={step}
                className={cn(
                  'rounded-full border px-3 py-1',
                  i === currentStep ? 'flex' : 'hidden md:flex',
                  i === currentStep
                    ? 'bg-primary text-primary-foreground border-primary'
                    : i < currentStep
                      ? 'bg-muted text-muted-foreground border-transparent'
                      : 'text-muted-foreground border-border',
                )}
              >
                {i + 1}. <span>{t.stepLabels[step]}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className='flex-1 py-6 w-full'>
          {currentStep === 0 && <HqlaStep form={form} />}
          {currentStep === 1 && <RetailDepositsStep form={form} />}
          {currentStep === 2 && <WholesaleDepositsStep form={form} />}
          {currentStep === 3 && <OffBalanceSheetStep form={form} />}
          {currentStep === 4 && <InflowsStep form={form} />}
          {isReviewStep && <ReviewStep form={form} />}

          {error && (
            <p className='text-destructive mt-6 text-sm'>
              {error instanceof Error ? error.message : t.result.error}
            </p>
          )}

          {data &&
            (() => {
              const statusKey = getLcrStatus(data.lcr_ratio);
              const status = {
                ...LCR_STATUS_STYLES[statusKey],
                ...t.status[statusKey],
              };
              return (
                <Card
                  ref={resultCardRef}
                  className='mt-6 scroll-mt-20 bg-muted/40'
                >
                  <CardHeader>
                    <CardTitle>{t.result.title}</CardTitle>
                    <CardAction>
                      <Badge
                        variant='outline'
                        className={cn(
                          'border-transparent font-medium',
                          status.badgeStyles,
                        )}
                      >
                        {status.label}
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <p
                      className={cn(
                        'text-2xl font-semibold',
                        status.textStyles,
                      )}
                    >
                      {new Intl.NumberFormat(intlLocale, {
                        maximumFractionDigits: 1,
                      }).format(data.lcr_ratio)}
                      %
                    </p>
                    <p className='text-muted-foreground text-sm'>
                      {status.meaning}
                    </p>
                    <dl className='grid grid-cols-2 gap-x-4 gap-y-2 text-sm'>
                      <div>
                        <dt className='text-muted-foreground'>
                          {t.result.hqlaTotal}
                        </dt>
                        <dd>{formatAmount(data.hqla_total)}</dd>
                      </div>
                      <div>
                        <dt className='text-muted-foreground'>
                          {t.result.inflowsCapped}
                        </dt>
                        <dd>{formatAmount(data.total_inflows_capped)}</dd>
                      </div>
                      <div>
                        <dt className='text-muted-foreground'>
                          {t.result.totalOutflows}
                        </dt>
                        <dd>{formatAmount(data.total_outflows)}</dd>
                      </div>
                      <div>
                        <dt className='text-muted-foreground'>
                          {t.result.netOutflows}
                        </dt>
                        <dd>{formatAmount(data.net_outflows)}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              );
            })()}
        </div>

        {/* action buttons — stay pinned to the bottom as the form scrolls */}
        <div className='bg-background sticky bottom-0 z-10 -mx-4 flex items-center justify-between border-t px-4 py-4 sm:mx-0 sm:px-0'>
          <Button
            type='button'
            variant='ghost'
            onClick={handleStartOver}
            disabled={isPending}
          >
            {t.actions.startOver}
          </Button>

          <div className='flex gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={handleBack}
              disabled={isFirstStep || isPending}
              data-umami-event={'calculate-lcr-back-click'}
            >
              {t.actions.back}
            </Button>

            {isReviewStep ? (
              <Button
                type='submit'
                disabled={isPending || !!data}
                data-umami-event='calculate-lcr-submit-click'
              >
                {isPending ? common.calculating : t.actions.calculate}
              </Button>
            ) : (
              <Button
                type='button'
                onClick={handleNext}
                disabled={isPending}
                data-umami-event='calculate-lcr-next-click'
              >
                {t.actions.next}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}

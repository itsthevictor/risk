'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import {
  LCRCalculationRequestSchema,
  LCRCalculationRequest,
} from '@/lib/definitions';
import { useCalculateLCR } from '@/hooks/use-calculate-lcr';

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

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* step indicator */}
      {/* render current step's fields based on currentStep, all reading/writing `form` */}
      {/* back/next buttons update currentStep */}
      {/* final step renders a "Calculate" submit button */}
    </form>
  );
}

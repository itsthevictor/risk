'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import {
  LCRCalculationRequestSchema,
  LCRCalculationRequest,
} from '@/lib/definitions';
import { useCalculateLCR } from '@/hooks/use-calculate-lcr';
import { IconPencil } from '@tabler/icons-react';
const STEPS = [
  'hqla',
  'retail',
  'wholesale',
  'off-balance-sheet',
  'inflows',
  'review',
] as const;

export default function CalculateLcrForm() {
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<LCRCalculationRequest>({
    resolver: zodResolver(LCRCalculationRequestSchema),
    defaultValues: {
      hqla_items: [],
      retail_deposits: [],
      wholesale_deposits: [],
      off_balance_sheet: [],
      inflow_items: [],
    },
  });

  const { mutate, data, isPending, error } = useCalculateLCR();

  const onSubmit = (values: LCRCalculationRequest) => {
    mutate(values);
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

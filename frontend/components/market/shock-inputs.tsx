'use client';

import { Input } from '@/components/ui/input';
import { useDictionary } from '@/providers/i18n-provider';

export interface ShockInputsProps {
  assetClasses: string[];
  shocks: Record<string, number>;
  onChange: (assetClass: string, value: number) => void;
  disabled?: boolean;
}

export function ShockInputs({
  assetClasses,
  shocks,
  onChange,
  disabled,
}: ShockInputsProps) {
  const { assetClasses: assetClassLabels } = useDictionary().market;
  return (
    <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
      {assetClasses.map((cls) => (
        <div key={cls} className='space-y-1'>
          <label className='text-muted-foreground text-xs font-medium'>
            {assetClassLabels[cls] ?? cls}
          </label>
          <div className='relative'>
            <Input
              type='number'
              step={1}
              disabled={disabled}
              value={Math.round((shocks[cls] ?? 0) * 100)}
              onChange={(e) => onChange(cls, Number(e.target.value) / 100)}
              className='pr-6 text-right tabular-nums'
            />
            <span className='text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs'>
              %
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

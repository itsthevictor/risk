'use client';

import React from 'react';
import { format } from 'date-fns';
import { Control } from 'react-hook-form';
import type { FieldValues, Path } from 'react-hook-form';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '../ui/textarea';

import { IconCalendar as CalendarIcon } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';

import { enGB } from 'date-fns/locale/en-GB';
import { ro } from 'date-fns/locale/ro';
import {
  useDictionary,
  useIntlLocale,
  useLocale,
} from '@/providers/i18n-provider';
import { fmt } from '@/lib/i18n/config';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { NumericFormat } from 'react-number-format';
import { Switch } from '@/components/ui/switch';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

import { Badge } from '@/components/ui/badge';
import { IconCheck, IconChevronDown, IconX } from '@tabler/icons-react';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// import { Label } from '@/components/ui/label';
const futureDate = new Date();
futureDate.setFullYear(futureDate.getFullYear() + 10);
const currentDate = new Date();

type CustomFormInputProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  labelText?: string;
  type?: string;
  disabled?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
};

export function CustomFormField<T extends FieldValues>({
  control,
  name,
  labelText,
  type,
  disabled,
}: CustomFormInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={`${disabled ? 'cursor-not-allowed' : null}`}>
          <FormLabel className='text-muted-foreground!'>{labelText}</FormLabel>
          <FormControl>
            <Input
              {...field}
              type={type}
              disabled={disabled}
              className='placeholder:text-muted-foreground bg-background'
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

type CustomFormTextareaProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  labelText?: string;
  type?: string;
  disabled?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  muted?: boolean;
};

export function CustomTextareaField<T extends FieldValues>({
  control,
  name,
  labelText,
  disabled,
  muted,
}: CustomFormTextareaProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      disabled={disabled}
      render={({ field }) => (
        <FormItem>
          <FormLabel className='text-muted-foreground!'>{labelText}</FormLabel>
          <FormControl>
            <Textarea
              {...field}
              className={cn('bg-background', muted && 'bg-sidebar')}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

type CustomFormSelectProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  items: string[];
  labelText?: string;
  infoComponent?: React.ReactNode;
  disabled?: boolean;
};
export function CustomFormSelect<T extends FieldValues>({
  name,
  control,
  items,
  labelText,
  infoComponent,
  disabled,
}: CustomFormSelectProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className='text-muted-foreground! flex items-center gap-1'>
            {labelText || name}
            {infoComponent}
          </FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value || items[0]} // <-- Default to first item
            disabled={disabled}
          >
            <FormControl className='bg-background w-full'>
              <SelectTrigger className='bg-background w-full'>
                <SelectValue />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// types.ts or wherever you keep common interfaces
export interface SelectOption {
  value: string;
  label: string;
}

type CustomFormSelectLabelProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  items: SelectOption[];
  labelText?: string;
  infoComponent?: React.ReactNode;
  disabled?: boolean;
};

export function CustomFormSelectLabel<T extends FieldValues>({
  name,
  control,
  items,
  labelText,
  infoComponent,
  disabled,
}: CustomFormSelectLabelProps<T>) {
  const dict = useDictionary();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className='text-muted-foreground! flex items-center gap-1'>
            {labelText || name}
            {infoComponent}
          </FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value ?? ''}
            disabled={disabled}
          >
            <FormControl className='w-full'>
              <SelectTrigger className='bg-background'>
                <SelectValue placeholder={dict.common.choose}>
                  {(value: string) =>
                    items.find((item) => item.value === value)?.label ?? value
                  }
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.label} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

type CustomFormCheckboxProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  labelText?: string;
};

export function CustomFormCheckbox<T extends FieldValues>({
  name,
  control,
  labelText,
}: CustomFormCheckboxProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className='flex h-full flex-col-reverse items-start justify-end space-x-2'>
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              id={name}
              name={name}
            />
          </FormControl>
          <FormLabel
            htmlFor={name}
            className='text-muted-foreground text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
          >
            {labelText}
          </FormLabel>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function CustomDatePicker<T extends FieldValues>({
  name,
  labelText,
  control,
  disabled,
}: CustomFormInputProps<T>) {
  const dict = useDictionary();
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className='flex flex-col'>
          <FormLabel className='text-muted-foreground text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
            {labelText}
          </FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <FormControl>
                  <Button
                    type='button'
                    variant='outline'
                    disabled={disabled}
                    className={cn(
                      'w-full pl-3 text-left font-normal capitalize',
                      !field.value && 'text-muted-foreground',
                    )}
                    onClick={() => setOpen(true)} // open popover on button click
                  >
                    {field.value ? (
                      format(field.value, 'PPP', {
                        locale: locale === 'en' ? enGB : ro,
                      })
                    ) : (
                      <span>{dict.common.chooseDate}</span>
                    )}
                    <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                  </Button>
                </FormControl>
              }
            />
            {undefined /* placeholder to keep JSX structure */}

            {!disabled && (
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  mode='single'
                  selected={field.value}
                  onSelect={(date) => {
                    field.onChange(date);
                    setOpen(false); // ✅ close popover after selecting
                  }}
                  disabled={(date) => date < new Date('2006-01-01')}
                  captionLayout='dropdown'
                  defaultMonth={field.value ?? currentDate}
                  startMonth={currentDate}
                  endMonth={futureDate}
                />
              </PopoverContent>
            )}
          </Popover>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function CustomNumberField<T extends FieldValues>({
  name,
  control,
  labelText,
  currency = 'mil. RON',
  disabled = false,
  max,
}: {
  name: Path<T>;
  control: Control<T>;
  labelText?: string;
  currency?: string;
  disabled?: boolean;
  max?: number;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className='text-muted-foreground! capitalize'>
            {labelText || name}
          </FormLabel>
          <FormControl>
            <div className='relative'>
              <NumericFormat
                value={field.value ?? ''} // Pass empty string if no value, so it displays empty
                thousandSeparator='.'
                decimalSeparator=','
                decimalScale={2}
                fixedDecimalScale={false}
                allowNegative={false}
                allowLeadingZeros={false}
                disabled={disabled}
                customInput={Input}
                onValueChange={(values) => {
                  field.onChange(values.floatValue ?? undefined);
                }}
                onBlur={field.onBlur}
                className='no-spinner bg-background pr-16'
                max={max}
              />
              <span className='text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm'>
                {currency}
              </span>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

type CustomIncrementalFormFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  labelText?: string;
  step?: number;
  min?: number;
  max?: number;
  disabled?: boolean;
};

export function CustomIncrementalFormField<T extends FieldValues>({
  name,
  control,
  labelText,
  step = 1,
  min,
  max,
  disabled,
}: CustomIncrementalFormFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const current = field.value ?? 0;

        const decrement = () => {
          const next = current - step;
          if (min === undefined || next >= min) field.onChange(next);
        };

        const increment = () => {
          const next = current + step;
          if (max === undefined || next <= max) field.onChange(next);
        };

        return (
          <FormItem>
            <FormLabel className='text-muted-foreground!'>
              {labelText || name}
            </FormLabel>
            <FormControl>
              <div className='flex items-center gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  disabled={disabled || (min !== undefined && current <= min)}
                  onClick={decrement}
                  className=' shrink-0'
                >
                  −
                </Button>
                <Input
                  {...field}
                  type='number'
                  disabled={disabled}
                  value={current}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  className='bg-background [appearance:textfield] text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                />
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  disabled={disabled || (max !== undefined && current >= max)}
                  onClick={increment}
                  className=' shrink-0'
                >
                  +
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

type CustomFormSwitchProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  labelText?: string;
};

export function CustomFormSwitch<T extends FieldValues>({
  name,
  control,
  labelText,
}: CustomFormSwitchProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className='flex h-full flex-col-reverse items-start justify-end space-x-2'>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              id={name}
              name={name}
            />
          </FormControl>
          <FormLabel
            htmlFor={name}
            className='text-muted-foreground text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
          >
            {labelText}
          </FormLabel>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

type CustomFormRadioProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  labelText?: string;
  options: { label: string; value: string }[];
};

export function CustomFormRadio<T extends FieldValues>({
  name,
  control,
  labelText,
  options,
}: CustomFormRadioProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className='space-y-3'>
          <FormLabel className='text-muted-foreground!'>{labelText}</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className='flex gap-6 space-y-1'
            >
              {options.map((option) => (
                <FormItem
                  key={option.value}
                  className='flex items-center space-y-0'
                >
                  <FormControl>
                    <RadioGroupItem value={option.value} />
                  </FormControl>
                  <FormLabel className='font-normal'>{option.label}</FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

type MultiCheckboxFormFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  labelText: string;
  items: string[];
  labelsMap?: Record<string, string>;
  disabled?: boolean;
};

export function MultiCheckboxFormField<T extends FieldValues>({
  name,
  control,
  labelText,
  items,
  labelsMap = {},
  disabled = false,
}: MultiCheckboxFormFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem>
          <FormLabel className='text-muted-foreground text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
            {labelText}
          </FormLabel>
          <div className='mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
            {items.map((item) => (
              <FormField
                key={item}
                control={control}
                name={name}
                render={({ field }) => {
                  return (
                    <FormItem
                      key={item}
                      className='flex flex-row items-start space-y-0 space-x-3'
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(item)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, item])
                              : field.onChange(
                                  field.value?.filter(
                                    (value: string) => value !== item,
                                  ),
                                );
                          }}
                          disabled={disabled}
                        />
                      </FormControl>
                      <FormLabel className='cursor-pointer font-normal'>
                        {labelsMap[item] || item}
                      </FormLabel>
                    </FormItem>
                  );
                }}
              />
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function SingleSelectCheckboxFormField<T extends FieldValues>({
  name,
  control,
  labelText,
  items,
  labelsMap = {},
  disabled = false,
}: MultiCheckboxFormFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className='text-muted-foreground text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
            {labelText}
          </FormLabel>
          <FormControl>
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              disabled={disabled}
              className='mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'
            >
              {items.map((item) => (
                <FormItem
                  key={item}
                  className='flex flex-row items-start space-y-0 space-x-3'
                >
                  <FormControl>
                    <RadioGroupItem value={item} />
                  </FormControl>
                  <FormLabel className='cursor-pointer font-normal'>
                    {labelsMap[item] || item}
                  </FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function SingleSelectPillFormField<T extends FieldValues>({
  name,
  control,
  labelText,
  items,
  labelsMap = {},
  disabled = false,
}: MultiCheckboxFormFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className='text-muted-foreground text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
            {labelText}
          </FormLabel>
          <FormControl>
            <div className='flex flex-wrap gap-2'>
              {items.map((item) => {
                const isSelected = field.value === item;
                return (
                  <button
                    key={item}
                    type='button'
                    disabled={disabled}
                    onClick={() => field.onChange(item)}
                    className={cn(
                      'cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-all',
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-primary',
                      disabled && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    {labelsMap[item] || item}
                  </button>
                );
              })}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface DatePickerPopoverProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  disabled?: boolean;
}

export function DatePickerPopover({
  date,
  onDateChange,
  disabled,
}: DatePickerPopoverProps) {
  const dict = useDictionary();
  const intlLocale = useIntlLocale();
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          'w-full justify-start text-left font-normal',
          !date && 'text-muted-foreground',
        )}
        disabled={disabled}
      >
        {date ? (
          date.toLocaleDateString(intlLocale)
        ) : (
          <span>{dict.common.selectDate}</span>
        )}
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          selected={date}
          onSelect={(selectedDate) => {
            onDateChange(selectedDate);
            setOpen(false);
          }}
          disabled={(date) => date > new Date()}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

interface DatePickerPopoverFutureProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  disabled?: boolean;
}

export function DatePickerPopoverFuture({
  date,
  onDateChange,
  disabled,
}: DatePickerPopoverFutureProps) {
  const dict = useDictionary();
  const intlLocale = useIntlLocale();
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          'w-full justify-start text-left font-normal',
          !date && 'text-muted-foreground',
        )}
        disabled={disabled}
      >
        {date ? (
          date.toLocaleDateString(intlLocale)
        ) : (
          <span>{dict.common.selectDate}</span>
        )}
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          selected={date}
          onSelect={(selectedDate) => {
            onDateChange(selectedDate);
            setOpen(false);
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

type CustomIntegerFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  labelText?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  step?: number;
};

export function CustomIntegerField<T extends FieldValues>({
  name,
  control,
  labelText,
  min,
  max,
  disabled,
  step,
}: CustomIntegerFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const current = field.value ?? 0;

        return (
          <FormItem>
            <FormLabel className='text-muted-foreground!'>
              {labelText || name}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                type='number'
                disabled={disabled}
                value={current}
                min={min}
                max={max}
                step={step}
                onChange={(e) =>
                  field.onChange(Math.round(e.target.valueAsNumber))
                }
                className='bg-background [appearance:textfield] text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

export interface MultiSelectOption {
  value: string;
  label: string;
}

type CustomMultiSelectFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  options: MultiSelectOption[];
  labelText?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
};

export function CustomMultiSelectField<T extends FieldValues>({
  name,
  control,
  options,
  labelText,
  placeholder,
  min,
  max,
  disabled,
}: CustomMultiSelectFieldProps<T>) {
  const dict = useDictionary();
  const [open, setOpen] = React.useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selected: string[] = field.value ?? [];
        const atMax = max !== undefined && selected.length >= max;
        const atMin = min !== undefined && selected.length <= min;

        const toggle = (value: string) => {
          if (selected.includes(value)) {
            if (atMin) return;
            field.onChange(selected.filter((v: string) => v !== value));
          } else {
            if (atMax) return;
            field.onChange([...selected, value]);
          }
        };

        const remove = (value: string) => {
          if (atMin) return;
          field.onChange(selected.filter((v: string) => v !== value));
        };

        return (
          <FormItem className='flex flex-col'>
            <FormLabel className='text-muted-foreground!'>
              {labelText || name}
            </FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger
                render={
                  <FormControl>
                    <Button
                      type='button'
                      variant='outline'
                      role='combobox'
                      aria-expanded={open}
                      disabled={disabled}
                      className={cn(
                        'bg-background h-auto min-h-9 w-full justify-between font-normal',
                        selected.length === 0 && 'text-muted-foreground',
                      )}
                    >
                      <div className='flex flex-1 flex-wrap gap-1'>
                        {selected.length === 0 ? (
                          <span>
                            {placeholder ?? dict.common.selectPlaceholder}
                          </span>
                        ) : (
                          selected.map((value) => {
                            const opt = options.find((o) => o.value === value);
                            return (
                              <Badge
                                key={value}
                                variant='secondary'
                                className='gap-1 pr-1'
                                onClick={(e: React.MouseEvent) =>
                                  e.stopPropagation()
                                }
                              >
                                {opt?.label ?? value}
                                <span
                                  role='button'
                                  tabIndex={0}
                                  aria-label={fmt(dict.common.remove, {
                                    item: opt?.label ?? value,
                                  })}
                                  className='hover:bg-muted-foreground/20 rounded-sm'
                                  onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    remove(value);
                                  }}
                                  onKeyDown={(e: React.KeyboardEvent) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      remove(value);
                                    }
                                  }}
                                >
                                  <IconX className='h-3 w-3' />
                                </span>
                              </Badge>
                            );
                          })
                        )}
                      </div>
                      <IconChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </FormControl>
                }
              />
              <PopoverContent
                className='w-(--radix-popover-trigger-width) p-0'
                align='start'
              >
                <Command>
                  <CommandInput placeholder={dict.common.searchTicker} />
                  <CommandList>
                    <CommandEmpty>{dict.common.noResults}</CommandEmpty>
                    <CommandGroup>
                      {options.map((option) => {
                        const isSelected = selected.includes(option.value);
                        const disableAdd = !isSelected && atMax;
                        const disableRemove = isSelected && atMin;
                        return (
                          <CommandItem
                            key={option.value}
                            value={option.value}
                            disabled={disableAdd || disableRemove}
                            onSelect={() => toggle(option.value)}
                          >
                            <div
                              className={cn(
                                'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                                isSelected
                                  ? 'bg-primary text-primary-foreground'
                                  : 'opacity-50 [&_svg]:invisible',
                              )}
                            >
                              <IconCheck className='h-3 w-3' />
                            </div>
                            {option.label}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

// app/BackButton.tsx

'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { IconArrowLeft } from '@tabler/icons-react';
import { useDictionary } from '@/providers/i18n-provider';

export function BackButton() {
  const router = useRouter();
  const dict = useDictionary();

  return (
    <Button onClick={() => router.back()}>
      <IconArrowLeft className='mr-2' />
      {dict.common.back}
    </Button>
  );
}

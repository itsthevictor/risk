// app/BackButton.tsx

'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { IconArrowLeft } from '@tabler/icons-react';
export function BackButton() {
  const router = useRouter();

  return (
    <Button onClick={() => router.back()}>
      <IconArrowLeft className='mr-2' />
      Înapoi
    </Button>
  );
}

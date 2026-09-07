'use client';

import { InfoIcon } from '@phosphor-icons/react';
import { BlockMath } from 'react-katex';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

type InfoDrawerProps = {
  title: string;
  definition?: string;
  equation?: string;
  implementation?: string[];
  triggerClassName?: string;
};

function InfoDrawer({
  title,
  definition,
  equation,
  implementation,
  triggerClassName,
}: InfoDrawerProps) {
  return (
    <Drawer swipeDirection='right'>
      <DrawerTrigger
        render={
          <Button
            variant='ghost'
            size='icon-xs'
            className={cn(
              'rounded-full text-muted-foreground',
              triggerClassName,
            )}
          />
        }
      >
        <InfoIcon />
        <span className='sr-only'>Mai multe informații</span>
      </DrawerTrigger>
      <DrawerContent className='flex flex-col gap-8'>
        <DrawerHeader>
          <DrawerTitle className='text-foreground text-2xl'>
            {title}
          </DrawerTitle>
        </DrawerHeader>
        <div className='flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto p-4 pt-0'>
          {definition && (
            <DrawerDescription className='mt-8'>{definition}</DrawerDescription>
          )}

          {equation && (
            <div className='overflow-x-auto rounded-none border border-border bg-muted/40 p-3'>
              <BlockMath math={equation} />
            </div>
          )}

          {implementation && implementation.length > 0 && (
            <div className='flex flex-col gap-1.5 '>
              <span className='font-heading text-xs font-medium text-foreground'>
                Implementare
              </span>
              <ul className='flex flex-col gap-1 text-xs/relaxed text-muted-foreground'>
                {implementation.map((item, index) => (
                  <li key={index} className='flex gap-2'>
                    <span aria-hidden='true'>-</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <DrawerFooter>
          <DrawerClose render={<Button variant='outline' />}>
            Închide
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default InfoDrawer;

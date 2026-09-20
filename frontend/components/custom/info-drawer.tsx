'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
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
  contentClassName?: string;
};

// The drawer's default width (24rem, see drawer.tsx) minus the padding the
// equation has to render within: the scroll area's p-4 and the equation
// box's own p-3, on both sides.
const DEFAULT_DRAWER_WIDTH_PX = 384;
const MAX_DRAWER_WIDTH_PX = 672; // 42rem
const EQUATION_HORIZONTAL_PADDING_PX = (16 + 12) * 2;

function InfoDrawer({
  title,
  definition,
  equation,
  implementation,
  triggerClassName,
  contentClassName,
}: InfoDrawerProps) {
  const equationWrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [wideDrawerWidthPx, setWideDrawerWidthPx] = useState<number | null>(
    null,
  );

  // The drawer's popup isn't mounted (and the formula has no layout) until
  // it's actually open, so measuring/observing has to (re)start every time
  // it opens rather than once at mount — a ResizeObserver set up too early
  // never sees the element and misses the eventual reflow from KaTeX's
  // webfont finishing its (async) load.
  useEffect(() => {
    if (!open || !equation) return;

    let cancelled = false;
    let observer: ResizeObserver | undefined;

    const raf = requestAnimationFrame(() => {
      if (cancelled) return;
      const formulaEl =
        equationWrapperRef.current?.querySelector<HTMLElement>('.katex');
      if (!formulaEl) return;

      const update = () => {
        const neededWidth =
          formulaEl.scrollWidth + EQUATION_HORIZONTAL_PADDING_PX;
        setWideDrawerWidthPx(
          neededWidth > DEFAULT_DRAWER_WIDTH_PX
            ? Math.min(neededWidth, MAX_DRAWER_WIDTH_PX)
            : null,
        );
      };

      update();
      observer = new ResizeObserver(update);
      observer.observe(formulaEl);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [open, equation]);

  return (
    <Drawer swipeDirection='right' open={open} onOpenChange={setOpen}>
      <DrawerTrigger
        render={
          <Button
            variant='ghost'
            size='icon-xs'
            className={cn(
              'rounded-full text-muted-foreground',
              triggerClassName,
            )}
            data-umami-event={`info-drawer-${title}`}
          />
        }
      >
        <InfoIcon />
        <span className='sr-only'>Mai multe informații</span>
      </DrawerTrigger>
      <DrawerContent
        className={cn('flex flex-col gap-8', contentClassName)}
        style={
          wideDrawerWidthPx
            ? ({ width: `${wideDrawerWidthPx}px` } as CSSProperties)
            : undefined
        }
      >
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
            <div
              ref={equationWrapperRef}
              className='overflow-x-auto rounded-none border border-border bg-muted/40 p-3'
            >
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

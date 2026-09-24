import Link from '@/components/locale-link';
import { IconArrowUpRight } from '@tabler/icons-react';

export function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className='break-all rounded bg-muted px-1 py-0.5 font-mono text-[0.8em]'>
      {children}
    </code>
  );
}

export function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className='overflow-x-auto rounded-md border bg-muted/40 p-3 font-mono text-xs leading-relaxed'>
      {children}
    </pre>
  );
}

export function Section({
  id,
  title,
  href,
  children,
}: {
  id?: string;
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className='space-y-4 border-t pt-8 first:border-t-0 first:pt-0'
    >
      <h2 className='text-xl font-bold'>
        <Link
          href={href}
          className='inline-flex items-center gap-1 hover:underline'
        >
          {title}
          <IconArrowUpRight className='size-5' />
        </Link>
      </h2>
      <div className='space-y-4 text-sm leading-relaxed text-foreground/90'>
        {children}
      </div>
    </section>
  );
}

export function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className='pt-2 text-base font-semibold'>{children}</h3>;
}

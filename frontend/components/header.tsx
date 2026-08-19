'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';

const PATH_LABELS: Record<string, string> = {
  '/liquidity': 'Risc de lichiditate',
  '/market': 'Risc de piață',
  '/credit': 'Risc de credit',
};

const Header = () => {
  const pathname = usePathname();
  const currentLabel = PATH_LABELS[pathname] ?? 'Navigare';
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='header flex flex-row items-center justify-between p-4 border-b border-muted-foreground'>
      <Link href='/' className='text-lg font-bold'>
        Risk Analysis Portfolio
      </Link>
      <div className='flex items-center justify-between gap-x-4'>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger render={<Button variant='outline' />}>
            {currentLabel}{' '}
            {isOpen ? (
              <IconChevronUp className='ml-2 h-4 w-4' />
            ) : (
              <IconChevronDown className='ml-2 h-4 w-4' />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <Link href='/liquidity' className='w-full'>
                <DropdownMenuItem>Risc de lichiditate</DropdownMenuItem>
              </Link>
              <Link href='/market' className='w-full'>
                <DropdownMenuItem>Risc de piață</DropdownMenuItem>
              </Link>
              <Link href='/credit' className='w-full'>
                <DropdownMenuItem>Risc de credit</DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>Despre</DropdownMenuItem>
              <DropdownMenuItem>Documentatie</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
export default Header;

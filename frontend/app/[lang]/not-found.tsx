import { Button } from '@/components/ui/button';
import Link from '@/components/locale-link';
import { BackButton } from '@/components/back-btn';
import { getDictionary } from '@/lib/i18n/dictionaries';

const NotFoundPage = async () => {
  const { notFound, common } = await getDictionary();
  return (
    <div className='relative flex flex-col flex-1 justify-center min-h-full p-4 overflow-hidden items-center'>
      {/* background layer — isolated so transform/opacity don't affect content */}
      <div className='absolute inset-0 -z-10 bg-background' />
      <div className='max-w-3xl items-center justify-center flex-col flex gap-y-4'>
        <h1 className='text-4xl font-bold mb-4'>{notFound.title}</h1>
        <p className='text-lg text-foreground'>
          {notFound.description}
        </p>
        <div className='md:flex md:flex-row flex flex-col max-w-3xl gap-x-4 gap-y-2 mt-4'>
          <BackButton />
          <Button variant='outline' className='w-fit'>
            <Link href='/'>{common.home}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
export default NotFoundPage;

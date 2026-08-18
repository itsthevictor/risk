import CalculateLcrForm from '@/components/forms/calculate-lcr-form';

const LiquidityRiskPage = () => {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-4 p-4 max-w-4xl mx-auto'>
      <CalculateLcrForm />
    </div>
  );
};
export default LiquidityRiskPage;

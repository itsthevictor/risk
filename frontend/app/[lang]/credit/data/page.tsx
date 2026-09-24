import DatasetColumnsTable from '@/components/credit/data-table';
import enRows from '@/components/credit/dataset-columns.en';
import roRows from '@/components/credit/dataset-columns.ro';
import { getLocale } from '@/lib/i18n/dictionaries';

// Picked on the server so only one language's rows reach the client.
const rowsByLocale = { ro: roRows, en: enRows };

const Page = async () => {
  const rows = rowsByLocale[await getLocale()];

  return (
    <div className=' p-8 w-full '>
      <DatasetColumnsTable rows={rows} />
    </div>
  );
};
export default Page;

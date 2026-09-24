import { getLocale } from '@/lib/i18n/dictionaries';
import AboutEn from './content.en';
import AboutRo from './content.ro';

// Long-form prose: one component per language instead of dictionary keys.
const content = { ro: AboutRo, en: AboutEn };

export default async function AboutPage() {
  const Content = content[await getLocale()];
  return <Content />;
}

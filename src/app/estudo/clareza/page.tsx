import ClarityStudy from '@/components/ClarityStudy';
import { pageMetadata } from '@/lib/metadata';
export const metadata = pageMetadata(
  'Clareza construída — Experimento Mansa',
  '/estudo/clareza/',
  true,
);
export default function Page() {
  return <ClarityStudy />;
}

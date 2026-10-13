import LayerStudy from '@/components/LayerStudy';
import { pageMetadata } from '@/lib/metadata';
export const metadata = pageMetadata('Camadas — Experimento Mansa', '/estudo/camadas/', true);
export default function Page() {
  return <LayerStudy />;
}

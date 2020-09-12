import { useRouter } from 'next/dist/client/router';
import { extractSignal } from '@/api/validator';
import BaseLayout from '../../components/BaseLayout';

export default function Signal() {
  const router = useRouter();

  // const signal = extractSignal(router);
  return (
    <BaseLayout title={`My COVIDcast - `} mainActive="single">
      {JSON.stringify(router.query)}
    </BaseLayout>
  );
}

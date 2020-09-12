import { useRouter } from 'next/dist/client/router';
import Link from 'next/link';
import { extractSignal } from '../../api/validator';
import BaseLayout from '../../components/BaseLayout';

export default function Signal() {
  const router = useRouter();

  const signal = extractSignal(router);

  const breadcrumbs = [
    <Link href="/signal/[signal]" as={`/signal/${signal.id}`}>
      {signal.name}
    </Link>,
  ];
  return <BaseLayout title={signal.name} mainActive="overview" breadcrumbs={breadcrumbs}></BaseLayout>;
}

import Link from 'next/link';
import { useQueryParam } from '@/api/hooks';
import { extractSignal } from '@/api/validator';
import BaseLayout from '@/components/BaseLayout';
import { signals } from '../../data/constants';

export default function Signal() {
  // TODO could be a fake one
  const signal = useQueryParam(extractSignal) ?? signals[0];

  const breadcrumbs = [
    <Link href="/signal/[signal]" as={`/signal/${signal.id}`}>
      {signal.name}
    </Link>,
  ];
  return <BaseLayout title={signal.name} mainActive="overview" breadcrumbs={breadcrumbs}></BaseLayout>;
}

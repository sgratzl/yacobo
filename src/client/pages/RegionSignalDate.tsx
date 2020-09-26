import BaseLayout from '../components/BaseLayout';
import { DateSignalSelect } from '../components/DateSelect';
import { RegionSelect } from '../components/RegionSelect';
import { SignalSelect } from '../components/SignalSelect';
import { formatAPIDate, formatLocal } from '@/common';
import type { ITriple } from '@/model';
import { DownloadMenu } from '../components/DownloadMenu';
import { FavoriteToggle } from '../components/FavoriteToggle';
import { RegionSignalKeyFacts, RegionSignalKeyFactsTable } from '../components/RegionSignalKeyFacts';
import { Divider, Typography } from 'antd';
import { SignalInfoBlock } from '../components/SignalInfoBox';
import { MapDescription, MapImage } from '../vega/MapImage';
import { LineDescription, LineImage } from '../vega/LineImage';
import ContentLayout from '../components/ContentLayout';
import { fullUrl } from '@/client/hooks';
import { CompareWithButton } from '../components/CompareIcon';
import ParagraphTitle from '../components/ParagraphTitle';

export function RegionSignalDate({ region, signal, date }: ITriple) {
  const apiDate = formatAPIDate(date);
  return (
    <BaseLayout
      pageTitle={`${region?.name} - ${signal?.name} as of ${formatLocal(date)}`}
      description={signal?.description(date)}
      previewImage={fullUrl('/api/region/[region]/[signal].jpg', { region, signal })}
      mainActive="overview"
      title={
        <RegionSelect
          region={region}
          path="/region/[region]/[signal]/[date]"
          clearPath="/signal/[signal]/[date]"
          query={{ signal, date }}
        />
      }
      subTitle={
        <>
          <SignalSelect
            signal={signal}
            path="/region/[region]/[signal]/[date]"
            clearPath="/region/[region]/date/[date]"
            query={{ region, date }}
          />
          <DateSignalSelect
            date={date}
            signal={signal}
            path="/region/[region]/[signal]/[date]"
            clearPath="/region/[region]/[signal]"
            query={{ region, signal }}
          />
        </>
      }
      breadcrumb={[
        {
          breadcrumbName: region?.name ?? '',
          path: '/region/[region]',
        },
        {
          breadcrumbName: signal?.name ?? '',
          path: '/region/[region]/[signal]',
        },
        {
          breadcrumbName: apiDate,
          path: '/region/[region]/[signal]/[date]',
        },
      ]}
      extra={[
        <CompareWithButton key="c" region={region} signal={signal} date={date} />,
        region && signal && (
          <FavoriteToggle key="bookmark" warning={false} favorite={{ type: 'r+s', region, signal }} />
        ),
        <DownloadMenu
          key="download"
          img={false}
          path={fullUrl('/region/[region]/[signal]/[date]', { region, signal, date })}
        />,
      ]}
    >
      <ContentLayout>
        <Typography.Title>{signal?.name}</Typography.Title>
        <Typography.Paragraph>{signal?.description(date)}</Typography.Paragraph>
        <RegionSignalKeyFacts signal={signal} region={region} date={date} />
        <RegionSignalKeyFactsTable signal={signal} region={region} date={date} />
        <Divider />
        <SignalInfoBlock signal={signal} />
        <Divider />
        <ParagraphTitle
          level={2}
          extra={[
            signal && <FavoriteToggle key="bookmark" warning={false} favorite={{ type: 's', signal }} />,
            <DownloadMenu key="download" path={fullUrl('/signal/[signal]/[date]', { signal, date })} />,
          ]}
        >
          Overview
        </ParagraphTitle>
        <MapImage scale={2} interactive region={region} signal={signal} date={date} />
        <MapDescription signal={signal} date={date} />
        <Divider />
        <ParagraphTitle
          level={2}
          extra={[
            region && signal && (
              <FavoriteToggle key="bookmark" warning={false} favorite={{ type: 'r+s+h', region, signal }} />
            ),
            <DownloadMenu key="download" path={fullUrl('/region/[region]/[signal]', { region, signal })} />,
          ]}
        >
          History
        </ParagraphTitle>
        <LineImage scale={2} interactive region={region} signal={signal} date={date} />
        <LineDescription signal={signal} region={region} />
      </ContentLayout>
    </BaseLayout>
  );
}

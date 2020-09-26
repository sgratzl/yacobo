import BaseLayout from '../components/BaseLayout';
import { DateSelect } from '../components/DateSelect';
import { RegionSelect } from '../components/RegionSelect';
import { formatAPIDate, formatLocal } from '@/common';
import { IRegion, isCountyRegion, refSignal, signals, toState } from '@/model';
import GridColumn from '../components/GridColumn';
import { Divider, Row, Typography } from 'antd';
import RegionSignalWidget from '../widgets/RegionSignalWidget';
import { LineDescription, LineImage } from '../vega/LineImage';
import ContentLayout from '../components/ContentLayout';
import { Fragment } from 'react';
import RegionSignalHistoryWidget from '../widgets/RegionSignalHistoryWidget';
import { fullUrl } from '@/client/hooks';
import type { IDateRange } from '@/model';
import { CompareWithButton } from '../components/CompareIcon';
import { HeatMapDescription, HeatMapImage } from '../vega/HeatmapImage';
import ParagraphTitle from '../components/ParagraphTitle';
import { FavoriteToggle } from '../components/FavoriteToggle';
import { DownloadMenu } from '../components/DownloadMenu';

export function RegionDate({ date, region, dynamic }: { region?: IRegion; date?: Date; dynamic?: IDateRange }) {
  const apiDate = formatAPIDate(date);
  const focus = toState(region);
  return (
    <BaseLayout
      pageTitle={`${region?.name} as of ${formatLocal(date)}`}
      mainActive="overview"
      description={`${region?.name} as of ${formatLocal(date)}. ${refSignal.description(date)}`}
      previewImage={fullUrl('/api/region/[region]/[signal].jpg?highlight=[date]', { date, signal: refSignal, region })}
      title={
        <RegionSelect region={region} path="/region/[region]/date/[date]" clearPath="/date/[date]" query={{ date }} />
      }
      subTitle={
        <DateSelect
          date={date}
          path="/region/[region]/date/[date]"
          clearPath="/region/[region]"
          query={{ region }}
          dateRange={dynamic}
        />
      }
      breadcrumb={[
        isCountyRegion(region)
          ? [
              {
                breadcrumbName: region.state.name,
                path: '/region/[region]',
                query: { region: region.state },
              },
            ]
          : [],
        {
          breadcrumbName: region?.name ?? '',
          path: '/region/[region]',
        },
        !dynamic
          ? [
              {
                breadcrumbName: apiDate,
                path: '/region/[region]/date/[date]',
              },
            ]
          : [],
      ].flat()}
      extra={[<CompareWithButton region={region} date={date} />]}
    >
      <ContentLayout>
        <Typography.Title>{region?.name}</Typography.Title>
        {dynamic && (
          <>
            <ParagraphTitle
              level={2}
              extra={[
                region && (
                  <FavoriteToggle
                    key="bookmark"
                    warning={false}
                    favorite={{ type: 'r+s+h', region, signal: refSignal }}
                  />
                ),
                <DownloadMenu
                  key="download"
                  path={fullUrl('/region/[region]/[signal]', { region, signal: refSignal })}
                />,
              ]}
            >
              History of {refSignal.name}
            </ParagraphTitle>
            <LineImage scale={2} interactive region={region} signal={refSignal} date={date} />
            <LineDescription signal={refSignal} />
            <Divider />
            <ParagraphTitle
              level={2}
              extra={[
                focus && (
                  <FavoriteToggle
                    key="bookmark"
                    warning={false}
                    favorite={{ type: 'r+s+sh', region: focus, signal: refSignal }}
                  />
                ),
                <DownloadMenu
                  key="download"
                  path={fullUrl('/signal/[signal]', { signal: refSignal })}
                  params={`&focus=${focus?.id}`}
                />,
              ]}
            >
              Counties of {focus?.name} over Time
            </ParagraphTitle>
            <HeatMapImage scale={2} interactive region={region} signal={refSignal} focus={focus} />
            <HeatMapDescription signal={refSignal} focus={focus} />
            <Divider />
            <Typography.Title level={2}>All Signals</Typography.Title>
          </>
        )}
        <Row>
          {signals.map((s) => (
            <Fragment key={s.id}>
              <GridColumn>
                {region && <RegionSignalWidget region={region} signal={s} date={date} focus="signal" />}
              </GridColumn>
              <GridColumn>
                {region && <RegionSignalHistoryWidget region={region} signal={s} date={date} focus="signal" />}
              </GridColumn>
            </Fragment>
          ))}
        </Row>
      </ContentLayout>
    </BaseLayout>
  );
}

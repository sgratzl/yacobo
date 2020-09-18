import { regionByID } from '@/model';
import { Typography } from 'antd';

export const dateValueTooltip = (datum: { date: number; value?: number | null; stderr?: number | null }) => {
  return <div>{datum.date}</div>;
};

export const regionValueTooltip = (datum: { region: string; value?: number | null }) => {
  const region = regionByID(datum.region);
  return <Typography.Text>{region.name}</Typography.Text>;
};

import { COMPARE_COLORS, IRegion, ISignal, ZERO_COLOR } from '@/model';
import { Typography } from 'antd';
import { Fragment } from 'react';
import ColorBox, { MissingColorBox } from '../components/ColorBox';

export function CCLink() {
  return (
    <Typography.Link href="https://covidcast.cmu.edu" target="_blank" rel="noopener noreferrer">
      COVIDCast Map
    </Typography.Link>
  );
}

export function ColorLegend({ signal, missing = true }: { signal?: ISignal; missing?: boolean }) {
  return (
    <Typography.Paragraph>
      {`The meaning of the color is shown in the legend on the right side of each plot ranging from 0 to a defined computed maximum for
      ${signal ? `the signal ${signal.name}` : 'the signal'}.
      Similar to the original `}
      <CCLink />
      {`, the maximum is computed as the average signal value in the whole database plus three times its standard deviation (`}
      <Typography.Text code>mean + 3 * stdev</Typography.Text>
      {`). `}
      {missing && (
        <>
          {`In addition two extra colors are used to emphasize special values: `}
          <ColorBox color={ZERO_COLOR}>grey color</ColorBox>
          {` indicating the value is 0 and a `}
          <MissingColorBox>hatching pattern</MissingColorBox>
          {` indicating the value is not available.`}
        </>
      )}
      {!missing && (
        <>
          {`In addition, a`} <ColorBox color={ZERO_COLOR}>grey color</ColorBox>
          {` is used to emphasize the value is 0.`}
        </>
      )}
    </Typography.Paragraph>
  );
}

export function ValueLegend({
  signal,
  horizontal,
  vertical,
}: {
  signal?: ISignal;
  horizontal?: boolean;
  vertical?: boolean;
}) {
  return (
    <Typography.Paragraph>
      {horizontal && vertical && `The value scales are`}
      {horizontal && !vertical && `The horizontal value scale is`}
      {!horizontal && vertical && `The vertical value scale is`}
      {!horizontal && !vertical && `The value scale of each plot is`}
      {` ranging from 0 to a defined computed maximum for
      ${signal ? `the signal ${signal.name}` : 'the signal'}.
      Similar to the original `}
      <CCLink />
      {`, the maximum is computed as the average signal value in the whole database plus three times its standard deviation (`}
      <Typography.Text code>mean + 3 * stdev</Typography.Text>
      {`).`}
    </Typography.Paragraph>
  );
}

export function CompareDescription({ regions }: { regions: IRegion[] }) {
  return (
    <Typography.Paragraph>
      {`Every region is assigned a unique color to separate them: `}
      {regions.map((region, i) => (
        <Fragment key={i}>
          <ColorBox color={COMPARE_COLORS[i]}>{region.name}</ColorBox>
          {i < regions.length - 2 && <>, </>}
          {i === regions.length - 2 && <>, and </>}
        </Fragment>
      ))}
    </Typography.Paragraph>
  );
}

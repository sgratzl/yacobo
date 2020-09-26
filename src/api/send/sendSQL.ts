import { ITripleValue, signals } from '@/model';
import { formatISO, isValid } from 'date-fns';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { ICommonOptions } from '../format';
import { setCommonHeaders } from './setCommonHeaders';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? '';

export const DDL = `
-- Data Definition File for Yacobo Database Exports

CREATE TABLE yacobo_signal (
	signal	    varchar(${signals.reduce((acc, d) => Math.max(acc, d.id.length), 30)}),
	name	      varchar(${signals.reduce((acc, d) => Math.max(acc, d.name.length), 50)}),
	description	varchar(255),
	PRIMARY KEY (signal)
);
INSERT INTO yacobo_signal(signal, name, description) VALUES
${signals
  .map((d, i) => `  ("${d.id}", "${d.name}", "${d.description()}")${i < signals.length - 1 ? ',' : ';'}`)
  .join('\n')}

-- mysql syntax
CREATE TABLE yacobo_data (
  id         int not null auto_increment,
  isodate    date,
  region     varchar(5), -- fips code
  signal     varchar(${signals.reduce((acc, d) => Math.max(acc, d.id.length), 30)}),
  value      real,
  stderr     real,
  PRIMARY KEY (id)
)
`;

function formatString(string?: string) {
  return string == null ? 'NULL' : `"${string}"`;
}
function formatNumber(value?: number | null) {
  return value == null ? 'NULL' : value.toString();
}
function formatISODate(date?: Date | number) {
  if (!date || !isValid(date)) {
    return undefined;
  }
  return formatISO(date, { representation: 'date' });
}

// eslint-disable-next-line @typescript-eslint/ban-types
export default function sendSQL<T extends ITripleValue>(
  req: NextApiRequest,
  res: NextApiResponse,
  data: T[],
  options: ICommonOptions
) {
  const c = options.constantFields;
  setCommonHeaders(req, res, options, 'sql');
  res.setHeader('Content-Type', 'application/sql; charset=utf-8');
  let stream = `-- assumes a data structure as of ${BASE_URL}/api/ddl.sql\n`;
  if (data.length > 0) {
    stream += 'INSERT INTO yacobo_data (isodate, region, signal, value, stderr) VALUES\n';
    data.forEach((row, i) => {
      const date = formatISODate(row.date ?? c.date);
      stream += `  (${formatString(date)},${formatString(row.region ?? c.region)},${formatString(
        row.signal ?? c.signal
      )},${formatNumber(row.value)},${formatNumber(row.stderr)})${i === data.length - 1 ? ';' : ','}\n`;
    });
  }
  res.send(stream);
  res.end();
}

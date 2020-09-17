import { subDays, subMonths, subWeeks } from 'date-fns';

export function regionDateSummaryDates(date: Date) {
  const yesterday = subDays(date, 1);
  const week = subWeeks(date, 1);
  const month = subMonths(date, 1);
  return [date, yesterday, week, month];
}

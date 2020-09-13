export function classNames(...classes: (boolean | null | undefined | string)[]) {
  return classes.filter(Boolean).join(' ');
}

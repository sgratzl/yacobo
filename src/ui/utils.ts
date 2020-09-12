export function fetcher(path: string) {
  return fetch(path).then((r) => r.json());
}

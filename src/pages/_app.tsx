import type { AppProps } from 'next/app';
import '../client/globals.scss';

function YaCoBo({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default YaCoBo;

import type { AppProps } from 'next/app';
import '../styles/globals.scss';

function YaCoBo({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default YaCoBo;

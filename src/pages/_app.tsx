import type { AppProps } from 'next/app';
import '../client/globals.css';

function YaCoBo({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default YaCoBo;

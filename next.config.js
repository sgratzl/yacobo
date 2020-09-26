/* eslint-env node */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('./package.json');

module.exports = {
  env: {
    NEXT_PUBLIC_VERSION: pkg.version,
    NEXT_PUBLIC_BASE_URL: process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000',
    COVIDCAST_ENDPOINT: process.env.COVIDCAST_ENDPOINT || 'https://api.covidcast.cmu.edu/epidata/api.php',
  },
  async redirects() {
    return [
      {
        source: '/signal/all',
        destination: '/',
        permanent: true,
      },
      {
        source: '/compare/date',
        destination: '/compare',
        permanent: true,
      },
      {
        source: '/signal',
        destination: '/',
        permanent: true,
      },
      {
        source: '/date',
        destination: '/',
        permanent: true,
      },
      {
        source: '/signal/all/:date',
        destination: '/date/:date',
        permanent: true,
      },
      {
        source: '/region/:region/all',
        destination: '/region/:region',
        permanent: true,
      },
      {
        source: '/compare/:regions/date',
        destination: '/compare/:regions',
        permanent: true,
      },
    ];
  },
};

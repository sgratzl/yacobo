/* eslint-env node */

module.exports = {
  async redirects() {
    return [
      {
        source: '/signal/all',
        destination: '/',
        permanent: true,
      },
      {
        source: '/signal',
        destination: '/',
        permanent: true,
      },
      {
        source: '/history',
        destination: '/',
        permanent: true,
      },
      {
        source: '/signal/all/:date',
        destination: '/history/:date',
        permanent: true,
      },
      {
        source: '/region/:region/all',
        destination: '/region/:region',
        permanent: true,
      },
    ];
  },
};

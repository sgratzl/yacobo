# YaCoBo - Yet another COVID-19 Board

[![License: MIT][mit-image]][mit-url] [![Github Actions][github-actions-image]][github-actions-url]

YaCoBo (Yet another COVID-19 Board) is a dashboard application visualizing the data from the [Delphi Group at Carnegie Mellon University](https://delphi.cmu.edu/) as part of the [COVIDCast](https://covidcast.cmu.edu) project.

![Overview](https://user-images.githubusercontent.com/4129778/93870730-efce6e80-fccd-11ea-9854-0b5d627ef5ef.png)

![Compare Regions](https://user-images.githubusercontent.com/4129778/93870932-31f7b000-fcce-11ea-8b0b-134f6928384a.png)

## Features

- overview of several signal collected by COVIDCast
- drill down to individual signals, regions, dates, and their combinations
- compare regions across multiple signals
- bookmark your favorite sections for a personalized summary (local store only)
- sharable URLs with social media preview images
- download the shown data in CSV or JSON format
- download the shown images in PNG, JPEG, or PDF format
- download the shown images as [Vega Lite Specification](https://vega.github.io/vega-lite/)
- use the provided [OpenAPI/Swagger](https://swagger.io/specification/) description to access the API

## Development Environment

YaCoBo is implemented using [Next.js](https://nextjs.org), hosted on [Vercel](https://vercel.com/), and uses [Lambda Store](https://lambda.store/) for caching.

```sh
npm i -g yarn
yarn install
docker-compose up -d
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Common commands

```sh
yarn dev
yarn compile
yarn test
yarn lint
yarn fix
yarn build
yarn release
```

### License

YaCoBo is released under the **MIT License**. Copyright of the website belongs to Samuel Gratzl. The [Terms of Use](https://covidcast.cmu.edu/terms-of-use.html) of the COVIDCast project apply.

[mit-image]: https://img.shields.io/badge/License-MIT-yellow.svg
[mit-url]: https://opensource.org/licenses/MIT
[github-actions-image]: https://github.com/sgratzl/yacobo/workflows/ci/badge.svg
[github-actions-url]: https://github.com/sgratzl/yacobo/actions

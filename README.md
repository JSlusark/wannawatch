# Wanna Watch

A movie watchlist app built with Next.js, TypeScript, and Tailwind, with components developed in isolation in Storybook.

## Setup

```bash
nvm use
npm install
```

## Scripts

```bash
npm run dev              # start the app
npm run storybook        # start Storybook on localhost:6006
npm run build             # production build
npm run build-storybook  # build the static Storybook site
npm run lint              # ESLint
npm run typecheck         # TypeScript, no emit
npm run test               # Vitest (unit tests + Storybook story tests)
npm run format             # Prettier
```

## Where the movies come from

By default the app reads its movies from one file in the code, `src/data/staticMovies.json`
(about 500 popular movies with posters, scores and plot vectors). It needs no database and
no API key, which is how the deployed site runs.

To use the local database and the movie API instead, add this line to `.env.local`
(with `DATABASE_URL` and `MOVIE_API_KEY`, and Docker running: `npm run db:up`):

```bash
MOVIE_SOURCE=live
```

To refresh the file from the database and the movie API: `npm run export:static`.

<div align="center">
<h1 id="wannawatch" style="font-size: 50px; border-bottom: none;" align="center">WannaWatch</h1>
<!-- <img src="./images/hero_image.png" alt="WannaWatch" width="500" align="center"> -->

<br />

[About](#about) · [Online demo](#online-demo) · [Storybook](https://develop--6ab6af8a25eede04be456883.chromatic.com) · [Current build status](#current-build-status) · [Design](#design) · [Running the project](#running-the-project) · [Upcoming features](#upcoming-features)

</div>

<br/>

<div align="center">
<img src="./images/preview.gif" width="800" alt="Preview of the WannaWatch catalogue">
</div>

<br/>

WannaWatch is a full-stack web app built for movie lovers tired of endless scrolling to find their favourite gem.

- **Score what you watch:** the user can add movies to their "Watched" list and score them, and the app will use that information to improve its recommendations.

- **Your Daily 10:** each day, the app provides a curated stack of 10 films based on the user's watch history, which the user can swipe through to add to their "WannaWatch" list or skip.

- **Your viewer persona:** as the user's tastes evolve, the app builds a dynamic viewer persona that summarizes their cinematic profile, which they can also fine-tune anytime to sharpen the app's matches or break out from their user-persona bubble.

<br/>
<div align="right"><a href="#wannawatch">↑ Return to top</a></div>

<br/>

# Online demo

You can find the deployed app at [https://wannawatch.vercel.app](https://wannawatch.vercel.app). <br/>

> **Note:** Currently this is just at an hardcoded MVP stage. It was launched to start testing its CD pipeline and `Storybook` hosting. While the branch `build` is what uses the live database and connection to the Trakt API.

# Current build status

The `build` branch is the full version of the app, running on a local `PostgreSQL` database of more than 28,800 movies from the Trakt API.

### Features

- **Movie catalogue:** popular movies, 20 per page, with posters, genres and IMDb and Rotten Tomatoes scores.
  > The filter bar is only a preview: filtering is not implemented yet.
- **Interactive movie card:** ✓ Watched flips the card to score the movie from "Hated it" (-2) to "Loved it" (+2), the bookmark adds it to WannaWatch, and clicking the card opens its details page.
  > A movie can never be in both lists.
- **Daily 10:** a swipe deck of 10 movies the user hasn't marked yet: right to add to WannaWatch, left to skip.
  > For now the movies are picked at random, not by the user's taste.
- **More like this:** a row of the 10 most similar movies on every movie page.
- **Sample profile:** the Watched and WannaWatch lists of a hardcoded sample user.
  > Changes are not saved to an account yet.
- **Accessibility:** a keyboard alternative for every gesture, reduced motion support and semantic HTML.

### AI implementation

The similar movies are found with embeddings. A free model that runs locally (`bge-small-en-v1.5` with `Transformers.js`) turns each movie's plot into 384 numbers that describe its meaning, which are saved in `PostgreSQL` with the `pgvector` extension. When a movie page opens, `pgvector` finds the 200 plots closest in meaning (cosine similarity), and a scoring function re-ranks them by plot similarity (60%) and shared genres (40%) to keep the best 10. Only the plot is embedded: with the titles included, the model matched movies by shared words, like _Big Fish_ with any movie containing "Big".

<div align="center">
<img src="./images/ai-embeddings.png" width="900" alt="How More like this works: once for every movie, the plot goes through the embedding model and its 384 numbers are saved in PostgreSQL with pgvector; when a movie page opens, pgvector finds the 200 closest plots, they are re-ranked by plot similarity and shared genres, and the best 10 are shown">
</div>

Below you can see a 3d preview of the vectorized movie data (embeddings), based on movie similarity per plot. The claude code artifact can be accessed [here](https://claude.ai/artifact/G4erFtk3oEAsiFKTNsBLXg).

<div align="left">
<a href="https://claude.ai/artifact/G4erFtk3oEAsiFKTNsBLXg"><img src="./images/vectorized_moviedata.gif" width="600" alt="3D map of the movie embeddings: the searched movie in the centre, its 10 most similar movies numbered around it, and every other movie placed farther out the less similar its plot is"></a>
</div>

### Technologies

- **Stack:** `Next.js 16`, `React 19`, `TypeScript`, `Tailwind CSS v4`, `shadcn`, `Base UI`, `Motion`, `PostgreSQL` + `pgvector`, `Drizzle`, `Transformers.js`.
- **Quality:** every component is built in `Storybook` first. Its stories include interaction tests (`play` functions that click through the component like a user), which the `Storybook` `Vitest` addon runs in a headless `Chromium` browser with `Playwright`. The logic has `Vitest` unit tests, `Chromatic` takes visual snapshots of every story, and `GitHub Actions` runs all of it on every pull request.
- **Design tokens:** colours, fonts and hard shadows defined in one place, with contrast checked against WCAG AA. The dark theme is only available in `Storybook` for now.

<br/>

<div align="right"><a href="#wannawatch">↑ Return to top</a></div>

<br/>

# Design

The style of WannaWatch is **neubrutalism** (also called neo-brutalism): flat colours, thick black outlines, hard shadows with no blur and bold, oversized type. The inspiration came from the Techgroove rebrand, the Aura Bora shop and the [Neobrutalism UI how-to](https://dribbble.com/shots/20764973-Neobrutalism-UI-How-to) on Dribbble, mixed with a zine, indie and punk mood: colourful, loud, a bit crazy and unconventional.

- **Design tokens:** all the colours, fonts, radius and shadows can be explored in the [Storybook tokens page](https://develop--6ab6af8a25eede04be456883.chromatic.com/?path=/docs/foundations-tokens--docs).
- **Design brainstorm:** my sketches, the Canva mockups and the concept art, including some concepts I am still planning to add, are collected in [DESIGN_BRAINSTORM.md](./DESIGN_BRAINSTORM.md).

<div align="center">
<img src="./images/brainstorm/chatgpt/neon-zine-movie-swipe-interface.jpg" width="420" alt="ChatGPT concept art of the swipe interface">
<img src="./images/brainstorm/chatgpt/wannawatch-punk-streaming-app-moodboard.jpg" width="420" alt="ChatGPT punk streaming app moodboard">
</div>

<br/>

<div align="right"><a href="#wannawatch">↑ Return to top</a></div>

<br/>

# Running the project

Follow these steps to run the app on your machine. Everything runs from the `main` branch: by default the app reads the same hardcoded movies as the online demo, and one setting switches it to the full database (see the last steps).

**Prerequisites:**

- Install `Node.js` (the version is set in `.nvmrc`; with `nvm`, run `nvm use`).
- Optional, only for the live database: `Docker` and a free Trakt API key.

**How to run the project:**

1. Clone or download this repository to your local machine.
2. Open a terminal in the project folder and run `npm install`.
3. Run `npm run dev`.
4. Open `http://localhost:3000` in your browser.

**How to open `Storybook`:**

1. Run `npm run storybook`.
2. Open `http://localhost:6006` in your browser.

**How to use the live database (optional):**

1. Create a `.env.local` file in the project folder with these lines:

   ```bash
   MOVIE_SOURCE=live
   DATABASE_URL=postgres://user:password@localhost:5432/dbname
   MOVIE_API_KEY=your-trakt-api-key
   ```

2. Run `npm run db:up` to start `PostgreSQL` with `pgvector` in `Docker`.
3. Run `npm run db:migrate` to create the tables.
4. Run `npm run db:seed` to add the movies from Trakt (about 29,000).
5. Run `npm run db:embed` to create the embedding of every movie.
6. Run `npm run dev`.

> The seed and embed scripts take a while the first time, because they download every movie and run the AI model on each plot locally. <br/> To update the static movies file from the database, run `npm run export:static`.

<br/>

<div align="right"><a href="#wannawatch">↑ Return to top</a></div>

<br/>

# Upcoming features

Each page will have its own job, and together they make the full experience:

- **Landing page:** a short animation that shows what WannaWatch is about in a few seconds, with sign up and log in.
- **Onboarding:** right after signing up, the user adds at least 5 watched and 5 WannaWatch movies, with a progress counter, to unlock their Daily 10.
- **Catalogue:** movies and series, filters by genre, year, rating, country and streaming service (kept when switching between movies and series), ordering by release date or IMDb and Rotten Tomatoes rating, and search by title, director or actor.
- **Daily 10:** AI recommendations based on the user's Watched and WannaWatch lists. The same 10 stay all day, skipped movies never come back, and when there are no new recommendations the app suggests reviewing the user's bookmarks instead.
- **Profile:** an AI-generated description of the user's taste, with keywords and favourite genres, and the option to edit scores or remove movies from both lists.
- **Advanced search:** the user picks up to 5 watched movies, describes what they liked about each one, and the AI suggests 5 real movies and explains the reason behind each choice.
- **Saving:** user accounts that keep every list, score and skip.

<!-- <div align="center">

### - Preview images -

<img src="./images/catalogue.png" height="300" alt="Catalogue">
<img src="./images/daily_10.png" height="300" alt="Daily 10">
<img src="./images/movie_page.png" height="300" alt="Movie page">
<img src="./images/profile.png" height="300" alt="Profile">

</div> -->

</br>

> **Data Source Note:** Movie data and posters come from [Trakt](https://trakt.tv).

</br>

<div align="right"><a href="#wannawatch">↑ Return to top</a></div>

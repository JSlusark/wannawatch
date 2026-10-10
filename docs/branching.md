# Branching

> **Status: initial idea.** This is a first draft of how I want to organise branches while building WannaWatch on my own. I am figuring the project out as I go, so this will change.

## Why I use branches when I work alone

There is no team to coordinate with, but working through branches and pull requests (PRs) still helps:

- Every change goes through a PR, so CI checks run before anything reaches `main`.
- The list of merged PRs shows how the project grew, one feature at a time.
- `main` always has a working version of the app.

## Rules

1. **One branch at a time.** Start it from an up-to-date `main`, merge it through a PR, then start the next one.
2. **Backend first, then UI.** Each feature gets two branches: `feat/<feature>-api` (database and server code, with a test proving it works), then `feat/<feature>-ui` (the screen uses it). Merge the API branch before starting the UI one, so the two halves never live apart for long.
3. **Done means it works, not that it is perfect.** If the feature works and is readable, merge it. Visual polish can come later in its own small branch.
4. **`main` always works.** Never merge something that breaks the app or the checks.
5. **Inside a branch I can experiment freely.** Changing my mind is fine. The branch only has to make sense when I open the PR.

## Naming

Format: `type/short-description`, lowercase, words separated by `-`.

The types match the ones I use in commit messages ([Conventional Commits](https://www.conventionalcommits.org/)):

| Type | Use it for | Example |
| --- | --- | --- |
| `feat/` | a new feature | `feat/watchlist` |
| `fix/` | a bug fix | `fix/score-not-saving` |
| `refactor/` | restructuring code without changing what it does | `refactor/movie-card-hooks` |
| `style/` | visual polish only | `style/card-shadows` |
| `chore/` | setup, tooling, dependencies | `chore/database-setup` |
| `docs/` | documentation only | `docs/branching` |
| `experiment/` | trying an idea I might throw away | `experiment/swipe-physics` |

For features, the end of the name says which side it is: `-api` for backend, `-ui` for frontend (`feat/watchlist-api`, `feat/watchlist-ui`). Branches that aren't part of a feature don't need it (`chore/database-setup`, `style/card-shadows`).

Reference: [Conventional Branch](https://conventional-branch.github.io/).

## Why split backend and UI

- Each PR is smaller and easier to read.
- The API can be tested on its own before any screen depends on it.
- It makes it easy to alternate between backend and frontend work.

Splitting by deployable part (frontend and backend in separate PRs) is common practice, for example in [Sentry](https://redirect.github.com/getsentry/sentry/pull/70711). The risk is leaving the two halves apart for too long, so each branch stays short and gets merged soon ([trunk-based development, DORA](https://dora.dev/capabilities/trunk-based-development/)).

## Possible order (draft)

| # | Branch | What it does |
| --- | --- | --- |
| 1 | `feat/movie-card` | finish the movie card (frontend only) |
| 2 | `chore/database-setup` | database and `movies` table, filled with mock data |
| 3 | `feat/catalogue-api` | read movies from the database |
| 4 | `feat/catalogue-ui` | catalogue shows real data |
| 5 | `feat/watchlist-api` | save "Wanna Watch" |
| 6 | `feat/watchlist-ui` | bookmark button saves |
| 7 | `feat/watched-score-api` | save "watched" and the −3 to +3 score |
| 8 | `feat/watched-score-ui` | score card saves the rating |
| 9 | `feat/daily-10-api` | pick 10 movies a day |
| 10 | `feat/daily-10-ui` | swipe deck uses them |
| 11 | `feat/auth-api` | user accounts |
| 12 | `feat/auth-ui` | login screen |

Auth comes last on purpose: building features for a single user first is simpler, and adding accounts later is a manageable change.

## Open questions

- Which database host and which library to talk to it (to decide before step 2, recorded as an ADR in `docs/adr/`).
- Whether to protect `main` on GitHub so changes can only go in through a PR.

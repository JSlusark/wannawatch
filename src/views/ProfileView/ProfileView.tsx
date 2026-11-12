"use client";

import { AdvancedSearchCallout } from "@/components/AdvancedSearchCallout";
import { CatalogueGrid } from "@/components/CatalogueGrid";
import { useUserMovies } from "@/components/CatalogueGrid/useUserMovies";
import { CollectionPanel } from "@/components/CollectionPanel";
import { ProfileSummary } from "@/components/ProfileSummary";
import { SiteHeader } from "@/components/SiteHeader";
import { user } from "@/data/user";
import type { LibraryEntry, SaveUserMovie } from "@/data/userMovies";

// Three columns of cards inside each collection panel
const PANEL_GRID =
  "grid-cols-[repeat(auto-fill,minmax(max(9.8rem,calc((100%_-_2rem)/3)),1fr))] gap-x-4 gap-y-6";

type ProfileViewProps = {
  /** Every movie the user marked, from anywhere in the app */
  library: LibraryEntry[];
  /** Where each change is saved (the server's mock library). Storybook leaves it out */
  save?: SaveUserMovie;
};

// The profile: your info and taste on top, then your two collections side by side
// (Watched on the left, WannaWatch on the right).
function ProfileView({ library, save }: ProfileViewProps) {
  const movies = library.map((entry) => entry.movie);
  // One shared record for both lists, so a movie can move from one to the other
  const { userMovies, update } = useUserMovies(
    Object.fromEntries(library.map((e) => [e.movie.id, e.userMovie])),
    save,
  );
  const watched = movies.filter((movie) => userMovies[movie.id]?.watched);
  const wannaWatch = movies.filter((movie) => userMovies[movie.id]?.bookmarked);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-col gap-12 px-6 py-12 sm:px-10">
        <ProfileSummary user={user} />
        <AdvancedSearchCallout className="mx-auto w-full lg:w-[70vw]" />

        <div className="mx-auto grid w-full items-start gap-8 lg:w-[70vw] lg:grid-cols-2">
          <CollectionPanel
            title="Watched"
            count={watched.length}
            tone="purple"
            addLabel="Add a movie to Watched"
          >
            <CatalogueGrid
              movies={watched}
              userMovies={userMovies}
              onUpdate={update}
              className={PANEL_GRID}
            />
          </CollectionPanel>
          <CollectionPanel
            title="WannaWatch"
            count={wannaWatch.length}
            tone="lime"
            addLabel="Add a movie to WannaWatch"
          >
            <CatalogueGrid
              movies={wannaWatch}
              userMovies={userMovies}
              onUpdate={update}
              className={PANEL_GRID}
            />
          </CollectionPanel>
        </div>
      </main>
    </div>
  );
}

export { ProfileView };

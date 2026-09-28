import { AdvancedSearchCallout } from "@/components/AdvancedSearchCallout";
import { CatalogueGrid } from "@/components/CatalogueGrid";
import { CollectionPanel } from "@/components/CollectionPanel";
import { ProfileSummary } from "@/components/ProfileSummary";
import { SiteHeader } from "@/components/SiteHeader";
import { movies } from "@/data/movies";
import { user } from "@/data/user";

const watched = movies.filter((movie) => movie.isWatched);
const wannaWatch = movies.filter((movie) => movie.isBookmarked);

// The profile: your info and taste on top, then your two collections side by side
// (Watched on the left, WannaWatch on the right).
function ProfileView() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-col gap-12 px-6 py-12 sm:px-10">
        <ProfileSummary user={user} />
        <AdvancedSearchCallout className="mx-auto w-[90vw] max-w-full" />

        <div className="mx-auto grid w-full items-start gap-8 lg:w-[70vw] lg:grid-cols-2">
          <CollectionPanel
            title="Watched"
            count={watched.length}
            tone="lime"
            addLabel="Add a movie to Watched"
          >
            <CatalogueGrid
              movies={watched}
              className="grid-cols-[repeat(auto-fill,minmax(9.8rem,1fr))] gap-x-4 gap-y-6"
            />
          </CollectionPanel>
          <CollectionPanel
            title="WannaWatch"
            count={wannaWatch.length}
            tone="purple"
            addLabel="Add a movie to WannaWatch"
          >
            <CatalogueGrid
              movies={wannaWatch}
              className="grid-cols-[repeat(auto-fill,minmax(9.8rem,1fr))] gap-x-4 gap-y-6"
            />
          </CollectionPanel>
        </div>
      </main>
    </div>
  );
}

export { ProfileView };

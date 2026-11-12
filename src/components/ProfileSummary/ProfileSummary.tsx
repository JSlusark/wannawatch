import { GenreList } from "@/components/movie/GenreList";
import { Badge } from "@/components/ui/badge";
import type { UserProfile } from "@/data/user";
import { cn } from "@/lib/utils";

// Each group of labels gets its own colour
const TINTS = ["soft-lime", "soft-purple", "soft-orange"] as const;

function initials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("");
}

// Top of the profile, no box around it: avatar and name side by side, then what the
// algorithm thinks you like (as labels) and a nudge to add more movies.
function ProfileSummary({
  user,
  className,
}: {
  user: UserProfile;
  className?: string;
}) {
  return (
    <section
      aria-labelledby="profile-heading"
      className={cn(
        "mx-auto flex w-full lg:w-[70vw] flex-col gap-10",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:text-left">
        <span
          aria-hidden="true"
          className="grid size-32 shrink-0 place-items-center rounded-full border-4 border-border bg-pink font-display text-5xl text-ink shadow-brutal sm:size-40"
        >
          {initials(user.name)}
        </span>
        <div>
          <h1
            id="profile-heading"
            className="font-display text-4xl leading-none uppercase sm:text-6xl"
          >
            {user.name}
          </h1>
          <p className="mt-2 font-mono text-base font-bold text-muted-foreground">
            {user.handle}
          </p>
          <p className="mt-4 max-w-2xl text-lg sm:text-xl">{user.bio}</p>
        </div>
      </div>

      <div className="text-center sm:text-left">
        <h2 className="font-display text-2xl uppercase">Your taste</h2>
        <p className="text-muted-foreground">
          What your daily WannaWatch is based on
        </p>
        <dl className="mt-5 grid gap-6 sm:grid-cols-3">
          {user.tasteGroups.map((group, index) => (
            <div key={group.heading}>
              <dt className="font-mono text-xs font-bold uppercase">
                {group.heading}
              </dt>
              <dd>
                {group.plain ? (
                  <GenreList
                    genres={group.labels}
                    className="mt-2 justify-center text-sm sm:justify-start"
                  />
                ) : (
                  <ul className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                    {group.labels.map((label) => (
                      <Badge
                        key={label}
                        render={<li />}
                        variant={TINTS[index % TINTS.length]}
                        className="h-7 text-sm"
                      >
                        {label}
                      </Badge>
                    ))}
                  </ul>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="text-center text-lg font-medium sm:text-left">
        Want better picks? Add more movies to your <strong>Watched</strong> and{" "}
        <strong>WannaWatch</strong> lists below. The more we know, the better
        your daily recommendations get.
      </p>
    </section>
  );
}

export { ProfileSummary };

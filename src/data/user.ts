// Mock profile (no backend yet). The "taste" labels are what the algorithm
// would work out from the movies in the two collections.
type UserProfile = {
  name: string;
  handle: string;
  bio: string;
  tasteGroups: { heading: string; labels: string[]; plain?: boolean }[];
};

const user: UserProfile = {
  name: "Sam Rivers",
  handle: "@samrivers",
  bio: "Loves a movie that keeps you guessing. Weekend horror fan, weekday comedy fan.",
  tasteGroups: [
    {
      heading: "Genres you love",
      labels: ["Horror", "Comedy", "Drama"],
      plain: true, // genres are plain text, never in boxes
    },
    {
      heading: "Plots and topics",
      labels: ["Revenge", "Corporate satire", "Survival"],
    },
    {
      heading: "Twists you enjoy",
      labels: ["Twist endings", "Surreal turns", "Dark humor"],
    },
  ],
};

export { user, type UserProfile };

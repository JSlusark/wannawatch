import { Film } from "lucide-react";
import Image from "next/image";

function PosterLowOverlay() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 h-4/5 bg-linear-to-t from-media-scrim/65  to-transparent"
    />
  );
}

function PosterTopOverlay() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-media-glow/20 via-media-glow/10 to-transparent"
    />
  );
}

// url missing or null = no poster: shows "Image not found" instead
function Poster({ url }: { url?: string | null }) {
  if (!url) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gray-300 text-ink"
      >
        <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
          <span className="grid size-12 place-items-center ">
            <Film className="size-16  " />
          </span>
          <p className="text-xl  p-5 font-medium">Image not found</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Image
        src={url}
        alt=""
        fill
        sizes="(min-width: 768px) 22rem, 100vw"
        // Posters from the movie API load straight in the browser: the API blocks the
        // server-side resizer, and its posters are already small .webp files
        unoptimized={url.startsWith("https://")}
        className="-z-10 object-cover"
      />
      <PosterTopOverlay />
      <PosterLowOverlay />
    </div>
  );
}

// Shared with PreviewCard, which shows the same poster without the card buttons
export { Poster, PosterLowOverlay };

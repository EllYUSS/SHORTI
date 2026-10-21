import catalog from "./catalog.json";

/** One drama in the catalogue. Edit the entries in `catalog.json`, not here. */
export type Show = {
  id: string;
  title: string;
  genre: string;
  category: string;
  views: string;
  image: string;
  badge?: string;
  episodes: number;
  currentEpisode: number;
  summary: string;
  cast: { name: string; role: string; image: string }[];
  isNew?: boolean;
};

export const shows: Show[] = catalog.shows;
export const forYouShow: Show = catalog.featured;
export const genreOptions: string[] = catalog.genres;
export const categoryLabels: Record<string, string> = catalog.categoryLabels;

import catalog from "./catalog.json";

/** One drama in the catalogue. Edit the entries in `catalog.json`, not here. */
export type Show = {
  id: string;
  title: string;
  genre: string;
  category: string;
  views: string;
  image: string;
  /** Необязательный путь к видео, например `/assets/video/prison-king.mp4`.
      Без него плеер показывает постер, как раньше. */
  video?: string;
  badge?: string;
  episodes: number;
  currentEpisode: number;
  summary: string;
  cast: { name: string; role: string; image: string }[];
  isNew?: boolean;
};

export const shows: Show[] = catalog.shows as Show[];
export const forYouShow: Show = catalog.featured as Show;
export const genreOptions: string[] = catalog.genres;
export const categoryLabels: Record<string, string> = catalog.categoryLabels;

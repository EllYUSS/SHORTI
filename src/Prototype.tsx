import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useDrag } from "@use-gesture/react";
import {
  ArrowLeftIcon,
  BookmarkIcon,
  BellIcon,
  ChevronDownIcon,
  CheckIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  Cross1Icon,
  LayersIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  MixerHorizontalIcon,
  PauseIcon,
  QuestionMarkCircledIcon,
  RocketIcon,
  StarIcon,
} from "@radix-ui/react-icons";
import { categoryLabels, forYouShow, genreOptions, shows, type Show } from "./content";
import {
  BottomSheet,
  Carousel,
  KeyboardInput,
  MobileScroll,
  useKeyboard,
} from "./mobile";



const categoryTabs = ["HOT", "NEW", "RANKING"];
const mainTabOrder: Record<MainTab, number> = { home: 0, "for-you": 1, search: 2, profile: 3 };
const feedSlideVariants = {
  enter: (direction: number) => ({ y: direction > 0 ? "100%" : "-100%" }),
  center: { y: "0%" },
  exit: (direction: number) => ({ y: direction > 0 ? "-100%" : "100%" }),
};
const pageSlideVariants = {
  enter: (direction: number) => ({ x: `${direction * 100}%` }),
  center: { x: "0%" },
  exit: (direction: number) => ({ x: `${direction * -100}%`, pointerEvents: "none" as const }),
};
const initialHistory = ["prison-king", "forbidden-tide", "billionaire-contract"];
const initialSaved = ["secret-heir", "reborn-to-love", "velvet-revenge"];
const coinHistoryEntries = [
  { id: "login-oct-11", title: "Вход в игру", date: "2026.10.11", month: "ОКТ. 2026 г.", amount: 20 },
  { id: "daily-oct-10", title: "Отмечай приём пищи", date: "2026.10.10", month: "ОКТ. 2026 г.", amount: 5 },
  { id: "save-oct-10", title: "Добавить сериал в «Мой список»", date: "2026.10.10", month: "ОКТ. 2026 г.", amount: 10 },
  { id: "login-oct-09", title: "Вход в игру", date: "2026.10.09", month: "ОКТ. 2026 г.", amount: 20 },
  { id: "login-oct-07", title: "Вход в игру", date: "2026.10.07", month: "ОКТ. 2026 г.", amount: 20 },
  { id: "expired-sep-22", title: "Истекший", date: "2026.09.22", month: "СЕНТ. 2026 г.", amount: -11 },
  { id: "set-sep-15", title: "День 3/7 набора монет", date: "2026.09.15", month: "СЕНТ. 2026 г.", amount: 120 },
] as const;
const coinExpiryEntries = [
  { id: "expires-oct-15-a", date: "2026.10.15", amount: 20 },
  { id: "expires-oct-16", date: "2026.10.16", amount: 120 },
  { id: "expires-oct-17", date: "2026.10.17", amount: 20 },
  { id: "expires-oct-18-a", date: "2026.10.18", amount: 5 },
  { id: "expires-oct-18-b", date: "2026.10.18", amount: 10 },
  { id: "expires-oct-18-c", date: "2026.10.18", amount: 20 },
] as const;
const rechargePackages = [
  { coins: "100", price: "29 ₽", bonus: "" },
  { coins: "500", price: "129 ₽", bonus: "+50" },
  { coins: "1000", price: "229 ₽", bonus: "+150" },
  { coins: "2000", price: "429 ₽", bonus: "+500" },
] as const;
const vipPlans = [
  { id: "weekly-vip", title: "Еженедельный", detail: "Продление каждую неделю. Отменить можно в любое время.", price: "199 ₽", oldPrice: "", discount: "", featured: true, adFree: true },
  { id: "monthly-vip", title: "Ежемесячный", detail: "Автоматическое продление. Отменить можно в любое время.", price: "499 ₽", oldPrice: "", discount: "", featured: false, adFree: true },
] as const;
const dailyRewardAmounts = [50, 75, 100, 150, 200, 300, 500];
const hourlyRewardCooldownMs = 60 * 60 * 1000;

function formatRewardCooldown(milliseconds: number) {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

type MainPage = "home" | "for-you" | "search" | "profile" | "library";
type MainTab = "home" | "for-you" | "search" | "profile";
type SettingsPage = "language" | "account-management" | "recommendations" | "privacy" | "legal";
type AccountFlowPage = "store" | "rewards" | "coin-history" | "coin-expiry" | "transaction-history" | "auto-unlock";
type Page = MainPage | "detail" | "watch" | "settings" | "wallet" | "exchange" | "notifications" | SettingsPage | AccountFlowPage;
type SheetKind = "filter" | "coming" | "rate" | null;
type SettingsDialogKind = "cache" | "logout" | null;
type CoinHistoryFilter = "all" | "earned" | "spent";
type AccountIconName = "mail" | "settings" | "copy" | "coin" | "clock" | "adfree" | "support" | "exchange" | "drama" | "bookmark" | "star" | "items" | "subscriptions" | "notifications" | "feedback";

function byId(id: string) {
  return id === forYouShow.id ? forYouShow : shows.find((show) => show.id === id) ?? shows[0];
}

function MenuPlayIcon({ size = 26, active = false }: { size?: number; active?: boolean }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.1 5.7 18.2 11.4a1.7 1.7 0 0 1 0 3L8.1 20.1a1.7 1.7 0 0 1-2.5-1.5V7.2a1.7 1.7 0 0 1 2.5-1.5Z" fill={active ? "currentColor" : "none"} />
    </svg>
  );
}

function PlayOutlineIcon({ size = 26 }: { size?: number }) {
  return <MenuPlayIcon size={size} />;
}

function PosterCard({ show, onOpen }: { show: Show; onOpen: () => void }) {
  return (
    <button className="poster-card" type="button" onClick={onOpen} aria-label={`Открыть сериал «${show.title}»`}>
      <span className="poster-art">
        <img src={show.image} alt="" draggable={false} />
        {show.badge ? <span className={`poster-badge ${show.badge === "Хит" ? "is-hot" : ""}`}>{show.badge}</span> : null}
        <span className="poster-views">
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 5.4C7.1 5.4 3.35 8 0.55 12c2.8 4 6.55 6.6 11.45 6.6s8.65-2.6 11.45-6.6C20.65 8 16.9 5.4 12 5.4Z" />
            <circle cx="12" cy="12" r="4.45" fill="#111114" />
            <circle cx="12" cy="12" r="2.05" fill="currentColor" />
          </svg>
          {show.views}
        </span>
      </span>
      <span className="poster-title">{show.title}</span>
      <span className="poster-genre">{show.genre}</span>
    </button>
  );
}

function HomeTabIcon({ active }: { active: boolean }) {
  return (
    <svg className="home-tab-icon" aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path
        d="M5.2 19.5h2.9c.7 0 1.2-.5 1.2-1.2v-5.1a2.7 2.7 0 0 1 5.4 0v5.1c0 .7.5 1.2 1.2 1.2h2.9c1.1 0 2-.9 2-2v-7a2.5 2.5 0 0 0-.8-1.8l-6.6-5.9a2.1 2.1 0 0 0-2.8 0L4 8.7a2.5 2.5 0 0 0-.8 1.8v7c0 1.1.9 2 2 2Z"
        fill={active ? "currentColor" : "none"}
      />
    </svg>
  );
}

function ForYouTabIcon({ active }: { active: boolean }) {
  return <MenuPlayIcon active={active} />;
}

function ProfileTabIcon({ active }: { active: boolean }) {
  const headRadius = active ? 4.5 : 3.4;
  const bodyPath = active
    ? "M4.5 21c.5-5.3 3.3-8 7.5-8s7 2.7 7.5 8"
    : "M4.5 21c.5-4.8 3.3-7.2 7.5-7.2s7 2.4 7.5 7.2";

  return (
    <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r={headRadius} fill={active ? "currentColor" : "none"} stroke={active ? "none" : "currentColor"} />
      <path
        d={bodyPath}
        fill={active ? "currentColor" : "none"}
        stroke={active ? "none" : "currentColor"}
      />
    </svg>
  );
}

function ProfileBookmarkIcon() {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.15 3.8h11.7a1.5 1.5 0 0 1 1.5 1.5v14.45L12 15.05l-7.35 4.7V5.3a1.5 1.5 0 0 1 1.5-1.5Z" />
    </svg>
  );
}

function AccountIcon({ name, size = 23 }: { name: AccountIconName; size?: number }) {
  if (name === "coin") {
    return <img aria-hidden="true" className="ruble-coin-icon" src="/assets/coin-ruble.svg" width={size} height={size} alt="" />;
  }

  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {name === "mail" ? <><rect x="3.5" y="5" width="17" height="14" rx="3" /><path d="m5.2 7.2 6.8 5.2 6.8-5.2" /></> : null}
      {name === "settings" ? <><path d="m12 3.2 7.6 4.2v9.2L12 20.8l-7.6-4.2V7.4L12 3.2Z" /><circle cx="12" cy="12" r="2.8" /></> : null}
      {name === "copy" ? <><rect x="8" y="3.5" width="12" height="15" rx="2.4" /><path d="M16 20.5H6.2A2.2 2.2 0 0 1 4 18.3V7.5" /></> : null}
      {name === "clock" ? <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.2 2.1" /></> : null}
      {name === "adfree" ? <><rect x="3.5" y="5" width="17" height="14" rx="3" /><path d="m7 16 10-8M7 9h.01M17 15h.01" /></> : null}
      {name === "support" ? <><path d="M4 5.8A2.8 2.8 0 0 1 6.8 3h10.4A2.8 2.8 0 0 1 20 5.8v7.4a2.8 2.8 0 0 1-2.8 2.8h-5L7 20v-4H6.8A2.8 2.8 0 0 1 4 13.2V5.8Z" /><path d="M8 9.5h.01M12 9.5h.01M16 9.5h.01" /></> : null}
      {name === "exchange" ? <><path d="M4 8h14m0 0-3-3m3 3-3 3M20 16H6m0 0 3-3m-3 3 3 3" /></> : null}
      {name === "drama" ? <><rect x="3.5" y="4.5" width="17" height="15" rx="3" /><path d="m10 8 6 4-6 4V8Z" /></> : null}
      {name === "bookmark" ? <path d="M6.15 3.8h11.7a1.5 1.5 0 0 1 1.5 1.5v14.45L12 15.05l-7.35 4.7V5.3a1.5 1.5 0 0 1 1.5-1.5Z" /> : null}
      {name === "star" ? <path d="m12 3.8 2.55 5.18 5.72.83-4.14 4.04.98 5.7L12 16.86l-5.11 2.69.98-5.7-4.14-4.04 5.72-.83L12 3.8Z" /> : null}
      {name === "items" ? <><path d="M4 9.2 12 5l8 4.2-8 4.2-8-4.2Z" /><path d="m4 13.2 8 4.2 8-4.2M4 17.2l8 4 8-4" /></> : null}
      {name === "subscriptions" ? <><rect x="3.5" y="4" width="17" height="16" rx="3" /><path d="M7.5 8h9m-9 4h9m-9 4h5" /></> : null}
      {name === "notifications" ? <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></> : null}
      {name === "feedback" ? <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v10a2.5 2.5 0 0 1-2.5 2.5H10l-5 3v-3.3a2.5 2.5 0 0 1-1-2.2v-10Z" /><path d="M12 7v4m0 3h.01" /></> : null}
    </svg>
  );
}

function SearchTabIcon({ active }: { active: boolean }) {
  return (
    <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2.2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10.6" cy="10.6" r="6.8" />
      <path d="m15.6 15.6 4.1 4.1" />
    </svg>
  );
}

function BottomNavigation({ active, onNavigate, className = "" }: { active: MainTab; onNavigate: (page: MainTab) => void; className?: string }) {
  const items = [
    { id: "home", label: "Главная", icon: HomeTabIcon },
    { id: "for-you", label: "Для вас", icon: ForYouTabIcon },
    { id: "search", label: "Поиск", icon: SearchTabIcon },
    { id: "profile", label: "Профиль", icon: ProfileTabIcon },
  ] as const;

  return (
    <nav className={`bottom-navigation ${className}`} aria-label="Главная навигация">
      {items.map(({ id, label, icon: Icon }) => {
        const selected = id === active;
        return (
          <button
            className={`nav-item ${selected ? "is-active" : ""}`}
            type="button"
            key={id}
            aria-label={label}
            aria-current={selected ? "page" : undefined}
            onClick={() => onNavigate(id)}
          >
            <Icon active={selected} />
          </button>
        );
      })}
    </nav>
  );
}

export default function Prototype() {
  const keyboard = useKeyboard();
  const [page, setPage] = useState<Page>("home");
  const [pageDirection, setPageDirection] = useState(1);
  const [selectedShow, setSelectedShow] = useState<Show>(shows[0]);
  const [selectedCategory, setSelectedCategory] = useState("HOT");
  const [search, setSearch] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [savedIds, setSavedIds] = useState(initialSaved);
  const [historyIds, setHistoryIds] = useState(initialHistory);
  const [historyEnabled, setHistoryEnabled] = useState(true);
  const [coinBalance, setCoinBalance] = useState(199);
  const [bonusCoinBalance, setBonusCoinBalance] = useState(195);
  const [dailyRewardClaimed, setDailyRewardClaimed] = useState(false);
  const [hourlyRewardReadyAt, setHourlyRewardReadyAt] = useState<number | null>(null);
  const [hourlyRewardTimeLeft, setHourlyRewardTimeLeft] = useState(0);
  const [coinHistoryFilter, setCoinHistoryFilter] = useState<CoinHistoryFilter>("all");
  const [coinHistoryFilterOpen, setCoinHistoryFilterOpen] = useState(false);
  const [coinAlertsEnabled, setCoinAlertsEnabled] = useState(false);
  const [autoUnlockEnabled, setAutoUnlockEnabled] = useState(true);
  const [navStack, setNavStack] = useState<Page[]>([]);
  const [editList, setEditList] = useState(false);
  const [expandedSynopsis, setExpandedSynopsis] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [episodeSheetOpen, setEpisodeSheetOpen] = useState(false);
  const [episodeRangeIndex, setEpisodeRangeIndex] = useState(0);
  const [watchLiked, setWatchLiked] = useState(false);
  const [watchProgress, setWatchProgress] = useState(65);
  const [watchSynopsisExpanded, setWatchSynopsisExpanded] = useState(false);
  const [forYouLiked, setForYouLiked] = useState(false);
  const [forYouProgress, setForYouProgress] = useState(0);
  const [forYouIndex, setForYouIndex] = useState(0);
  const [forYouPlaying, setForYouPlaying] = useState(true);
  const [forYouImmersive, setForYouImmersive] = useState(false);
  const [forYouMuted, setForYouMuted] = useState(false);
  const [forYouDirection, setForYouDirection] = useState(1);
  const [toast, setToast] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [notificationCategory, setNotificationCategory] = useState<"new" | "system">("new");
  const [selectedLanguage, setSelectedLanguage] = useState("Русский");
  const [settingsDialog, setSettingsDialog] = useState<SettingsDialogKind>(null);
  const [selectedRating, setSelectedRating] = useState(5);

  // Android tints the system status bar with theme-color. Track the colour of the
  // current screen's top edge so that strip blends into the app instead of
  // reading as a band above it.
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    const purpleTopped = page === "home" || page === "search";
    meta.setAttribute("content", purpleTopped ? "#240c37" : "#050505");
  }, [page]);

  /* iOS всегда возвращает список туда, где его оставили. Позиция пишется на
     каждый скролл и восстанавливается, когда экран снова становится текущим. */
  const watchVideoRef = useRef<HTMLVideoElement | null>(null);
  const forYouVideoRef = useRef<HTMLVideoElement | null>(null);

  /* Кнопка play/pause — единственный источник правды для плеера. iOS не даёт
     запускать звук без жеста пользователя, поэтому play() вызывается только по
     нажатию и его отказ не ломает состояние. */
  useEffect(() => {
    const video = watchVideoRef.current;
    if (!video) return;
    if (playing) void video.play().catch(() => setPlaying(false));
    else video.pause();
  }, [playing, currentEpisode, selectedShow.id]);

  const scrollMemory = useRef<Record<string, number>>({});

  useEffect(() => {
    /* Во время перехода в DOM два слоя; нужен скроллер текущего экрана, а не
       последний в разметке. */
    const scroller = document.querySelector<HTMLElement>(
      `.page-transition-layer[data-page="${page}"] .mobile-scroll`,
    );
    if (!scroller) return;

    const saved = scrollMemory.current[page];
    if (saved) scroller.scrollTop = saved;

    const onScroll = () => { scrollMemory.current[page] = scroller.scrollTop; };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [page]);

  /* Системный жест «назад» в Safari — это кнопка браузера, поэтому обработка
     popstate даёт его бесплатно. С корневой вкладки стек пуст, и браузер уходит
     со страницы — для веб-приложения это ожидаемое поведение, перехватывать его
     не нужно. Без списка зависимостей, чтобы обработчик видел свежее состояние. */
  useEffect(() => {
    const onPop = () => { goBack(); };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  });

  useEffect(() => {
    if (hourlyRewardReadyAt === null) {
      setHourlyRewardTimeLeft(0);
      return;
    }

    const updateTimeLeft = () => {
      const remaining = Math.max(0, hourlyRewardReadyAt - Date.now());
      setHourlyRewardTimeLeft(remaining);
      if (remaining === 0) setHourlyRewardReadyAt(null);
    };

    updateTimeLeft();
    const interval = window.setInterval(updateTimeLeft, 1000);
    return () => window.clearInterval(interval);
  }, [hourlyRewardReadyAt]);

  /* Лента «Для вас» — только то, у чего есть видео: автопереход привязан к
     концу воспроизведения, и ролик-постер остановил бы ленту навсегда. Пока
     видео не добавлено ни одному сериалу, показываем каталог, чтобы экран не
     остался пустым. */
  const forYouFeed = useMemo(() => {
    const withVideo = [forYouShow, ...shows].filter((show) => show.video);
    return withVideo.length > 0 ? withVideo : [forYouShow, ...shows];
  }, []);
  const forYouItem = forYouFeed[forYouIndex] ?? forYouFeed[0];

  const goToForYou = (step: number) => {
    setForYouDirection(step);
    setForYouIndex((index) => (index + step + forYouFeed.length) % forYouFeed.length);
    setForYouProgress(0);
    setForYouPlaying(true);
  };

  const advanceForYou = () => goToForYou(1);

  /* Лента владеет вертикальным жестом сама: короткий или быстрый свайп
     переключает ролик, не дожидаясь конца воспроизведения. Разметка помечена
     data-scroll-drag="ignore", иначе перетаскивание забрал бы MobileScroll. */
  const bindForYouSwipe = useDrag(
    ({ last, movement: [, moveY], velocity: [, velocityY], direction: [, directionY] }) => {
      if (!last) return;
      const farEnough = Math.abs(moveY) > 80;
      const fastEnough = velocityY > 0.35;
      if (!farEnough && !fastEnough) return;
      if (directionY === 0) return;
      goToForYou(directionY < 0 ? 1 : -1);
    },
    { axis: "y", filterTaps: true },
  );

  /* Кнопка в центре — источник правды для воспроизведения ленты. iOS запрещает
     автозапуск со звуком, но разрешает его после действия пользователя. Поэтому
     сначала пробуем со звуком и только при отказе браузера уходим в беззвучный
     режим — иначе лента молчала бы даже там, где звук разрешён. */
  useEffect(() => {
    const video = forYouVideoRef.current;
    if (!video) return;
    video.muted = forYouMuted;
    if (!forYouPlaying) {
      video.pause();
      return;
    }
    void video.play().catch(() => {
      if (video.muted) {
        setForYouPlaying(false);
        return;
      }
      video.muted = true;
      setForYouMuted(true);
      void video.play().catch(() => setForYouPlaying(false));
    });
  }, [forYouPlaying, forYouMuted, forYouIndex]);

  const visibleShows = useMemo(() => {
    let result = [...shows];
    if (selectedCategory === "NEW") result = result.filter((show) => show.isNew);
    if (selectedCategory === "RANKING") result = result.sort((a, b) => Number.parseFloat(b.views.replace(",", ".")) - Number.parseFloat(a.views.replace(",", ".")));
    if (selectedGenres.length > 0) result = result.filter((show) => selectedGenres.includes(show.genre));
    /* Запрос применяется только на своём экране: раньше он молча фильтровал и
       главную ленту, где поля поиска нет и сбросить его нечем. */
    const normalizedSearch = page === "search" ? search.trim().toLowerCase() : "";
    if (normalizedSearch) {
      result = result.filter((show) => `${show.title} ${show.genre} ${show.category}`.toLowerCase().includes(normalizedSearch));
    }
    return result;
  }, [page, search, selectedCategory, selectedGenres]);

  const openDetail = (show: Show) => {
    keyboard.hide();
    pushPage();
    setSelectedShow(show);
    setExpandedSynopsis(false);
    setPageDirection(1);
    setPage("detail");
  };

  const toggleSaved = (show: Show) => {
    setSavedIds((ids) => (ids.includes(show.id) ? ids.filter((id) => id !== show.id) : [show.id, ...ids]));
    showToast(savedIds.includes(show.id) ? "Удалено из избранного" : "Добавлено в избранное");
  };

  const shareShow = async (show: Show) => {
    const shareUrl = window.location.href;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: show.title, text: show.summary, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(`${show.title}\n${shareUrl}`);
      showToast("Ссылка скопирована");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      showToast("Не удалось поделиться сериалом");
    }
  };

  const startWatching = (show: Show = selectedShow) => {
    keyboard.hide();
    setSelectedShow(show);
    setCurrentEpisode(show.currentEpisode || 1);
    if (historyEnabled) setHistoryIds((ids) => [show.id, ...ids.filter((id) => id !== show.id)]);
    pushPage();
    setEpisodeSheetOpen(false);
    setWatchSynopsisExpanded(false);
    setPlaying(false);
    setPageDirection(1);
    setPage("watch");
  };

  const episodeRanges = Array.from({ length: Math.ceil(selectedShow.episodes / 30) }, (_, index) => {
    const start = index * 30 + 1;
    return { start, end: Math.min(start + 29, selectedShow.episodes) };
  });

  const openEpisodeSheet = () => {
    keyboard.hide();
    setEpisodeRangeIndex(Math.floor((currentEpisode - 1) / 30));
    setEpisodeSheetOpen(true);
  };

  const selectEpisode = (episode: number) => {
    if (episode > currentEpisode + 12) {
      showToast("Для этой серии нужен безлимитный доступ");
      return;
    }

    setCurrentEpisode(episode);
    setPlaying(false);
    setEpisodeSheetOpen(false);
    if (historyEnabled) setHistoryIds((ids) => [selectedShow.id, ...ids.filter((id) => id !== selectedShow.id)]);
  };

  /* Кладёт текущий экран в стек и добавляет запись в историю браузера. В
     Safari на iOS свайп от левого края — это и есть кнопка «назад», поэтому
     корректная история даёт системный жест без собственного обработчика. */
  const pushPage = () => {
    keyboard.hide();
    setNavStack((stack) => [...stack, page]);
    setPageDirection(1);
    if (typeof window !== "undefined") window.history.pushState({ shorty: true }, "");
  };

  const navigate = (nextPage: MainTab) => {
    keyboard.hide();
    setNavStack([]);
    if (nextPage === "search") setSelectedCategory("HOT");
    const currentTab: MainTab | null = page === "library" ? "profile" : page in mainTabOrder ? page as MainTab : null;
    setPageDirection(currentTab === null || mainTabOrder[nextPage] >= mainTabOrder[currentTab] ? 1 : -1);
    setPage(nextPage);
  };

  const onComing = (label: string) => {
    keyboard.hide();
    setSheet("coming");
    showToast(`Раздел «${label}» скоро появится`);
  };

  /* Один таймер на все сообщения: без отмены предыдущего второй тост подряд
     гасился его таймером раньше срока. */
  const toastTimerRef = useRef<number | null>(null);

  const showToast = (message: string) => {
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = window.setTimeout(() => {
      setToast("");
      toastTimerRef.current = null;
    }, 1800);
  };

  const openAccountFlowPage = (nextPage: AccountFlowPage | "exchange") => {
    pushPage();
    setPage(nextPage);
  };

  const openSettingsPage = (nextPage: SettingsPage) => {
    pushPage();
    setPage(nextPage);
  };

  /* Единственный путь возврата: кнопка в углу, жест от края и кнопка браузера
     ведут сюда. Стек делает поведение одинаковым для любого экрана, и новый
     экран не требует правки цепочки условий. */
  const goBack = () => {
    keyboard.hide();
    setEpisodeSheetOpen(false);
    if (navStack.length === 0) return false;
    const previousPage = navStack[navStack.length - 1];
    setNavStack((stack) => stack.slice(0, -1));
    setPageDirection(-1);
    setPage(previousPage);
    return true;
  };

  const toggleHistoryPreference = () => {
    setHistoryEnabled((enabled) => {
      const nextEnabled = !enabled;
      if (!nextEnabled) setHistoryIds([]);
      return nextEnabled;
    });
  };

  const libraryIds = savedIds;
  const isSaved = savedIds.includes(selectedShow.id);
  const visibleCoinHistory = coinHistoryEntries.filter((entry) => coinHistoryFilter === "all" || (coinHistoryFilter === "earned" ? entry.amount > 0 : entry.amount < 0));
  const coinHistoryMonths = [...new Set(visibleCoinHistory.map((entry) => entry.month))];
  const regularCoinBalance = Math.max(0, coinBalance - bonusCoinBalance);
  const activeNavigation = page === "library" ? "profile" : page === "home" || page === "for-you" || page === "search" || page === "profile" ? page : null;
  const accountPageTitles: Partial<Record<Page, string>> = {
    settings: "Настройки",
    wallet: "Мой кошелёк",
    store: "Магазин",
    rewards: "Награды",
    "coin-history": "История монет",
    "coin-expiry": "Срок действия наградных монет",
    "transaction-history": "История транзакций",
    "auto-unlock": "Автоматическая разблокировка",
    exchange: "Обмен VIP и монет",
    language: "Язык",
    "account-management": "Управление аккаунтом",
    recommendations: "Конфиденциальность и настройки рекомендаций",
    privacy: "Приватность",
    legal: "Правовая информация и политики",
  };

  return (
    <MotionConfig reducedMotion="user">
    <div className="stream-app" data-page={page}>
      <AnimatePresence initial={false} mode="sync" custom={pageDirection}>
      <motion.div
        key={page}
        data-page={page}
        className="page-transition-layer"
        custom={pageDirection}
        variants={pageSlideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ type: "spring", visualDuration: 0.35, bounce: 0 }}
      >
      {page === "home" || page === "search" ? <div className="header-scrim" aria-hidden="true" /> : null}

      {page === "home" ? (
        <header className="home-header">
          <div className="home-brand-row">
            <div className="brand-mark" aria-label="Шорты"><PlayOutlineIcon size={18} /></div>
          </div>
          <Carousel ariaLabel="Категории сериалов" className="category-carousel" contentClassName="category-track">
            {categoryTabs.map((category) => (
              <button
                type="button"
                key={category}
                className={`category-tab ${selectedCategory === category ? "is-selected" : ""}`}
                onClick={() => setSelectedCategory(category)}
              >
                {categoryLabels[category]}
              </button>
            ))}
          </Carousel>
        </header>
      ) : null}

      {page === "search" ? (
        <header className="search-page-header">
          <div className="search-field">
            <MagnifyingGlassIcon width={20} height={20} />
            <KeyboardInput
              aria-label="Поиск сериалов"
              placeholder="Поиск"
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              onBlur={() => keyboard.hide()}
            />
            {search ? <button type="button" className="clear-search" aria-label="Очистить поиск" onClick={() => setSearch("")}><Cross1Icon width={13} height={13} /></button> : null}
            <button className="filter-button" type="button" aria-label="Открыть фильтры" onClick={() => setSheet("filter")}><MixerHorizontalIcon width={18} height={18} /></button>
          </div>
        </header>
      ) : null}

      {page === "detail" ? (
        <header className="detail-toolbar">
          <button className="round-icon-button" type="button" aria-label="Назад" onClick={() => goBack()}><ArrowLeftIcon width={22} height={22} /></button>
        </header>
      ) : null}

      {page === "library" ? (
        <header className="library-toolbar">
          <button className="round-icon-button" type="button" aria-label="Назад в профиль" onClick={() => goBack()}><ArrowLeftIcon width={22} height={22} /></button>
          <h1>Мой список</h1>
        </header>
      ) : null}

      {page === "watch" ? (
        <header className="watch-toolbar">
          <button className="round-icon-button" type="button" aria-label="Закрыть плеер" onClick={() => { setPlaying(false); goBack(); }}><ArrowLeftIcon width={22} height={22} /></button>
        </header>
      ) : null}

      {page === "profile" ? (
        <header className="profile-toolbar" aria-label="Действия аккаунта">
          <button className="profile-toolbar-button" type="button" aria-label="Уведомления" onClick={() => { pushPage(); setPage("notifications"); }}><AccountIcon name="mail" /></button>
          <button className="profile-toolbar-button" type="button" aria-label="Настройки" onClick={() => { pushPage(); setPage("settings"); }}><AccountIcon name="settings" /></button>
        </header>
      ) : null}

      {page === "notifications" ? (
        <header className="notification-toolbar">
          <button className="round-icon-button" type="button" aria-label="Назад в профиль" onClick={() => goBack()}><ArrowLeftIcon width={22} height={22} /></button>
          <div className="notification-tabs" role="tablist" aria-label="Тип уведомлений">
            <button type="button" role="tab" aria-selected={notificationCategory === "new"} className={notificationCategory === "new" ? "is-selected" : ""} onClick={() => setNotificationCategory("new")}>Новое</button>
            <button type="button" role="tab" aria-selected={notificationCategory === "system"} className={notificationCategory === "system" ? "is-selected" : ""} onClick={() => setNotificationCategory("system")}>Система</button>
          </div>
          <span aria-hidden="true" />
        </header>
      ) : null}

      {page === "settings" || page === "wallet" || page === "exchange" || page === "language" || page === "account-management" || page === "recommendations" || page === "privacy" || page === "legal" || page === "store" || page === "rewards" || page === "coin-history" || page === "coin-expiry" || page === "transaction-history" || page === "auto-unlock" ? (
        <header className={`account-internal-toolbar ${page === "coin-expiry" ? "is-coin-expiry" : ""}`}>
          <button className="round-icon-button" type="button" aria-label="Назад" onClick={() => goBack()}><ArrowLeftIcon width={22} height={22} /></button>
          {accountPageTitles[page] ? <h1>{accountPageTitles[page]}</h1> : <span aria-hidden="true" />}
          {page === "store" ? <button className="account-toolbar-action" type="button" onClick={() => showToast("Покупки восстановлены")}>Восстановить</button> : <span aria-hidden="true" />}
        </header>
      ) : null}

      <MobileScroll className={`stream-scroll ${page === "home" ? "home-scroll" : ""} ${page === "for-you" ? "for-you-scroll" : ""} ${page === "search" ? "search-scroll" : ""} ${page === "library" ? "library-scroll" : ""} ${page === "watch" ? "watch-scroll" : ""} ${page === "notifications" ? "notifications-scroll" : ""}`}>
        {page === "for-you" ? (
          <main className={`for-you-feed ${forYouImmersive ? "is-immersive" : ""}`} aria-label="Подборка Для вас">
            {/* Уезжает только кадр: элементы управления вынесены за пределы
                анимируемого слоя и остаются на месте. */}
            <AnimatePresence initial={false} mode="popLayout" custom={forYouDirection}>
              <motion.div
                key={forYouIndex}
                className="for-you-media"
                custom={forYouDirection}
                variants={feedSlideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", visualDuration: 0.42, bounce: 0 }}
              >
                {forYouItem.video ? (
                  <video
                    ref={(element) => {
                      /* Только присваиваем: на размонтировании старого ролика
                         React передаёт null и затёр бы ссылку на новый. */
                      if (element) forYouVideoRef.current = element;
                    }}
                    className="for-you-art"
                    src={forYouItem.video}
                    playsInline
                    autoPlay
                    preload="auto"
                    onTimeUpdate={(event) => {
                      const video = event.currentTarget;
                      if (video.duration) setForYouProgress((video.currentTime / video.duration) * 100);
                    }}
                    onEnded={advanceForYou}
                  />
                ) : (
                  <img className="for-you-art" src={forYouItem.image} alt="" draggable={false} />
                )}
              </motion.div>
            </AnimatePresence>

            <div className="for-you-scrim" aria-hidden="true" />

                {/* Нажатие по кадру убирает и возвращает элементы поверх видео. */}
                <button
                  {...bindForYouSwipe()}
                  data-scroll-drag="ignore"
                  className="for-you-stage"
                  type="button"
                  aria-label={forYouImmersive ? "Показать элементы управления" : "Скрыть элементы управления"}
                  aria-pressed={forYouImmersive}
                  onClick={() => setForYouImmersive((hidden) => !hidden)}
                />

                <button
                  className="for-you-play"
                  type="button"
                  aria-label={forYouPlaying ? "Пауза" : "Воспроизвести"}
                  onClick={() => setForYouPlaying((playing) => !playing)}
                >
                  {forYouPlaying ? (
                    <svg className="player-pause-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none">
                      <path d="M8 6.25v11.5M16 6.25v11.5" />
                    </svg>
                  ) : (
                    <PlayOutlineIcon />
                  )}
                </button>

                <div className="for-you-actions" aria-label="Действия с сериалом">
                  <button className={`for-you-action ${savedIds.includes(forYouItem.id) ? "is-saved" : ""}`} type="button" aria-label={savedIds.includes(forYouItem.id) ? "Убрать из избранного" : "Добавить в избранное"} aria-pressed={savedIds.includes(forYouItem.id)} onClick={() => toggleSaved(forYouItem)}>
                    <svg className="for-you-outline-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none">
                      <path fill={savedIds.includes(forYouItem.id) ? "currentColor" : "none"} d="M6.15 3.8h11.7a1.5 1.5 0 0 1 1.5 1.5v14.45L12 15.05l-7.35 4.7V5.3a1.5 1.5 0 0 1 1.5-1.5Z" />
                    </svg>
                    <span>{forYouItem.views}</span>
                  </button>
                  <button className={`for-you-action ${forYouLiked ? "is-liked" : ""}`} type="button" aria-label={forYouLiked ? "Убрать отметку нравится" : "Нравится"} aria-pressed={forYouLiked} onClick={() => setForYouLiked((liked) => !liked)}>
                    <svg className="for-you-outline-icon for-you-heart-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none">
                      <path fill={forYouLiked ? "currentColor" : "none"} d="M12 19.15 4.25 11.7a4.9 4.9 0 0 1 6.95-6.9L12 5.6l.8-.8a4.9 4.9 0 0 1 6.95 6.9L12 19.15Z" />
                    </svg>
                    <span>{forYouLiked ? "630" : "629"}</span>
                  </button>
                  <button
                    className={`for-you-action ${forYouMuted ? "is-muted" : ""}`}
                    type="button"
                    aria-label={forYouMuted ? "Включить звук" : "Выключить звук"}
                    aria-pressed={!forYouMuted}
                    onClick={() => setForYouMuted((muted) => !muted)}
                  >
                    <svg className="for-you-outline-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4.8 6.6 8.4H3.6v7.2h3L11 19.2V4.8Z" fill="currentColor" />
                      {forYouMuted ? (
                        <path d="m15.4 9.6 5 4.8m0-4.8-5 4.8" />
                      ) : (
                        <path d="M15.2 9a4.2 4.2 0 0 1 0 6M18 6.4a8 8 0 0 1 0 11.2" />
                      )}
                    </svg>
                  </button>
                  <button className="for-you-action for-you-share-action" type="button" aria-label="Поделиться сериалом" onClick={() => void shareShow(forYouItem)}>
                    <svg className="for-you-share-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none">
                      <path d="M5.05 4.6h13.4a3 3 0 0 1 2.45 4.72l-6.82 10.02a2.75 2.75 0 0 1-4.9-1.04L8 12.85 3.65 9.4a3 3 0 0 1 1.4-4.8Z" />
                      <path d="m8 12.85 7.2-4.4" />
                    </svg>
                  </button>
                </div>

                <section className="for-you-caption">
                  {forYouItem.badge ? <span className="for-you-badge"><StarIcon width={14} height={14} /> {forYouItem.badge}</span> : null}
                  <button className="for-you-title" type="button" onClick={() => openDetail(forYouItem)}>
                    <span>{forYouItem.title}</span><ChevronRightIcon width={19} height={19} />
                  </button>
                  <p className="for-you-summary"><span>{forYouItem.summary}</span><button type="button" onClick={() => openDetail(forYouItem)}>Подробнее</button></p>
                  <span className="for-you-genre">{forYouItem.genre}</span>
                </section>

                <div className="for-you-progress">
                  <span className="for-you-progress-track" aria-hidden="true"><span style={{ width: `${forYouProgress}%` }} /></span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={forYouProgress}
                    aria-label="Позиция в ролике"
                    onChange={(event) => {
                      const percent = Number(event.currentTarget.value);
                      setForYouProgress(percent);
                      const video = forYouVideoRef.current;
                      if (video?.duration) video.currentTime = (percent / 100) * video.duration;
                    }}
                  />
                </div>

            <button className="for-you-watch" type="button" onClick={() => startWatching(forYouItem)}><PlayOutlineIcon size={17} /> Смотреть сейчас</button>
          </main>
        ) : null}

        {page === "home" ? (
          <main className="home-content">
            {visibleShows.length ? (
              <>
                <div className="section-heading"><h1>{selectedCategory === "HOT" ? "Сейчас популярно" : selectedCategory === "RANKING" ? "Лучшие сериалы" : "Новые серии"}</h1><span>Обновлено сегодня</span></div>
                <div className="poster-grid">
                  {visibleShows.map((show) => <PosterCard key={show.id} show={show} onOpen={() => openDetail(show)} />)}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <span className="empty-icon"><MagnifyingGlassIcon width={25} height={25} /></span>
                <h2>Сериалы не найдены</h2>
                <p>Попробуйте другое название или измените фильтры.</p>
                <button type="button" className="text-action" onClick={() => { setSearch(""); setSelectedGenres([]); }}>Сбросить поиск и фильтры</button>
              </div>
            )}
          </main>
        ) : null}

        {page === "search" ? (
          <main className="search-content">
            <div className="section-heading">
              <h1>{search.trim() ? "Результаты поиска" : "Популярные сериалы"}</h1>
              <span>{search.trim() ? `Найдено: ${visibleShows.length}` : "Подборка"}</span>
            </div>
            {visibleShows.length ? (
              <div className="poster-grid">
                {visibleShows.map((show) => <PosterCard key={show.id} show={show} onOpen={() => openDetail(show)} />)}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon"><MagnifyingGlassIcon width={25} height={25} /></span>
                <h2>Сериалы не найдены</h2>
                <p>Попробуйте другое название или измените фильтры.</p>
                <button type="button" className="text-action" onClick={() => { setSearch(""); setSelectedGenres([]); }}>Сбросить поиск и фильтры</button>
              </div>
            )}
          </main>
        ) : null}

        {page === "profile" ? (
          <main className="profile-content">
            <div className="profile-heading">
              <span className="profile-avatar"><ProfileTabIcon active={false} /></span>
              <h1>Elvin Yusifov</h1>
              <button className="account-uid" type="button" aria-label="Скопировать UID" onClick={() => { void navigator.clipboard?.writeText("1551745887"); showToast("UID скопирован"); }}>
                <span>UID: 1551745887</span><AccountIcon name="copy" size={16} />
              </button>
            </div>

            <section className="account-wallet" aria-label="Мой кошелёк">
              <button className="account-section-title" type="button" onClick={() => { pushPage(); setPage("wallet"); }}><strong>Мой кошелёк</strong><ChevronRightIcon width={18} height={18} /></button>
              <div className="account-wallet-balances">
                <button className="account-balance" type="button" onClick={() => { pushPage(); setPage("wallet"); }}>
                  <span className="account-balance-icon is-coin"><AccountIcon name="coin" size={44} /></span>
                  <span><strong>{coinBalance}</strong><small>Монеты</small></span>
                </button>
              </div>
            </section>

            <section className="account-feature-panels" aria-label="Список и награды">
              <button className="account-feature-panel" type="button" onClick={() => { pushPage(); setPage("library"); }}>
                <span className="account-feature-icon"><AccountIcon name="bookmark" size={22} /></span>
                <span className="account-feature-copy"><strong>Мой список</strong><small>Избранное и история просмотра</small></span>
                <ChevronRightIcon width={18} height={18} />
              </button>
              <button className="account-feature-panel" type="button" onClick={() => openAccountFlowPage("rewards")}>
                <span className="account-feature-icon"><AccountIcon name="star" size={22} /></span>
                <span className="account-feature-copy"><strong>Награды</strong><small>Бонусы и подарки</small></span>
                <ChevronRightIcon width={18} height={18} />
              </button>
            </section>

            <section className="account-link-group" aria-label="Уведомления и помощь">
              <button className="account-link-row" type="button" onClick={() => { pushPage(); setPage("notifications"); }}><span className="account-link-icon"><AccountIcon name="notifications" /></span><span>Уведомления</span><ChevronRightIcon width={18} height={18} /></button>
              <button className="account-link-row" type="button" onClick={() => onComing("Обратная связь")}><span className="account-link-icon"><AccountIcon name="feedback" /></span><span>Обратная связь</span><ChevronRightIcon width={18} height={18} /></button>
            </section>
          </main>
        ) : null}

        {page === "settings" ? (
          <main className="account-settings-content">
            <button className="account-settings-row" type="button" onClick={() => openSettingsPage("language")}><span>Язык</span><span className="account-settings-value">{selectedLanguage}</span><ChevronRightIcon width={18} height={18} /></button>
            <section className="account-settings-group" aria-label="Аккаунт и конфиденциальность">
              <button className="account-settings-row" type="button" onClick={() => openSettingsPage("account-management")}><span>Управление аккаунтом</span><ChevronRightIcon width={18} height={18} /></button>
              <button className="account-settings-row" type="button" onClick={() => openSettingsPage("recommendations")}><span>Конфиденциальность и настройки рекомендаций</span><ChevronRightIcon width={18} height={18} /></button>
              <button className="account-settings-row" type="button" onClick={() => setSettingsDialog("cache")}><span>Очистить кэш</span><span className="account-settings-value">69,5 МБ</span><ChevronRightIcon width={18} height={18} /></button>
            </section>
            <section className="account-settings-group" aria-label="Информация о приложении">
              <button className="account-settings-row" type="button" onClick={() => onComing("О приложении")}><span>О нас</span><span className="account-settings-value">Версия 1.0</span><ChevronRightIcon width={18} height={18} /></button>
              <button className="account-settings-row" type="button" onClick={() => { setSelectedRating(5); setSheet("rate"); }}><span>Оцените нас</span><ChevronRightIcon width={18} height={18} /></button>
              <button className="account-settings-row" type="button" onClick={() => openSettingsPage("legal")}><span>Правовая информация и политики</span><ChevronRightIcon width={18} height={18} /></button>
            </section>
            <button className="account-settings-row account-logout" type="button" onClick={() => setSettingsDialog("logout")}><span>Выйти</span><ChevronRightIcon width={18} height={18} /></button>
          </main>
        ) : null}

        {page === "language" ? (
          <main className="language-list-content" aria-label="Выберите язык">
            {["English", "Español", "Português", "Bahasa Indonesia", "Deutsch", "Français", "日本語", "한국어", "ภาษาไทย", "Русский", "繁體中文"].map((language) => (
              <button className="language-option" type="button" key={language} aria-pressed={selectedLanguage === language} onClick={() => setSelectedLanguage(language)}>
                <span>{language}</span>
                <span className={`language-radio ${selectedLanguage === language ? "is-selected" : ""}`}>{selectedLanguage === language ? <CheckIcon width={13} height={13} /> : null}</span>
              </button>
            ))}
          </main>
        ) : null}

        {page === "account-management" ? (
          <main className="settings-subpage-content">
            <section className="account-settings-group" aria-label="Управление аккаунтом">
              <button className="account-settings-row" type="button" onClick={() => onComing("Привязка email")}><span>Привяжите ваш email</span><ChevronRightIcon width={18} height={18} /></button>
              <button className="account-settings-row" type="button" onClick={() => onComing("Привязанные аккаунты")}><span>Привязанные аккаунты</span><ChevronRightIcon width={18} height={18} /></button>
              <button className="account-settings-row account-danger-row" type="button" onClick={() => onComing("Удаление аккаунта")}><span>Удалить аккаунт</span><ChevronRightIcon width={18} height={18} /></button>
            </section>
          </main>
        ) : null}

        {page === "recommendations" ? (
          <main className="settings-subpage-content">
            <section className="account-settings-group" aria-label="Конфиденциальность и рекомендации">
              <button className="account-settings-row" type="button" onClick={() => openSettingsPage("privacy")}><span>Приватность</span><ChevronRightIcon width={18} height={18} /></button>
            </section>
          </main>
        ) : null}

        {page === "privacy" ? (
          <main className="privacy-settings-content">
            <section className="privacy-history-card">
              <div className="privacy-history-heading">
                <h2>История просмотров</h2>
                <button className={`privacy-toggle ${historyEnabled ? "is-on" : ""}`} type="button" role="switch" aria-checked={historyEnabled} aria-label="Сохранять историю просмотров" onClick={toggleHistoryPreference}><span /></button>
              </div>
              <p>Если включено, вы найдёте просмотренные драмы в Истории. Если выключить, история просмотров не будет сохраняться, а раздел Истории будет пустым.</p>
            </section>
          </main>
        ) : null}

        {page === "legal" ? (
          <main className="settings-subpage-content">
            <section className="account-settings-group" aria-label="Правовая информация">
              <button className="account-settings-row" type="button" onClick={() => onComing("Условия обслуживания")}><span>Условия обслуживания</span><ChevronRightIcon width={18} height={18} /></button>
              <button className="account-settings-row" type="button" onClick={() => onComing("Политика конфиденциальности")}><span>Политика конфиденциальности</span><ChevronRightIcon width={18} height={18} /></button>
            </section>
          </main>
        ) : null}

        {page === "wallet" ? (
          <main className="account-wallet-content">
            <section className="wallet-balance-card wallet-coins-card" aria-label="Баланс монет">
              <div className="wallet-balance-line">
                <div className="wallet-balance-main">
                  <span className="wallet-card-label">Монеты</span>
                  <div className="wallet-balance-amount">
                    <span className="wallet-currency-icon is-coin"><AccountIcon name="coin" size={42} /></span>
                    <strong>{coinBalance}</strong>
                  </div>
                </div>
                <button className="wallet-action-button" type="button" onClick={() => openAccountFlowPage("store")}>Пополнить</button>
              </div>
              <button className="wallet-reward-row" type="button" onClick={() => openAccountFlowPage("coin-expiry")}>
                <span>В том числе {bonusCoinBalance} наградных монет</span><ChevronRightIcon width={18} height={18} />
              </button>
            </section>

            <section className="wallet-payment-provider" aria-label="ЮKassa">
              <img className="wallet-yookassa-logo" src="/assets/payment/yookassa-white.svg" alt="ЮKassa" />
              <div className="wallet-payment-provider-copy">
                <span>Оплата и пополнение кошелька</span>
              </div>
              <span className="wallet-payment-provider-status">Скоро</span>
            </section>

            <section className="wallet-history-group" aria-label="История и операции">
              <button type="button" onClick={() => openAccountFlowPage("coin-history")}>История монет<ChevronRightIcon width={18} height={18} /></button>
              <button type="button" onClick={() => openAccountFlowPage("transaction-history")}>История транзакций<ChevronRightIcon width={18} height={18} /></button>
              <button type="button" onClick={() => openAccountFlowPage("exchange")}>Обмен VIP и монет<ChevronRightIcon width={18} height={18} /></button>
            </section>

            <button className="wallet-history-group wallet-unlock-row" type="button" onClick={() => openAccountFlowPage("auto-unlock")}>
              <span>Автоматическая разблокировка</span><ChevronRightIcon width={18} height={18} />
            </button>
          </main>
        ) : null}

        {page === "store" ? (
          <main className="store-content">
            <section className="store-balance-card">
              <div className="store-balance-heading">
                <span className="store-coin-mark"><AccountIcon name="coin" size={19} /></span>
                <strong>Баланс</strong>
                <button type="button" aria-label="О балансе монет" onClick={() => showToast("Наградные монеты расходуются первыми") }><QuestionMarkCircledIcon width={16} height={16} /></button>
              </div>
              <div className="store-balance-values">
                <div><strong>{regularCoinBalance}</strong><span>Монеты</span></div>
                <i aria-hidden="true" />
                <div><strong>{bonusCoinBalance}</strong><span>Награды</span></div>
              </div>
            </section>

            <section className="store-section">
              <div className="store-section-heading"><h2>Подписки</h2><span>Планы</span></div>
              <div className="store-plan-list">
                {vipPlans.map((plan) => (
                  <article className={`store-plan-card ${plan.featured ? "is-featured" : ""}`} key={plan.id}>
                    {plan.discount ? <span className="store-plan-discount">{plan.discount}</span> : null}
                    <div className="store-plan-top">
                      <div className="store-plan-copy">
                        <h3>{plan.title}</h3>
                        <p>{plan.detail}</p>
                      </div>
                      <div className="store-plan-price"><strong>{plan.price}</strong>{plan.oldPrice ? <s>{plan.oldPrice}</s> : null}</div>
                    </div>
                    <div className="store-plan-benefits">
                      <span><AccountIcon name="drama" size={17} />Просмотр коротких драм</span>
                      <span><StarIcon width={17} height={17} />Ежедневные бонусы</span>
                      <span><span className="quality-mark">1080</span>1080P</span>
                      {plan.adFree ? <span><AccountIcon name="adfree" size={17} />Без рекламы</span> : null}
                    </div>
                    <button className="store-plan-action" type="button" onClick={() => showToast("Оформление подписки доступно в полной версии")}>Выбрать план</button>
                  </article>
                ))}
              </div>
            </section>

            <section className="store-section recharge-section">
              <div className="store-section-heading"><h2>Пополнить</h2><span>Монеты</span></div>
              <div className="recharge-package-grid">
                {rechargePackages.map((pack) => (
                  <button className="recharge-package" key={pack.coins} type="button" onClick={() => showToast("Покупка монет доступна в полной версии")}>
                    <span className="recharge-amount"><span className="store-coin-mark"><AccountIcon name="coin" size={16} /></span><strong>{pack.coins}</strong>{pack.bonus ? <b>{pack.bonus}</b> : null}</span>
                    <span className="recharge-price">{pack.price}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="store-terms">
              <h3>Условия использования и информация об оплате</h3>
              <ol>
                <li>ReelShort предлагает бесплатный и платный контент. Вы можете выбрать, что разблокировать.</li>
                <li>Наградные монеты можно получить за задания и бонусы пополнения. Они используются как обычные монеты для разблокировки серий.</li>
                <li>Наградные монеты расходуются первыми и могут иметь срок действия.</li>
                <li>Подписка открывает доступ к преимуществам на период действия плана.</li>
                <li>Подписки активируются после подтверждения покупки в App Store.</li>
                <li>Автопродление списывает оплату за 24 часа до окончания периода, если подписка не отменена.</li>
                <li>Отменить подписку можно в настройках Apple ID не позднее чем за 24 часа до продления.</li>
                <li>Цены могут отличаться в зависимости от региона и страны.</li>
                <li>Для получения помощи свяжитесь с нами через раздел обратной связи.</li>
              </ol>
            </section>
          </main>
        ) : null}

        {page === "rewards" ? (
          <main className="rewards-content">
              <div className="rewards-tab-panel">
                <section className="reward-balance-card">
                  <div><span>Наградные монеты</span><strong>{bonusCoinBalance}</strong></div>
                  <span className="wallet-currency-icon is-coin"><AccountIcon name="coin" size={27} /></span>
                </section>
                <section className="daily-reward-card">
                  <div className="daily-reward-heading"><span className="reward-orb"><StarIcon width={22} height={22} /></span><div><h2>Ежедневная награда</h2><p>Заходи каждый день за бонусами</p></div></div>
                  <div className="daily-reward-days" aria-label="Награды за семь дней">
                    {dailyRewardAmounts.map((amount, index) => <span className={index === 0 && dailyRewardClaimed ? "is-claimed" : index === 0 ? "is-current" : ""} key={index}><small>День {index + 1}</small><strong>{amount}</strong><i>монет</i></span>)}
                  </div>
                  <button className="rewards-primary-action" type="button" disabled={dailyRewardClaimed} onClick={() => { if (!dailyRewardClaimed) { setDailyRewardClaimed(true); setCoinBalance((balance) => balance + dailyRewardAmounts[0]); setBonusCoinBalance((balance) => balance + dailyRewardAmounts[0]); showToast(`Награда получена: +${dailyRewardAmounts[0]} монет`); } }}>{dailyRewardClaimed ? "Получено сегодня" : "Получить награду"}</button>
                </section>
                <section className="hourly-reward-card">
                  <div className="daily-reward-heading"><span className="reward-orb"><AccountIcon name="clock" size={22} /></span><div><h2>Бонус каждый час</h2><p>{hourlyRewardReadyAt === null ? "Забирай 50 монет раз в 60 минут" : `Следующая награда через ${formatRewardCooldown(hourlyRewardTimeLeft)}`}</p></div></div>
                  <div className="hourly-reward-action-row">
                    <span className="hourly-reward-amount"><span className="wallet-currency-icon is-coin"><AccountIcon name="coin" size={23} /></span><strong>+50 монет</strong></span>
                    <button className="rewards-primary-action" type="button" disabled={hourlyRewardReadyAt !== null} onClick={() => { if (hourlyRewardReadyAt === null) { setCoinBalance((balance) => balance + 50); setBonusCoinBalance((balance) => balance + 50); setHourlyRewardReadyAt(Date.now() + hourlyRewardCooldownMs); setHourlyRewardTimeLeft(hourlyRewardCooldownMs); showToast("Получено: +50 монет. Новый бонус будет через час"); } }}>{hourlyRewardReadyAt === null ? "Забрать" : `Через ${formatRewardCooldown(hourlyRewardTimeLeft)}`}</button>
                  </div>
                </section>
                <section className="rewards-bonus-card">
                  <span className="rewards-bonus-icon"><BellIcon width={21} height={21} /></span>
                  <div><strong>Бонусы и подарки</strong><p>Новые награды появляются каждую неделю.</p></div>
                  <ChevronRightIcon width={18} height={18} />
                </section>
              </div>
          </main>
        ) : null}

        {page === "coin-history" ? (
          <main className="coin-history-content">
            <div className="coin-history-filter-area">
              <button className="coin-history-filter-trigger" type="button" aria-expanded={coinHistoryFilterOpen} onClick={() => setCoinHistoryFilterOpen((open) => !open)}>
                {coinHistoryFilter === "all" ? "Фильтр транзакций" : coinHistoryFilter === "earned" ? "Начисления" : "Списания"}<ChevronDownIcon width={17} height={17} />
              </button>
              {coinHistoryFilterOpen ? <div className="coin-history-filter-menu" role="group" aria-label="Фильтр транзакций">
                {([{ value: "all", label: "Все операции" }, { value: "earned", label: "Начисления" }, { value: "spent", label: "Списания" }] as const).map((filter) => <button className={coinHistoryFilter === filter.value ? "is-selected" : ""} key={filter.value} type="button" onClick={() => { setCoinHistoryFilter(filter.value); setCoinHistoryFilterOpen(false); }}>{filter.label}{coinHistoryFilter === filter.value ? <CheckIcon width={15} height={15} /> : null}</button>)}
              </div> : null}
            </div>
            <div className="coin-alert-card">
              <BellIcon width={24} height={24} />
              <strong>Защити свои монеты — включи уведомления!</strong>
              <button type="button" aria-label={coinAlertsEnabled ? "Уведомления о монетах включены" : "Включить уведомления о монетах"} aria-pressed={coinAlertsEnabled} onClick={() => { setCoinAlertsEnabled(true); showToast("Уведомления о монетах включены"); }}>{coinAlertsEnabled ? <CheckIcon width={16} height={16} /> : "Включить"}</button>
            </div>
            {coinHistoryMonths.length ? coinHistoryMonths.map((month) => (
              <section className="coin-history-month" key={month}>
                <h2>{month}</h2>
                <div className="coin-history-list">
                  {visibleCoinHistory.filter((entry) => entry.month === month).map((entry) => (
                    <article className="coin-history-row" key={entry.id}>
                      <div><strong>{entry.title}</strong><time>{entry.date}</time></div>
                      <span className={entry.amount < 0 ? "is-spent" : "is-earned"}>{entry.amount > 0 ? `+${entry.amount}` : entry.amount}<AccountIcon name="coin" size={19} /></span>
                    </article>
                  ))}
                </div>
              </section>
            )) : <div className="wallet-empty-state"><span className="wallet-empty-icon"><LayersIcon width={30} height={30} /></span><p>Операций пока нет</p></div>}
          </main>
        ) : null}

        {page === "coin-expiry" ? (
          <main className="coin-expiry-content">
            <div className="coin-alert-card">
              <BellIcon width={24} height={24} />
              <strong>Защити свои монеты — включи уведомления!</strong>
              <button type="button" aria-label={coinAlertsEnabled ? "Уведомления о монетах включены" : "Включить уведомления о монетах"} aria-pressed={coinAlertsEnabled} onClick={() => { setCoinAlertsEnabled(true); showToast("Уведомления о монетах включены"); }}>{coinAlertsEnabled ? <CheckIcon width={16} height={16} /> : "Включить"}</button>
            </div>
            <section className="coin-expiry-list" aria-label="Сроки действия наградных монет">
              {coinExpiryEntries.map((entry) => (
                <article className="coin-expiry-row" key={entry.id}>
                  <div><span>Срок действия до</span><time>{entry.date}</time></div>
                  <strong>{entry.amount}<AccountIcon name="coin" size={21} /></strong>
                </article>
              ))}
            </section>
            <p className="coin-expiry-end">Пока это всё</p>
          </main>
        ) : null}

        {page === "transaction-history" ? (
          <main className="transaction-history-content">
            <article className="transaction-history-row">
              <span className="wallet-currency-icon is-coin"><AccountIcon name="coin" size={27} /></span>
              <div><strong>200 Монеты</strong><time>2026.09.13</time></div>
              <span className="transaction-history-amount">−$1.99</span>
            </article>
            <p className="transaction-history-end">Пока это всё</p>
          </main>
        ) : null}

        {page === "auto-unlock" ? (
          <main className="auto-unlock-content">
            <section className="auto-unlock-card">
              <span>Короткие драмы</span>
              <button className={`privacy-toggle ${autoUnlockEnabled ? "is-on" : ""}`} type="button" role="switch" aria-checked={autoUnlockEnabled} aria-label="Автоматически разблокировать короткие драмы" onClick={() => setAutoUnlockEnabled((enabled) => !enabled)}><span /></button>
            </section>
          </main>
        ) : null}

        {page === "notifications" ? (
          <main className="notification-content" aria-label={notificationCategory === "new" ? "Новые уведомления" : "Системные уведомления"}>
            <div className="notification-empty-state">
              <span className="notification-empty-art" aria-hidden="true">
                <i className="notification-orbit notification-orbit-one" />
                <i className="notification-orbit notification-orbit-two" />
                <span className="notification-empty-icon"><AccountIcon name="notifications" size={31} /></span>
                <i className="notification-spark notification-spark-one" />
                <i className="notification-spark notification-spark-two" />
              </span>
              <p>Данные отсутствуют</p>
            </div>
          </main>
        ) : null}

        {page === "exchange" ? (
          <main className="account-exchange-content">
            <div className="exchange-art" aria-hidden="true">
              <span className="exchange-art-glow" />
              <svg viewBox="0 0 180 142" fill="none">
                <path d="M41 50h98l-9 19H50l-9-19Z" />
                <path d="M51 69h78l-5 47H56l-5-47Z" />
                <path d="M41 50 50 31h80l9 19M50 31l22 19 18-19 18 19 22-19" />
                <path d="M83 69v14h14V69M30 117h120" />
                <circle cx="90" cy="48" r="5" /><path d="m90 17 2.5 5.5L98 25l-5.5 2.5L90 33l-2.5-5.5L82 25l5.5-2.5L90 17Z" />
                <path d="m30 48 1.5 3.5L35 53l-3.5 1.5L30 58l-1.5-3.5L25 53l3.5-1.5L30 48Zm120 7 1.5 3.5L155 60l-3.5 1.5L150 65l-1.5-3.5L145 60l3.5-1.5L150 55Z" />
              </svg>
            </div>
            <h2>Обмен VIP и монет</h2>
            <p className="exchange-subtitle">Введите промокод, чтобы получить награду</p>
            <div className="exchange-form">
              <KeyboardInput aria-label="Промокод" placeholder="Введите промокод" value={promoCode} onChange={(event) => setPromoCode(event.currentTarget.value)} onBlur={() => keyboard.hide()} />
              <button type="button" disabled={!promoCode.trim()} onClick={() => { keyboard.hide(); showToast("Промокод не найден"); }}>Обменять</button>
            </div>
            <section className="exchange-notice">
              <h3>Уведомление</h3>
              <ol>
                <li>Каждый аккаунт может использовать один и тот же промокод только один раз.</li>
                <li>Промокоды могут иметь срок действия. Используйте их до истечения.</li>
                <li>Каждый промокод имеет лимит использований. После достижения лимита его нельзя использовать снова.</li>
                <li>После активации VIP-время или монеты будут добавлены сразу. Награда зависит от промокода.</li>
              </ol>
            </section>
          </main>
        ) : null}

        {page === "library" ? (
          <main className="library-content">
            <section className="library-section history-section">
              <div className="library-heading"><h2>История</h2><button type="button" onClick={() => setToast("Здесь показаны недавно просмотренные сериалы")}>Все <ChevronRightIcon width={14} height={14} /></button></div>
              <Carousel ariaLabel="Недавно просмотренные сериалы" className="history-carousel" contentClassName="history-track">
                {historyIds.map((id) => {
                  const show = byId(id);
                  return (
                    <button className="history-card" key={id} type="button" onClick={() => openDetail(show)}>
                      <span className="history-art"><img src={show.image} alt="" draggable={false} /><span className="history-progress"><i style={{ width: `${Math.max(14, Math.round((show.currentEpisode / show.episodes) * 100))}%` }} /></span></span>
                      <span className="history-title">{show.title}</span>
                      <span className="episode-progress">Серия {show.currentEpisode} <i>/ {show.episodes}</i></span>
                    </button>
                  );
                })}
              </Carousel>
            </section>

            <section className="library-section saved-section">
              <div className="library-heading"><h2>Избранное</h2><button type="button" onClick={() => setEditList((editing) => !editing)}>{editList ? "Готово" : "Изменить"}</button></div>
              {libraryIds.length ? (
                <div className="poster-grid saved-grid">
                  {libraryIds.map((id) => {
                    const show = byId(id);
                    return (
                      <div className="saved-card-wrap" key={id}>
                        <PosterCard show={show} onOpen={() => editList ? toggleSaved(show) : openDetail(show)} />
                        {editList ? <button type="button" className="remove-saved" aria-label={`Удалить ${show.title} из избранного`} onClick={() => toggleSaved(show)}><Cross1Icon width={13} height={13} /></button> : <span className="saved-episode">Серия {show.currentEpisode} / {show.episodes}</span>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="library-empty"><BookmarkIcon width={26} height={26} /><p>Сохранённые сериалы появятся здесь.</p><button className="text-action" type="button" onClick={() => navigate("home")}>Выбрать сериал</button></div>
              )}
            </section>
          </main>
        ) : null}

        {page === "detail" ? (
          <main className="detail-content">
            <section className="detail-hero">
              <img className="detail-poster" src={selectedShow.image} alt="" draggable={false} />
              <h1>{selectedShow.title}</h1>
            </section>

            <section className="detail-section synopsis-section">
              <h2>О сериале</h2>
              <div className="genre-pills"><span>{selectedShow.category}<ChevronRightIcon width={12} height={12} /></span><span>{selectedShow.genre}<ChevronRightIcon width={12} height={12} /></span></div>
              <p className={`synopsis-copy ${expandedSynopsis ? "is-expanded" : ""}`}>
                {selectedShow.summary}{" "}
                <button type="button" onClick={() => setExpandedSynopsis((expanded) => !expanded)}>{expandedSynopsis ? "Свернуть" : "Подробнее"}</button>
              </p>
            </section>

            <section className="cast-section">
              <div className="cast-row">
                {selectedShow.cast.map((person) => (
                  <div className="cast-person" key={person.name}>
                    <span className="cast-photo"><img src={person.image} alt="" draggable={false} /><i><CheckIcon width={10} height={10} /></i></span>
                    <span className="cast-name">{person.name}</span>
                    <span className="cast-role">{person.role}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="detail-section related-section">
              <h2>Похожие сериалы</h2>
              <Carousel ariaLabel="Похожие сериалы" className="related-carousel" contentClassName="related-track">
                {shows.filter((show) => show.id !== selectedShow.id).slice(0, 4).map((show) => <PosterCard key={show.id} show={show} onOpen={() => openDetail(show)} />)}
              </Carousel>
            </section>
          </main>
        ) : null}

        {page === "watch" ? (
          <main className="watch-content" aria-label={`Просмотр сериала «${selectedShow.title}»`}>
            {selectedShow.video ? (
              <video
                ref={watchVideoRef}
                className="watch-art"
                src={selectedShow.video}
                playsInline
                preload="auto"
                onTimeUpdate={(event) => {
                  const video = event.currentTarget;
                  if (video.duration) setWatchProgress((video.currentTime / video.duration) * 100);
                }}
                onEnded={() => setPlaying(false)}
              />
            ) : (
              <img className="watch-art" src={selectedShow.image} alt="" draggable={false} />
            )}
            <div className="watch-scrim" aria-hidden="true" />

            <button className="player-toggle" type="button" aria-label={playing ? "Поставить на паузу" : "Воспроизвести"} onClick={() => setPlaying((value) => !value)}>
              {playing ? (
                <svg className="player-pause-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none">
                  <path d="M8 6.25v11.5M16 6.25v11.5" />
                </svg>
              ) : <PlayOutlineIcon size={26} />}
            </button>

            <div className="watch-actions" aria-label="Действия с сериалом">
              <button className={`watch-action ${isSaved ? "is-saved" : ""}`} type="button" aria-label={isSaved ? "Убрать из избранного" : "Добавить в избранное"} aria-pressed={isSaved} onClick={() => toggleSaved(selectedShow)}>
                <svg className="for-you-outline-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none">
                  <path fill={isSaved ? "currentColor" : "none"} d="M6.15 3.8h11.7a1.5 1.5 0 0 1 1.5 1.5v14.45L12 15.05l-7.35 4.7V5.3a1.5 1.5 0 0 1 1.5-1.5Z" />
                </svg>
                <span>{isSaved ? "В списке" : "238,1 тыс."}</span>
              </button>
              <button className={`watch-action ${watchLiked ? "is-liked" : ""}`} type="button" aria-label={watchLiked ? "Убрать отметку нравится" : "Нравится"} aria-pressed={watchLiked} onClick={() => setWatchLiked((liked) => !liked)}>
                <svg className="for-you-outline-icon for-you-heart-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none">
                  <path fill={watchLiked ? "currentColor" : "none"} d="M12 19.15 4.25 11.7a4.9 4.9 0 0 1 6.95-6.9L12 5.6l.8-.8a4.9 4.9 0 0 1 6.95 6.9L12 19.15Z" />
                </svg>
                <span>{watchLiked ? "1,9 тыс." : "1,8 тыс."}</span>
              </button>
              <button className="watch-action watch-more-action" type="button" aria-expanded={watchSynopsisExpanded} aria-label={watchSynopsisExpanded ? "Свернуть описание" : "Подробнее о сериале"} onClick={() => setWatchSynopsisExpanded((expanded) => !expanded)}>
                <svg className="for-you-share-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none">
                  <path d="M5.05 4.6h13.4a3 3 0 0 1 2.45 4.72l-6.82 10.02a2.75 2.75 0 0 1-4.9-1.04L8 12.85 3.65 9.4a3 3 0 0 1 1.4-4.8Z" />
                  <path d="m8 12.85 7.2-4.4" />
                </svg>
              </button>
            </div>

            <section className={`watch-caption ${watchSynopsisExpanded ? "is-expanded" : ""}`}>
              <button className="watch-title" type="button" onClick={() => setWatchSynopsisExpanded((expanded) => !expanded)}>
                <strong>{selectedShow.title}</strong><ChevronRightIcon width={19} height={19} />
              </button>
              <span className="watch-genre">{selectedShow.genre}</span>
              <p>{selectedShow.summary}</p>
              {!watchSynopsisExpanded ? <button className="watch-details-link" type="button" onClick={() => setWatchSynopsisExpanded(true)}>Подробнее</button> : <button className="watch-details-link" type="button" onClick={() => setWatchSynopsisExpanded(false)}>Свернуть</button>}
            </section>

            <div className="watch-progress">
              <span className="watch-progress-track" aria-hidden="true"><i style={{ width: `${watchProgress}%` }} /></span>
              <input
                type="range"
                min="0"
                max="100"
                value={watchProgress}
                aria-label="Позиция серии"
                onChange={(event) => {
                  const percent = Number(event.currentTarget.value);
                  setWatchProgress(percent);
                  const video = watchVideoRef.current;
                  if (video?.duration) video.currentTime = (percent / 100) * video.duration;
                }}
              />
            </div>

            <button className="watch-episode-trigger" type="button" aria-expanded={episodeSheetOpen} onClick={openEpisodeSheet}>
              <LayersIcon width={19} height={19} />
              <span>EP.{currentEpisode}/EP.{selectedShow.episodes}</span>
              <ChevronUpIcon className="watch-episode-chevron" width={18} height={18} />
            </button>
          </main>
        ) : null}
      </MobileScroll>
      </motion.div>
      </AnimatePresence>

      {page === "watch" && episodeSheetOpen ? (
        <div className="episodes-sheet-layer">
          <button className="episodes-sheet-backdrop" type="button" aria-label="Закрыть список серий" onClick={() => setEpisodeSheetOpen(false)} />
          <section className="episodes-sheet" role="dialog" aria-modal="true" aria-label="Выбор серии">
            <div className="episodes-sheet-grabber" aria-hidden="true"><span /></div>
            <div className="episodes-sheet-header">
              <img src={selectedShow.image} alt="" draggable={false} />
              <button className="episodes-show-title" type="button" onClick={() => { setEpisodeSheetOpen(false); goBack(); }}>
                <strong>{selectedShow.title}</strong><ChevronRightIcon width={19} height={19} />
              </button>
              <button className="episodes-sheet-close" type="button" aria-label="Закрыть" onClick={() => setEpisodeSheetOpen(false)}><Cross1Icon width={16} height={16} /></button>
            </div>
            <div className="episodes-range-tabs" role="tablist" aria-label="Диапазон серий">
              {episodeRanges.map((range, index) => (
                <button className={index === episodeRangeIndex ? "is-selected" : ""} type="button" role="tab" aria-selected={index === episodeRangeIndex} key={range.start} onClick={() => setEpisodeRangeIndex(index)}>
                  {range.start}-{range.end}
                </button>
              ))}
            </div>
            <div className="episodes-sheet-grid" role="tabpanel">
              {(() => {
                const range = episodeRanges[episodeRangeIndex] ?? episodeRanges[0];
                return range ? Array.from({ length: range.end - range.start + 1 }, (_, index) => range.start + index).map((episode) => {
                  const locked = episode > currentEpisode + 12;
                  return (
                    <button className={`episode-sheet-cell ${episode === currentEpisode ? "is-current" : ""} ${locked ? "is-locked" : ""}`} key={episode} type="button" aria-label={`Серия ${episode}${locked ? ", закрыта" : ""}`} aria-current={episode === currentEpisode ? "step" : undefined} onClick={() => selectEpisode(episode)}>
                      <span>{episode}</span>
                      {locked ? <LockClosedIcon className="episode-sheet-lock" width={13} height={13} /> : null}
                      {episode === currentEpisode ? <PauseIcon className="episode-sheet-playing" width={13} height={13} /> : null}
                    </button>
                  );
                }) : null;
              })()}
            </div>
          </section>
        </div>
      ) : null}

      {activeNavigation ? <BottomNavigation active={activeNavigation} onNavigate={navigate} className={page === "for-you" ? "for-you-navigation" : ""} /> : null}

      {page === "detail" ? (
        <div className="detail-actions">
          <button className={`bookmark-action ${isSaved ? "is-saved" : ""}`} type="button" aria-label={isSaved ? "Удалить из избранного" : "Добавить в избранное"} onClick={() => toggleSaved(selectedShow)}>
            {isSaved ? <CheckIcon width={23} height={23} /> : (
              <svg className="detail-bookmark-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none">
                <path d="M6.15 3.8h11.7a1.5 1.5 0 0 1 1.5 1.5v14.45L12 15.05l-7.35 4.7V5.3a1.5 1.5 0 0 1 1.5-1.5Z" />
              </svg>
            )}
          </button>
          <button className="continue-button" type="button" onClick={() => startWatching()}><PlayOutlineIcon size={19} /> Продолжить просмотр</button>
        </div>
      ) : null}

      <BottomSheet
        open={sheet !== null}
        onOpenChange={(open) => setSheet(open ? sheet : null)}
        title={sheet === "filter" ? "Найдите свой сериал" : sheet === "rate" ? "Оцените нас" : "Скоро появится"}
        description={sheet === "filter" ? "Выберите жанры, чтобы настроить подборку." : sheet === "rate" ? "Покажите свою любовь, поставив 5 звёзд!" : "Мы готовим для вас этот раздел."}
        snap={sheet === "filter" ? 0.64 : sheet === "rate" ? 0.58 : 0.5}
      >
        {sheet === "filter" ? (
          <div className="filter-options">
            {genreOptions.map((genre) => {
              const selected = selectedGenres.includes(genre);
              return <button className={`filter-option ${selected ? "is-selected" : ""}`} key={genre} type="button" onClick={() => setSelectedGenres((current) => selected ? current.filter((item) => item !== genre) : [...current, genre])}><span>{genre}</span>{selected ? <CheckIcon width={17} height={17} /> : null}</button>;
            })}
            <button className="sheet-primary" type="button" onClick={() => { setSelectedCategory("HOT"); setSheet(null); }}>{selectedGenres.length ? `Показать выбранные: ${selectedGenres.length}` : "Показать все сериалы"}</button>
          </div>
        ) : null}
        {sheet === "rate" ? (
          <div className="rating-sheet-content">
            <span className="rating-sheet-emoji" aria-hidden="true">🤩</span>
            <div className="rating-stars" role="radiogroup" aria-label="Оценка приложения">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button className={rating <= selectedRating ? "is-selected" : ""} key={rating} type="button" role="radio" aria-checked={selectedRating === rating} aria-label={`${rating} из 5`} onClick={() => setSelectedRating(rating)}><StarIcon width={29} height={29} /></button>
              ))}
            </div>
            <button className="sheet-primary" type="button" onClick={() => { setSheet(null); showToast("Спасибо за оценку!"); }}>Да</button>
          </div>
        ) : null}
        {sheet === "coming" ? <div className="coming-content"><RocketIcon width={28} height={28} /><p>Мы добавляем новые способы находить сериалы и сохранять любимые истории.</p><button className="sheet-primary" type="button" onClick={() => setSheet(null)}>Понятно</button></div> : null}
      </BottomSheet>

      {settingsDialog ? (
        <div className="account-dialog-layer">
          <button className="account-dialog-backdrop" type="button" aria-label="Закрыть окно" onClick={() => setSettingsDialog(null)} />
          <section className="account-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="account-confirm-title">
            {settingsDialog === "logout" ? <h2 id="account-confirm-title">Выйти</h2> : null}
            <p id={settingsDialog === "logout" ? undefined : "account-confirm-title"}>
              {settingsDialog === "cache" ? <>Вы уверены, что хотите очистить кэш?<br /><span>(Включая видео и изображения)</span></> : "Выход из системы может повлиять на ваш пользовательский опыт. Вы уверены, что хотите выйти из системы?"}
            </p>
            <div className="account-dialog-actions">
              <button className="account-dialog-cancel" type="button" onClick={() => setSettingsDialog(null)}>Отмена</button>
              <button className="account-dialog-confirm" type="button" onClick={() => {
                const action = settingsDialog;
                setSettingsDialog(null);
                if (action === "cache") {
                  showToast("Кэш очищен");
                }
              }}>{settingsDialog === "cache" ? "Очистить" : "ОК"}</button>
            </div>
          </section>
        </div>
      ) : null}

      {toast ? <div className="app-toast" role="status">{toast}</div> : null}
    </div>
    </MotionConfig>
  );
}

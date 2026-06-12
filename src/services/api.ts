import type { NewsItem, Program, BentoItem, GalleryItem, Report, Partner, KerjasamaItem, SejarahData, ContactInfo, Statistic, Achievement, TimelineEvent, Facility, HeroStat } from '@/types';
import { NAV_LINKS, FOOTER_LINKS } from '@/data/navigation';
import { NEWS_ITEMS } from '@/data/news';
import { PROGRAMS, BENTO_ITEMS } from '@/data/programs';
import { GALLERY_ITEMS, GALLERY_CATEGORIES } from '@/data/gallery';
import { STATISTICS, ABOUT_DATA, TIMELINE, ACHIEVEMENTS } from '@/data/about';
import { PARTNERS, KERJASAMA } from '@/data/partners';
import { REPORTS } from '@/data/reports';
import { CONTACT_INFO, HERO_STATS, HERO_NEWS } from '@/data/contact';
import { FASILITAS } from '@/data/fasilitas';

export function getNavLinks() { return NAV_LINKS; }
export function getFooterLinks() { return FOOTER_LINKS; }

export function getNews(): NewsItem[] { return NEWS_ITEMS; }
export function getNewsBySlug(slug: string): NewsItem | undefined { return NEWS_ITEMS.find((n) => n.slug === slug); }
export function getNewsSlugs(): string[] { return NEWS_ITEMS.map((n) => n.slug); }
export function getTrendingNews(limit = 3): NewsItem[] { return NEWS_ITEMS.slice(0, limit); }

export function getPrograms(): Program[] { return PROGRAMS; }
export function getBentoItems(): BentoItem[] { return BENTO_ITEMS; }

export function getGalleryItems(): GalleryItem[] { return GALLERY_ITEMS; }
export function getGalleryCategories() { return GALLERY_CATEGORIES; }

export function getPartners(): Partner[] { return PARTNERS; }
export function getKerjasama(): KerjasamaItem[] { return KERJASAMA; }

export function getStatistics(): Statistic[] { return STATISTICS; }
export function getHeroStats(): HeroStat[] { return HERO_STATS; }
export function getHeroNews() { return HERO_NEWS; }

export function getAboutData(): SejarahData { return ABOUT_DATA; }
export function getTimeline(): TimelineEvent[] { return TIMELINE; }
export function getAchievements(): Achievement[] { return ACHIEVEMENTS; }

export function getReports(): Report[] { return REPORTS; }

export function getContactInfo(): ContactInfo { return CONTACT_INFO; }
export function getFacilities(): Facility[] { return FASILITAS; }

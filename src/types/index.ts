export interface NavLink {
  href: string;
  label: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface Statistic {
  value: number;
  suffix: string;
  label: string;
  desc: string;
}

export interface HeroStat {
  value: string;
  label: string;
}

export interface NewsItem {
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  content: string;
  tag: string;
  color: string;
  image: string;
}

export interface Program {
  title: string;
  desc: string;
  icon: string;
  color: string;
  image: string;
}

export interface BentoItem {
  title: string;
  desc: string;
  icon: string;
  color: string;
  size: 'large' | 'wide' | 'tall' | 'small';
  image: string;
}

export interface GalleryItem {
  title: string;
  desc: string;
  color: string;
  image: string;
}

export interface Report {
  title: string;
  desc: string;
  fileSize: string;
  format: string;
}

export interface Partner {
  name: string;
  image: string;
}

export interface KerjasamaItem {
  name: string;
  bidang: string;
  logo: string;
  image: string;
}

export interface FooterLinkGroup {
  navigasi: { label: string; href: string }[];
  program: string[];
}

export interface SejarahData {
  sejarah: string[];
  visi: string;
  misi: string[];
  pimpinan: { nama: string; jabatan: string }[];
}

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  maps: string;
  hours: string;
}

export interface TimelineEvent {
  year: string;
  title: string;
  desc: string;
}

export interface Achievement {
  title: string;
  desc: string;
  year: string;
  image: string;
  color: string;
}

export interface Facility {
  title: string;
  desc: string;
  image: string;
  color: string;
}

export interface CTAButton {
  label: string;
  href: string;
  variant: 'primary' | 'secondary';
}

export interface CTASectionProps {
  title: string;
  description: string;
  buttons: CTAButton[];
  bgImage?: string;
}

export interface SectionTitleProps {
  badge?: string;
  title: string;
  highlight?: string;
  description?: string;
  align?: 'center' | 'left';
}

export interface StatCardProps {
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  value: string;
  label: string;
  desc?: string;
}

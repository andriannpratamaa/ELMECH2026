import type { NavLink, FooterLinkGroup } from '@/types';

export const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'Beranda' },
  { href: '/tentang', label: 'Tentang' },
  { href: '/program', label: 'Program' },
  { href: '/berita', label: 'Berita' },
  { href: '/galeri', label: 'Galeri' },
  { href: '/kontak', label: 'Kontak' },
];

export const FOOTER_LINKS: FooterLinkGroup = {
  navigasi: [
    { label: 'Beranda', href: '/' },
    { label: 'Tentang', href: '/tentang' },
    { label: 'Program', href: '/program' },
    { label: 'Berita', href: '/berita' },
    { label: 'Galeri', href: '/galeri' },
  ],
  program: [
    'Teknik Perkapalan',
    'Teknik Kelistrikan',
    'Teknik Mesin',
    'Teknik Permesinan',
    'D4 Teknologi Rekayasa',
  ],
};

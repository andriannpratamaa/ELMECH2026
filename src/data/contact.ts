import type { ContactInfo, HeroStat } from '@/types';

export const CONTACT_INFO: ContactInfo = {
  address: 'Jl. Teknik Kimia, Keputih, Kec. Sukolilo, Surabaya 60111',
  phone: '+62 31 594 7264',
  email: 'info@ppns.ac.id',
  maps: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.635654321234!2d112.789!3d-7.293!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sPPNS!5e0!3m2!1sid!2sid!4v1',
  hours: 'Senin – Jumat, 07:00 – 16:00 WIB',
};

export const HERO_STATS: HeroStat[] = [
  { value: '25+', label: 'Program Studi' },
  { value: '10.000+', label: 'Mahasiswa' },
  { value: '500+', label: 'Mitra Industri' },
  { value: '95%', label: 'Penyerapan Kerja' },
];

export const HERO_NEWS = {
  title: 'PPNS Raih Akreditasi Unggul 2025',
  desc: 'Peringkat akreditasi institusi meningkat ke status Unggul dari BAN-PT.',
};

import Link from 'next/link';
import { GraduationCap, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';
import { getFooterLinks } from '@/services/api';
const FOOTER_LINKS = getFooterLinks();

const socials = [
  { name: 'Facebook', href: '#', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
  { name: 'X', href: '#', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  { name: 'Instagram', href: '#', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
  { name: 'LinkedIn', href: '#', path: 'M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zM16 16h-2v-3c0-1.654-2-1.654-2 0v3h-2v-6h2v1.041c.655-.978 2-1.151 2-.19V16z' },
];

export default function Footer() {
  return (
    <footer id="kontak" className="relative text-gray-400 bg-[#0F172A]">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FBBF24]/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="grid sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-4">
            <Link href="/" className="flex items-center gap-3 mb-5 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#2D5BDB] flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                <GraduationCap className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <span className="text-xl font-bold text-white block leading-tight font-[family-name:var(--font-display)]">
                  PPNS
                </span>
                <span className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">Smart Maritime Campus</span>
              </div>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-xs">
              Building Indonesia&apos;s Future Maritime Technology Ecosystem since 1996.
            </p>
            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#FBBF24] hover:text-[#0F172A] flex items-center justify-center transition-all duration-300 group"
                  aria-label={s.name}
                >
                  <svg className="w-4 h-4 text-gray-500 group-hover:text-[#0F172A]" fill="currentColor" viewBox="0 0 24 24">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold text-sm mb-6">Navigasi</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.navigasi.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-white transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold text-sm mb-6">Program</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.program.map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h4 className="text-white font-semibold text-sm mb-6">Kontak</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <MapPin className="w-5 h-5 text-gray-500 group-hover:text-[#FBBF24] transition-colors flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span className="text-sm text-gray-500 group-hover:text-white transition-colors">
                  Jl. Teknik Kimia, Keputih<br />Kec. Sukolilo, Surabaya 60111
                </span>
              </li>
              <li className="flex items-start gap-3 group">
                <Mail className="w-5 h-5 text-gray-500 group-hover:text-[#FBBF24] transition-colors flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span className="text-sm text-gray-500 group-hover:text-white transition-colors">info@ppns.ac.id</span>
              </li>
              <li className="flex items-start gap-3 group">
                <Phone className="w-5 h-5 text-gray-500 group-hover:text-[#FBBF24] transition-colors flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span className="text-sm text-gray-500 group-hover:text-white transition-colors">+62 31 594 7264</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} PPNS Smart Maritime Campus. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Kebijakan Privasi', 'Syarat & Ketentuan', 'FAQ'].map((item) => (
              <a key={item} href="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

import type { Metadata } from "next";
import CmsPage from "@/components/cms/CmsPage";
import { motion } from "framer-motion";
import { MapPin, Mail, Phone } from "lucide-react";
import PageHero from "@/components/PageHero";
import SectionTitle from "@/components/SectionTitle";
import CTASection from "@/components/CTASection";
import { getContactInfo } from "@/services/api";
import { fetchCmsPage } from "@/lib/cms";

const CONTACT = getContactInfo();
const slug = "kontak";

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchCmsPage(slug);
  return {
    title: page?.title ?? "Kontak Kami",
    description: page?.title
      ? `${page.title} - PPNS`
      : "Hubungi PPNS untuk informasi akademik, kerja sama, dan kunjungan kampus.",
  };
}

export default async function KontakPage() {
  const page = await fetchCmsPage(slug);
  const cmsContent =
    page && page.published
      ? Array.isArray(page.content)
        ? page.content
        : []
      : undefined;

  return (
    <>
      <PageHero
        bgImage="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1440&q=80"
        title="Kontak Kami"
        subtitle="Hubungi PPNS untuk informasi akademik, kerja sama, dan kunjungan kampus"
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Kontak" }]}
      />

      <section className="relative py-16 sm:py-24 bg-[#F8FAFC] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle badge="Kontak" title="Hubungi Kami" highlight="PPNS" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-6 h-6 text-[#FBBF24]" />
                <span className="text-sm font-semibold text-[#0F172A]">
                  Alamat Kampus
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {CONTACT.address}
              </p>
            </div>
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="w-6 h-6 text-[#FBBF24]" />
                <span className="text-sm font-semibold text-[#0F172A]">
                  Email
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {CONTACT.email}
              </p>
            </div>
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <Phone className="w-6 h-6 text-[#FBBF24]" />
                <span className="text-sm font-semibold text-[#0F172A]">
                  Telepon
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {CONTACT.phone}
              </p>
            </div>
          </div>
        </div>
      </section>

      {cmsContent ? (
        <CmsPage slug={slug} initialData={{ content: cmsContent }} />
      ) : null}

      <CTASection
        title="Tanyakan pada Kami"
        description="Tim PPNS siap membantu pertanyaan Anda terkait pendidikan dan kerjasama."
        buttons={[
          {
            label: "Kirim Pesan",
            href: "mailto:info@ppns.ac.id",
            variant: "primary",
          },
        ]}
        bgImage="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&q=80"
      />
    </>
  );
}

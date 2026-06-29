import { notFound } from "next/navigation";
import CmsPage from "@/components/cms/CmsPage";
import { fetchCmsPage } from "@/lib/cms";

export default async function LaporanPage() {
  const page = await fetchCmsPage("laporan");
  if (!page || !page.published) notFound();

  const content = Array.isArray(page.content) ? page.content : [];
  return <CmsPage slug="laporan" initialData={{ content }} />;
}

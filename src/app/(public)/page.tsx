import { fetchCmsPage } from "@/lib/cms";
import BlockRenderer from "@/components/cms/BlockRenderer";

export default async function Home() {
  const page = await fetchCmsPage("");
  const blocks = Array.isArray(page?.content) ? page.content : [];

  return <BlockRenderer blocks={blocks} />;
}

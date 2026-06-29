"use client";

import { useParams } from "next/navigation";
import PageEditorPage from "@/components/admin/PageEditorPage";

export default function SlugPageEditor() {
  const params = useParams();
  const slug = params.slug as string;

  return <PageEditorPage slug={slug} backHref="/admin/pages/list" />;
}

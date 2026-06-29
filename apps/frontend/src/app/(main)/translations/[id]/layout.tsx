import { notFound } from "next/navigation";
import { TranslationLayout } from "@/components/translation-editor/TranslationLayout";
import { getTranslationById } from "@/services/translations";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function Layout({ children, params }: LayoutProps) {
  const { id } = await params;

  const translation = await getTranslationById(id);

  if (!translation) {
    notFound();
  }

  return (
    <TranslationLayout initialData={translation}>{children}</TranslationLayout>
  );
}

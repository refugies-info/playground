import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { TranslationLayout } from "@/components/translation-editor/TranslationLayout";
import { getAuthUser } from "@/lib/auth";
import { getTranslationById } from "@/services/translations";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function Layout({ children, params }: LayoutProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  await getAuthUser(supabase);

  const translation = await getTranslationById(id);

  if (!translation) {
    notFound();
  }

  return (
    <TranslationLayout initialData={translation}>{children}</TranslationLayout>
  );
}

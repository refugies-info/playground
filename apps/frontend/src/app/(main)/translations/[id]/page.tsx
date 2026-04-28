import { createSupabaseServerClient } from "@playground/supabase";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { TranslationLayout } from "@/components/translation-editor/TranslationLayout";
import { getAuthUser } from "@/lib/auth";
import { getTranslationById } from "@/services/translations";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: "Éditeur de traduction | Content Playground",
  description: "Traduisez et publiez votre contenu",
};

export default async function TranslationPage(props: PageProps) {
  const params = await props.params;
  const { id } = params;

  // Auth check
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const user = await getAuthUser(supabase);

  if (!user) {
    redirect("/login");
  }

  // Fetch data
  const translation = await getTranslationById(id);

  if (!translation) {
    notFound();
  }

  // Pass to client layout
  return <TranslationLayout initialData={translation} />;
}

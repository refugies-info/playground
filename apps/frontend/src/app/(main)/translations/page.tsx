import { createSupabaseServerClient } from "@playground/supabase";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  type GetTranslationsParams,
  getTranslations,
} from "@/services/translations";
import { TranslationsList } from "./TranslationsList";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata: Metadata = {
  title: "Mes Traductions | Content Playground",
  description: "Gérez vos traductions assignées",
};

export default async function TranslationsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const status = searchParams.status;

  // Get user to identify language
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userLanguage = user.user_metadata?.language;

  const serviceParams: GetTranslationsParams = {
    page: 1,
    pageSize: 50,
    status: typeof status === "string" ? status : undefined,
    language: userLanguage,
  };

  const { data: translations } = await getTranslations(serviceParams);

  const initialFilters = {
    status: typeof status === "string" ? status : "",
  };

  const role = user.user_metadata?.role;
  const title =
    role === "translator" ? "Traductions" : "Toutes les traductions";

  return (
    <TranslationsList
      initialTranslations={translations}
      initialFilters={initialFilters}
      title={title}
    />
  );
}

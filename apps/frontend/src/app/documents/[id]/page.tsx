import { Button } from "@refugies/ui/primitives";
import Link from "next/link";

interface DocumentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DocumentPage(props: DocumentPageProps) {
  const params = await props.params;
  const { id } = params;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Document {id}
        </h1>
        <p className="text-lg text-gray-500">
          L'éditeur de document arrive bientôt !
        </p>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-sm border max-w-md w-full">
        <div className="flex flex-col space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse mx-auto"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Link href="/documents">
          <Button variant="outline">← Retour à la liste des documents</Button>
        </Link>
      </div>
    </div>
  );
}

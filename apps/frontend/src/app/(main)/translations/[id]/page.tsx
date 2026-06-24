import { SourcePane } from "@/components/translation-editor/SourcePane";
import { TranslationEditorPane } from "@/components/translation-editor/TranslationEditorPane";

export default function TranslationContentPage() {
  return (
    <>
      <SourcePane />
      <div className="w-px bg-gray-200" />
      <TranslationEditorPane />
    </>
  );
}

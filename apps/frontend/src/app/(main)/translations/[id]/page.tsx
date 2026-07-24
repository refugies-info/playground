import { SourcePane } from "@/components/translation-editor/SourcePane";
import { TranslationEditorPane } from "@/components/translation-editor/TranslationEditorPane";
import { TranslationRegenerateButton } from "@/components/translation-editor/TranslationRegenerateButton";

export default function TranslationContentPage() {
  return (
    <>
      <SourcePane />
      <TranslationEditorPane />
      {/* Bouton flottant de regénération IA — bas-droite */}
      <TranslationRegenerateButton />
    </>
  );
}

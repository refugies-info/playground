interface WidgetEditorSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function WidgetEditorSection({
  title,
  description,
  children,
}: WidgetEditorSectionProps) {
  return (
    <section className="flex flex-col gap-6 bg-white p-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold leading-7 text-(--text-title-grey)">
          {title}
        </h2>
        <p className="text-xs leading-5 text-(--text-title-grey)">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

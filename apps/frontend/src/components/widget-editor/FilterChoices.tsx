import { Tag } from "@playground/ui/primitives";

interface FilterChoicesProps<Value extends string> {
  label: string;
  options: readonly { value: Value; label: string }[];
  selected: readonly Value[];
  onToggle: (value: Value) => void;
}

export function FilterChoices<Value extends string>({
  label,
  options,
  selected,
  onToggle,
}: FilterChoicesProps<Value>) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="py-1 text-sm font-medium leading-6 text-(--text-default-grey)">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map(({ value, label: optionLabel }) => (
          <Tag
            key={value}
            status="choice"
            pressed={selected.includes(value)}
            onToggle={() => onToggle(value)}
          >
            {optionLabel}
          </Tag>
        ))}
      </div>
    </fieldset>
  );
}

import { AsyncSearchInput } from "@playground/ui/forms";
import { Tag } from "@playground/ui/primitives";
import { searchDepartments } from "@/lib/widget-filters";

const searchDepartmentsAsync = async (text: string) => searchDepartments(text);

interface DepartmentsFieldProps {
  selected: readonly string[];
  onAdd: (department: string) => void;
  onRemove: (department: string) => void;
}

export function DepartmentsField({
  selected,
  onAdd,
  onRemove,
}: DepartmentsFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="py-1 text-base font-medium leading-6 text-(--text-default-grey)">
        Localisation
      </span>
      <AsyncSearchInput
        onSearch={searchDepartmentsAsync}
        onSelect={onAdd}
        getResultKey={(department) => department}
        renderResult={(department) => (
          <span className="truncate text-sm leading-6 text-(--text-default-grey)">
            {department}
          </span>
        )}
        minLength={1}
        delayInMs={0}
        placeholder="Rechercher un département"
        aria-label="Rechercher un département"
      />
      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Départements choisis">
          {selected.map((department) => (
            <li key={department}>
              <Tag
                status="selected"
                dismissLabel={`Retirer ${department}`}
                onDismiss={() => onRemove(department)}
              >
                {department}
              </Tag>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import { ACTIVITY_LOG_TYPES, LANGUAGES } from "@playground/shared-types";
import { BoutonFiltre } from "@playground/ui/primitives";
import { useState } from "react";

interface Profile {
  id: string;
  email: string;
  displayName: string;
}

interface ActivityLogsFilters {
  type: string;
  profile: string;
  language: string;
}

const EMPTY_FILTERS: ActivityLogsFilters = {
  type: "",
  profile: "",
  language: "",
};

interface ActivityLogsViewProps {
  profiles: Profile[];
}

export function ActivityLogsView({ profiles }: ActivityLogsViewProps) {
  const [filters, setFilters] = useState<ActivityLogsFilters>(EMPTY_FILTERS);

  const updateFilter = (key: keyof ActivityLogsFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const typeOptions = ACTIVITY_LOG_TYPES.map(({ value, label }) => ({
    value,
    label,
  }));

  const profileOptions = [
    { label: "PapaIA", value: "__unassigned__" },
    ...profiles.map((p) => ({ label: p.displayName, value: p.email })),
  ];

  const languageOptions = LANGUAGES.map((l) => ({
    label: l.label,
    value: l.code,
  }));

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div className="mx-auto space-y-6">
          <div className="w-full flex flex-col gap-8">
            <h1 className="text-[40px] font-bold leading-[1.2]">
              Journal d'activités
            </h1>
            <div className="flex flex-wrap items-center gap-4">
              <BoutonFiltre
                label="Type"
                options={typeOptions}
                value={filters.type}
                onChange={(value) => updateFilter("type", value)}
              />
              <BoutonFiltre
                label="Qui"
                options={profileOptions}
                value={filters.profile}
                onChange={(value) => updateFilter("profile", value)}
              />
              <BoutonFiltre
                label="Langue"
                options={languageOptions}
                value={filters.language}
                onChange={(value) => updateFilter("language", value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

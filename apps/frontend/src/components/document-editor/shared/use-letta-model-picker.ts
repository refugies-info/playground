"use client";

import { logger } from "@playground/shared-types";
import { useEffect, useState } from "react";

type ModelOption = { label: string; value: string };

export function useLettaModelPicker(isAdmin: boolean, isRco: boolean) {
  const [modelOptions, setModelOptions] = useState<ModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState("");

  useEffect(() => {
    if (!isAdmin) return;
    fetch("/api/editorial-rewrite/models")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { models, defaultModels } = (await res.json()) as {
          models: { handle: string; name: string }[];
          defaultModels: { rco: string; di: string };
        };
        const envModel = isRco ? defaultModels.rco : defaultModels.di;
        const options = models.map((model) => ({
          label: model.name,
          value: model.handle,
        }));
        // letta/auto or a handle Letta no longer lists: still selectable.
        setModelOptions(
          options.some((option) => option.value === envModel)
            ? options
            : [{ label: `${envModel} (env)`, value: envModel }, ...options],
        );
        setSelectedModel((current) => current || envModel);
      })
      .catch((err) => {
        logger.warn({ err }, "[useLettaModelPicker] Letta models unavailable");
      });
  }, [isAdmin, isRco]);

  return {
    modelOptions,
    // Empty for non-admins: the server applies the env-forced model.
    selectedModel: isAdmin ? selectedModel : "",
    setSelectedModel,
  };
}

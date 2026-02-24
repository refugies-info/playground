"use client";

import type { RiPoi } from "@playground/shared-types";
import { EditableField, TextInput } from "@playground/ui";
import { Badge } from "@playground/ui/primitives";
import { Plus, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useMetadata } from "../MetadataContext";

/**
 * Props for the PoiField component.
 */
interface PoiFieldProps {
  /** Metadata field key */
  fieldKey: string;

  /** Display label */
  label: string;
}

/**
 * Render POIs in read mode (same as original renderMap).
 */
function renderPoiList(pois: RiPoi[]): React.ReactNode {
  if (pois.length === 0) return null;

  return pois.map((poi, idx) => {
    const address = poi.address ?? "";
    const city = poi.city ?? "";
    const fullAddress = [address, city].filter(Boolean).join(", ");

    const title = poi.title ?? "";
    const lat = poi.lat ?? "";
    const lng = poi.lng ?? "";
    const email = poi.email ?? "";
    const phone = poi.phone ?? "";

    const poiKey =
      [title, address, city, lat, lng].filter(Boolean).join("-") ||
      `poi-${idx}`;

    return (
      <div
        key={poiKey}
        className="flex flex-col gap-2 mb-2 last:mb-0"
        style={{ wordBreak: "break-word" }}
      >
        {title && <strong className="text-gray-900">{title}</strong>}
        {fullAddress && <div className="text-gray-800">{fullAddress}</div>}

        {(lat || lng) && (
          <div className="text-gray-800 text-xs">
            {lat && <div>lat : {lat}</div>}
            {lng && <div>lng : {lng}</div>}
          </div>
        )}

        {(email || phone) && (
          <div className="flex flex-wrap gap-1 mt-1">
            {email && (
              <Badge size="sm" variant="info">
                {email}
              </Badge>
            )}
            {phone && (
              <Badge size="sm" variant="info">
                {phone}
              </Badge>
            )}
          </div>
        )}
      </div>
    );
  });
}

/**
 * PoiField — An editable points of interest field for metadata.
 *
 * @description
 * Displays a list of POIs (address, city, etc.) with CRUD operations.
 * Read mode shows formatted list (same as original renderMap), click to edit.
 */
export function PoiField({ fieldKey }: PoiFieldProps) {
  const { getFieldValue, updateField } = useMetadata();
  const [isEditing, setIsEditing] = useState(false);

  const pois = (getFieldValue(fieldKey) as RiPoi[]) ?? [];

  const handleAdd = useCallback(() => {
    const newPoi: RiPoi = {
      title: "",
      address: "",
      city: "",
    };
    updateField(fieldKey, [...pois, newPoi]);
  }, [fieldKey, updateField, pois]);

  const handleUpdate = useCallback(
    (index: number, field: keyof RiPoi, value: string) => {
      const newPois = [...pois];
      newPois[index] = {
        ...newPois[index],
        [field]: value,
      };
      updateField(fieldKey, newPois);
    },
    [fieldKey, updateField, pois],
  );

  const handleRemove = useCallback(
    (index: number) => {
      const newPois = pois.filter((_, i) => i !== index);
      updateField(fieldKey, newPois.length > 0 ? newPois : undefined);
    },
    [fieldKey, updateField, pois],
  );

  return (
    <EditableField
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onExit={() => setIsEditing(false)}
      placeholder="Aucun point d'intérêt"
      renderEdit={() => (
        <div className="space-y-3 p-1">
          {/* POI list */}
          {pois.map((poi, index) => (
            <div
              key={`poi-edit-${poi.title || index}`}
              className="flex items-start gap-2 p-2 bg-gray-50 rounded-md"
            >
              <div className="flex-1 space-y-2">
                <TextInput
                  variant="inline"
                  value={poi.title ?? ""}
                  onChange={(val) => handleUpdate(index, "title", val)}
                  placeholder="Nom du lieu"
                  className="font-medium"
                />
                <TextInput
                  variant="inline"
                  value={poi.address ?? ""}
                  onChange={(val) => handleUpdate(index, "address", val)}
                  placeholder="Adresse"
                />
                <div className="flex gap-2">
                  <TextInput
                    variant="inline"
                    value={poi.city ?? ""}
                    onChange={(val) => handleUpdate(index, "city", val)}
                    placeholder="Ville"
                    className="flex-1"
                  />
                  <TextInput
                    variant="inline"
                    value={poi.phone ?? ""}
                    onChange={(val) => handleUpdate(index, "phone", val)}
                    placeholder="Téléphone"
                    className="w-32"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="p-1 text-gray-400 hover:text-red-500 mt-1"
                aria-label={`Supprimer ${poi.title || `POI ${index + 1}`}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          {/* Add button */}
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4" />
            Ajouter un point d'intérêt
          </button>
        </div>
      )}
    >
      {renderPoiList(pois)}
    </EditableField>
  );
}

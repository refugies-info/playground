"use client";

import type { RiPoi } from "@playground/shared-types";
import { EditableField, TextInput } from "@playground/ui";
import { Badge } from "@playground/ui/primitives";
import { Plus, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useMetadata } from "../MetadataContext";

/**
 * PoiField — An editable points of interest field for metadata.
 */
export function PoiField({ fieldKey }: { fieldKey: string }) {
  const { getFieldValue, updateField } = useMetadata();
  const [isEditing, setIsEditing] = useState(false);

  const rawPois = getFieldValue(fieldKey) as RiPoi[] | RiPoi | undefined;
  const pois = Array.isArray(rawPois) ? rawPois : rawPois ? [rawPois] : [];

  // Local state for editing
  const [localPois, setLocalPois] = useState<RiPoi[]>(pois);

  // Sync local state when entering edit mode
  const handleEdit = useCallback(() => {
    setLocalPois(pois);
    setIsEditing(true);
  }, [pois]);

  // Save on exit
  const handleExit = useCallback(() => {
    setIsEditing(false);
    if (localPois.length > 0) {
      updateField(fieldKey, localPois);
    }
  }, [fieldKey, updateField, localPois]);

  // Local handlers
  const handleAdd = useCallback(() => {
    const newPoi: RiPoi = { title: "", address: "", city: "" };
    setLocalPois((prev) => [...prev, newPoi]);
  }, []);

  const handleUpdate = useCallback(
    (index: number, field: keyof RiPoi, value: string) => {
      setLocalPois((prev) => {
        const newPois = [...prev];
        newPois[index] = { ...newPois[index], [field]: value };
        return newPois;
      });
    },
    [],
  );

  const handleRemove = useCallback((index: number) => {
    setLocalPois((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Render POIs in read mode
  const renderPoiList = useMemo(() => {
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

      return (
        <div
          key={`poi-${title || idx}`}
          className="flex flex-col gap-2 mb-2 last:mb-0"
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
  }, [pois]);

  return (
    <EditableField
      isEditing={isEditing}
      onEdit={handleEdit}
      onExit={handleExit}
      placeholder="Aucun point d'intérêt"
      renderEdit={() => (
        <div className="space-y-3 p-1">
          {localPois.map((poi, index) => (
            <div
              key={`poi-edit-${poi.title || index}`}
              className="flex items-start gap-2 p-2 bg-gray-50 rounded-md"
            >
              <div className="flex-1 space-y-2">
                <TextInput
                  value={poi.title ?? ""}
                  onChange={(val) => handleUpdate(index, "title", val)}
                  placeholder="Nom du lieu"
                  className="font-medium"
                />
                <TextInput
                  value={poi.address ?? ""}
                  onChange={(val) => handleUpdate(index, "address", val)}
                  placeholder="Adresse"
                />
                <div className="flex gap-2">
                  <TextInput
                    value={poi.city ?? ""}
                    onChange={(val) => handleUpdate(index, "city", val)}
                    placeholder="Ville"
                    className="flex-1"
                  />
                  <TextInput
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
      {renderPoiList}
    </EditableField>
  );
}

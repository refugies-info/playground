"use client";

import type { RiPoi } from "@playground/shared-types";
import { EditableField, TextInput } from "@playground/ui";
import { Badge, Button } from "@playground/ui/primitives";
import { Plus, Trash2 } from "lucide-react";
import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { useMetadata } from "../MetadataContext";

/**
 * Internal type for POI items with stable ID for React keys.
 * The _poiId is used as a stable key and removed before saving.
 */
type PoiWithId = RiPoi & { _poiId: number };

/** DSFR labeled field: label (Marianne 14px) above a control */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[14px] leading-[24px] text-(--text-default-grey)">
        {label}
      </span>
      {children}
    </div>
  );
}

/**
 * PoiField — An editable points of interest field for metadata.
 * Uses stable IDs instead of array indices for reliable React key management.
 */
export function PoiField({ fieldKey }: { fieldKey: string }) {
  const { getFieldValue, updateField } = useMetadata();
  const [isEditing, setIsEditing] = useState(false);
  const nextPoiId = useRef(0);

  const rawPois = getFieldValue(fieldKey) as RiPoi[] | RiPoi | undefined;
  const pois = Array.isArray(rawPois) ? rawPois : rawPois ? [rawPois] : [];

  // Convert pois to internal format with stable IDs
  const poiWithIds = useMemo<PoiWithId[]>(() => {
    return pois.map((poi) => ({
      ...poi,
      _poiId: nextPoiId.current++,
    }));
  }, [pois]);

  // Local state for editing
  const [localPois, setLocalPois] = useState<PoiWithId[]>(poiWithIds);

  // Sync local state when entering edit mode
  const handleEdit = useCallback(() => {
    setLocalPois(poiWithIds);
    setIsEditing(true);
  }, [poiWithIds]);

  // Save on exit (remove internal _poiId before saving)
  const handleExit = useCallback(() => {
    setIsEditing(false);
    if (localPois.length > 0) {
      const poisToSave = localPois.map(({ _poiId, ...poi }) => {
        const result = { ...poi };
        if (result.lat !== undefined && result.lat !== "") {
          const parsed = parseFloat(String(result.lat));
          if (!isNaN(parsed)) result.lat = parsed;
        }
        if (result.lng !== undefined && result.lng !== "") {
          const parsed = parseFloat(String(result.lng));
          if (!isNaN(parsed)) result.lng = parsed;
        }
        return result;
      });
      updateField(fieldKey, poisToSave);
    }
  }, [fieldKey, updateField, localPois]);

  // Local handlers
  const handleAdd = useCallback(() => {
    const newPoi: PoiWithId = {
      title: "",
      address: "",
      city: "",
      _poiId: nextPoiId.current++,
    };
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
    if (poiWithIds.length === 0) return null;

    return poiWithIds.map((poi) => {
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
          key={`poi-${poi._poiId}`}
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
  }, [poiWithIds]);

  return (
    <EditableField
      isEditing={isEditing}
      onEdit={handleEdit}
      onExit={handleExit}
      placeholder="Aucun point d'intérêt"
      renderEdit={() => (
        <div className="flex w-full flex-col gap-3 rounded-[2px] border border-(--border-default-grey) bg-white p-2 shadow-md">
          {localPois.map((poi, index) => (
            <div key={`poi-edit-${poi._poiId}`} className="flex flex-col gap-3">
              {index > 0 && (
                <div className="border-t border-(--border-default-grey)" />
              )}
              <div className="flex items-start gap-2">
                <div className="flex flex-1 flex-col gap-3">
                  <Field label="Titre du lieu d'accueil">
                    <TextInput
                      variant="dsfr"
                      value={poi.title ?? ""}
                      onChange={(val) => handleUpdate(index, "title", val)}
                      className="w-full"
                      aria-label="Titre du lieu d'accueil"
                    />
                  </Field>
                  <Field label="Adresse du lieu d'accueil">
                    <TextInput
                      variant="dsfr"
                      value={poi.address ?? ""}
                      onChange={(val) => handleUpdate(index, "address", val)}
                      className="w-full"
                      aria-label="Adresse du lieu d'accueil"
                    />
                  </Field>
                  <Field label="Ville du lieu d'accueil">
                    <TextInput
                      variant="dsfr"
                      value={poi.city ?? ""}
                      onChange={(val) => handleUpdate(index, "city", val)}
                      className="w-full"
                      aria-label="Ville du lieu d'accueil"
                    />
                  </Field>
                  <Field label="Téléphone (optionnel)">
                    <TextInput
                      variant="dsfr"
                      value={poi.phone ?? ""}
                      onChange={(val) => handleUpdate(index, "phone", val)}
                      className="w-full"
                      aria-label="Téléphone"
                    />
                  </Field>
                  <Field label="Email de contact (optionnel)">
                    <TextInput
                      variant="dsfr"
                      value={poi.email ?? ""}
                      onChange={(val) => handleUpdate(index, "email", val)}
                      className="w-full"
                      aria-label="Email de contact"
                    />
                  </Field>
                  <Field label="Coordonnées GPS">
                    <div className="flex gap-2">
                      <TextInput
                        variant="dsfr"
                        value={String(poi.lat ?? "")}
                        onChange={(val) => handleUpdate(index, "lat", val)}
                        className="w-full flex-1"
                        aria-label="Latitude"
                      />
                      <TextInput
                        variant="dsfr"
                        value={String(poi.lng ?? "")}
                        onChange={(val) => handleUpdate(index, "lng", val)}
                        className="w-full flex-1"
                        aria-label="Longitude"
                      />
                    </div>
                  </Field>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="mt-1 p-1 text-(--text-mention-grey) hover:text-(--text-default-error)"
                  aria-label={`Supprimer ${poi.title || `POI ${index + 1}`}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          <Button type="button" onClick={handleAdd} size="sm">
            <Plus className="h-4 w-4" />
            Ajouter un point d'intérêt
          </Button>
        </div>
      )}
    >
      {renderPoiList}
    </EditableField>
  );
}

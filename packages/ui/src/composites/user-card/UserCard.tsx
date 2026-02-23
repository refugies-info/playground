"use client";

import { LANGUAGES } from "@playground/shared-types";
import { cva } from "class-variance-authority";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, Edit2, Globe, Shield, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../../primitives/button";
import { cn } from "../../utils/cn";

// CVA configurations
const cardVariants = cva(
  "group relative flex flex-col h-80 p-6 rounded-xl border transition-all shadow-sm hover:shadow-md",
  {
    variants: {
      intent: {
        view: "bg-white border-gray-200 hover:border-gray-300",
        edit: "bg-white border-blue-200 ring-4 ring-blue-50/50",
        delete: "bg-red-50 border-red-100 shadow-sm",
      },
    },
    defaultVariants: {
      intent: "view",
    },
  },
);

const avatarVariants = cva(
  "w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-inner bg-linear-to-br",
  {
    variants: {
      role: {
        admin: "from-pink-500 to-rose-600",
        translator: "from-orange-400 to-amber-500",
        editor: "from-indigo-500 to-blue-600",
      },
    },
    defaultVariants: {
      role: "editor",
    },
  },
);

export type UserRole = "admin" | "editor" | "translator";

export interface UserData {
  id?: string;
  email: string;
  username?: string;
  role: UserRole;
  language?: string;
  created_at?: string;
}

interface UserCardProps {
  user?: UserData;
  onSave: (data: UserData) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onCancel?: () => void;
  isNew?: boolean;
}

const ROLES: {
  value: UserRole;
  label: string;
  color:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "indigo"
    | "pink"
    | "orange";
}[] = [
  { value: "admin", label: "Administrateur", color: "pink" },
  { value: "editor", label: "Éditeur", color: "indigo" },
  { value: "translator", label: "Traducteur", color: "orange" },
];

export function UserCard({
  user,
  onSave,
  onDelete,
  onCancel,
  isNew = false,
}: UserCardProps) {
  const [isEditing, setIsEditing] = useState(isNew);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<UserData>({
    id: user?.id,
    email: user?.email || "",
    username: user?.username || "",
    role: user?.role || "editor",
    language: user?.language || "",
  });

  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    if (!formData.email) {
      setError("L'email est requis");
      return;
    }
    if (formData.role === "translator" && !formData.language) {
      setError("La langue est requise pour un traducteur");
      return;
    }

    try {
      setIsSaving(true);
      await onSave(formData);
      setIsEditing(false);
    } catch (_e) {
      setError("Une erreur est survenue");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user?.id || !onDelete) return;
    try {
      setIsSaving(true);
      await onDelete(user.id);
    } catch (_e) {
      setError("Erreur lors de la suppression");
      setIsSaving(false);
    }
  };

  // Determine intent for CVA
  const intent = isDeleting ? "delete" : isEditing ? "edit" : "view";

  const emailId = `email-${user?.id || "new"}`;
  const roleId = `role-${user?.id || "new"}`;
  const langId = `lang-${user?.id || "new"}`;

  return (
    <div className={cn(cardVariants({ intent }))}>
      {/* DELETE STATE */}
      {isDeleting && (
        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
          <h3 className="font-semibold text-red-900">
            Supprimer cet utilisateur ?
          </h3>
          <p className="text-sm text-red-700">Cette action est irréversible.</p>
          <div className="flex gap-3 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleting(false)}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={isSaving}
            >
              {isSaving ? "..." : "Confirmer"}
            </Button>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}

      {/* EDIT STATE */}
      {isEditing && !isDeleting && (
        <>
          <div className="flex-1 space-y-4">
            <div>
              <label
                htmlFor={emailId}
                className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1"
              >
                Email
              </label>
              <input
                id={emailId}
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={!isNew}
                className={`w-full text-sm font-medium text-gray-900 border-b-2 border-gray-200 focus:border-blue-500 outline-none py-1 bg-transparent ${!isNew ? "opacity-60 cursor-not-allowed" : ""}`}
                placeholder="email@refugies.info"
              />
            </div>

            <div>
              <label
                htmlFor={`username-${user?.id || "new"}`}
                className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1"
              >
                Nom d'utilisateur
              </label>
              <input
                id={`username-${user?.id || "new"}`}
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full text-sm font-medium text-gray-900 border-b-2 border-gray-200 focus:border-blue-500 outline-none py-1 bg-transparent"
                placeholder="john_doe"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor={roleId}
                  className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1"
                >
                  Rôle
                </label>
                <select
                  id={roleId}
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as UserRole,
                    })
                  }
                  className="w-full text-sm text-gray-900 border-b-2 border-gray-200 focus:border-blue-500 outline-none py-1 bg-transparent"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor={langId}
                  className={cn(
                    "block text-xs font-semibold uppercase tracking-wider mb-1 transition-colors",
                    formData.role === "translator"
                      ? "text-gray-500"
                      : "text-gray-300",
                  )}
                >
                  Langue
                </label>
                <select
                  id={langId}
                  value={formData.language}
                  onChange={(e) =>
                    setFormData({ ...formData, language: e.target.value })
                  }
                  disabled={formData.role !== "translator"}
                  className={cn(
                    "w-full text-sm border-b-2 outline-none py-1 bg-transparent transition-colors",
                    formData.role === "translator"
                      ? "text-gray-900 border-gray-200 focus:border-blue-500"
                      : "text-gray-300 border-transparent cursor-not-allowed",
                  )}
                >
                  <option value="">-</option>
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-600 mb-2 font-medium">{error}</div>
          )}

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full w-8 h-8 p-0"
              onClick={() => (isNew ? onCancel?.() : setIsEditing(false))}
            >
              <X size={18} className="text-gray-400" />
            </Button>
            <Button
              variant="primary" // Assuming primary is black/dark based on previous design, or adjusting to match
              size="sm"
              className="rounded-full bg-gray-900 hover:bg-gray-800"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "..." : "Valider"}
              {!isSaving && <Check size={16} />}
            </Button>
          </div>
        </>
      )}

      {/* VIEW STATE */}
      {!isEditing && !isDeleting && (
        <>
          <div className="absolute top-4 right-4 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full w-8 h-8 p-0 hover:bg-blue-50"
              onClick={() => setIsEditing(true)}
              title="Éditer"
            >
              <Edit2 size={16} className="text-gray-400 hover:text-blue-600" />
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full w-8 h-8 p-0 hover:bg-red-50"
                onClick={() => setIsDeleting(true)}
                title="Supprimer"
              >
                <Trash2
                  size={16}
                  className="text-gray-400 hover:text-red-600"
                />
              </Button>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
            <div className="relative">
              <div className={cn(avatarVariants({ role: formData.role }))}>
                {(formData.username?.[0] || formData.email[0]).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
                {formData.role === "admin" && (
                  <Shield
                    size={14}
                    className="text-pink-600"
                    fill="currentColor"
                  />
                )}
                {formData.role === "translator" && (
                  <Globe size={14} className="text-orange-500" />
                )}
                {formData.role === "editor" && (
                  <Edit2 size={14} className="text-indigo-500" />
                )}
              </div>
            </div>

            <div>
              <div className="flex flex-col items-center gap-0.5">
                <span
                  className={cn(
                    "text-xs font-medium uppercase tracking-wider",
                    formData.role === "admin"
                      ? "text-pink-600"
                      : formData.role === "translator"
                        ? "text-orange-600"
                        : "text-indigo-600",
                  )}
                >
                  {ROLES.find((r) => r.value === formData.role)?.label ||
                    "Inconnu"}
                </span>

                <h3
                  className="text-sm font-semibold text-gray-900 truncate max-w-[200px]"
                  title={formData.username || formData.email}
                >
                  {formData.username || formData.email}
                </h3>
                {formData.username && (
                  <p
                    className="text-xs text-gray-500 truncate max-w-[200px]"
                    title={formData.email}
                  >
                    {formData.email}
                  </p>
                )}
              </div>

              {formData.role === "translator" && (
                <div className="mt-2 flex justify-center">
                  <span className="text-xs text-gray-500 flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                    <Globe size={10} />
                    {LANGUAGES.find((l) => l.code === formData.language)
                      ?.label || "-"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-50 flex justify-center">
            <span className="text-[10px] text-gray-400">
              {user?.created_at
                ? `Créé le ${format(new Date(user.created_at), "dd MMM yyyy", { locale: fr })}`
                : "Nouveau"}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

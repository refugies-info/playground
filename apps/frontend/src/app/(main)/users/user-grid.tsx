"use client";

import { AddUserCard } from "@playground/ui/composites/user-card/AddUserCard";
import { UserCard } from "@playground/ui/composites/user-card/UserCard";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { uploadAvatar } from "@/app/actions/avatars";
import { createUser, deleteUser, updateUser } from "@/app/actions/users";
import type { Profile } from "@/lib/profile";

interface UserGridProps {
  initialUsers: Profile[];
}

export function UserGrid({ initialUsers }: UserGridProps) {
  const router = useRouter();
  const [users, setUsers] = useState<Profile[]>(initialUsers);
  const [isCreating, setIsCreating] = useState(false);

  // Sync state with server data on revalidation
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  // Create
  const handleCreate = async (
    data: Pick<Profile, "email" | "username" | "role" | "language">,
  ) => {
    try {
      const res = await createUser({
        email: data.email,
        username: data.username,
        role: data.role,
        language: data.language,
      });
      setIsCreating(false);

      if (res?.success) {
        // Refresh server data to get IDs and dates
        router.refresh();
      }
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Une erreur est survenue";
      alert(message);
      throw e;
    }
  };

  // Update
  const handleUpdate = async (data: {
    id: string;
    username: string;
    role: string;
    language?: string;
  }) => {
    if (!data.id) return;
    try {
      await updateUser({
        id: data.id,
        username: data.username,
        role: data.role,
        language: data.language,
      });
      // Local update
      setUsers((prev) =>
        prev.map((u) =>
          u.id === data.id
            ? {
                ...u,
                username: data.username,
                role: data.role as Profile["role"],
                language: data.language,
              }
            : u,
        ),
      );
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Une erreur est survenue";
      alert(message);
      throw e;
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      // Local update: remove from list immediately
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Une erreur est survenue";
      alert(message);
      throw e;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {/* Add Card acts as first element */}
      {!isCreating && <AddUserCard onClick={() => setIsCreating(true)} />}
      {/* Wrapper for New User Card flow */}
      {isCreating && (
        <UserCard
          isNew={true}
          onSave={handleCreate}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {/* Explicitly sort or just map. Assuming input is sorted */}
      {users.map((profile) => (
        <UserCard
          key={profile.id}
          user={{
            ...profile,
            language: profile.language ?? "",
            username: profile.username ?? "",
            createdAt: profile.createdAt ?? "",
            avatarUrl: profile.avatarUrl,
          }}
          onSave={handleUpdate}
          onDelete={handleDelete}
          onAvatarUpload={async (file) => {
            const fd = new FormData();
            fd.set("file", file);
            const { secureUrl } = await uploadAvatar(profile.id, fd);
            setUsers((prev) =>
              prev.map((u) =>
                u.id === profile.id ? { ...u, avatarUrl: secureUrl } : u,
              ),
            );
            return secureUrl;
          }}
        />
      ))}
    </div>
  );
}

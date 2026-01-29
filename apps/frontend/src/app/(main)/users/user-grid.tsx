"use client";

import { AddUserCard } from "@playground/ui/composites/user-card/AddUserCard";
import {
  UserCard,
  type UserData,
} from "@playground/ui/composites/user-card/UserCard";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createUser, deleteUser, updateUser } from "@/app/actions/users";

interface UserGridProps {
  initialUsers: UserData[];
}

export function UserGrid({ initialUsers }: UserGridProps) {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [isCreating, setIsCreating] = useState(false);

  // Sync state with server data on revalidation
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  // Create
  const handleCreate = async (data: UserData) => {
    try {
      const res = await createUser({
        email: data.email,
        role: data.role,
        language: data.language,
      });
      setIsCreating(false);

      if (res?.success) {
        // Refresh server data to get IDs and dates
        router.refresh();
      }

      if (res?.password) {
        alert(
          `Utilisateur créé !\n\nMot de passe temporaire à communiquer :\n${res.password}\n\nCopiez-le, il ne sera plus affiché.`,
        );
      }
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Une erreur est survenue";
      alert(message);
      throw e;
    }
  };

  // Update
  const handleUpdate = async (data: UserData) => {
    if (!data.id) return;
    try {
      await updateUser({
        id: data.id,
        role: data.role,
        language: data.language,
      });
      // Local update
      setUsers((prev) =>
        prev.map((u) =>
          u.id === data.id
            ? { ...u, role: data.role, language: data.language }
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onSave={handleUpdate}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

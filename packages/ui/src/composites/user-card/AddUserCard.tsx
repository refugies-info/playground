"use client";

import { Plus } from "lucide-react";

interface AddUserCardProps {
  onClick: () => void;
  disabled?: boolean;
}

export function AddUserCard({ onClick, disabled }: AddUserCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group flex flex-col justify-center items-center h-80 p-6 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/30 transition-all text-center focus:outline-none focus:ring-4 focus:ring-blue-50"
    >
      <div className="w-16 h-16 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center text-gray-400 group-hover:text-blue-600 transition-colors mb-4">
        <Plus size={32} />
      </div>
      <h3 className="text-sm font-medium text-gray-600 group-hover:text-blue-700">
        Ajouter un utilisateur
      </h3>
    </button>
  );
}

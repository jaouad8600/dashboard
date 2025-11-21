"use client";

import { useAuth } from "@/components/providers/AuthContext";
import { Role } from "@prisma/client";
import { Shield } from "lucide-react";

export default function RoleSwitcher() {
    const { user, switchRole } = useAuth();

    return (
        <div className="fixed bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-50 flex items-center space-x-3">
            <div className="flex items-center text-sm font-medium text-gray-700">
                <Shield size={16} className="mr-2 text-blue-600" />
                <span className="hidden sm:inline">Huidige Rol:</span>
            </div>
            <select
                value={user.role}
                onChange={(e) => switchRole(e.target.value as Role)}
                className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
                {Object.keys(Role).map((role) => (
                    <option key={role} value={role}>
                        {role}
                    </option>
                ))}
            </select>
        </div>
    );
}

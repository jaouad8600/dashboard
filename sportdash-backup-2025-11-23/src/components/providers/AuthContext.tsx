"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthUser, MOCK_USERS } from "@/lib/auth";
import { Role } from "@prisma/client";

interface AuthContextType {
    user: AuthUser;
    switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser>(MOCK_USERS.BEGELEIDER);

    // Persist mock role in localStorage for demo purposes
    useEffect(() => {
        const storedRole = localStorage.getItem("mockRole") as Role;
        if (storedRole && MOCK_USERS[storedRole]) {
            setUser(MOCK_USERS[storedRole]);
        }
    }, []);

    const switchRole = (role: Role) => {
        const newUser = MOCK_USERS[role];
        setUser(newUser);
        localStorage.setItem("mockRole", role);
        // Force reload to refresh server components if needed (simulating login)
        window.location.reload();
    };

    return (
        <AuthContext.Provider value={{ user, switchRole }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

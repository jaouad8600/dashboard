import { Role } from "@prisma/client";

// Mock User Interface
export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: Role;
}

// Mock Users
export const MOCK_USERS: Record<Role, AuthUser> = {
    SPORTDOCENT: {
        id: "user-sportdocent",
        name: "Sven Sport",
        email: "sven@sportdash.nl",
        role: "SPORTDOCENT",
    },
    BEGELEIDER: {
        id: "user-begeleider",
        name: "Bea Begeleider",
        email: "bea@sportdash.nl",
        role: "BEGELEIDER",
    },
    GROEPSLEIDER: {
        id: "user-groepsleider",
        name: "Gerrit Groep",
        email: "gerrit@sportdash.nl",
        role: "GROEPSLEIDER",
    },
    AV_MT: {
        id: "user-mt",
        name: "Mandy Management",
        email: "mandy@sportdash.nl",
        role: "AV_MT",
    },
    BEHEERDER: {
        id: "user-admin",
        name: "Admin Ad",
        email: "admin@sportdash.nl",
        role: "BEHEERDER",
    },
};

// Current Mock User (stored in localStorage in real app, here just a variable for server-side simulation won't work well across requests without cookies/headers)
// For this demo, we will use a simple cookie or header simulation if needed, 
// but for client-side components we can use a Context.

// Permission Check
export const canViewKPIs = (role: Role) => {
    return [Role.AV_MT, Role.BEHEERDER].includes(role);
};

export const canViewSensitiveIncidents = (role: Role) => {
    return [Role.AV_MT, Role.BEHEERDER, Role.GROEPSLEIDER].includes(role);
};

export const canManageUsers = (role: Role) => {
    return role === Role.BEHEERDER;
};

export const canEditReport = (role: Role, reportAuthorId: string, userId: string) => {
    if (role === Role.BEHEERDER) return true;
    if (role === Role.AV_MT) return true; // MT can edit? Maybe.
    return reportAuthorId === userId;
};

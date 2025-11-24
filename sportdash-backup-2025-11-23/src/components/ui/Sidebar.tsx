"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    Dumbbell,
    FolderOpen,
    Activity,
    Shield,
    AlertCircle,
    Package,
    Calendar,
    CheckSquare,
    LogOut,
    Menu,
    X,
    Trophy,
    AlertTriangle,
    Book
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthContext";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar() {
    const { user } = useAuth();
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    const isActive = (path: string) => pathname === path;

    const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => (
        <Link
            href={href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive(href)
                ? "bg-gradient-to-r from-teylingereind-royal to-blue-700 text-white shadow-lg shadow-blue-900/30"
                : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
        >
            {isActive(href) && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-teylingereind-royal to-blue-700 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
            <Icon size={20} className={`relative z-10 ${isActive(href) ? "text-white" : "text-gray-400 group-hover:text-white transition-colors"}`} />
            <span className="font-medium relative z-10">{label}</span>
        </Link>
    );

    const SectionLabel = ({ label }: { label: string }) => (
        <div className="px-4 py-2 mt-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
            <span>{label}</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
        </div>
    );

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-gradient-to-b from-teylingereind-blue via-teylingereind-blue to-blue-950 text-white border-r border-white/10 backdrop-blur-xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-teylingereind-orange via-orange-500 to-teylingereind-royal rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
                        <Trophy className="text-white relative z-10" size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">SportDash</h1>
                        <p className="text-[10px] text-blue-300 font-medium uppercase tracking-widest">Teylingereind</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                <NavItem href="/" icon={LayoutDashboard} label="Dashboard" />
                <NavItem href="/groepen" icon={Users} label="Groepen" />
                <NavItem href="/sportmomenten" icon={CheckSquare} label="Dagplanning" />

                <SectionLabel label="Rapportages" />
                <NavItem href="/rapportages" icon={FileText} label="Rapportages" />
                <NavItem href="/incidenten" icon={AlertTriangle} label="Incidenten" />
                <NavItem href="/dagrapport" icon={FileText} label="Dagrapport" />

                <SectionLabel label="Zorg & Sport" />
                <NavItem href="/sportmutaties" icon={AlertCircle} label="Sportmutaties" />
                <NavItem href="/sportindicaties" icon={Activity} label="Sportindicaties" />
                <NavItem href="/extra-sportmomenten" icon={Trophy} label="Extra Sport" />

                <SectionLabel label="Organisatie" />
                <NavItem href="/materialen" icon={Package} label="Materialen" />
                <NavItem href="/bibliotheek" icon={Book} label="Bibliotheek" />
                <NavItem href="/reserveringen" icon={Calendar} label="Reserveringen" />
                <NavItem href="/kalender" icon={Calendar} label="Kalender" />
                <NavItem href="/programmas" icon={Dumbbell} label="Programma's" />
                <NavItem href="/documenten" icon={FolderOpen} label="Documenten" />

                {(user?.role === "BEHEERDER" || user?.role === "AV_MT") && (
                    <>
                        <SectionLabel label="Beheer" />
                        <NavItem href="/admin/audit" icon={Shield} label="Audit Log" />
                        <NavItem href="/settings" icon={Settings} label="Instellingen" />
                    </>
                )}
            </nav>

            <div className="p-4 border-t border-white/5 bg-black/20">
                <div className="flex items-center gap-3 mb-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                        {user?.name?.charAt(0) || 'JD'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user?.name || 'John Doe'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.role || 'Sportdocent'}</p>
                    </div>
                </div>
                <Link
                    href="/login"
                    className="flex items-center gap-2 px-2 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                    <LogOut size={16} />
                    <span>Uitloggen</span>
                </Link>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Toggle Button */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="p-2 bg-[#0f172a] text-white rounded-lg shadow-lg border border-white/10"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 fixed inset-y-0 left-0 z-40">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Drawer */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 z-50 w-72 md:hidden shadow-2xl"
                        >
                            <SidebarContent />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

"use client";

import Link from "next/link";
import { LayoutDashboard, Users, FileText, Settings, Dumbbell, FolderOpen, Activity, Shield, AlertCircle, Package, Calendar } from "lucide-react";
import { useAuth } from "@/components/providers/AuthContext";

export default function Sidebar() {
    const { user } = useAuth();

    return (
        <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10">
            <div className="p-6 border-b border-gray-100">
                <h1 className="text-2xl font-bold text-blue-600 flex items-center">
                    <LayoutDashboard className="mr-2" />
                    SportDash
                </h1>
            </div>

            <nav className="p-4 space-y-2">
                <Link
                    href="/"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                >
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </Link>
                <Link
                    href="/groepen"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                >
                    <Users size={20} />
                    <span>Groepen</span>
                </Link>
                <Link
                    href="/rapportage"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                >
                    <FileText size={20} />
                    <span>Rapportages</span>
                </Link>
                <Link
                    href="/dagrapport"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                >
                    <FileText size={20} />
                    <span>Dagrapport</span>
                </Link>
                <Link
                    href="/extra-sport"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                >
                    <Activity size={20} />
                    <span>Extra Sport</span>
                </Link>
                <Link
                    href="/sportmutaties"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                >
                    <AlertCircle size={20} />
                    <span>Sportmutaties</span>
                </Link>
                <Link
                    href="/sportindicaties"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                >
                    <Activity size={20} />
                    <span>Sportindicaties</span>
                </Link>
                <Link
                    href="/materialen"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                >
                    <Package size={20} />
                    <span>Materialen</span>
                </Link>
                <Link
                    href="/kalender"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                >
                    <Calendar size={20} />
                    <span>Kalender</span>
                </Link>

                {/* Admin Section */}
                {(user.role === "BEHEERDER" || user.role === "AV_MT") && (
                    <>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4">
                            Beheer
                        </div>
                        <Link
                            href="/admin/audit"
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                        >
                            <Shield size={20} />
                            <span>Audit Log</span>
                        </Link>
                    </>
                )}

                <Link
                    href="/programmas"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                >
                    <Dumbbell size={20} />
                    <span>Programma's</span>
                </Link>
                <Link
                    href="/documenten"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                >
                    <FolderOpen size={20} />
                    <span>Documenten</span>
                </Link>
                <Link
                    href="/input"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                >
                    <FileText size={20} />
                    <span>Snel Invoeren</span>
                </Link>
                <div className="pt-4 mt-4 border-t">
                    <Link
                        href="/settings"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                    >
                        <Settings size={20} />
                        <span>Instellingen</span>
                    </Link>
                </div>
            </nav>
        </aside>
    );
}

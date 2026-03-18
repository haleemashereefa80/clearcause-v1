"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ClipboardList,
    History,
    User,
    ShieldCheck,
    LogOut,
    ChevronRight,
    Search
} from "lucide-react";

const menuItems = [
    { label: "Dashboard", href: "/volunteer/dashboard", icon: LayoutDashboard },
    { label: "Active Jobs", href: "/volunteer/active-jobs", icon: ClipboardList },
    { label: "History", href: "/volunteer/history", icon: History },
    { label: "My Profile", href: "/volunteer/profile", icon: User },
];

export default function VolunteerSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-72 bg-[#0F172A] text-white hidden lg:flex flex-col shrink-0 h-screen sticky top-0">
            {/* Brand */}
            <div className="px-7 py-8 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-base font-black tracking-tight">ClearCause</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Agent Fleet</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-3 mb-3">Field Operations</p>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all group ${
                                isActive
                                    ? "bg-gradient-to-r from-red-500/90 to-rose-600/90 text-white shadow-lg shadow-red-500/15"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            <item.icon className={`w-[18px] h-[18px] ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`} />
                            <span className="flex-1">{item.label}</span>
                            {isActive && <ChevronRight className="w-4 h-4 opacity-60" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Verification Focus */}
            <div className="px-6 py-8">
                <div className="bg-slate-800/50 rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-red-500/10 rounded-full blur-2xl transition-all group-hover:bg-red-500/20" />
                    <div className="relative z-10 space-y-4">
                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-white/5">
                            <Search className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-white uppercase tracking-wider">Field Protocol</p>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1">Always verify physical evidence before submission.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-5 border-t border-white/5">
                <div className="bg-white/5 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-slate-400">Secure Operation</span>
                    </div>
                    <Link
                        href="/login"
                        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-red-400 transition-colors"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        End Session
                    </Link>
                </div>
            </div>
        </aside>
    );
}

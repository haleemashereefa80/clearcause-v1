"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Heart,
    Users,
    Wallet,
    ClipboardList,
    FileCheck,
    Building2,
    FileText,
    BarChart3,
    History,
    Bell,
    ShieldCheck,
    LogOut,
    ChevronRight,
} from "lucide-react";

const menuItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Campaigns", href: "/admin/campaigns", icon: Heart },
    { label: "Donations", href: "/admin/donations", icon: History },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Withdrawals", href: "/admin/withdrawals", icon: Wallet },
    { label: "KYC Review", href: "/admin/kyc", icon: FileCheck },
    { label: "Volunteers", href: "/admin/volunteers", icon: ClipboardList },
    { label: "NGO Management", href: "/admin/ngos", icon: Building2 },
    { label: "Content", href: "/admin/content", icon: FileText },
    { label: "Reports", href: "/admin/reports", icon: BarChart3 },
    { label: "Alerts", href: "/admin/alerts", icon: Bell },
];

export default function AdminSidebar() {
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
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Admin Panel</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-3 mb-3">Management</p>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
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

            {/* Footer */}
            <div className="px-5 py-5 border-t border-white/5">
                <div className="bg-white/5 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-slate-400">System Online</span>
                    </div>
                    <Link
                        href="/admin/login"
                        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-red-400 transition-colors"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Logout
                    </Link>
                </div>
            </div>
        </aside>
    );
}

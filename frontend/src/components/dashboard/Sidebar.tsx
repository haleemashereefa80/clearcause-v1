"use client";

import { useAuth } from "@/hooks/useAuth";
import {
    LayoutDashboard,
    Heart,
    PlusCircle,
    History,
    Wallet,
    Bell,
    ShieldCheck,
    FileText,
    Settings,
    ChevronRight,
    LogOut
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const menuItems = [
        { label: "Dashboard Overview", icon: LayoutDashboard, href: "/dashboard" },
        { label: "My Campaigns", icon: Heart, href: "/dashboard/campaigns" },
        { label: "Create Campaign", icon: PlusCircle, href: "/start-fundraiser" },
        { label: "Donations Made", icon: History, href: "/dashboard/donations" },
        { label: "Withdrawal Requests", icon: Wallet, href: "/dashboard/withdrawals" },
        { label: "Notifications", icon: Bell, href: "/dashboard/notifications" },
        { label: "KYC Verification", icon: ShieldCheck, href: "/dashboard/kyc" },
        { label: "Documents", icon: FileText, href: "/dashboard/documents" },
        { label: "Profile Settings", icon: Settings, href: "/dashboard/settings" },
    ];

    return (
        <aside className="w-72 bg-white border-r border-[#F0F0FF] flex flex-col h-screen sticky top-0">
            <div className="p-8 pb-4">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <Heart className="w-6 h-6 fill-white" />
                    </div>
                    <span className="text-xl font-black text-gray-900 tracking-tighter italic">ClearCause</span>
                </Link>
            </div>

            <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4 mb-4">Main Menu</p>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-between p-4 rounded-2xl group transition-all duration-300 ${isActive
                                    ? "bg-primary text-white shadow-xl shadow-primary/20 font-bold"
                                    : "text-gray-500 hover:bg-primary/5 hover:text-primary font-semibold"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400 group-hover:text-primary"}`} />
                                <span className="text-sm">{item.label}</span>
                            </div>
                            {isActive && <ChevronRight className="w-4 h-4 text-white" />}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-6 border-t border-gray-50 space-y-4">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
                        {(user as any)?.username?.charAt(0) || user?.full_name?.charAt(0) || "U"}
                    </div>
                    <div className="flex-grow overflow-hidden">
                        <p className="text-sm font-black text-gray-900 truncate">{(user as any)?.username || user?.full_name || "User"}</p>
                        <p className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-widest">{user?.role || "Member"}</p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full h-12 flex items-center gap-3 px-4 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all font-bold text-xs uppercase tracking-widest"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
